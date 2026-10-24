import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCareerRun } from "./actions";

type Run = Record<string, unknown>;

function show(value: unknown) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "object") return "";
  const text = String(value);
  const labels: Record<string, string> = { planned: "Planejada", in_progress: "Em andamento", completed: "Concluída", canceled: "Cancelada", active: "Ativo", maintenance: "Em manutenção", inactive: "Inativo" };
  if (labels[text]) return labels[text];
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? text : date.toLocaleString("pt-BR");
  }
  return text;
}

export default async function OperationsPage({ searchParams }: { searchParams: Promise<{ company?: string; saved?: string; error?: string }> }) {
  const query = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");
  const { data: companies, error: companiesError } = await supabase.from("companies").select("id,name").order("name");
  if (companiesError) return <main className="dashboard-page"><div className="dashboard-shell"><p className="auth-error">Não foi possível carregar as empresas autorizadas.</p><Link href="/dashboard">Voltar ao painel</Link></div></main>;
  const selected = (companies ?? []).find(c => c.id === query.company) ?? (companies ?? [])[0];
  let careers: { id: string; title: string }[] = [];
  let vehicles: { id: string; fleet_number: string; display_name: string }[] = [];
  let runs: Run[] = [];
  let loadError = false;
  if (selected) {
    const [careerResult, vehicleResult, runResult] = await Promise.all([
      supabase.from("careers").select("id,title").eq("company_id", selected.id).order("title"),
      supabase.from("vehicles").select("id,fleet_number,display_name").eq("company_id", selected.id).order("fleet_number"),
      supabase.from("career_runs").select("*").eq("company_id", selected.id).order("created_at", { ascending: false }).limit(50)
    ]);
    careers = careerResult.data ?? [];
    vehicles = vehicleResult.data ?? [];
    if (runResult.error) loadError = true;
    else runs = (runResult.data ?? []) as Run[];
  }
  return <main className="dashboard-page">
    <header className="dashboard-nav"><Link className="brand" href="/dashboard"><span className="brand-mark">EV</span><span>EMPRESA VIRTUAL <b>OMSI</b></span></Link><span>{user.email}</span><Link className="button button-outline button-small" href="/dashboard">Voltar ao painel</Link></header>
    <div className="dashboard-shell">
      <div className="eyebrow">OPERAÇÃO E ESCALAS</div><h1>Operações</h1>
      <p className="dashboard-intro">Organize os serviços das carreiras e acompanhe os registros operacionais. O motorista autenticado fica associado ao serviço criado.</p>
      {query.saved === "1" && <div className="auth-notice">Serviço registrado com sucesso.</div>}
      {query.error === "validation" && <div className="auth-error">Selecione uma empresa e uma carreira válidas.</div>}
      {query.error === "save" && <div className="auth-error">Não foi possível registrar o serviço. Confira a carreira, a empresa e as permissões da sua conta.</div>}
      {companies?.length ? <form className="resource-company-picker" action="/dashboard/operations" method="get"><label htmlFor="operation-company">Empresa selecionada</label><div className="company-form-row"><select id="operation-company" name="company" defaultValue={selected?.id ?? ""}>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><button className="button button-primary" type="submit">Abrir empresa</button></div></form> : <section className="dashboard-panel empty-state"><h2>Nenhuma empresa cadastrada</h2><p>Crie uma empresa no painel principal para começar.</p><Link className="button button-primary" href="/dashboard">Ir para o painel</Link></section>}
      {selected && <><section className="dashboard-panel"><div className="panel-heading"><div><h2>Registrar serviço</h2><p>{selected.name}</p></div></div>
        {careers.length ? <form action={createCareerRun} className="resource-create-form"><input type="hidden" name="company_id" value={selected.id}/><label>Carreira<select name="career_id" required defaultValue=""><option value="" disabled>Selecione a carreira</option>{careers.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label><label>Veículo (opcional)<select name="vehicle_id" defaultValue=""><option value="">A definir</option>{vehicles.map(v => <option key={v.id} value={v.id}>{v.fleet_number} — {v.display_name}</option>)}</select></label><label className="operation-notes">Observações<input name="notes" maxLength={1000} placeholder="Anotações iniciais do serviço (opcional)"/></label><button className="button button-primary" type="submit">Registrar serviço →</button><p className="form-hint">O registro começa como planejado. O motorista é definido pela sessão autenticada; não é possível informar outro usuário pelo formulário.</p></form> : <div className="empty-state"><p>Cadastre uma carreira antes de registrar um serviço.</p><Link className="button button-outline" href={`/dashboard/careers?company=${selected.id}`}>Cadastrar carreira →</Link></div>}
      </section><section className="dashboard-panel"><div className="panel-heading"><div><h2>Histórico operacional</h2><p>Últimos 50 registros visíveis para sua conta.</p></div><span className="count-pill">{runs.length} serviço(s)</span></div>
        {loadError ? <p className="auth-error">Não foi possível consultar o histórico operacional.</p> : runs.length ? <div className="resource-list">{runs.map((run,index) => <article className="resource-row" key={String(run.id ?? index)}><span className="company-avatar">{String(run.status ?? "P").slice(0,1).toUpperCase()}</span><div className="resource-row-main"><b>{careers.find(c => c.id === run.career_id)?.title ?? "Serviço operacional"}</b><div className="resource-details"><span><small>Situação</small>{show(run.status) || "Planejada"}</span><span><small>Criado em</small>{show(run.created_at)}</span><span><small>Distância (km)</small>{show(run.distance_km) || "Não informada"}</span><span><small>Pontuação</small>{show(run.score) || "Não informada"}</span></div></div></article>)}</div> : <div className="empty-state"><h3>Nenhum serviço registrado</h3><p>Quando um serviço for registrado, ele aparecerá aqui com os dados persistidos no banco.</p></div>}
      </section></>}
      <nav className="resource-nav"><Link href={`/dashboard/garages?company=${selected?.id ?? ""}`}>Garagens</Link><Link href={`/dashboard/vehicles?company=${selected?.id ?? ""}`}>Frota</Link><Link href={`/dashboard/careers?company=${selected?.id ?? ""}`}>Carreiras</Link></nav>
    </div>
  </main>;
}
