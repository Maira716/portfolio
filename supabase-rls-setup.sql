-- ==============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) & SCHEMA SETUP
-- Portfólio & Gestão de Clientes - Maira Reis
-- ==============================================================================

-- 1. Criação das Tabelas (caso não existam)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_email TEXT,
  client_name TEXT,
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
-- 2. Habilitação do Row Level Security (RLS)
-- ------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. Função Auxiliar para Verificação de Administrador
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) OR (
    auth.jwt() ->> 'email' IN (
      'mairareis2017@gmail.com',
      'maira.reis.ti@gmail.com',
      'admin@mairareis.dev'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 4. Políticas de Segurança (Policies) para PROFILES
-- ------------------------------------------------------------------------------

-- Remover políticas antigas para evitar duplicidade
DROP POLICY IF EXISTS "Admins possuem acesso total a perfis" ON public.profiles;
DROP POLICY IF EXISTS "Clientes visualizam próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Clientes editam próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Permitir auto-cadastro inicial" ON public.profiles;

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

-- Clientes: Atualização de seus dados cadastrais (exceto role)
CREATE POLICY "Clientes editam próprio perfil"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'client');

-- ------------------------------------------------------------------------------
-- 5. Políticas de Segurança (Policies) para PROJECTS
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
    LOWER(client_email) = LOWER(auth.jwt() ->> 'email')
  );

-- ------------------------------------------------------------------------------
-- 6. Políticas de Segurança (Policies) para MILESTONES & UPDATES
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
          LOWER(public.projects.client_email) = LOWER(auth.jwt() ->> 'email')
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
          LOWER(public.projects.client_email) = LOWER(auth.jwt() ->> 'email')
        )
    )
  );

-- ------------------------------------------------------------------------------
-- 7. Criação de Índices para Alta Performance
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_email ON public.projects(client_email);
CREATE INDEX IF NOT EXISTS idx_project_milestones_proj_id ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_proj_id ON public.project_updates(project_id);

-- Concluído com sucesso!
