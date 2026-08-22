-- ==============================================================================
-- DIGITAL ASSETS TABLE & PERMISSIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.digital_assets (
    id TEXT PRIMARY KEY,
    brand_id TEXT REFERENCES public.brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'image',
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    size_formatted TEXT DEFAULT '1.2 MB',
    file_format TEXT DEFAULT 'PNG',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.digital_assets ENABLE ROW LEVEL SECURITY;

-- Permissive CRUD policies for digital_assets
DROP POLICY IF EXISTS "Allow public read digital_assets" ON public.digital_assets;
DROP POLICY IF EXISTS "Allow public insert digital_assets" ON public.digital_assets;
DROP POLICY IF EXISTS "Allow public update digital_assets" ON public.digital_assets;
DROP POLICY IF EXISTS "Allow public delete digital_assets" ON public.digital_assets;

CREATE POLICY "Allow public read digital_assets" ON public.digital_assets FOR SELECT USING (true);
CREATE POLICY "Allow public insert digital_assets" ON public.digital_assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update digital_assets" ON public.digital_assets FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete digital_assets" ON public.digital_assets FOR DELETE USING (true);

-- Ensure drive_files and drive_folders delete policies exist
DROP POLICY IF EXISTS "Allow public delete drive_files" ON public.drive_files;
DROP POLICY IF EXISTS "Allow public delete drive_folders" ON public.drive_folders;

CREATE POLICY "Allow public delete drive_files" ON public.drive_files FOR DELETE USING (true);
CREATE POLICY "Allow public delete drive_folders" ON public.drive_folders FOR DELETE USING (true);

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
