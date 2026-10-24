# Arquitetura inicial — Empresa Virtual OMSI

## Limites do produto
- Portal separado do Conecta e do repositório dos plugins/adaptadores.
- Dois alvos distintos: OMSI 2 clássico e openOMSI. Não presumir compatibilidade de API; validar cada adaptador contra documentação e runtime reais.
- Pagamentos Premium não estão ativos. Valores Premium seguem TBD e nenhum checkout concede acesso sem confirmação server-side do provedor.
- Sem usuários, empresas, frotas ou carreiras de demonstração inseridos no banco.

## Camadas
1. Next.js App Router para o portal web.
2. Supabase Auth e PostgreSQL para identidade e persistência.
3. Row Level Security por associação à empresa e função.
4. Adaptadores dos simuladores em repositório separado, conectados por contrato versionado.
5. Futuro Stripe: checkout server-side, webhooks assinados, idempotência e reconciliação antes de conceder plano.

## Modelo inicial
- profiles: perfil vinculado a auth.users.
- companies / company_members: empresas e papéis owner/admin/dispatcher/driver.
- garages / vehicles: garagens e frota.
- careers / career_runs: carreiras e execuções.
- plans / subscriptions: catálogo e estado de assinatura.
- audit_events: trilha de auditoria reservada a operações privilegiadas.

## Segurança
- RLS habilitada nas tabelas expostas.
- Chaves secretas exclusivamente server-side; nunca usar prefixo NEXT_PUBLIC_.
- Cliente não pode criar nem alterar assinaturas, catálogo de planos ou eventos de auditoria.
- Papéis de autorização não vêm de user_metadata editável pelo usuário.
- Antes de liberar administração de membros, implementar e testar operações server-side com autorização explícita e auditoria.

## Estado
Esquema inicial aplicado no projeto Supabase dedicado em sa-east-1. Autenticação de produção, criação de empresa pelo painel, integrações dos simuladores, Stripe, testes E2E e deploy continuam pendentes.
