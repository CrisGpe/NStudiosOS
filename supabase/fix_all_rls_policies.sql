-- ==============================================================================
-- N. STUDIOS OS — FULL CRUD ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- Run this script in the Supabase SQL Editor (Project: qrwqzgzchhnirrzzfzsw)
-- ==============================================================================

-- 1. BRANDS
DROP POLICY IF EXISTS Allow public read brands ON public.brands;
DROP POLICY IF EXISTS Allow public insert brands ON public.brands;
DROP POLICY IF EXISTS Allow public update brands ON public.brands;
DROP POLICY IF EXISTS Allow public delete brands ON public.brands;

CREATE POLICY Allow public read brands ON public.brands FOR SELECT USING (true);
CREATE POLICY Allow public insert brands ON public.brands FOR INSERT WITH CHECK (true);
CREATE POLICY Allow public update brands ON public.brands FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY Allow public delete brands ON public.brands FOR DELETE USING (true);

-- 2. COMMUNICATION TERRITORIES
DROP POLICY IF EXISTS Allow public read territories ON public.communication_territories;
DROP POLICY IF EXISTS Allow public insert territories ON public.communication_territories;
DROP POLICY IF EXISTS Allow public update territories ON public.communication_territories;
DROP POLICY IF EXISTS Allow public delete territories ON public.communication_territories;

CREATE POLICY Allow public read territories ON public.communication_territories FOR SELECT USING (true);
CREATE POLICY Allow public insert territories ON public.communication_territories FOR INSERT WITH CHECK (true);
CREATE POLICY Allow public update territories ON public.communication_territories FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY Allow public delete territories ON public.communication_territories FOR DELETE USING (true);

-- 3. DIGITAL ASSETS
DROP POLICY IF EXISTS Allow public read digital_assets ON public.digital_assets;
DROP POLICY IF EXISTS Allow public insert digital_assets ON public.digital_assets;
DROP POLICY IF EXISTS Allow public update digital_assets ON public.digital_assets;
DROP POLICY IF EXISTS Allow public delete digital_assets ON public.digital_assets;

CREATE POLICY Allow public read digital_assets ON public.digital_assets FOR SELECT USING (true);
CREATE POLICY Allow public insert digital_assets ON public.digital_assets FOR INSERT WITH CHECK (true);
CREATE POLICY Allow public update digital_assets ON public.digital_assets FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY Allow public delete digital_assets ON public.digital_assets FOR DELETE USING (true);

-- 4. HARDWARE EQUIPMENT
DROP POLICY IF EXISTS Allow public read equipment ON public.hardware_equipment;
DROP POLICY IF EXISTS Allow public insert equipment ON public.hardware_equipment;
DROP POLICY IF EXISTS Allow public update equipment ON public.hardware_equipment;
DROP POLICY IF EXISTS Allow public delete equipment ON public.hardware_equipment;

CREATE POLICY Allow public read equipment ON public.hardware_equipment FOR SELECT USING (true);
CREATE POLICY Allow public insert equipment ON public.hardware_equipment FOR INSERT WITH CHECK (true);
CREATE POLICY Allow public update equipment ON public.hardware_equipment FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY Allow public delete equipment ON public.hardware_equipment FOR DELETE USING (true);

-- 5. EQUIPMENT RESERVATIONS
DROP POLICY IF EXISTS Allow public read equipment_reservations ON public.equipment_reservations;
DROP POLICY IF EXISTS Allow public insert equipment_reservations ON public.equipment_reservations;
DROP POLICY IF EXISTS Allow public update equipment_reservations ON public.equipment_reservations;
DROP POLICY IF EXISTS Allow public delete equipment_reservations ON public.equipment_reservations;

CREATE POLICY Allow public read equipment_reservations ON public.equipment_reservations FOR SELECT USING (true);
CREATE POLICY Allow public insert equipment_reservations ON public.equipment_reservations FOR INSERT WITH CHECK (true);
CREATE POLICY Allow public update equipment_reservations ON public.equipment_reservations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY Allow public delete equipment_reservations ON public.equipment_reservations FOR DELETE USING (true);

-- 6. CAMPAIGNS
DROP POLICY IF EXISTS Allow public read campaigns ON public.campaigns;
DROP POLICY IF EXISTS Allow public insert campaigns ON public.campaigns;
DROP POLICY IF EXISTS Allow public update campaigns ON public.campaigns;
DROP POLICY IF EXISTS Allow public delete campaigns ON public.campaigns;

CREATE POLICY Allow public read campaigns ON public.campaigns FOR SELECT USING (true);
CREATE POLICY Allow public insert campaigns ON public.campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY Allow public update campaigns ON public.campaigns FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY Allow public delete campaigns ON public.campaigns FOR DELETE USING (true);

-- 7. DELIVERABLES
DROP POLICY IF EXISTS Allow public read deliverables ON public.deliverables;
DROP POLICY IF EXISTS Allow public insert deliverables ON public.deliverables;
DROP POLICY IF EXISTS Allow public update deliverables ON public.deliverables;
DROP POLICY IF EXISTS Allow public delete deliverables ON public.deliverables;

CREATE POLICY Allow public read deliverables ON public.deliverables FOR SELECT USING (true);
CREATE POLICY Allow public insert deliverables ON public.deliverables FOR INSERT WITH CHECK (true);
CREATE POLICY Allow public update deliverables ON public.deliverables FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY Allow public delete deliverables ON public.deliverables FOR DELETE USING (true);

-- 8. DRIVE ACCOUNTS
DROP POLICY IF EXISTS Allow public read drive_accounts ON public.drive_accounts;
DROP POLICY IF EXISTS Allow public insert drive_accounts ON public.drive_accounts;
DROP POLICY IF EXISTS Allow public update drive_accounts ON public.drive_accounts;
DROP POLICY IF EXISTS Allow public delete drive_accounts ON public.drive_accounts;

CREATE POLICY Allow public read drive_accounts ON public.drive_accounts FOR SELECT USING (true);
CREATE POLICY Allow public insert drive_accounts ON public.drive_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY Allow public update drive_accounts ON public.drive_accounts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY Allow public delete drive_accounts ON public.drive_accounts FOR DELETE USING (true);

-- 9. DRIVE FOLDERS
DROP POLICY IF EXISTS Allow public read drive_folders ON public.drive_folders;
DROP POLICY IF EXISTS Allow public insert drive_folders ON public.drive_folders;
DROP POLICY IF EXISTS Allow public update drive_folders ON public.drive_folders;
DROP POLICY IF EXISTS Allow public delete drive_folders ON public.drive_folders;

CREATE POLICY Allow public read drive_folders ON public.drive_folders FOR SELECT USING (true);
CREATE POLICY Allow public insert drive_folders ON public.drive_folders FOR INSERT WITH CHECK (true);
CREATE POLICY Allow public update drive_folders ON public.drive_folders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY Allow public delete drive_folders ON public.drive_folders FOR DELETE USING (true);

-- 10. DRIVE FILES
DROP POLICY IF EXISTS Allow public read drive_files ON public.drive_files;
DROP POLICY IF EXISTS Allow public insert drive_files ON public.drive_files;
DROP POLICY IF EXISTS Allow public update drive_files ON public.drive_files;
DROP POLICY IF EXISTS Allow public delete drive_files ON public.drive_files;

CREATE POLICY Allow public read drive_files ON public.drive_files FOR SELECT USING (true);
CREATE POLICY Allow public insert drive_files ON public.drive_files FOR INSERT WITH CHECK (true);
CREATE POLICY Allow public update drive_files ON public.drive_files FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY Allow public delete drive_files ON public.drive_files FOR DELETE USING (true);

-- 11. USERS PROFILES
DROP POLICY IF EXISTS Allow public read users_profiles ON public.users_profiles;
DROP POLICY IF EXISTS Allow public insert users_profiles ON public.users_profiles;
DROP POLICY IF EXISTS Allow public update users_profiles ON public.users_profiles;
DROP POLICY IF EXISTS Allow public delete users_profiles ON public.users_profiles;

CREATE POLICY Allow public read users_profiles ON public.users_profiles FOR SELECT USING (true);
CREATE POLICY Allow public insert users_profiles ON public.users_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY Allow public update users_profiles ON public.users_profiles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY Allow public delete users_profiles ON public.users_profiles FOR DELETE USING (true);

-- 12. CLIENT SANDBOX IDEAS
DROP POLICY IF EXISTS Allow public read client_sandbox_ideas ON public.client_sandbox_ideas;
DROP POLICY IF EXISTS Allow public insert client_sandbox_ideas ON public.client_sandbox_ideas;
DROP POLICY IF EXISTS Allow public update client_sandbox_ideas ON public.client_sandbox_ideas;
DROP POLICY IF EXISTS Allow public delete client_sandbox_ideas ON public.client_sandbox_ideas;

CREATE POLICY Allow public read client_sandbox_ideas ON public.client_sandbox_ideas FOR SELECT USING (true);
CREATE POLICY Allow public insert client_sandbox_ideas ON public.client_sandbox_ideas FOR INSERT WITH CHECK (true);
CREATE POLICY Allow public update client_sandbox_ideas ON public.client_sandbox_ideas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY Allow public delete client_sandbox_ideas ON public.client_sandbox_ideas FOR DELETE USING (true);
