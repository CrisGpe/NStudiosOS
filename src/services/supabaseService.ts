import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  UserProfile,
  Brand,
  CommunicationTerritory,
  Deliverable,
  HardwareEquipment,
  DriveAccount,
  DriveFolder,
  DriveFile,
  ClientIdeaSandboxItem,
  UserRole,
  DeliverablePhase,
  DeliverablePriority,
} from '../types';
import {
  INITIAL_BRANDS,
  INITIAL_TERRITORIES,
  INITIAL_DELIVERABLES,
  INITIAL_DRIVE_ACCOUNTS,
  INITIAL_DRIVE_FOLDERS,
  INITIAL_DRIVE_FILES,
  INITIAL_SANDBOX_IDEAS,
} from '../data/initialData';

// ==============================================================================
// 1. AUTH & PROFILES SERVICE
// ==============================================================================

export const authService = {
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase no está configurado');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string, name: string, role: UserRole = 'webadmin') {
    if (!isSupabaseConfigured) throw new Error('Supabase no está configurado');
    
    // 1. Sign up in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    });
    if (error) throw error;

    // 2. Create profile in users_profiles
    if (data.user) {
      const newProfile: UserProfile = {
        id: data.user.id,
        name,
        email,
        role,
        roleTitle: role === 'webadmin' ? 'Chief Technology Officer & WebAdmin Global' : 'Usuario Registrado',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        assignedBrandIds: [],
        schedule: {
          workDays: [1, 2, 3, 4, 5],
          startHour: '09:00',
          endHour: '18:00',
          isOnVacation: false,
          alertsEnabled: true,
        },
        preferences: {
          navPosition: 'topbar',
          theme: 'light-density',
          compactCards: false,
          enableNotifications: true,
        },
      };

      await supabase.from('users_profiles').upsert({
        id: newProfile.id,
        email: newProfile.email,
        name: newProfile.name,
        role: newProfile.role,
        role_title: newProfile.roleTitle,
        avatar: newProfile.avatar,
        assigned_brand_ids: newProfile.assignedBrandIds,
        schedule: newProfile.schedule,
        preferences: newProfile.preferences,
      });

      return { user: data.user, profile: newProfile };
    }

    return { user: data.user, profile: null };
  },

  async signOut() {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  },

  async getSession() {
    if (!isSupabaseConfigured) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('users_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role as UserRole,
      roleTitle: data.role_title,
      avatar: data.avatar,
      assignedBrandIds: data.assigned_brand_ids || [],
      schedule: data.schedule,
      preferences: data.preferences,
    };
  },

  async fetchAllProfiles(): Promise<UserProfile[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('users_profiles').select('*');
    if (error || !data) return [];
    return data.map((d) => ({
      id: d.id,
      email: d.email,
      name: d.name,
      role: d.role as UserRole,
      roleTitle: d.role_title,
      avatar: d.avatar,
      assignedBrandIds: d.assigned_brand_ids || [],
      schedule: d.schedule,
      preferences: d.preferences,
    }));
  },

  async upsertProfile(profile: UserProfile): Promise<void> {
    if (!isSupabaseConfigured) return;
    await supabase.from('users_profiles').upsert({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      role_title: profile.roleTitle,
      avatar: profile.avatar,
      assigned_brand_ids: profile.assignedBrandIds,
      schedule: profile.schedule,
      preferences: profile.preferences,
      updated_at: new Date().toISOString(),
    });
  },
};

// ==============================================================================
// 2. BRANDS & TERRITORIES SERVICE
// ==============================================================================

export const brandService = {
  async fetchBrands(): Promise<Brand[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('brands').select('*').order('created_at', { ascending: true });
    if (error || !data) return [];
    return data.map((b) => ({
      id: b.id,
      name: b.name,
      industry: b.industry || 'Producción Audiovisual',
      logo: b.logo_url || b.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${b.id}`,
      primaryColor: b.primary_color || '#4f46e5',
      secondaryColor: b.secondary_color,
      slogan: b.tagline || b.slogan || '',
      contactPerson: b.contact_person || 'Director de Marca',
      contactEmail: b.contact_email || 'contacto@marca.com',
      driveFolderId: b.folder_id,
      createdAt: b.created_at || new Date().toISOString().split('T')[0],
    }));
  },

  async createBrand(brand: Brand): Promise<void> {
    if (!isSupabaseConfigured) return;
    await supabase.from('brands').insert({
      id: brand.id,
      name: brand.name,
      tagline: brand.slogan,
      primary_color: brand.primaryColor,
      logo_url: brand.logo,
      industry: brand.industry,
      folder_id: brand.driveFolderId,
    });
  },

  async updateBrand(brand: Brand): Promise<void> {
    if (!isSupabaseConfigured) return;
    await supabase.from('brands').update({
      name: brand.name,
      tagline: brand.slogan,
      primary_color: brand.primaryColor,
      logo_url: brand.logo,
      industry: brand.industry,
      folder_id: brand.driveFolderId,
      updated_at: new Date().toISOString(),
    }).eq('id', brand.id);
  },

  async deleteBrand(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    await supabase.from('brands').delete().eq('id', id);
  },

  async fetchTerritories(): Promise<CommunicationTerritory[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('communication_territories').select('*');
    if (error || !data) return [];
    return data.map((t) => ({
      id: t.id,
      brandId: t.brand_id,
      name: t.name,
      description: t.description || '',
      objective: t.objective || 'Consistencia de Marca',
      contentPillars: t.content_pillars || ['Contenido Principal'],
      targetAudience: t.target_audience || 'Audiencia General',
      active: t.active ?? true,
      colorTag: t.color || t.color_tag || '#6366f1',
    }));
  },

  async createTerritory(territory: CommunicationTerritory): Promise<void> {
    if (!isSupabaseConfigured) return;
    await supabase.from('communication_territories').insert({
      id: territory.id,
      brand_id: territory.brandId,
      name: territory.name,
      description: territory.description,
      color: territory.colorTag,
      active: territory.active,
    });
  },
};

// ==============================================================================
// 3. DELIVERABLES SERVICE
// ==============================================================================

export const deliverableService = {
  async fetchDeliverables(): Promise<Deliverable[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('deliverables').select('*').order('created_at', { ascending: true });
    if (error || !data) return [];
    return data.map((d) => ({
      id: d.id,
      code: d.code,
      brandId: d.brand_id,
      campaignId: d.campaign_id,
      title: d.title,
      description: d.description || d.brief || '',
      brief: d.brief,
      format: d.format,
      phase: (d.phase as DeliverablePhase) || 'ideacion',
      priority: (d.priority as DeliverablePriority) || 'medium',
      productionStartDate: d.production_start_date || d.shooting_date || new Date().toISOString().split('T')[0],
      productionEndDate: d.production_end_date || d.publish_date || new Date().toISOString().split('T')[0],
      publishDate: d.publish_date || new Date().toISOString().split('T')[0],
      assigneeId: d.assignee_id || 'usr_director_1',
      territoryId: d.territory_id,
      deliverableType: d.process_type || 'audiovisual',
      equipmentReservedIds: d.equipment_reserved_ids || [],
      assetsLinked: d.assets_linked || [],
      technicalGuide: d.tech_guide || d.technical_guide || {
        aspectRatios: ['9:16'],
        frameRate: '24fps',
        colorSpace: 'Rec.709',
        audioSpecs: 'Audio Stereo',
        lightingScheme: 'Esquema base',
        equipmentList: [],
        exportTargets: ['Social Reels'],
        shotlist: [],
      },
      changeRequests: d.change_requests || [],
      clientApproved: d.client_approved || false,
      directorApproved: d.director_approved || false,
      createdAt: d.created_at || new Date().toISOString().split('T')[0],
      updatedAt: d.updated_at || new Date().toISOString().split('T')[0],
    }));
  },

  async createDeliverable(del: Deliverable): Promise<void> {
    if (!isSupabaseConfigured) return;
    await supabase.from('deliverables').insert({
      id: del.id,
      code: del.code,
      brand_id: del.brandId,
      campaign_id: del.campaignId,
      title: del.title,
      brief: del.description,
      format: del.format,
      phase: del.phase,
      priority: del.priority,
      shooting_date: del.productionStartDate,
      publish_date: del.publishDate,
      assignee_id: del.assigneeId,
      territory_id: del.territoryId,
      process_type: del.deliverableType || 'audiovisual',
      tech_guide: del.technicalGuide,
      change_requests: del.changeRequests,
    });
  },

  async updateDeliverable(del: Deliverable): Promise<void> {
    if (!isSupabaseConfigured) return;
    await supabase.from('deliverables').update({
      title: del.title,
      brief: del.description,
      format: del.format,
      phase: del.phase,
      priority: del.priority,
      shooting_date: del.productionStartDate,
      publish_date: del.publishDate,
      assignee_id: del.assigneeId,
      territory_id: del.territoryId,
      process_type: del.deliverableType || 'audiovisual',
      tech_guide: del.technicalGuide,
      change_requests: del.changeRequests,
      updated_at: new Date().toISOString(),
    }).eq('id', del.id);
  },

  async deleteDeliverable(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    await supabase.from('deliverables').delete().eq('id', id);
  },
};

// ==============================================================================
// 4. CLIENT SANDBOX SERVICE
// ==============================================================================

export const sandboxService = {
  async fetchSandboxIdeas(): Promise<ClientIdeaSandboxItem[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('client_sandbox_ideas').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((i) => ({
      id: i.id,
      brandId: i.brand_id,
      title: i.title,
      notes: i.notes,
      referenceUrls: i.reference_urls || [],
      targetTerritoryId: i.target_territory_id,
      formatSuggested: i.format_suggested,
      captureType: i.capture_type,
      sourcePlatform: i.source_platform,
      attachmentUrl: i.attachment_url,
      audioDurationSeconds: i.audio_duration_seconds,
      status: i.status || 'draft',
      convertedDeliverableId: i.converted_deliverable_id,
      aiGeneratedBrief: i.ai_generated_brief,
      createdAt: i.created_at,
      updatedAt: i.updated_at,
    }));
  },

  async createSandboxIdea(idea: ClientIdeaSandboxItem): Promise<void> {
    if (!isSupabaseConfigured) return;
    await supabase.from('client_sandbox_ideas').insert({
      id: idea.id,
      brand_id: idea.brandId,
      title: idea.title,
      notes: idea.notes,
      reference_urls: idea.referenceUrls,
      target_territory_id: idea.targetTerritoryId,
      format_suggested: idea.formatSuggested,
      capture_type: idea.captureType,
      source_platform: idea.sourcePlatform,
      attachment_url: idea.attachmentUrl,
      audio_duration_seconds: idea.audioDurationSeconds,
      status: idea.status,
      ai_generated_brief: idea.aiGeneratedBrief,
    });
  },

  async deleteSandboxIdea(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    await supabase.from('client_sandbox_ideas').delete().eq('id', id);
  },
};

// ==============================================================================
// 5. DRIVE VAULT SERVICE
// ==============================================================================

export const driveVaultService = {
  async fetchDriveAccounts(): Promise<DriveAccount[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('drive_accounts').select('*');
    if (error || !data) return [];
    return data.map((a) => ({
      id: a.id,
      name: a.name,
      type: (a.type as any) || 'corporate_workspace',
      email: a.email,
      rootFolderId: a.root_folder_id || 'root',
      quotaTotalGB: a.quota_total_gb || 2000,
      quotaUsedGB: a.quota_used_gb || 450,
      isConnected: a.is_connected ?? true,
      status: (a.status as any) || 'active',
      lastSyncedAt: a.last_sync_at || new Date().toISOString(),
    }));
  },

  async fetchDriveFolders(): Promise<DriveFolder[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('drive_folders').select('*');
    if (error || !data) return [];
    return data.map((f) => ({
      id: f.id,
      accountId: f.account_id,
      brandId: f.brand_id,
      parentFolderId: f.parent_id,
      name: f.name,
      path: f.path || `/${f.name}`,
      isSystemGenerated: f.is_system_folder ?? false,
      itemCount: f.item_count || 0,
      createdAt: f.created_at || new Date().toISOString().split('T')[0],
    }));
  },

  async fetchDriveFiles(): Promise<DriveFile[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('drive_files').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((f) => ({
      id: f.id,
      accountId: f.account_id,
      folderId: f.folder_id,
      brandId: f.brand_id,
      campaignId: f.campaign_id,
      deliverableId: f.deliverable_id,
      name: f.name,
      type: f.type,
      mimeType: f.mime_type,
      sizeFormatted: f.size_formatted,
      sizeBytes: Number(f.size_bytes),
      url: f.url,
      previewUrl: f.preview_url,
      proxyUrl: f.proxy_url,
      isOriginalMaster: f.is_original_master,
      uploadedByName: f.uploaded_by_name,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));
  },

  async createDriveFile(file: DriveFile): Promise<void> {
    if (!isSupabaseConfigured) return;
    await supabase.from('drive_files').insert({
      id: file.id,
      account_id: file.accountId,
      folder_id: file.folderId,
      brand_id: file.brandId,
      campaign_id: file.campaignId,
      deliverable_id: file.deliverableId,
      name: file.name,
      type: file.type,
      mime_type: file.mimeType,
      size_formatted: file.sizeFormatted,
      size_bytes: file.sizeBytes,
      url: file.url,
      preview_url: file.previewUrl,
      proxy_url: file.proxyUrl,
      is_original_master: file.isOriginalMaster,
      uploaded_by_name: file.uploadedByName,
    });
  },
};

// ==============================================================================
// 6. SEED DEMO DATA HELPER (FOR 1-CLICK WEBADMIN IMPORT)
// ==============================================================================

export async function seedDemoDataToSupabase(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured) return { success: false, message: 'Supabase no está configurado' };

  try {
    // 1. Seed Brands
    for (const b of INITIAL_BRANDS) {
      await supabase.from('brands').upsert({
        id: b.id,
        name: b.name,
        tagline: b.slogan,
        primary_color: b.primaryColor,
        industry: b.industry,
      });
    }

    // 2. Seed Territories
    for (const t of INITIAL_TERRITORIES) {
      await supabase.from('communication_territories').upsert({
        id: t.id,
        brand_id: t.brandId,
        name: t.name,
        description: t.description,
        color: t.colorTag,
        active: t.active,
      });
    }

    // 3. Seed Deliverables
    for (const d of INITIAL_DELIVERABLES) {
      await supabase.from('deliverables').upsert({
        id: d.id,
        code: d.code,
        brand_id: d.brandId,
        campaign_id: d.campaignId,
        title: d.title,
        brief: d.description,
        format: d.format,
        phase: d.phase,
        priority: d.priority,
        shooting_date: d.productionStartDate,
        publish_date: d.publishDate,
        assignee_id: d.assigneeId,
        territory_id: d.territoryId,
        process_type: d.deliverableType || 'audiovisual',
        tech_guide: d.technicalGuide,
        change_requests: d.changeRequests,
      });
    }

    // 4. Seed Drive Vault
    for (const a of INITIAL_DRIVE_ACCOUNTS) {
      await supabase.from('drive_accounts').upsert({
        id: a.id,
        name: a.name,
        email: a.email,
      });
    }

    for (const f of INITIAL_DRIVE_FOLDERS) {
      await supabase.from('drive_folders').upsert({
        id: f.id,
        account_id: f.accountId,
        brand_id: f.brandId,
        parent_id: f.parentFolderId,
        name: f.name,
        path: f.path,
        is_system_folder: f.isSystemGenerated,
      });
    }

    for (const file of INITIAL_DRIVE_FILES) {
      await supabase.from('drive_files').upsert({
        id: file.id,
        account_id: file.accountId,
        folder_id: file.folderId,
        brand_id: file.brandId,
        campaign_id: file.campaignId,
        deliverable_id: file.deliverableId,
        name: file.name,
        type: file.type,
        mime_type: file.mimeType,
        size_formatted: file.sizeFormatted,
        size_bytes: file.sizeBytes,
        url: file.url,
        preview_url: file.previewUrl,
        proxy_url: file.proxyUrl,
        is_original_master: file.isOriginalMaster,
        uploaded_by_name: file.uploadedByName,
      });
    }

    // 5. Seed Sandbox Ideas
    for (const s of INITIAL_SANDBOX_IDEAS) {
      await supabase.from('client_sandbox_ideas').upsert({
        id: s.id,
        brand_id: s.brandId,
        title: s.title,
        notes: s.notes,
        reference_urls: s.referenceUrls,
        target_territory_id: s.targetTerritoryId,
        format_suggested: s.formatSuggested,
        capture_type: s.captureType,
        source_platform: s.sourcePlatform,
        attachment_url: s.attachmentUrl,
        audio_duration_seconds: s.audioDurationSeconds,
        status: s.status,
        ai_generated_brief: s.aiGeneratedBrief,
      });
    }

    return { success: true, message: 'Datos demo importados exitosamente a Supabase' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Error al importar datos demo' };
  }
}
