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
  const { data: companies, error } = await supabase.from("companies").select("id,name,slug,created_at").order("created_at", { ascending: false });
  return <main className="dashboard-page">
    <header className="dashboard-nav"><Link className="brand" href="/"><span className="brand-mark">EV</span><span>EMPRESA VIRTUAL <b>OMSI</b></span></Link><span>{user.email}</span><form action="/auth/signout" method="post"><button className="button button-outline button-small" type="submit">Sair</button></form></header>
    <div className="dashboard-shell"><div className="eyebrow">ÁREA AUTENTICADA</div><h1>Visão geral</h1><p className="dashboard-intro">Gerencie suas empresas. Os dados abaixo vêm do banco real.</p>
    {params.created && <div className="auth-notice">Empresa criada com sucesso.</div>}{params.error && <div className="auth-error">Não foi possível criar a empresa. Verifique o nome e tente novamente.</div>}
    <section className="dashboard-panel"><div className="panel-heading"><div><h2>Minhas empresas</h2><p>Comece criando sua empresa virtual.</p></div><span className="count-pill">{companies?.length ?? 0} cadastrada(s)</span></div>
    <form action={createCompany} className="company-form"><label htmlFor="company-name">Nome da empresa</label><div className="company-form-row"><input id="company-name" name="name" required minLength={2} maxLength={120} placeholder="Nome da empresa virtual" /><button className="button button-primary" type="submit">Criar empresa →</button></div></form>
    {error ? <p className="auth-error">Não foi possível carregar suas empresas.</p> : companies?.length ? <div className="company-list">{companies.map(company => <article className="company-row" key={company.id}><span className="company-avatar">{company.name.slice(0,1).toUpperCase()}</span><span className="company-name"><b>{company.name}</b><small>/{company.slug}</small></span><span className="company-status">Ativa</span></article>)}</div> : <div className="empty-state"><h3>Nenhuma empresa por enquanto</h3><p>Crie a primeira empresa usando o formulário acima. Sua conta será vinculada como proprietária.</p></div>}</section>
    <section className="dashboard-panel"><h2>Próximos módulos</h2><div className="roadmap-grid"><div><b>Garagens e frota</b><small>Cadastro por empresa</small></div><div><b>Carreiras</b><small>Planejamento e histórico</small></div><div><b>Integrações OMSI</b><small>Adaptadores validados</small></div></div></section><Link className="text-link" href="/">← Voltar ao site público</Link></div></main>;
}
