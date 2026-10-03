-- ==============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) & SCHEMA SETUP (COMPLETO & BLINDADO)
-- Portfólio & Gestão de Clientes - Maira Reis
-- ==============================================================================

-- 1. Criação das Tabelas e Garantia de Colunas
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planejamento',
  progress INTEGER DEFAULT 0,
  start_date DATE,
  deadline DATE,
  preview_url TEXT,
  figma_url TEXT,
  repo_url TEXT,
  category TEXT DEFAULT 'Mobile App (React Native)',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir colunas adicionais
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS preview_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS figma_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS repo_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category TEXT;

CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'update',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. Habilitação do Row Level Security (RLS) em TODAS as Tabelas
-- ------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. Função Auxiliar SECURITY DEFINER para Verificação de Administrador
--    (Sem recursão infinita e com search_path restrito)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Consulta direta na tabela com SECURITY DEFINER para evitar loop de RLS
  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN (v_role = 'admin') OR (
    auth.jwt() ->> 'email' IN (
      'mairareis2017@gmail.com',
      'maira.reis.ti@gmail.com',
      'admin@mairareis.dev'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- 4. Triggers de Proteção de Integridade & Auto-Cadastro
-- ------------------------------------------------------------------------------

-- Trigger 4.1: Impede que não-administradores alterem as colunas 'role' e 'status'
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o executor NÃO for admin, preserva os valores originais de role e status
  IF NOT public.is_admin() THEN
    NEW.role := OLD.role;
    NEW.status := OLD.status;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_fields();

-- Trigger 4.2: Auto-cadastro ao criar usuário no auth.users (Sempre força role = 'client')
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    'client', -- FORÇA SEMPRE CLIENT NO CADASTRO
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 5. Políticas de Segurança (Policies) para PROFILES
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins possuem acesso total a perfis" ON public.profiles;
DROP POLICY IF EXISTS "Clientes visualizam próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Clientes editam próprio perfil" ON public.profiles;

-- Admins: Acesso total (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admins possuem acesso total a perfis"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Clientes: Leitura apenas do seu próprio perfil
CREATE POLICY "Clientes visualizam próprio perfil"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Clientes: Atualização de seus dados cadastrais (protegido pelo trigger contra alteração de role/status)
CREATE POLICY "Clientes editam próprio perfil"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 6. Políticas de Segurança (Policies) para PROJECTS
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins possuem acesso total a projetos" ON public.projects;
DROP POLICY IF EXISTS "Clientes visualizam apenas seus projetos" ON public.projects;

-- Admins: Acesso total
CREATE POLICY "Admins possuem acesso total a projetos"
  ON public.projects
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Clientes: Leitura apenas dos projetos onde são donos (ID ou Email)
CREATE POLICY "Clientes visualizam apenas seus projetos"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    (client_email IS NOT NULL AND LOWER(client_email) = LOWER(auth.jwt() ->> 'email'))
  );

-- ------------------------------------------------------------------------------
-- 7. Políticas de Segurança (Policies) para MILESTONES & UPDATES
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins possuem acesso total a milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Clientes visualizam milestones de seus projetos" ON public.project_milestones;
DROP POLICY IF EXISTS "Admins possuem acesso total a updates" ON public.project_updates;
DROP POLICY IF EXISTS "Clientes visualizam updates de seus projetos" ON public.project_updates;

-- Milestones: Admin total
CREATE POLICY "Admins possuem acesso total a milestones"
  ON public.project_milestones
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Milestones: Leitura pelo cliente dono do projeto
CREATE POLICY "Clientes visualizam milestones de seus projetos"
  ON public.project_milestones
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.project_milestones.project_id
        AND (
          public.projects.client_id = auth.uid() OR
          (public.projects.client_email IS NOT NULL AND LOWER(public.projects.client_email) = LOWER(auth.jwt() ->> 'email'))
        )
    )
  );

-- Updates: Admin total
CREATE POLICY "Admins possuem acesso total a updates"
  ON public.project_updates
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Updates: Leitura pelo cliente dono do projeto
CREATE POLICY "Clientes visualizam updates de seus projetos"
  ON public.project_updates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.project_updates.project_id
        AND (
          public.projects.client_id = auth.uid() OR
          (public.projects.client_email IS NOT NULL AND LOWER(public.projects.client_email) = LOWER(auth.jwt() ->> 'email'))
        )
    )
  );

-- ------------------------------------------------------------------------------
-- 8. Criação de Índices para Alta Performance
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_email ON public.projects(client_email);
CREATE INDEX IF NOT EXISTS idx_project_milestones_proj_id ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_proj_id ON public.project_updates(project_id);

-- Configuração concluída com sucesso!
