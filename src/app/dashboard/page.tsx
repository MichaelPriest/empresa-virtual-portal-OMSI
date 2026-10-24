import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCompany } from "./actions";

type SearchParams = Promise<{ created?: string; error?: string }>;

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  const { data: companies, error } = await supabase
    .from("companies")
    .select("id,name,slug,created_at")
    .order("created_at", { ascending: false });

  // Counts are queried through the signed-in user's RLS session, never a service-role key.
  const companySummaries = await Promise.all((companies ?? []).map(async (company) => {
    const [garages, vehicles, careers, membership] = await Promise.all([
      supabase.from("garages").select("id", { count: "exact", head: true }).eq("company_id", company.id),
      supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("company_id", company.id),
      supabase.from("careers").select("id", { count: "exact", head: true }).eq("company_id", company.id),
      supabase.from("company_members").select("role").eq("company_id", company.id).eq("user_id", user.id).maybeSingle()
    ]);
    return {
      ...company,
      garageCount: garages.count ?? 0,
      vehicleCount: vehicles.count ?? 0,
      careerCount: careers.count ?? 0,
      role: membership.data?.role ?? "membro"
    };
  }));

  const roleLabels: Record<string, string> = {
    owner: "Proprietária(o)",
    admin: "Administradora(or)",
    dispatcher: "Despachante",
    driver: "Motorista",
    membro: "Membro"
  };

  return <main className="dashboard-page">
    <header className="dashboard-nav">
      <Link className="brand" href="/"><span className="brand-mark">EV</span><span>EMPRESA VIRTUAL <b>OMSI</b></span></Link>
      <span>{user.email}</span>
      <form action="/auth/signout" method="post"><button className="button button-outline button-small" type="submit">Sair</button></form>
    </header>
    <div className="dashboard-shell">
      <div className="eyebrow">ÁREA AUTENTICADA</div>
      <h1>Visão geral</h1>
      <p className="dashboard-intro">Sua central de gestão para OMSI 2 clássico e openOMSI. As informações são carregadas do banco real, respeitando as permissões da sua conta.</p>
      {params.created && <div className="auth-notice">Empresa criada com sucesso e vinculada à sua conta.</div>}
      {params.error && <div className="auth-error">Não foi possível criar a empresa. Verifique o nome e tente novamente.</div>}

      <section className="dashboard-panel">
        <div className="panel-heading">
          <div><h2>Minhas empresas</h2><p>Empresas nas quais sua conta possui associação.</p></div>
          <span className="count-pill">{companies?.length ?? 0} cadastrada(s)</span>
        </div>
        <form action={createCompany} className="company-form">
          <label htmlFor="company-name">Nome da empresa</label>
          <div className="company-form-row">
            <input id="company-name" name="name" required minLength={2} maxLength={120} placeholder="Nome da empresa virtual" />
            <button className="button button-primary" type="submit">Criar empresa →</button>
          </div>
        </form>
        {error ? <p className="auth-error">Não foi possível carregar suas empresas. Atualize a página ou tente novamente mais tarde.</p> :
          companySummaries.length ? <div className="company-list">{companySummaries.map(company =>
            <article className="company-row company-row-expanded" key={company.id}>
              <span className="company-avatar">{company.name.slice(0, 1).toUpperCase()}</span>
              <span className="company-name"><b>{company.name}</b><small>/{company.slug}</small><small>{roleLabels[company.role] ?? "Membro"}</small></span>
              <div className="company-metrics">
                <span><b>{company.garageCount}</b><small>Garagens</small></span>
                <span><b>{company.vehicleCount}</b><small>Veículos</small></span>
                <span><b>{company.careerCount}</b><small>Carreiras</small></span>
              </div>
              <div className="company-quick-links"><Link href={`/dashboard/garages?company=${company.id}`}>Garagens</Link><Link href={`/dashboard/vehicles?company=${company.id}`}>Frota</Link><Link href={`/dashboard/careers?company=${company.id}`}>Carreiras</Link><Link href={`/dashboard/operations?company=${company.id}`}>Operações</Link></div><span className="company-status">Ativa</span>
            </article>
          )}</div> :
          <div className="empty-state"><h3>Nenhuma empresa por enquanto</h3><p>Crie a primeira empresa usando o formulário acima. Sua conta será vinculada como proprietária automaticamente pelo banco.</p></div>}
      </section>

      <section className="dashboard-panel">
        <div className="panel-heading"><div><h2>Central de operação</h2><p>Os módulos abaixo serão habilitados por etapas, com persistência e autorização reais.</p></div></div>
        <div className="roadmap-grid">
          <Link href="/dashboard/garages"><b>Garagens</b><small>Consultar as garagens por empresa →</small></Link>
          <Link href="/dashboard/vehicles"><b>Frota de veículos</b><small>Consultar veículos cadastrados →</small></Link>
          <Link href="/dashboard/careers"><b>Carreiras</b><small>Consultar carreiras cadastradas →</small></Link>
          <Link href="/dashboard/operations"><b>Operações e escalas</b><small>Registrar serviços e consultar o histórico →</small></Link>
          <div><b>Motoristas e funções</b><small>Associação por empresa e permissões</small></div>
          <div><b>Integrações OMSI</b><small>Adaptadores separados e ainda não liberados</small></div>
          <div><b>Planos e assinatura</b><small>Catálogo inicial · cobrança desativada</small></div>
          <div><b>Sincronização offline</b><small>Planejada após validar os contratos dos plugins</small></div>
        </div>
      </section>
      <Link className="text-link" href="/">← Voltar ao site público</Link>
    </div>
  </main>;
}
