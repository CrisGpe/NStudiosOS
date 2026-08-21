-- ==============================================================================
-- MIGRATION: UPDATE DRIVE ACCOUNTS SCHEMA TO SUPPORT FLEXIBLE EXTENDED COLUMNS
-- ==============================================================================

-- 1. Ensure public.drive_accounts has all columns
ALTER TABLE public.drive_accounts ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'corporate_workspace';
ALTER TABLE public.drive_accounts ADD COLUMN IF NOT EXISTS root_folder_id TEXT DEFAULT 'root';
ALTER TABLE public.drive_accounts ADD COLUMN IF NOT EXISTS quota_total_gb NUMERIC DEFAULT 2000;
ALTER TABLE public.drive_accounts ADD COLUMN IF NOT EXISTS quota_used_gb NUMERIC DEFAULT 0;
ALTER TABLE public.drive_accounts ADD COLUMN IF NOT EXISTS is_connected BOOLEAN DEFAULT true;
ALTER TABLE public.drive_accounts ADD COLUMN IF NOT EXISTS service_account_connected BOOLEAN DEFAULT true;
ALTER TABLE public.drive_accounts ADD COLUMN IF NOT EXISTS storage_quota_bytes BIGINT DEFAULT 2147483648000;
ALTER TABLE public.drive_accounts ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT DEFAULT 0;

-- 2. Notify pgrst schema cache to reload
NOTIFY pgrst, 'reload schema';
