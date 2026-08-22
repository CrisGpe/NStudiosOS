-- ==============================================================================
-- 1. CLIENT ORGANIZATIONS (HOLDINGS / GRUPOS EMPRESARIALES)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.client_organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    legal_name TEXT,
    tax_id TEXT,
    contact_email TEXT NOT NULL,
    owner_user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alter brands table to link to client_organizations
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS client_organization_id TEXT REFERENCES public.client_organizations(id) ON DELETE SET NULL;

-- Alter users_profiles table for holding roles & permissions matrix
ALTER TABLE public.users_profiles ADD COLUMN IF NOT EXISTS client_organization_id TEXT REFERENCES public.client_organizations(id) ON DELETE SET NULL;
ALTER TABLE public.users_profiles ADD COLUMN IF NOT EXISTS client_role TEXT DEFAULT 'holding_admin';
ALTER TABLE public.users_profiles ADD COLUMN IF NOT EXISTS client_permissions_matrix JSONB DEFAULT '{}'::jsonb;

-- Enable RLS
ALTER TABLE public.client_organizations ENABLE ROW LEVEL SECURITY;

-- Permissive CRUD policies
DROP POLICY IF EXISTS "Allow public read client_organizations" ON public.client_organizations;
DROP POLICY IF EXISTS "Allow public insert client_organizations" ON public.client_organizations;
DROP POLICY IF EXISTS "Allow public update client_organizations" ON public.client_organizations;
DROP POLICY IF EXISTS "Allow public delete client_organizations" ON public.client_organizations;

CREATE POLICY "Allow public read client_organizations" ON public.client_organizations FOR SELECT USING (true);
CREATE POLICY "Allow public insert client_organizations" ON public.client_organizations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update client_organizations" ON public.client_organizations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete client_organizations" ON public.client_organizations FOR DELETE USING (true);

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
