import { plans } from "@/lib/plans";

function Icon({ name, size = 22 }: { name: "building" | "fleet" | "route" | "shield" | "arrow" | "users" | "layers" | "check" | "bus" | "gauge"; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths = {
    building: <><path d="M3 21h18M5 21V5l7-2v18M19 21V9l-7-2"/><path d="M8 7h1M8 11h1M8 15h1M15 11h1M15 15h1"/></>,
    fleet: <><path d="M3 7h12v11H3zM15 11h4l3 3v4h-7z"/><circle cx="7.5" cy="18" r="2"/><circle cx="18.5" cy="18" r="2"/><path d="M6 10h6"/></>,
    route: <><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3v-6a3 3 0 0 1 3-3"/></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    bus: <><path d="M5 17V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12"/><path d="M5 10h14M8 6h.01M16 6h.01M5 17h14l1 3H4l1-3z"/><circle cx="8" cy="17" r="1"/><circle cx="16" cy="17" r="1"/></>,
    gauge: <><path d="M3 14a9 9 0 1 1 18 0"/><path d="m12 14 4-5"/><circle cx="12" cy="14" r="1"/><path d="M5 18h14"/></>
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const features = [
  { number: "01", icon: "building" as const, title: "Sua empresa, organizada", text: "Cadastre empresa, membros e garagens em um espaço próprio, com acesso controlado por função." },
  { number: "02", icon: "fleet" as const, title: "Frota e carreiras", text: "Estruture veículos, escalas e registros para transformar sua operação virtual em uma gestão consistente." },
  { number: "03", icon: "route" as const, title: "Dois simuladores", text: "Arquitetura preparada para OMSI 2 clássico e openOMSI, com integrações desenvolvidas e validadas separadamente." }
];

export default function HomePage() {
  return <main className="marketing public-app">
    <aside className="public-sidebar">
      <a className="brand public-brand" href="#inicio" aria-label="Empresa Virtual OMSI - início"><span className="brand-mark"><Icon name="bus" size={20}/></span><span>EMPRESA VIRTUAL <b>OMSI</b></span></a>
      <div className="public-nav-label">MENU PRINCIPAL</div>
      <nav className="public-side-nav" aria-label="Atalhos públicos">
        <a className="public-side-link active" href="#inicio"><span><Icon name="gauge" size={18}/></span>Visão geral</a>
        <a className="public-side-link" href="#recursos"><span><Icon name="layers" size={18}/></span>Plataforma</a>
        <a className="public-side-link" href="#planos"><span><Icon name="building" size={18}/></span>Planos e recursos</a>
        <a className="public-side-link" href="#status"><span><Icon name="shield" size={18}/></span>Status do projeto</a>
        <a className="public-side-link" href="/login"><span><Icon name="users" size={18}/></span>Acessar / criar conta</a>
      </nav>
      <div className="sidebar-plan-card"><span className="sidebar-plan-icon"><Icon name="bus" size={18}/></span><b>Comece gratuitamente</b><p>Organize sua empresa virtual em um só lugar.</p><a href="/login">Criar minha conta <Icon name="arrow" size={14}/></a></div>
      <div className="public-sidebar-footer"><span className="sidebar-status-dot"/> Projeto em desenvolvimento <small>OMSI 2 clássico · openOMSI</small></div>
    </aside>
    <div className="public-content">
    <nav className="nav public-topbar">
      <div className="topbar-context"><span className="topbar-mobile-brand"><Icon name="bus" size={18}/></span><div><small>PORTAL PÚBLICO</small><b>Empresa Virtual OMSI</b></div></div>
      <div className="topbar-actions"><span className="topbar-status"><i/> Plataforma em evolução</span><a className="button button-small button-primary nav-login" href="/login">Acessar portal <Icon name="arrow" size={15}/></a></div>
    </nav>

    <section id="inicio" className="hero shell">
      <div className="hero-copy">
        <div className="eyebrow"><span className="pulse"/> PLATAFORMA DE GESTÃO · OMSI</div>
        <h1>Leve sua empresa virtual <span>para o próximo nível.</span></h1>
        <p className="hero-lead">Uma central profissional para organizar empresas, motoristas, frota e carreiras — concebida para acompanhar OMSI 2 clássico e openOMSI sem misturar suas integrações.</p>
        <div className="hero-actions"><a className="button button-primary" href="/login">Começar agora <Icon name="arrow" size={17}/></a><a className="text-link" href="#recursos">Conhecer a plataforma <span>↓</span></a></div>
        <div className="hero-assurances"><span><Icon name="shield" size={16}/> Acesso por permissões</span><span><Icon name="layers" size={16}/> Arquitetura modular</span></div>
      </div>
      <div className="hero-visual">
        <div className="visual-top"><span className="window-dots"><i/><i/><i/></span><span>EMPRESA VIRTUAL / OVERVIEW</span><span className="live-label"><i/> AMBIENTE INICIAL</span></div>
        <div className="visual-body"><aside className="visual-sidebar"><span className="side-icon active"><Icon name="gauge" size={17}/></span><span className="side-icon"><Icon name="building" size={17}/></span><span className="side-icon"><Icon name="fleet" size={17}/></span><span className="side-icon"><Icon name="route" size={17}/></span><span className="side-icon"><Icon name="users" size={17}/></span></aside>
          <div className="visual-content"><div className="preview-heading"><div><small className="mono">PAINEL DE CONTROLE</small><h3>Visão geral</h3><p>Bem-vindo à sua central de operações.</p></div><span className="preview-avatar">EV</span></div>
            <div className="preview-kpis"><div className="stat"><span className="stat-icon"><Icon name="building" size={16}/></span><small>EMPRESAS</small><strong>—</strong><span>Seus espaços de gestão</span></div><div className="stat"><span className="stat-icon"><Icon name="fleet" size={16}/></span><small>FROTA</small><strong>—</strong><span>Veículos cadastrados</span></div></div>
            <div className="route-card"><div className="route-card-title"><span className="route-card-icon"><Icon name="route" size={16}/></span><div><small className="mono">OPERAÇÃO</small><h4>Carreiras e escalas</h4></div><span className="preview-tag">EM PREPARAÇÃO</span></div><div className="preview-line"><span/><span/><span/></div><p>Os dados operacionais aparecerão conforme os módulos forem liberados.</p></div>
          </div>
        </div>
        <div className="visual-footer"><span><Icon name="shield" size={13}/> Dados reais quando autenticado</span><span>PRÉVIA DA INTERFACE</span></div>
      </div>
    </section>

    <div className="trust-strip"><div className="shell trust-inner"><span><Icon name="check" size={15}/> Isolamento por empresa</span><span><Icon name="check" size={15}/> Permissões por função</span><span><Icon name="check" size={15}/> Sem dados fictícios</span><span><Icon name="check" size={15}/> Pagamentos desativados</span></div></div>

    <section id="recursos" className="section shell"><div className="section-heading"><div><div className="eyebrow">UMA BASE PARA CRESCER</div><h2>Da garagem ao relatório.<br/><span>Uma gestão, muitas possibilidades.</span></h2></div><p>Uma experiência planejada para a comunidade de simulação, com transparência sobre o que já está disponível e o que ainda está em desenvolvimento.</p></div><div className="pillar-grid">{features.map(feature=><article className="pillar" key={feature.number}><div className="pillar-topline"><span className="pillar-number">{feature.number}</span><span className="pillar-icon"><Icon name={feature.icon} size={23}/></span></div><h3>{feature.title}</h3><p>{feature.text}</p><a href="/login" className="pillar-link">Acessar portal <Icon name="arrow" size={15}/></a></article>)}</div></section>

    <section id="planos" className="pricing-section"><div className="shell"><div className="section-heading"><div><div className="eyebrow">SIMPLES E TRANSPARENTE</div><h2>Comece grátis.<br/><span>Evolua no seu ritmo.</span></h2></div><p>Os recursos Premium e os preços finais serão publicados após validação. Nenhuma cobrança é ativada nesta versão.</p></div><div className="pricing-grid">{plans.map(plan=><article className={plan.highlighted?"plan plan-highlighted":"plan"} key={plan.code}>{plan.highlighted&&<div className="plan-tag">MAIS RECURSOS</div>}<div className="plan-icon"><Icon name={plan.code==="free"?"bus":plan.code==="premium_monthly"?"gauge":"layers"} size={20}/></div><h3>{plan.name}</h3><p className="plan-description">{plan.description}</p><div className="price">{plan.price}<small>{plan.code==="free"?" / sem mensalidade":plan.code==="premium_monthly"?" / por mês":" / por ano"}</small></div><ul>{plan.features.map(feature=><li key={feature}><span><Icon name="check" size={14}/></span>{feature}</li>)}</ul><a className={plan.highlighted?"button button-primary plan-button":"button button-outline plan-button"} href={plan.code==="free"?"/login":"#status"}>{plan.code==="free"?"Criar conta gratuita":"Disponibilidade em breve"} <Icon name="arrow" size={15}/></a></article>)}</div></div></section>

    <section id="status" className="section shell status-section"><div className="status-card"><div><div className="eyebrow">TRANSPARÊNCIA DO PROJETO</div><h2>Construído com cuidado.<br/><span>Liberado por etapas.</span></h2><p>A plataforma está em desenvolvimento contínuo. A base web e a autenticação estão no projeto; os módulos operacionais, os plugins e os pagamentos dependem de validação antes de serem anunciados como disponíveis.</p><a href="/login" className="button button-outline status-cta">Acessar o portal <Icon name="arrow" size={16}/></a></div><div className="status-list"><div><i className="done"><Icon name="check" size={15}/></i><span><b>Projeto Supabase dedicado</b><small>Separado dos demais projetos</small></span></div><div><i className="done"><Icon name="check" size={15}/></i><span><b>Estrutura inicial e controle de acesso</b><small>Base de dados e políticas previstas no código</small></span></div><div><i className="progress">◷</i><span><b>Painel de gestão</b><small>Em implementação e validação</small></span></div><div><i className="pending">○</i><span><b>Plugins e cobrança</b><small>Não liberados nesta etapa</small></span></div></div></div></section>

    <footer className="footer"><div className="shell footer-inner"><a className="brand" href="#"><span className="brand-mark"><Icon name="bus" size={18}/></span><span>EMPRESA VIRTUAL <b>OMSI</b></span></a><span>Feito para quem vive o transporte virtual.</span><span>© {new Date().getFullYear()} · Projeto independente</span></div></footer>
    </div>
  </main>;
}
