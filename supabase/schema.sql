-- ==============================================================================
-- N. STUDIOS OS (CineFlow Studio Platform) — SUPABASE POSTGRESQL SCHEMA & SEEDS
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.users_profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('webadmin', 'director', 'colaborador', 'cliente')),
    role_title TEXT NOT NULL,
    avatar TEXT,
    assigned_brand_ids JSONB DEFAULT '[]'::jsonb,
    schedule JSONB,
    preferences JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BRANDS TABLE
CREATE TABLE IF NOT EXISTS public.brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    primary_color TEXT DEFAULT '#4f46e5',
    logo_url TEXT,
    industry TEXT,
    folder_id TEXT,
    drive_account_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMMUNICATION TERRITORIES TABLE
CREATE TABLE IF NOT EXISTS public.communication_territories (
    id TEXT PRIMARY KEY,
    brand_id TEXT REFERENCES public.brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DIGITAL ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.digital_assets (
    id TEXT PRIMARY KEY,
    brand_id TEXT REFERENCES public.brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    drive_url TEXT,
    drive_file_id TEXT,
    territory_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. HARDWARE EQUIPMENT TABLE
CREATE TABLE IF NOT EXISTS public.hardware_equipment (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('camera', 'lens', 'lighting', 'audio', 'grip', 'drone', 'accessories')),
    status TEXT NOT NULL CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
    serial_number TEXT,
    drive_manual_url TEXT,
    daily_rate_cents INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EQUIPMENT RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS public.equipment_reservations (
    id TEXT PRIMARY KEY,
    equipment_id TEXT REFERENCES public.hardware_equipment(id) ON DELETE CASCADE,
    deliverable_id TEXT,
    user_id TEXT REFERENCES public.users_profiles(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.campaigns (
    id TEXT PRIMARY KEY,
    brand_id TEXT REFERENCES public.brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('planning', 'active', 'paused', 'completed', 'archived')),
    start_date DATE,
    end_date DATE,
    budget_cents BIGINT DEFAULT 0,
    spent_cents BIGINT DEFAULT 0,
    kpis JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DELIVERABLES TABLE
CREATE TABLE IF NOT EXISTS public.deliverables (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    brand_id TEXT REFERENCES public.brands(id) ON DELETE CASCADE,
    campaign_id TEXT REFERENCES public.campaigns(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    brief TEXT,
    format TEXT NOT NULL,
    phase TEXT NOT NULL CHECK (phase IN ('ideacion_co_creativa', 'calendarizacion', 'guia_tecnica_av', 'en_rodaje', 'post_produccion', 'aprobacion_cliente', 'publicado')),
    priority TEXT NOT NULL CHECK (priority IN ('baja', 'media', 'alta', 'urgente')),
    shooting_date DATE,
    publish_date DATE,
    assignee_id TEXT REFERENCES public.users_profiles(id),
    territory_id TEXT REFERENCES public.communication_territories(id),
    process_type TEXT DEFAULT 'audiovisual' CHECK (process_type IN ('audiovisual', 'graphic')),
    tech_guide JSONB,
    change_requests JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DRIVE ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.drive_accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    storage_quota_bytes BIGINT DEFAULT 2147483648000,
    storage_used_bytes BIGINT DEFAULT 0,
    status TEXT DEFAULT 'connected',
    service_account_connected BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DRIVE FOLDERS TABLE
CREATE TABLE IF NOT EXISTS public.drive_folders (
    id TEXT PRIMARY KEY,
    account_id TEXT REFERENCES public.drive_accounts(id) ON DELETE CASCADE,
    brand_id TEXT REFERENCES public.brands(id) ON DELETE CASCADE,
    parent_id TEXT,
    name TEXT NOT NULL,
    drive_folder_id TEXT,
    web_view_link TEXT,
    is_system_folder BOOLEAN DEFAULT FALSE
);

-- 11. DRIVE FILES TABLE
CREATE TABLE IF NOT EXISTS public.drive_files (
    id TEXT PRIMARY KEY,
    account_id TEXT REFERENCES public.drive_accounts(id) ON DELETE CASCADE,
    folder_id TEXT,
    brand_id TEXT REFERENCES public.brands(id) ON DELETE CASCADE,
    campaign_id TEXT REFERENCES public.campaigns(id) ON DELETE SET NULL,
    deliverable_id TEXT REFERENCES public.deliverables(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('video', 'audio', 'image', 'document', 'archive')),
    mime_type TEXT NOT NULL,
    size_formatted TEXT,
    size_bytes BIGINT DEFAULT 0,
    url TEXT NOT NULL,
    preview_url TEXT,
    proxy_url TEXT,
    is_original_master BOOLEAN DEFAULT FALSE,
    uploaded_by_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. CLIENT SANDBOX IDEAS TABLE (WITH MOBILE METADATA)
CREATE TABLE IF NOT EXISTS public.client_sandbox_ideas (
    id TEXT PRIMARY KEY,
    brand_id TEXT REFERENCES public.brands(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    notes TEXT,
    reference_urls JSONB DEFAULT '[]'::jsonb,
    target_territory_id TEXT REFERENCES public.communication_territories(id) ON DELETE SET NULL,
    format_suggested TEXT,
    capture_type TEXT CHECK (capture_type IN ('social_link', 'camera_photo', 'quick_note', 'voice_memo')),
    source_platform TEXT,
    attachment_url TEXT,
    audio_duration_seconds INTEGER,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'converted_to_deliverable')),
    converted_deliverable_id TEXT REFERENCES public.deliverables(id) ON DELETE SET NULL,
    ai_generated_brief JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. CLIENT ORGANIZATIONS (HOLDINGS) TABLE
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

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardware_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drive_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drive_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drive_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_sandbox_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read policies for authenticated / demo app access
CREATE POLICY "Allow public read users_profiles" ON public.users_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Allow public read territories" ON public.communication_territories FOR SELECT USING (true);
CREATE POLICY "Allow public read deliverables" ON public.deliverables FOR SELECT USING (true);
CREATE POLICY "Allow public read campaigns" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Allow public read equipment" ON public.hardware_equipment FOR SELECT USING (true);
CREATE POLICY "Allow public read drive_files" ON public.drive_files FOR SELECT USING (true);
CREATE POLICY "Allow public read drive_folders" ON public.drive_folders FOR SELECT USING (true);
CREATE POLICY "Allow public read client_sandbox_ideas" ON public.client_sandbox_ideas FOR SELECT USING (true);
CREATE POLICY "Allow public read client_organizations" ON public.client_organizations FOR SELECT USING (true);
CREATE POLICY "Allow public read audit_logs" ON public.audit_logs FOR SELECT USING (true);

-- Insert & Update policies
CREATE POLICY "Allow public insert client_sandbox_ideas" ON public.client_sandbox_ideas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update client_sandbox_ideas" ON public.client_sandbox_ideas FOR UPDATE USING (true);
CREATE POLICY "Allow public insert client_organizations" ON public.client_organizations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update client_organizations" ON public.client_organizations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete client_organizations" ON public.client_organizations FOR DELETE USING (true);
CREATE POLICY "Allow public insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert drive_files" ON public.drive_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update deliverables" ON public.deliverables FOR UPDATE USING (true);

-- ==============================================================================
-- SEED DATA
-- ==============================================================================

-- Seed Brands
INSERT INTO public.brands (id, name, tagline, primary_color, industry)
VALUES 
    ('brd_apex', 'Apex Athletics', 'Redefine Your Athletic Threshold', '#0284c7', 'Sportswear & High Performance Gear'),
    ('brd_lumina', 'Lumina Skin', 'Radiance Rooted in Science', '#db2777', 'Clean Clinical Skincare & Dermocosmetics'),
    ('brd_kuro', 'Kuro Artisan Coffee', 'Crafted Darkness, Pure Extraction', '#d97706', 'Specialty Coffee & Direct Trade Roastery'),
    ('brd_velox', 'Velox Electric', 'The Autonomous Commute Revolution', '#4f46e5', 'Urban Micro-Mobility & Clean Tech'),
    ('brd_terra', 'Terra Organics', 'Soil to Table Regenerative Living', '#16a34a', 'Functional Foods & Regenerative Ag'),
    ('brd_nova', 'Nova FinTech', 'Financial Velocity for Creators', '#9333ea', 'Next-Gen Banking & Cross-Border Treasury')
ON CONFLICT (id) DO NOTHING;

-- Seed Users Profiles
INSERT INTO public.users_profiles (id, email, name, role, role_title, avatar, assigned_brand_ids)
VALUES
    ('usr_admin_1', 'sebastian.director@cineflow.studio', 'Sebastián Morales', 'webadmin', 'Chief Technology Officer & WebAdmin Global', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', '["brd_apex", "brd_lumina", "brd_kuro", "brd_velox", "brd_terra", "brd_nova"]'::jsonb),
    ('usr_director_1', 'valeria.directora@cineflow.studio', 'Valeria Benítez', 'director', 'Directora Creativa & Lead Producer', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', '["brd_apex", "brd_lumina", "brd_kuro", "brd_velox", "brd_terra", "brd_nova"]'::jsonb),
    ('usr_colab_1', 'lucas.editor@cineflow.studio', 'Lucas Mendonça', 'colaborador', 'Editor Senior & Colorista Lead', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', '["brd_apex", "brd_lumina", "brd_kuro"]'::jsonb),
    ('usr_client_1', 'm.rivas@apexathletics.com', 'Martín Rivas', 'cliente', 'Brand Manager - Apex Athletics', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', '["brd_apex"]'::jsonb),
    ('usr_client_2', 'c.duarte@luminaskin.com', 'Camila Duarte', 'cliente', 'Marketing Director - Lumina Skin', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', '["brd_lumina"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Territories for Apex Athletics
INSERT INTO public.communication_territories (id, brand_id, name, description, color, active)
VALUES
    ('ter_apx_01', 'brd_apex', 'Rendimiento Extremo & Maratón', 'Contenido enfocado en atletas de resistencia y competición', '#0284c7', true),
    ('ter_apx_02', 'brd_apex', 'Moda Urbana & Streetwear', 'Línea de zapatillas y ropa deportiva para la ciudad', '#38bdf8', true),
    ('ter_apx_03', 'brd_apex', 'Comunidad & Lifestyle', 'Historias de corredores y embajadores de marca', '#0ea5e9', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Sandbox Ideas
INSERT INTO public.client_sandbox_ideas (id, brand_id, title, notes, target_territory_id, format_suggested, capture_type, source_platform, reference_urls, ai_generated_brief, status)
VALUES
    ('sbx_apx_01', 'brd_apex', 'POV Desafío Nocturno con Zapatillas Reflectivas', 'Quiero un video estilo cámara en primera persona (POV) de un corredor atravesando la ciudad de noche bajo lluvia ligera, mostrando los reflejos de las zapatillas Kinetic Aero.', 'ter_apx_02', '9:16 Vertical Reel (45s)', 'social_link', 'tiktok', '["https://www.tiktok.com/@runningculture/video/night_pov_speed", "https://www.instagram.com/reel/cinematic_running_aero"]'::jsonb, '{"hook": "La ciudad duerme, pero tú estás en tu mejor kilómetro.", "narrativeAngle": "Superación y entrenamiento nocturno con estética cinematográfica neon.", "suggestedDuration": "45s", "recommendedPlatforms": ["TikTok", "Instagram Reels"]}'::jsonb, 'draft')
ON CONFLICT (id) DO NOTHING;
