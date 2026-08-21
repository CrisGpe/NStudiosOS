-- ==============================================================================
-- N. STUDIOS OS — NOTIFICATION WEBHOOK & SYSTEM SETTINGS MIGRATION
-- ==============================================================================

-- 1. Create system_settings table for Webhook URLs & platform configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by TEXT
);

-- Enable RLS on system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow public insert system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow public update system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow public delete system_settings" ON public.system_settings;

CREATE POLICY "Allow public read system_settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert system_settings" ON public.system_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update system_settings" ON public.system_settings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete system_settings" ON public.system_settings FOR DELETE USING (true);

-- Insert default notification webhook setting if not present
INSERT INTO public.system_settings (key, value, updated_by)
VALUES (
    'notification_webhook',
    jsonb_build_object(
        'url', '',
        'enabled', true,
        'notify_on_client_signup', true,
        'notify_on_t3_approval', true,
        'admin_email', 'crial0810@gmail.com'
    ),
    'system_init'
)
ON CONFLICT (key) DO NOTHING;

-- 2. Ensure audit_logs table has full CRUD permissions
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id TEXT,
    user_name TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details JSONB
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow public insert audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow public update audit_logs" ON public.audit_logs;

CREATE POLICY "Allow public read audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update audit_logs" ON public.audit_logs FOR UPDATE USING (true) WITH CHECK (true);

-- 3. Trigger Function to automatically log new user registrations in audit_logs
CREATE OR REPLACE FUNCTION public.handle_new_user_audit()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        id,
        timestamp,
        user_id,
        user_name,
        action,
        entity_type,
        entity_id,
        details
    ) VALUES (
        'audit_' || floor(extract(epoch from now()) * 1000)::text,
        now(),
        NEW.id,
        NEW.name,
        CASE 
            WHEN NEW.role = 'cliente' THEN 'NUEVO_CLIENTE_REGISTRADO'
            ELSE 'NUEVO_USUARIO_REGISTRADO'
        END,
        'user_profile',
        NEW.id,
        jsonb_build_object(
            'email', NEW.email,
            'role', NEW.role,
            'name', NEW.name,
            'assigned_brand_ids', NEW.assigned_brand_ids
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_user_profile_created_audit ON public.users_profiles;
CREATE TRIGGER on_user_profile_created_audit
    AFTER INSERT ON public.users_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_audit();
