import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  UserProfile,
  Brand,
  CommunicationTerritory,
  Deliverable,
  HardwareEquipment,
  EquipmentReservation,
  Campaign,
  AuditLog,
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
        roleTitle:
          role === 'webadmin'
            ? 'Chief Technology Officer & WebAdmin Global'
            : role === 'director'
            ? 'Director Creativo & Executive Producer'
            : role === 'cliente'
            ? 'Cliente de Marca'
            : 'Colaborador Técnico / Post-Producción',
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

      // 3. Log event in audit_logs
      try {
        await supabase.from('audit_logs').insert({
          id: 'audit_' + Date.now(),
          timestamp: new Date().toISOString(),
          user_id: newProfile.id,
          user_name: newProfile.name,
          action: role === 'cliente' ? 'NUEVO_CLIENTE_REGISTRADO' : 'NUEVO_USUARIO_REGISTRADO',
          entity_type: 'user_profile',
          entity_id: newProfile.id,
          details: { email: newProfile.email, role: newProfile.role },
        });
      } catch (logErr) {
        console.warn('Could not insert audit log:', logErr);
      }

      // 4. Dispatch Webhook Notification if client
      if (role === 'cliente') {
        try {
          const { notificationService } = await import('./notificationService');
          await notificationService.notifyClientSignup({
            name: newProfile.name,
            email: newProfile.email,
            userId: newProfile.id,
          });
        } catch (notifyErr) {
          console.warn('Webhook notification error:', notifyErr);
        }
      }

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
    const { error } = await supabase.from('users_profiles').upsert({
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
    if (error) throw error;
  },

  async updateUserProfile(
    userId: string,
    updates: {
      role?: UserRole;
      role_title?: string;
      assigned_brand_ids?: string[];
      schedule?: any;
      preferences?: any;
    }
  ): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from('users_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    if (error) throw error;
  },
};

export const userProfileService = authService;

export const supabaseService = {
  ...authService,
  updateUserProfile: authService.updateUserProfile,
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
    const { error } = await supabase.from('brands').insert({
      id: brand.id,
      name: brand.name,
      tagline: brand.slogan,
      primary_color: brand.primaryColor,
      logo_url: brand.logo,
      industry: brand.industry,
      folder_id: brand.driveFolderId,
    });
    if (error) {
      console.error('Supabase createBrand error:', error);
      throw error;
    }
  },

  async updateBrand(brand: Brand): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('brands').update({
      name: brand.name,
      tagline: brand.slogan,
      primary_color: brand.primaryColor,
      logo_url: brand.logo,
      industry: brand.industry,
      folder_id: brand.driveFolderId,
      updated_at: new Date().toISOString(),
    }).eq('id', brand.id);
    if (error) {
      console.error('Supabase updateBrand error:', error);
      throw error;
    }
  },

  async deleteBrand(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteBrand error:', error);
      throw error;
    }
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
    const { error } = await supabase.from('communication_territories').insert({
      id: territory.id,
      brand_id: territory.brandId,
      name: territory.name,
      description: territory.description,
      color: territory.colorTag,
      active: territory.active,
    });
    if (error) {
      console.error('Supabase createTerritory error:', error);
      throw error;
    }
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
    const { error } = await supabase.from('deliverables').insert({
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
    if (error) {
      console.error('Supabase createDeliverable error:', error);
      throw error;
    }
  },

  async updateDeliverable(del: Deliverable): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('deliverables').update({
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
    if (error) {
      console.error('Supabase updateDeliverable error:', error);
      throw error;
    }
  },

  async deleteDeliverable(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('deliverables').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteDeliverable error:', error);
      throw error;
    }
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
    const { error } = await supabase.from('client_sandbox_ideas').insert({
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
    if (error) {
      console.error('Supabase createSandboxIdea error:', error);
      throw error;
    }
  },

  async deleteSandboxIdea(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('client_sandbox_ideas').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteSandboxIdea error:', error);
      throw error;
    }
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

  async createDriveAccount(account: DriveAccount): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('drive_accounts').upsert({
      id: account.id,
      name: account.name,
      type: account.type,
      email: account.email,
      root_folder_id: account.rootFolderId,
      quota_total_gb: account.quotaTotalGB,
      quota_used_gb: account.quotaUsedGB,
      is_connected: account.isConnected,
      status: account.status,
      last_sync_at: new Date().toISOString(),
    });
    if (error) throw error;
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
    const { error } = await supabase.from('drive_files').insert({
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
    if (error) {
      console.error('Supabase createDriveFile error:', error);
      throw error;
    }
  },
};

// ==============================================================================
// 6. EQUIPMENT SERVICE
// ==============================================================================

export const equipmentService = {
  async fetchEquipment(): Promise<HardwareEquipment[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('hardware_equipment').select('*');
    if (error || !data) return [];
    return data.map((e) => ({
      id: e.id,
      name: e.name,
      category: e.category || 'camera',
      model: e.model || e.name,
      serialNumber: e.serial_number || '',
      status: e.status || 'available',
      specs: e.specs || '',
      dailyRateUSD: Number(e.daily_rate_cents || 0) / 100,
      image: e.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop&q=80',
    }));
  },

  async createEquipment(eq: HardwareEquipment): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('hardware_equipment').insert({
      id: eq.id,
      name: eq.name,
      category: eq.category,
      status: eq.status,
      serial_number: eq.serialNumber,
      daily_rate_cents: Math.round(eq.dailyRateUSD * 100),
    });
    if (error) {
      console.error('Supabase createEquipment error:', error);
      throw error;
    }
  },

  async fetchReservations(): Promise<EquipmentReservation[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('equipment_reservations').select('*');
    if (error || !data) return [];
    return data.map((r) => ({
      id: r.id,
      equipmentId: r.equipment_id,
      deliverableId: r.deliverable_id || '',
      deliverableTitle: r.deliverable_title || 'Entregable',
      brandName: r.brand_name || 'Marca',
      startDate: r.start_date,
      endDate: r.end_date,
      reservedById: r.user_id || '',
      reservedByName: r.reserved_by_name || 'Usuario',
      status: r.status || 'confirmed',
      createdAt: r.created_at || new Date().toISOString().split('T')[0],
    }));
  },
};

// ==============================================================================
// 7. CAMPAIGNS SERVICE
// ==============================================================================

export const campaignService = {
  async fetchCampaigns(): Promise<Campaign[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((c) => ({
      id: c.id,
      code: c.code || 'CMP-001',
      brandId: c.brand_id,
      name: c.name,
      description: c.description || '',
      objective: c.objective || '',
      campaignType: c.type || 'brand_awareness',
      startDate: c.start_date || new Date().toISOString().split('T')[0],
      endDate: c.end_date || new Date().toISOString().split('T')[0],
      budgetUSD: Number(c.budget_cents || 0) / 100,
      spentUSD: Number(c.spent_cents || 0) / 100,
      status: c.status || 'planning',
      deliverableIds: c.deliverable_ids || [],
      kpis: c.kpis || [],
      createdAt: c.created_at || new Date().toISOString().split('T')[0],
      updatedAt: c.updated_at || new Date().toISOString().split('T')[0],
    }));
  },

  async createCampaign(camp: Campaign): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('campaigns').insert({
      id: camp.id,
      brand_id: camp.brandId,
      name: camp.name,
      type: camp.campaignType,
      status: camp.status,
      start_date: camp.startDate,
      end_date: camp.endDate,
      budget_cents: Math.round(camp.budgetUSD * 100),
      spent_cents: Math.round((camp.spentUSD || 0) * 100),
      kpis: camp.kpis,
    });
    if (error) {
      console.error('Supabase createCampaign error:', error);
      throw error;
    }
  },
};

// ==============================================================================
// 8. AUDIT LOGS SERVICE
// ==============================================================================

export const auditService = {
  async fetchAuditLogs(): Promise<AuditLog[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      if (error || !data) return [];
      return data.map((a) => ({
        id: a.id,
        timestamp: a.timestamp ? new Date(a.timestamp).toLocaleString('es-ES') : new Date().toLocaleString('es-ES'),
        userId: a.user_id || 'usr_system',
        userName: a.user_name || 'Sistema',
        userRole: (a.details?.role || 'webadmin') as UserRole,
        action: a.action,
        entityType: a.entity_type || 'system',
        entityId: a.entity_id || 'sys_root',
        details: typeof a.details === 'string' ? a.details : JSON.stringify(a.details || {}),
      }));
    } catch (err) {
      console.warn('Could not fetch audit logs from Supabase:', err);
      return [];
    }
  },

  async addAuditLog(log: AuditLog): Promise<void> {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('audit_logs').insert({
        id: log.id,
        timestamp: new Date().toISOString(),
        user_id: log.userId,
        user_name: log.userName,
        action: log.action,
        entity_type: log.entityType,
        entity_id: log.entityId,
        details: typeof log.details === 'object' ? log.details : { message: log.details, role: log.userRole },
      });
      if (error) {
        console.warn('Supabase addAuditLog warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase addAuditLog exception:', err);
    }
  },
};

// ==============================================================================
// 9. SEED DEMO DATA HELPER (FOR 1-CLICK WEBADMIN IMPORT)
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
