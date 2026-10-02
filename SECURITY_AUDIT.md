# 🛡️ Relatório de Auditoria Completa de Segurança (AppSec)
**Data da Auditoria:** Outubro de 2026  
**Auditor Responsável:** Senior Application Security Engineer (AppSec)  
**Frameworks e Referências:** OWASP Top 10:2021, OWASP ASVS v4.0.3, LGPD (Lei 13.709/2018)  
**Status do Projeto:** Corrigido e Protegido (Hardened)

---

## 1. Mapeamento de Arquitetura e Superfície de Ataque

### 1.1 Stack Tecnológico
- **Linguagens:** TypeScript (TS / TSX), JavaScript (ESM / Node.js), CSS3 (Tailwind v4)
- **Framework Web:** Next.js 16.2 (App Router) & React 19.2
- **Camada de Dados & Persistência:**
  - Supabase Cloud (PostgreSQL gerenciado, Row Level Security, Auth JWT)
  - `serverStore` local (sistema de fallback de dados JSON para desenvolvimento)
  - `localStorage` no browser (cache e metadados de sessão do cliente)
- **Comunicação & Mensageria:** Resend API (e-mails transacionais), Webhooks

### 1.2 Pontos de Entrada de Dados e Rotas Mapeadas
| Rota / Endpoint | Método | Função | Nível de Acesso Original | Nível Corrigido |
| :--- | :---: | :--- | :---: | :---: |
| `/api/auth/client-login` | `POST` | Autenticação de clientes e admin | Público | Protegido com Rate Limiting e Salt/Hash |
| `/api/admin/clients` | `GET` | Listagem de todos os clientes | ⚠️ Público sem Auth | 🔒 Restrito a Administrador + Redação de Senhas |
| `/api/admin/create-client` | `POST` | Criação de novos perfis de clientes | ⚠️ Sem Auth no Servidor | 🔒 Restrito a Administrador |
| `/api/admin/update-client` | `POST` | Alteração de dados cadastrais | ⚠️ Sem Auth no Servidor | 🔒 Restrito a Administrador |
| `/api/admin/delete-client` | `POST` | Exclusão de contas de clientes | ⚠️ Sem Auth no Servidor | 🔒 Restrito a Administrador |
| `/api/admin/projects` | `POST` | Criação/edição de projetos | ⚠️ Sem Auth no Servidor | 🔒 Restrito a Administrador |
| `/api/admin/delete-project` | `POST` | Exclusão de projetos | ⚠️ Sem Auth no Servidor | 🔒 Restrito a Administrador |
| `/api/portal/projects` | `GET` | Consulta de projetos do cliente | ⚠️ Burlar via `?isAdmin=true` | 🔒 Verificação estrita de Token/Session |
| `/api/portal/finances` | `GET/POST` | Consulta e atualização financeira | ⚠️ Exposição total sem Auth | 🔒 Isolamento por cliente + Admin only POST |
| `/api/portal/documents` | `GET/POST` | Documentos e contratos | ⚠️ Exposição total sem Auth | 🔒 Isolamento por cliente + Admin only POST |
| `/api/portal/updates` | `GET/POST` | Linha do tempo de projetos | ⚠️ Sem validação de escopo | 🔒 Escopo validado por projeto |
| `/api/portal/notifications` | `GET/POST` | Notificações de clientes | Público | 🔒 Isolado por e-mail/ID de cliente |
| `/api/proposals` | `GET/POST` | Visualização e geração de propostas | Público com ID | 🔒 Validação de schema e sanitização |
| `/api/notifications/email` | `POST` | Disparo de e-mails transacionais | ⚠️ Open relay sem rate limit | 🔒 Rate limiting e validação estrita |

---

## 2. Matriz de Vulnerabilidades Identificadas e Corrigidas

### 🔴 VULN-01: Exposição Total de Clientes e PII sem Autenticação (Broken Access Control & LGPD)
- **Arquivo / Linha:** `src/app/api/admin/clients/route.ts` (Linha 5-45)
- **Severidade:** **CRÍTICA (CVSS 9.1)**
- **Classificação:** OWASP Top 10: A01:2021 - Broken Access Control / LGPD Art. 46 (Segurança de Dados)
- **Descrição:** O endpoint `GET /api/admin/clients` retornava todos os dados pessoais de clientes (nome completo, e-mails, telefones, empresas e hash/senhas) para qualquer requisição HTTP não autenticada.
- **Impacto:** Vazamento de dados de clientes, violação direta da LGPD com risco de sanções e perda de conformidade.
- **Correção Aplicada:**
  - Implementada verificação de sessão/token administrativo (`getAuthenticatedUser(req)`).
  - Removido explicitamente qualquer campo `password` do payload retornado para o frontend.

---

### 🔴 VULN-02: Escalação de Privilégios e IDOR via Query String em Projetos e Finanças
- **Arquivo / Linha:** `src/app/api/portal/projects/route.ts` (Linha 10) e `src/app/api/portal/finances/route.ts` (Linha 15)
- **Severidade:** **ALTA (CVSS 8.5)**
- **Classificação:** OWASP Top 10: A01:2021 - Broken Object Level Authorization (IDOR)
- **Descrição:** O endpoint confiava cegamente no parâmetro de URL `?isAdmin=true` enviado pelo cliente no navegador para liberar a listagem de todos os projetos e contratos financeiros globais.
- **Impacto:** Um cliente mal-intencionado podia visualizar valores de contratos de outros clientes e dados de outros projetos.
- **Correção Aplicada:**
  - O privilégio administrativo agora é validado exclusivamente pelo token de sessão verificado no servidor, impedindo manipulação por query params.

---

### 🔴 VULN-03: Rota de Disparo de E-mails sem Rate Limiting (Open Relay / Spam Abuse)
- **Arquivo / Linha:** `src/app/api/notifications/email/route.ts` (Linha 3-60)
- **Severidade:** **ALTA (CVSS 7.8)**
- **Classificação:** OWASP Top 10: A04:2021 - Insecure Design / Rate Limiting
- **Descrição:** O endpoint de envio de e-mails aceitava qualquer destinatário, assunto e corpo HTML sem limitação de requisições por IP, permitindo ataques de DoS ou uso da infraestrutura como disparador de spam/phishing.
- **Impacto:** Esgotamento da cota de e-mails (Resend), inclusão do domínio em blacklists de spam.
- **Correção Aplicada:**
  - Adicionado Rate Limiting em memória (sliding window) limitando disparos a 15 requisições por minuto por IP.
  - Sanitização de strings e validação formal de sintaxe de e-mails (`isValidEmail`).

---

### 🟠 VULN-04: Falta de Rate Limiting e Proteção contra Força Bruta no Endpoint de Login
- **Arquivo / Linha:** `src/app/api/auth/client-login/route.ts` (Linha 5-30)
- **Severidade:** **ALTA (CVSS 7.5)**
- **Classificação:** OWASP Top 10: A07:2021 - Identification and Authentication Failures
- **Descrição:** Não havia limitação de tentativas no backend, permitindo ataques automatizados de dicionário / força bruta em contas de clientes e admin.
- **Impacto:** Comprometimento de credenciais de usuários e sobrecarga no serviço de autenticação.
- **Correção Aplicada:**
  - Implementado bloqueio com resposta `HTTP 429 Too Many Requests` e cabeçalho `Retry-After` caso exceda 10 tentativas por minuto por IP.

---

### 🟠 VULN-05: Ausência de Content Security Policy (CSP) nos Cabeçalhos HTTP
- **Arquivo / Linha:** `next.config.ts` (Linha 3-33)
- **Severidade:** **MÉDIA (CVSS 6.1)**
- **Classificação:** OWASP Top 10: A05:2021 - Security Misconfiguration
- **Descrição:** O sistema não possuía cabeçalho `Content-Security-Policy`, permitindo potenciais ataques de Cross-Site Scripting (XSS) e injeção de scripts terceiros caso houvesse vulnerabilidade no DOM.
- **Impacto:** Risco de execução não autorizada de scripts em navegadores de clientes.
- **Correção Aplicada:**
  - Adicionado cabeçalho CSP rigoroso com restrição de fontes (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, conexões permitidas apenas para Supabase, Vercel e Google Fonts).

---

### 🟡 VULN-06: Armazenamento e Verificação de Senhas em Tempo Constante
- **Arquivo / Linha:** `src/lib/serverStore.ts` e `src/app/api/auth/client-login/route.ts`
- **Severidade:** **MÉDIA (CVSS 5.3)**
- **Classificação:** OWASP Top 10: A02:2021 - Cryptographic Failures / Timing Attacks
- **Descrição:** Comparações de strings diretas eram vulneráveis a ataques de canal lateral baseados em tempo (Timing Attacks).
- **Impacto:** Enumeração probabilística de senhas por tempo de resposta.
- **Correção Aplicada:**
  - Criada função `verifyPassword` utilizando `crypto.timingSafeEqual` e suporte a hash salgado `crypto.scryptSync`.

---

## 3. Conformidade com a LGPD (Lei Geral de Proteção de Dados)

| Princípio LGPD (Art. 6º) | Status no Projeto | Ação Implementada |
| :--- | :---: | :--- |
| **Finalidade & Necessidade** | ✅ Conforme | Apenas dados estritamente necessários para o projeto (nome, e-mail, telefone) são coletados. |
| **Segurança & Confidencialidade** | ✅ Conforme | Senhas e PII removidas de repositórios públicos; rotas protegidas por autenticação no servidor. |
| **Livre Acesso & Transparência** | ✅ Conforme | O cliente autenticado visualiza apenas seus próprios projetos, relatórios e documentos via Portal do Cliente. |
| **Prevenção contra Vazamentos** | ✅ Conforme | Proteção contra IDOR, Rate Limiting ativo e redação de campos confidenciais em respostas de API. |

---

## 4. Riscos Residuais e Recomendações de Infraestrutura

1. **Row Level Security (RLS) no Supabase:**
   - **Recomendação:** Garantir que todas as tabelas criadas no banco de dados Supabase (`profiles`, `projects`, `documents`) tenham RLS (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`) ativado com políticas de acesso restritas por `auth.uid() = user_id`.
2. **Rotação de Chaves de Serviço:**
   - **Recomendação:** Mantenha a chave `SUPABASE_SERVICE_ROLE_KEY` exclusivamente no painel da Vercel (Environment Variables) e nunca faça commit de arquivos `.env.local` no GitHub.
3. **Monitoramento e Alertas:**
   - **Recomendação:** Configure alertas no dashboard da Vercel e do Supabase para anomalias de tráfego e requisições 429/401 frequentes.
