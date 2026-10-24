"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email, password, options: { data: { full_name: name.trim() } }
        });
        if (authError) throw authError;
        if (data.session) window.location.assign("/dashboard");
        else setMessage("Cadastro recebido. Confira seu e-mail para confirmar a conta antes de entrar.");
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        window.location.assign("/dashboard");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível concluir a autenticação.");
    } finally { setBusy(false); }
  }

  return <main className="auth-page"><section className="auth-card">
    <Link className="brand" href="/"><span className="brand-mark">EV</span><span>EMPRESA VIRTUAL <b>OMSI</b></span></Link>
    <div className="eyebrow">ACESSO À PLATAFORMA</div><h1>{mode === "signin" ? "Entre na sua conta" : "Crie sua conta"}</h1>
    <p className="auth-lead">Acesse sua central de empresas, garagens e carreiras virtuais.</p>
    <div className="auth-assurances"><span>◈ Conta pessoal</span><span>✓ Sem usuários fictícios</span></div>
    <form className="auth-form" onSubmit={submit}>
      {mode === "signup" && <label>Nome para exibição<input autoComplete="name" value={name} onChange={e => setName(e.target.value)} required minLength={2} maxLength={100} /></label>}
      <label>E-mail<input type="email" autoComplete="email" inputMode="email" placeholder="voce@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} /></label>
      <label>Senha<input type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder={mode === "signin" ? "Sua senha" : "Mínimo de 8 caracteres"} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} maxLength={128} /></label>
      <button className="button button-primary auth-submit" disabled={busy} type="submit">{busy ? "Aguarde..." : mode === "signin" ? "Entrar →" : "Criar conta →"}</button>
    </form>
    {error && <p className="auth-error" role="alert">{error}</p>}
    {message && <p className="auth-notice" role="status">{message}</p>}
    <button className="auth-toggle" type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }}>{mode === "signin" ? "Ainda não tem conta? Criar cadastro" : "Já tem conta? Entrar"}</button>
    <Link className="auth-back" href="/">← Voltar ao início</Link>
  </section></main>;
}
