-- Migration: Add client_organizations table and fix RLS policies for audit_logs

-- 1. CLIENT ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.client_organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    legal_name TEXT,
    contact_email TEXT,
    owner_user_id TEXT,
    brand_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.client_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES FOR CLIENT ORGANIZATIONS
DROP POLICY IF EXISTS "Allow public read client_organizations" ON public.client_organizations;
CREATE POLICY "Allow public read client_organizations" ON public.client_organizations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert client_organizations" ON public.client_organizations;
CREATE POLICY "Allow public insert client_organizations" ON public.client_organizations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update client_organizations" ON public.client_organizations;
CREATE POLICY "Allow public update client_organizations" ON public.client_organizations FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete client_organizations" ON public.client_organizations;
CREATE POLICY "Allow public delete client_organizations" ON public.client_organizations FOR DELETE USING (true);

-- 4. RLS POLICIES FOR AUDIT LOGS (Fixes 401 Unauthorized)
DROP POLICY IF EXISTS "Allow public read audit_logs" ON public.audit_logs;
CREATE POLICY "Allow public read audit_logs" ON public.audit_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert audit_logs" ON public.audit_logs;
CREATE POLICY "Allow public insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- 5. SEED DEFAULT HOLDING (Grupo Empresarial Gonzales)
INSERT INTO public.client_organizations (id, name, legal_name, contact_email, brand_ids)
VALUES (
    'org_grupo_gonzales',
    'Grupo Empresarial Gonzales',
    'Gonzales Holdings S.A.C.',
    'contacto@gonzales.com',
    '["brd_apex", "brd_lumina", "brd_kuro", "brd_velox"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    legal_name = EXCLUDED.legal_name,
    contact_email = EXCLUDED.contact_email;
