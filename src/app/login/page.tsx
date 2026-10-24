import Link from "next/link";

export default function LoginPage() {
  return <main className="auth-page"><section className="auth-card"><Link className="brand" href="/"><span className="brand-mark">EV</span><span>EMPRESA VIRTUAL <b>OMSI</b></span></Link><div className="eyebrow">ACESSO À PLATAFORMA</div><h1>Entre na sua conta</h1><p>A autenticação está sendo conectada ao Supabase. Não utilizamos logins de demonstração.</p><div className="auth-notice">O acesso ainda não está liberado nesta versão. Volte ao início para acompanhar o desenvolvimento.</div><Link className="button button-primary" href="/">Voltar ao início →</Link></section></main>;
}
