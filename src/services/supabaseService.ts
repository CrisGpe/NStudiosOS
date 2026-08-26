import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { UserProfile, Brand, ClientBrandPermission } from '../types';
import { AuthRepository, BrandsRepository, DeliverablesRepository, CampaignsRepository, DriveVaultRepository, EquipmentRepository, ClientOrganizationsRepository, AuditRepository, ClientSandboxRepository } from '../repositories';

// ==============================================================================
// 1. AUTH & PROFILES SERVICE
// ==============================================================================
export const authService = {
  signIn: AuthRepository.signIn,
  signUp: AuthRepository.signUp,
  fetchProfiles: AuthRepository.fetchProfiles,
  fetchAllProfiles: AuthRepository.fetchProfiles,
  fetchUserProfile: async (id: string) => {
    const profiles = await AuthRepository.fetchProfiles();
    return profiles.find((p) => p.id === id) || null;
  },
  upsertProfile: async (profile: UserProfile) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('users_profiles').upsert({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      role_title: profile.roleTitle,
      avatar: profile.avatar,
      assigned_brand_ids: profile.assignedBrandIds,
      client_organization_id: profile.clientOrganizationId,
      client_role: profile.clientRole,
      schedule: profile.schedule,
      preferences: profile.preferences,
    });
  },
  updateUserProfile: AuthRepository.updateUserProfile,
  updateUserRoleAndBrands: AuthRepository.updateUserRoleAndBrands,
  updateUserSchedule: AuthRepository.updateUserSchedule,
  updateUserPreferences: AuthRepository.updateUserPreferences,
  signOut: AuthRepository.signOut,
};

// ==============================================================================
// 2. BRANDS & TERRITORIES SERVICE
// ==============================================================================
export const brandService = {
  fetchBrands: BrandsRepository.fetchBrands,
  createBrand: BrandsRepository.createBrand,
  updateBrand: BrandsRepository.updateBrand,
  deleteBrand: BrandsRepository.deleteBrand,

  fetchTerritories: BrandsRepository.fetchTerritories,
  createTerritory: BrandsRepository.createTerritory,
  updateTerritory: BrandsRepository.updateTerritory,
  deleteTerritory: BrandsRepository.deleteTerritory,

  fetchDigitalAssets: BrandsRepository.fetchDigitalAssets,
  createDigitalAsset: BrandsRepository.createDigitalAsset,
  updateDigitalAsset: BrandsRepository.updateDigitalAsset,
  deleteDigitalAsset: BrandsRepository.deleteDigitalAsset,
};

// ==============================================================================
// 3. DELIVERABLES SERVICE
// ==============================================================================
export const deliverableService = {
  fetchDeliverables: DeliverablesRepository.fetchDeliverables,
  createDeliverable: DeliverablesRepository.createDeliverable,
  updateDeliverable: DeliverablesRepository.updateDeliverable,
  updateDeliverablePhase: DeliverablesRepository.updatePhase,
  updateTechnicalGuide: DeliverablesRepository.updateTechnicalGuide,
  submitChangeRequest: DeliverablesRepository.submitChangeRequest,
  deleteDeliverable: DeliverablesRepository.deleteDeliverable,
};

// ==============================================================================
// 4. CAMPAIGNS SERVICE
// ==============================================================================
export const campaignService = {
  fetchCampaigns: CampaignsRepository.fetchCampaigns,
  createCampaign: CampaignsRepository.createCampaign,
  updateCampaign: CampaignsRepository.updateCampaign,
  deleteCampaign: CampaignsRepository.deleteCampaign,
};

// ==============================================================================
// 5. EQUIPMENT & SCHEDULES SERVICE
// ==============================================================================
export const equipmentService = {
  fetchEquipment: EquipmentRepository.fetchEquipment,
  createEquipment: EquipmentRepository.createEquipment,
  updateEquipment: EquipmentRepository.updateEquipment,
  deleteEquipment: EquipmentRepository.deleteEquipment,

  fetchReservations: EquipmentRepository.fetchReservations,
  createReservation: EquipmentRepository.createReservation,
  cancelReservation: EquipmentRepository.cancelReservation,
};

// ==============================================================================
// 6. DRIVE VAULT & STORAGE SERVICE
// ==============================================================================
export const driveVaultService = {
  fetchDriveAccounts: DriveVaultRepository.fetchAccounts,
  createDriveAccount: DriveVaultRepository.createAccount,
  deleteDriveAccount: DriveVaultRepository.deleteAccount,

  fetchDriveFolders: DriveVaultRepository.fetchFolders,
  createDriveFolder: DriveVaultRepository.createFolder,
  deleteDriveFolder: DriveVaultRepository.deleteFolder,

  fetchDriveFiles: DriveVaultRepository.fetchFiles,
  createDriveFile: DriveVaultRepository.createFile,
  deleteDriveFile: DriveVaultRepository.deleteFile,

  async generateBrandDriveTreeAndDocs(brandId: string, brandName: string, accountId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      const now = new Date().toISOString();
      const todayStr = now.split('T')[0];
      const brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const rootFolderId = `fld_${brandSlug}_root_${Date.now()}`;

      // 1. Root brand folder
      await DriveVaultRepository.createFolder({
        id: rootFolderId,
        accountId,
        name: `${brandName} [MASTER HUB]`,
        path: `/${brandName}`,
        brandId,
        itemCount: 4,
        isSystemGenerated: true,
        createdAt: todayStr,
      });

      // 2. Standard Subfolders
      const subfolders = [
        { name: '01_MASTERS_4K_PRORES', path: `/${brandName}/01_MASTERS` },
        { name: '02_AUDIO_STEMS_32BIT', path: `/${brandName}/02_AUDIO` },
        { name: '03_GRAPHIC_ASSETS', path: `/${brandName}/03_GRAPHICS` },
        { name: '04_SYSTEM_DOCS', path: `/${brandName}/04_DOCS` },
      ];

      for (const sf of subfolders) {
        const subId = `fld_${brandSlug}_${sf.name.toLowerCase().substring(0, 8)}_${Date.now()}`;
        await DriveVaultRepository.createFolder({
          id: subId,
          accountId,
          name: sf.name,
          path: sf.path,
          parentFolderId: rootFolderId,
          brandId,
          itemCount: 1,
          isSystemGenerated: true,
          createdAt: todayStr,
        });

        if (sf.name === '04_SYSTEM_DOCS') {
          // Add system doc
          await DriveVaultRepository.createFile({
            id: `fil_doc_${brandSlug}_spec_${Date.now()}`,
            accountId,
            folderId: subId,
            brandId,
            name: `Technical_Specs_Manual_${brandName}.gdoc`,
            type: 'document',
            mimeType: 'application/vnd.google-apps.document',
            sizeBytes: 1024 * 128,
            sizeFormatted: '128 KB',
            url: 'https://docs.google.com',
            previewUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=100&auto=format&fit=crop&q=60',
            uploadedByName: 'Sistema Nataraja',
            createdAt: todayStr,
            updatedAt: todayStr,
            isOriginalMaster: false,
            generatedDocument: {
              id: `doc_${Date.now()}`,
              type: 'brand_manual',
              brandId,
              title: `Especificaciones Técnicas Audiovisuales - ${brandName}`,
              subtitle: 'Pipeline de Producción y Formatos Oficiales',
              version: '1.0',
              generatedAt: now,
              sections: [
                { title: '1. Codecs de Exportación', content: 'Master ProRes 422 HQ para broadcast y H.264 para pauta digital.' },
                { title: '2. Perfil de Color y Espacio', content: 'Rec.709 Gamma 2.4 con LUTs oficiales calibrados por N. Studios.' },
              ],
            },
          });
        }
      }

      return true;
    } catch (err) {
      console.error('Error generating brand drive tree:', err);
      return false;
    }
  },

  async syncAndScanDriveAccount(accountId: string, brands: Brand[]): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      const now = new Date().toISOString();
      const todayStr = now.split('T')[0];
      await supabase
        .from('drive_accounts')
        .update({ last_synced_at: now })
        .eq('id', accountId);

      for (const brand of brands) {
        const existingFolder = await supabase
          .from('drive_folders')
          .select('id')
          .eq('account_id', accountId)
          .eq('brand_id', brand.id)
          .maybeSingle();

        if (!existingFolder.data) {
          await DriveVaultRepository.createFolder({
            id: `fld_vault_${brand.id}_${Date.now()}`,
            accountId,
            name: `${brand.name} • Bóveda Maestra`,
            path: `/${brand.name}`,
            brandId: brand.id,
            itemCount: 0,
            isSystemGenerated: true,
            createdAt: todayStr,
          });
        }
      }

      return true;
    } catch (err) {
      console.error('Error scanning drive account:', err);
      return false;
    }
  },
};

// ==============================================================================
// 7. CLIENT ORGANIZATIONS & TEAMS SERVICE
// ==============================================================================
export const clientOrgService = {
  fetchOrganizations: ClientOrganizationsRepository.fetchOrganizations,
  createOrganization: ClientOrganizationsRepository.createOrganization,
  fetchTeamMembers: ClientOrganizationsRepository.fetchTeamMembers,
  updateMemberPermissions: ClientOrganizationsRepository.updateMemberPermissions,

  async inviteClientTeamMember(params: {
    orgId: string;
    email: string;
    name: string;
    roleTitle?: string;
    tempPassword?: string;
    permissionsMatrix: Record<string, ClientBrandPermission>;
  }): Promise<any> {
    if (!isSupabaseConfigured) {
      return { id: 'usr_mock_' + Date.now(), email: params.email, name: params.name };
    }

    // 1. Sign up user in Auth
    const tempPassword = params.tempPassword || 'Nataraja2026!';
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: params.email,
      password: tempPassword,
      options: {
        data: {
          name: params.name,
          role: 'cliente',
        },
      },
    });

    if (authError && !authError.message.includes('already registered')) {
      throw authError;
    }

    const userId = authData?.user?.id || 'usr_' + Date.now();
    const assignedBrands = Object.keys(params.permissionsMatrix).filter(
      (bId) =>
        params.permissionsMatrix[bId].canAccessSandbox ||
        params.permissionsMatrix[bId].canViewProduction ||
        params.permissionsMatrix[bId].canAccessDrive ||
        params.permissionsMatrix[bId].isBrandLead
    );

    // 2. Create Profile
    await supabase.from('users_profiles').upsert({
      id: userId,
      email: params.email,
      name: params.name,
      role: 'cliente',
      role_title: params.roleTitle || 'Miembro del Equipo de Marca',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(params.name)}`,
      assigned_brand_ids: assignedBrands,
      client_organization_id: params.orgId,
      client_role: 'team_member',
    });

    // 3. Create Team Member Record
    const memberId = 'clm_' + Date.now();
    await supabase.from('client_team_members').insert({
      id: memberId,
      organization_id: params.orgId,
      user_id: userId,
      name: params.name,
      email: params.email,
      role_title: params.roleTitle || 'Miembro del Equipo de Marca',
      permissions_matrix: params.permissionsMatrix,
      created_at: new Date().toISOString(),
    });

    return { id: userId, email: params.email, name: params.name };
  },

  async syncBrandContacts(): Promise<{ syncedCount: number; orgsCreated: number }> {
    if (!isSupabaseConfigured) return { syncedCount: 0, orgsCreated: 0 };

    try {
      const { data: allBrands } = await supabase.from('brands').select('*');
      if (!allBrands || allBrands.length === 0) return { syncedCount: 0, orgsCreated: 0 };

      // 1. Group brands by client contact email
      const emailMap = new Map<string, any[]>();
      for (const b of allBrands) {
        const email = (b.contact_email || b.client_contact_email || '').trim().toLowerCase();
        if (!email) continue;
        if (!emailMap.has(email)) {
          emailMap.set(email, []);
        }
        emailMap.get(email)!.push(b);
      }

      let syncedCount = 0;
      let orgsCreated = 0;

      for (const [email, brandsList] of emailMap.entries()) {
        const firstBrand = brandsList[0];
        const contactName = firstBrand.contact_person || firstBrand.client_contact_name || firstBrand.name;
        const brandIds = brandsList.map((b) => b.id);
        const tempPassword = 'Nataraja2026!';

        // A. Sign up user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: tempPassword,
          options: {
            data: {
              name: contactName,
              role: 'cliente',
            },
          },
        });

        if (authError && !authError.message.includes('already registered')) {
          console.warn(`Error al aprovisionar usuario ${email}:`, authError.message);
        }

        const userId = authData?.user?.id || `usr_client_${Date.now()}`;

        // B. Ensure Organization exists
        const orgId = `org_${firstBrand.slug || firstBrand.id}`;
        const { data: existingOrg } = await supabase
          .from('client_organizations')
          .select('id')
          .eq('id', orgId)
          .maybeSingle();

        if (!existingOrg) {
          await supabase.from('client_organizations').insert({
            id: orgId,
            name: `${firstBrand.name} (Holding)`,
            contact_email: email,
            owner_user_id: userId,
            brand_ids: brandIds,
            created_at: new Date().toISOString().split('T')[0],
          });
          orgsCreated++;
        } else {
          await supabase
            .from('client_organizations')
            .update({ brand_ids: brandIds })
            .eq('id', orgId);
        }

        // C. Update Profile with organization and all assigned brands
        await supabase.from('users_profiles').upsert({
          id: userId,
          email,
          name: contactName,
          role: 'cliente',
          role_title: 'Director Ejecutivo de Marca (Holding Admin)',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(contactName)}`,
          assigned_brand_ids: brandIds,
          client_organization_id: orgId,
          client_role: 'holding_admin',
        });

        // D. Link brands to client_organization_id
        for (const b of brandsList) {
          await supabase
            .from('brands')
            .update({ client_organization_id: orgId })
            .eq('id', b.id);
        }

        syncedCount++;
      }

      return { syncedCount, orgsCreated };
    } catch (err) {
      console.error('Error during client sync:', err);
      throw err;
    }
  },
};

// ==============================================================================
// 8. AUDIT LOGS SERVICE
// ==============================================================================
export const auditService = {
  fetchAuditLogs: AuditRepository.fetchAuditLogs,
  addAuditLog: AuditRepository.addAuditLog,
};

// ==============================================================================
// 9. CLIENT SANDBOX SERVICE
// ==============================================================================
export const clientSandboxService = {
  fetchIdeas: ClientSandboxRepository.fetchIdeas,
  fetchSandboxIdeas: ClientSandboxRepository.fetchIdeas,
  createIdea: ClientSandboxRepository.createIdea,
  createSandboxIdea: ClientSandboxRepository.createIdea,
  updateIdea: ClientSandboxRepository.updateIdea,
  deleteIdea: ClientSandboxRepository.deleteIdea,
  deleteSandboxIdea: ClientSandboxRepository.deleteIdea,
};

// ==============================================================================
// UNIFIED FACADE EXPORT
// ==============================================================================
export const supabaseService = {
  ...authService,
  ...brandService,
  ...deliverableService,
  ...campaignService,
  ...equipmentService,
  ...driveVaultService,
  ...clientOrgService,
  ...auditService,
  ...clientSandboxService,
};
