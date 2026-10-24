# Empresa Virtual OMSI

Portal de gestão de empresas virtuais para OMSI 2 clássico e openOMSI.

## Estado atual
- Next.js App Router + TypeScript, interface inicial em português.
- Projeto Supabase dedicado em São Paulo (`sa-east-1`).
- Esquema inicial com empresas, membros, garagens, veículos, carreiras, execuções, planos, assinaturas e auditoria; RLS habilitada.
- Perfil criado automaticamente quando um usuário real é registrado no Supabase Auth.
- Sem usuários ou empresas fictícias.
- Login operacional, integrações reais com adaptadores OMSI e pagamentos ainda não liberados.
- Valores Premium ainda não definidos; nenhum checkout ou cobrança ativo.

## Desenvolvimento
Requer Node.js compatível com Next.js 15 e npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` com os valores do projeto dedicado. Nunca exponha `SUPABASE_SECRET_KEY`, `STRIPE_SECRET_KEY` ou `STRIPE_WEBHOOK_SECRET` no navegador.

## Validação
```bash
npm run lint
npm run typecheck
npm run build
```

## Segurança e deploy
- Desenvolvimento na branch `feature/portal-mvp-bootstrap`.
- Não alterar `main` nem implantar em produção sem autorização explícita.
- Antes do deploy, gerar e versionar lockfile, executar lint/typecheck/build e testar RLS com contas separadas.
- Premium só poderá ser concedido por backend após webhook de pagamento validado.

Consulte `docs/ARCHITECTURE.md`.