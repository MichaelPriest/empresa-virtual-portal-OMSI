import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createResource } from "./actions";
import DeleteResourceButton from "@/components/delete-resource-button";

const sections = {
  garages: { title: "Garagens", description: "Bases e instalações vinculadas às empresas que você administra.", table: "garages", fields: ["name", "city", "country_code"] },
  vehicles: { title: "Frota de veículos", description: "Consulte e organize os veículos cadastrados nas suas empresas.", table: "vehicles", fields: ["fleet_number", "display_name", "vehicle_model", "simulator", "status", "garage_id"] },
  careers: { title: "Carreiras", description: "Organize linhas, trajetos e serviços planejados para a operação virtual.", table: "careers", fields: ["title", "origin", "destination", "route_name", "simulator", "status", "scheduled_at"] }
} as const;

type SectionKey = keyof typeof sections;
type Row = Record<string, unknown>;
type Params = Promise<{ company?: string; saved?: string; deleted?: string; error?: string }>;

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "object") return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
  }
  const labels: Record<string, string> = {
    active: "Ativo", maintenance: "Em manutenção", inactive: "Inativo",
    planned: "Planejada", in_progress: "Em andamento", completed: "Concluída", canceled: "Cancelada",
    omsi2: "OMSI 2 clássico", openomsi: "openOMSI", both: "OMSI 2 + openOMSI", BR: "Brasil"
  };
  return labels[String(value)] ?? String(value);
}

function ResourceForm({ section, companyId, garages }: { section: SectionKey; companyId: string; garages: { id: string; name: string }[] }) {
  return <form action={createResource} className="resource-create-form">
    <input type="hidden" name="section" value={section} />
    <input type="hidden" name="company_id" value={companyId} />
    {section === "garages" ? <>
      <label>Nome da garagem<input name="name" required minLength={2} maxLength={120} placeholder="Ex.: Garagem Central" /></label>
      <label>Cidade<input name="city" maxLength={100} placeholder="Cidade (opcional)" /></label>
    </> : section === "vehicles" ? <>
      <label>Número de frota<input name="fleet_number" required maxLength={40} placeholder="Ex.: 101" /></label>
      <label>Nome do veículo<input name="display_name" required maxLength={120} placeholder="Ex.: Ônibus urbano" /></label>
      <label>Modelo<input name="vehicle_model" maxLength={120} placeholder="Modelo / carroceria (opcional)" /></label>
      <label>Garagem<select name="garage_id" defaultValue=""><option value="">Sem garagem vinculada</option>{garages.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
      <label>Simulador<select name="simulator" defaultValue="omsi2"><option value="omsi2">OMSI 2 clássico</option><option value="openomsi">openOMSI</option><option value="both">Ambos</option></select></label>
      <label>Situação<select name="status" defaultValue="active"><option value="active">Ativo</option><option value="maintenance">Em manutenção</option><option value="inactive">Inativo</option></select></label>
    </> : <>
      <label>Nome da carreira / linha<input name="title" required minLength={2} maxLength={160} placeholder="Ex.: Linha 101 — Terminal Centro" /></label>
      <label>Origem<input name="origin" maxLength={120} placeholder="Terminal de origem" /></label>
      <label>Destino<input name="destination" maxLength={120} placeholder="Terminal de destino" /></label>
      <label>Nome da rota / mapa<input name="route_name" maxLength={120} placeholder="Mapa ou rota (opcional)" /></label>
      <label>Simulador<select name="simulator" defaultValue="omsi2"><option value="omsi2">OMSI 2 clássico</option><option value="openomsi">openOMSI</option><option value="both">Ambos</option></select></label>
      <label>Data e hora prevista<input name="scheduled_at" type="datetime-local" /></label>
    </>}
    <button className="button button-primary" type="submit">Salvar {section === "garages" ? "garagem" : section === "vehicles" ? "veículo" : "carreira"} →</button>
    <p className="form-hint">O acesso é validado no servidor e pelas políticas RLS do banco. Campos opcionais podem ficar vazios.</p>
  </form>;
}

export default async function ResourcePage({ params, searchParams }: {
  params: Promise<{ section: string }>;
  searchParams: Params;
}) {
  const { section } = await params;
  const query = await searchParams;
  const companyId = query.company;
  if (!(section in sections)) notFound();
  const key = section as SectionKey;
  const config = sections[key];
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  const { data: companies, error: companyError } = await supabase.from("companies").select("id,name").order("name");
  if (companyError) return <main className="dashboard-page"><div className="dashboard-shell"><p className="auth-error">Não foi possível carregar as empresas autorizadas. Tente novamente.</p><Link className="text-link" href="/dashboard">← Voltar ao painel</Link></div></main>;
  const selected = (companies ?? []).find(item => item.id === companyId) ?? (companies ?? [])[0];
  let rows: Row[] = [];
  let loadError = false;
  let garages: { id: string; name: string }[] = [];
  if (selected) {
    if (key === "vehicles") {
      const garageResult = await supabase.from("garages").select("id,name").eq("company_id", selected.id).order("name");
      garages = garageResult.data ?? [];
    }
    const result = await supabase.from(config.table).select("*").eq("company_id", selected.id).order("created_at", { ascending: false });
    if (result.error) loadError = true;
    else rows = (result.data ?? []) as Row[];
  }

  return <main className="dashboard-page">
    <header className="dashboard-nav">
      <Link className="brand" href="/dashboard"><span className="brand-mark">EV</span><span>EMPRESA VIRTUAL <b>OMSI</b></span></Link>
      <span>{user.email}</span><Link className="button button-outline button-small" href="/dashboard">Voltar ao painel</Link>
    </header>
    <div className="dashboard-shell">
      <div className="eyebrow">GESTÃO DA EMPRESA</div><h1>{config.title}</h1>
      <p className="dashboard-intro">{config.description} Os dados são consultados com sua sessão autenticada e respeitam as políticas de acesso do banco.</p>
      {query.saved === "1" && <div className="auth-notice">Registro salvo com sucesso.</div>}
      {query.deleted === "1" && <div className="auth-notice">Registro excluído com sucesso.</div>}
      {query.error === "linked" && <div className="auth-error">Esta carreira possui serviços registrados e não pode ser excluída para preservar o histórico operacional.</div>}
      {query.error === "delete" && <div className="auth-error">Não foi possível excluir. Verifique sua função na empresa e se o registro ainda está em uso.</div>}
      {query.error === "validation" && <div className="auth-error">Confira os campos obrigatórios e os valores selecionados.</div>}
      {query.error === "save" && <div className="auth-error">Não foi possível salvar. Verifique se o registro já existe e se sua função permite essa operação.</div>}
      {companies && companies.length > 0 ? <form className="resource-company-picker" action={`/dashboard/${key}`} method="get">
        <label htmlFor="resource-company">Empresa selecionada</label>
        <div className="company-form-row"><select id="resource-company" name="company" defaultValue={selected?.id ?? ""}>{companies.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button className="button button-primary" type="submit">Abrir empresa</button></div>
      </form> : <section className="dashboard-panel empty-state"><h2>Você ainda não tem uma empresa</h2><p>Crie uma empresa no painel principal para começar a organizar seus recursos.</p><Link className="button button-primary" href="/dashboard">Ir para minhas empresas</Link></section>}
      {selected && <>
        <section className="dashboard-panel">
          <div className="panel-heading"><div><h2>Cadastrar {key === "garages" ? "garagem" : key === "vehicles" ? "veículo" : "carreira"}</h2><p>Empresa: {selected.name}</p></div></div>
          <ResourceForm section={key} companyId={selected.id} garages={garages} />
        </section>
        <section className="dashboard-panel">
          <div className="panel-heading"><div><h2>{selected.name}</h2><p>{config.title} cadastrados nesta empresa</p></div><span className="count-pill">{rows.length} registro(s)</span></div>
          {loadError ? <p className="auth-error">Não foi possível consultar estes registros. Verifique as permissões e tente novamente.</p> : rows.length === 0 ? <div className="empty-state"><h3>Nenhum registro cadastrado</h3><p>Use o formulário acima para cadastrar o primeiro item desta empresa.</p></div> :
            <div className="resource-list">{rows.map((row, index) => {
              const heading = [ "name", "display_name", "fleet_number", "title" ].map(field => displayValue(row[field])).find(Boolean) || `${config.title.slice(0, -1)} ${index + 1}`;
              const details = config.fields.filter(field => !["name", "display_name", "fleet_number", "title"].includes(field) && displayValue(row[field])).map(field => ({ field, value: displayValue(row[field]) }));
              return <article className="resource-row" key={String(row.id ?? index)}><span className="company-avatar">{heading.slice(0,1).toUpperCase()}</span><div className="resource-row-main"><b>{heading}</b><div className="resource-details">{details.map(detail => <span key={detail.field}><small>{detail.field.replaceAll("_", " ")}</small>{detail.field === "garage_id" ? (garages.find(g => g.id === detail.value)?.name ?? "Garagem vinculada") : detail.value}</span>)}</div></div><DeleteResourceButton section={key} companyId={selected.id} resourceId={String(row.id)} label={heading} /></article>;
            })}</div>}
        </section>
      </>}
      <nav className="resource-nav" aria-label="Módulos da empresa"><Link href={`/dashboard/garages?company=${selected?.id ?? ""}`}>Garagens</Link><Link href={`/dashboard/vehicles?company=${selected?.id ?? ""}`}>Frota</Link><Link href={`/dashboard/careers?company=${selected?.id ?? ""}`}>Carreiras</Link></nav>
    </div>
  </main>;
}
