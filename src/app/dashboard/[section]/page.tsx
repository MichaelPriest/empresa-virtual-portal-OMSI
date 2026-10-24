import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const sections = {
  garages: { title: "Garagens", description: "Bases e instalações vinculadas às empresas que você administra.", table: "garages", fields: ["name", "address", "city", "description"] },
  vehicles: { title: "Frota de veículos", description: "Consulte os veículos cadastrados nas suas empresas.", table: "vehicles", fields: ["name", "model", "brand", "fleet_number", "registration", "plate", "year", "status"] },
  careers: { title: "Carreiras", description: "Organize as carreiras e os serviços planejados para a operação virtual.", table: "careers", fields: ["name", "code", "description", "route", "status"] }
} as const;

type SectionKey = keyof typeof sections;
type Row = Record<string, unknown>;

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "object") return "";
  return String(value);
}

export default async function ResourcePage({ params, searchParams }: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ company?: string }>;
}) {
  const { section } = await params;
  const { company: companyId } = await searchParams;
  if (!(section in sections)) notFound();
  const key = section as SectionKey;
  const config = sections[key];
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  const { data: companies, error: companyError } = await supabase
    .from("companies").select("id,name").order("name");
  if (companyError) {
    return <main className="dashboard-page"><div className="dashboard-shell"><p className="auth-error">Não foi possível carregar as empresas autorizadas. Tente novamente.</p><Link className="text-link" href="/dashboard">← Voltar ao painel</Link></div></main>;
  }
  const selected = (companies ?? []).find(item => item.id === companyId) ?? (companies ?? [])[0];
  const rows: Row[] = [];
  let loadError = false;
  if (selected) {
    const result = await supabase.from(config.table).select("*").eq("company_id", selected.id).order("created_at", { ascending: false });
    if (result.error) loadError = true;
    else rows.push(...((result.data ?? []) as Row[]));
  }

  const valueFor = (row: Row, field: string) => {
    const val = displayValue(row[field]);
    if (val) return val;
    return "";
  };

  return <main className="dashboard-page">
    <header className="dashboard-nav">
      <Link className="brand" href="/dashboard"><span className="brand-mark">EV</span><span>EMPRESA VIRTUAL <b>OMSI</b></span></Link>
      <span>{user.email}</span><Link className="button button-outline button-small" href="/dashboard">Voltar ao painel</Link>
    </header>
    <div className="dashboard-shell">
      <div className="eyebrow">GESTÃO DA EMPRESA</div>
      <h1>{config.title}</h1>
      <p className="dashboard-intro">{config.description} Os dados são consultados com sua sessão autenticada e respeitam as políticas de acesso do banco.</p>
      {companies && companies.length > 0 ? <form className="resource-company-picker" action={`/dashboard/${key}`} method="get">
        <label htmlFor="resource-company">Empresa selecionada</label>
        <div className="company-form-row"><select id="resource-company" name="company" defaultValue={selected?.id ?? ""}>{companies.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button className="button button-primary" type="submit">Abrir empresa</button></div>
      </form> : <section className="dashboard-panel empty-state"><h2>Você ainda não tem uma empresa</h2><p>Crie uma empresa no painel principal para começar a organizar seus recursos.</p><Link className="button button-primary" href="/dashboard">Ir para minhas empresas</Link></section>}
      {selected && <section className="dashboard-panel">
        <div className="panel-heading"><div><h2>{selected.name}</h2><p>{config.title} cadastrados nesta empresa</p></div><span className="count-pill">{rows.length} registro(s)</span></div>
        {loadError ? <p className="auth-error">Não foi possível consultar estes registros. Verifique as permissões e tente novamente.</p> : rows.length === 0 ? <div className="empty-state"><h3>Nenhum registro cadastrado</h3><p>Esta página já está conectada à consulta real do banco. O formulário de cadastro será disponibilizado após confirmar os campos e regras da tabela.</p></div> :
          <div className="resource-list">{rows.map((row, index) => {
            const heading = ["name", "model", "fleet_number", "code"].map(field => displayValue(row[field])).find(Boolean) || `${config.title.slice(0, -1)} ${index + 1}`;
            const details = config.fields.filter(field => field !== "name" && valueFor(row, field)).map(field => ({ field, value: valueFor(row, field) }));
            return <article className="resource-row" key={String(row.id ?? index)}><span className="company-avatar">{heading.slice(0,1).toUpperCase()}</span><div className="resource-row-main"><b>{heading}</b><div className="resource-details">{details.map(detail => <span key={detail.field}><small>{detail.field.replaceAll("_", " ")}</small>{detail.value}</span>)}</div></div></article>;
          })}</div>}
      </section>}
      <nav className="resource-nav" aria-label="Módulos da empresa"><Link href={`/dashboard/garages?company=${selected?.id ?? ""}`}>Garagens</Link><Link href={`/dashboard/vehicles?company=${selected?.id ?? ""}`}>Frota</Link><Link href={`/dashboard/careers?company=${selected?.id ?? ""}`}>Carreiras</Link></nav>
    </div>
  </main>;
}
