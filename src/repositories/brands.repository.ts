import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Brand, CommunicationTerritory, DigitalAsset, AssetType } from '../types';

export const BrandsRepository = {
  // BRANDS
  async fetchBrands(): Promise<Brand[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('brands').select('*');
      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        industry: row.industry || 'Producción & Media',
        logo: row.logo || row.logo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(row.name)}`,
        primaryColor: row.primary_color || '#6366f1',
        secondaryColor: row.secondary_color,
        slogan: row.slogan || '',
        contactPerson: row.contact_person || row.client_contact_name || '',
        contactEmail: row.contact_email || row.client_contact_email || '',
        clientOrganizationId: row.client_organization_id,
        driveFolderId: row.drive_folder_id,
        driveFilesCount: Number(row.drive_files_count) || 0,
        createdAt: row.created_at || new Date().toISOString().split('T')[0],
      }));
    } catch {
      return [];
    }
  },

  async createBrand(brand: Brand): Promise<Brand> {
    if (!isSupabaseConfigured) return brand;

    const { error } = await supabase.from('brands').insert({
      id: brand.id,
      name: brand.name,
      industry: brand.industry,
      logo: brand.logo,
      primary_color: brand.primaryColor,
      secondary_color: brand.secondaryColor,
      slogan: brand.slogan,
      contact_person: brand.contactPerson,
      contact_email: brand.contactEmail,
      client_organization_id: brand.clientOrganizationId,
      drive_folder_id: brand.driveFolderId,
      drive_files_count: brand.driveFilesCount,
      created_at: brand.createdAt,
    });
    if (error) console.error('Error inserting brand to Supabase:', error);
    return brand;
  },

  async updateBrand(brand: Brand): Promise<Brand> {
    if (!isSupabaseConfigured) return brand;

    const { error } = await supabase
      .from('brands')
      .update({
        name: brand.name,
        industry: brand.industry,
        logo: brand.logo,
        primary_color: brand.primaryColor,
        secondary_color: brand.secondaryColor,
        slogan: brand.slogan,
        contact_person: brand.contactPerson,
        contact_email: brand.contactEmail,
        client_organization_id: brand.clientOrganizationId,
        drive_folder_id: brand.driveFolderId,
        drive_files_count: brand.driveFilesCount,
      })
      .eq('id', brand.id);
    if (error) console.error('Error updating brand in Supabase:', error);
    return brand;
  },

  async deleteBrand(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase.from('brands').delete().eq('id', id);
    return !error;
  },

  // TERRITORIES
  async fetchTerritories(): Promise<CommunicationTerritory[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('territories').select('*');
      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        brandId: row.brand_id,
        name: row.name,
        description: row.description,
        objective: row.objective,
        contentPillars: row.content_pillars || [],
        targetAudience: row.target_audience,
        active: row.active ?? true,
        colorTag: row.color_tag,
      }));
    } catch {
      return [];
    }
  },

  async createTerritory(territory: CommunicationTerritory): Promise<CommunicationTerritory> {
    if (!isSupabaseConfigured) return territory;

    const { error } = await supabase.from('territories').insert({
      id: territory.id,
      brand_id: territory.brandId,
      name: territory.name,
      description: territory.description,
      objective: territory.objective,
      content_pillars: territory.contentPillars,
      target_audience: territory.targetAudience,
      active: territory.active,
      color_tag: territory.colorTag,
    });
    if (error) console.error('Error inserting territory to Supabase:', error);
    return territory;
  },

  async updateTerritory(territory: CommunicationTerritory): Promise<CommunicationTerritory> {
    if (!isSupabaseConfigured) return territory;

    const { error } = await supabase
      .from('territories')
      .update({
        brand_id: territory.brandId,
        name: territory.name,
        description: territory.description,
        objective: territory.objective,
        content_pillars: territory.contentPillars,
        target_audience: territory.targetAudience,
        active: territory.active,
        color_tag: territory.colorTag,
      })
      .eq('id', territory.id);
    if (error) console.error('Error updating territory in Supabase:', error);
    return territory;
  },

  async deleteTerritory(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase.from('territories').delete().eq('id', id);
    return !error;
  },

  // DIGITAL ASSETS
  async fetchDigitalAssets(): Promise<DigitalAsset[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('digital_assets').select('*');
      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        brandId: row.brand_id,
        name: row.name,
        type: row.type as AssetType,
        url: row.url,
        status: row.status || 'active',
        notes: row.notes,
        updatedAt: row.updated_at || row.created_at || new Date().toISOString().split('T')[0],
      }));
    } catch {
      return [];
    }
  },

  async createDigitalAsset(asset: DigitalAsset): Promise<DigitalAsset> {
    if (!isSupabaseConfigured) return asset;

    const { error } = await supabase.from('digital_assets').insert({
      id: asset.id,
      brand_id: asset.brandId,
      name: asset.name,
      type: asset.type,
      url: asset.url,
      status: asset.status,
      notes: asset.notes,
      updated_at: asset.updatedAt,
    });
    if (error) console.error('Error inserting digital asset to Supabase:', error);
    return asset;
  },

  async updateDigitalAsset(asset: DigitalAsset): Promise<DigitalAsset> {
    if (!isSupabaseConfigured) return asset;

    const { error } = await supabase
      .from('digital_assets')
      .update({
        brand_id: asset.brandId,
        name: asset.name,
        type: asset.type,
        url: asset.url,
        status: asset.status,
        notes: asset.notes,
        updated_at: asset.updatedAt,
      })
      .eq('id', asset.id);
    if (error) console.error('Error updating digital asset in Supabase:', error);
    return asset;
  },

  async deleteDigitalAsset(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase.from('digital_assets').delete().eq('id', id);
    return !error;
  },
};
