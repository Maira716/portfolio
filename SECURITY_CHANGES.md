# 🛡️ Relatório de Mudanças e Correções de Segurança (SECURITY_CHANGES.md)
**Projeto:** Portfólio & Plataforma de Gestão de Clientes  
**Auditor:** Senior Security Engineer (Next.js & Supabase AppSec)  
**Data:** Outubro de 2026

---

## 1. Arquivos Alterados e Detalhamento das Mudanças

### 1.1 `src/lib/supabase.ts`
- **O que mudou:** Removidos todos os valores fixos (fallbacks) de `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Por quê:** Evitar que credenciais fiquem embutidas no código-fonte e garantir que a aplicação falhe explicitamente caso as variáveis de ambiente não estejam configuradas.

### 1.2 `src/context/AuthContext.tsx`
- **O que mudou:**
  - Removida a constante `ADMIN_EMAILS` e qualquer dedução de papel (`admin`/`client`) baseada em comparação de e-mails no bundle do cliente.
  - Em `getFallbackProfile`, o papel padrão é **estritamente `client`** (menor privilégio).
  - O papel (`role`) do usuário é lido exclusivamente da tabela `public.profiles` do banco de dados (que possui proteção RLS e trigger contra adulteração).
- **Por quê:** Impedir qualquer tentativa de escalação de privilégios no frontend.

### 1.3 `src/app/login/page.tsx`
- **O que mudou:**
  - Removida verificação de e-mail hardcoded para determinar destino do login. O roteamento baseia-se unicamente no `role` retornado do banco.
  - Implementada a função utilitária `sanitizeRedirectUrl()` para validação do parâmetro `redirect` (impedindo ataques de *Open Redirect*).
  - Se o papel não puder ser verificado, o redirecionamento padrão é sempre para a área restrita do cliente (`/portal`).
- **Por quê:** Prevenção de ataques de Open Redirect e garantia de menor privilégio.

### 1.4 `src/middleware.ts`
- **O que mudou:**
  - Implementada verificação de sessão e perfil no servidor utilizando `@supabase/ssr` e `supabase.auth.getUser()`.
  - Bloqueio no servidor para acessos a `/admin/*` caso o usuário não possua `role === 'admin'`.
  - Bloqueio de usuários não autenticados em `/portal/*`.
  - Bloqueio imediato de contas com `status === 'blocked'`.
- **Por quê:** Proteção real de rotas antes mesmo da renderização de qualquer componente React.

### 1.5 `supabase-rls-setup.sql`
- **O que mudou:**
  - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` em todas as tabelas públicas (`profiles`, `projects`, `project_milestones`, `project_updates`).
  - Criação da função `is_admin()` com `SECURITY DEFINER` e `SET search_path = public` para evitar recursão infinita em policies.
  - Criação do trigger `trg_protect_profile_fields` que bloqueia alterações nas colunas `role` e `status` por usuários comuns.
  - Criação do trigger `on_auth_user_created` que sempre cadastra novos usuários com `role = 'client'`.
- **Por quê:** Garantia de isolamento e segurança em nível de banco de dados (PostgreSQL RLS).

---

## 2. Passos Manuais Fora do Código (Painel Supabase & Vercel)

### 2.1 Executar o SQL Atualizado no Supabase:
1. Acesse o **SQL Editor** no painel da Supabase.
2. Cole o conteúdo de `supabase-rls-setup.sql` e clique em **Run**.

### 2.2 Conferir Configuração de Confirmação de E-mail:
1. No painel do Supabase, acesse **Authentication** > **Providers** > **Email**.
2. Verifique se a opção **"Confirm email"** está **marcada/habilitada**.
   - *Motivo:* Garante que usuários só consigam autenticar após validarem a posse do e-mail cadastrado.

### 2.3 Rotação de Chaves de Serviço:
- **Status:** Não encontramos nenhuma `SUPABASE_SERVICE_ROLE_KEY` exposta em texto puro no repositório.
- **Boa Prática:** Mantenha a chave `SUPABASE_SERVICE_ROLE_KEY` exclusivamente configurada nas Variáveis de Ambiente da Vercel (Production Environment).

---

## 3. Verificação de Rotas com Decisões no Frontend
| Rota / Componente | Verificação no Servidor | Verificação no Frontend | Status de Segurança |
| :--- | :---: | :---: | :---: |
| `/admin` | `middleware.ts` + APIs protegidas | `AuthContext` (perfil) | 🔒 Totalmente Blindado |
| `/portal` | `middleware.ts` + APIs isoladas por RLS | `AuthContext` (perfil) | 🔒 Totalmente Blindado |
| `/proposta/[id]` | Validação por ID de proposta | Renderização pública interativa | 🔒 Seguro por design |
