import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { DriveAccount, DriveFolder, DriveFile } from '../types';

export const DriveVaultRepository = {
  // ACCOUNTS
  async fetchAccounts(): Promise<DriveAccount[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('drive_accounts').select('*');
      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        type: row.type || 'corporate_workspace',
        quotaTotalGB: Number(row.quota_total_gb) || 200,
        quotaUsedGB: Number(row.quota_used_gb) || 0,
        rootFolderId: row.root_folder_id,
        isConnected: row.is_connected ?? true,
        lastSyncedAt: row.last_synced_at || new Date().toISOString(),
        status: row.status || 'active',
      }));
    } catch {
      return [];
    }
  },

  async createAccount(account: Omit<DriveAccount, 'id' | 'lastSyncedAt'>): Promise<DriveAccount> {
    const id = 'drv_acc_' + Date.now();
    const lastSyncedAt = new Date().toISOString();
    const newAcc: DriveAccount = { ...account, id, lastSyncedAt };

    if (!isSupabaseConfigured) return newAcc;

    const { error } = await supabase.from('drive_accounts').insert({
      id: newAcc.id,
      name: newAcc.name,
      email: newAcc.email,
      type: newAcc.type,
      quota_total_gb: newAcc.quotaTotalGB,
      quota_used_gb: newAcc.quotaUsedGB,
      root_folder_id: newAcc.rootFolderId,
      is_connected: newAcc.isConnected,
      last_synced_at: newAcc.lastSyncedAt,
      status: newAcc.status,
    });
    if (error) console.error('Error inserting drive account in Supabase:', error);
    return newAcc;
  },

  async updateAccount(id: string, updates: Partial<DriveAccount>): Promise<void> {
    if (!isSupabaseConfigured) return;
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.quotaTotalGB !== undefined) payload.quota_total_gb = updates.quotaTotalGB;
    if (updates.quotaUsedGB !== undefined) payload.quota_used_gb = updates.quotaUsedGB;
    if (updates.rootFolderId !== undefined) payload.root_folder_id = updates.rootFolderId;
    if (updates.isConnected !== undefined) payload.is_connected = updates.isConnected;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.lastSyncedAt !== undefined) payload.last_synced_at = updates.lastSyncedAt;

    const { error } = await supabase.from('drive_accounts').update(payload).eq('id', id);
    if (error) console.error('Error updating drive account in Supabase:', error);
  },

  async deleteAccount(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase.from('drive_accounts').delete().eq('id', id);
    return !error;
  },

  // FOLDERS
  async fetchFolders(): Promise<DriveFolder[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('drive_folders').select('*');
      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        accountId: row.account_id,
        name: row.name,
        path: row.path,
        parentFolderId: row.parent_folder_id,
        brandId: row.brand_id,
        itemCount: Number(row.item_count) || 0,
        isSystemGenerated: row.is_system_generated ?? false,
        createdAt: row.created_at || new Date().toISOString().split('T')[0],
      }));
    } catch {
      return [];
    }
  },

  async createFolder(folder: DriveFolder): Promise<DriveFolder> {
    if (!isSupabaseConfigured) return folder;

    const { error } = await supabase.from('drive_folders').insert({
      id: folder.id,
      account_id: folder.accountId,
      name: folder.name,
      path: folder.path,
      parent_folder_id: folder.parentFolderId,
      brand_id: folder.brandId,
      item_count: folder.itemCount,
      is_system_generated: folder.isSystemGenerated,
      created_at: folder.createdAt,
    });
    if (error) console.error('Error inserting folder to Supabase:', error);
    return folder;
  },

  async deleteFolder(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    // 1. Delete all contained files
    await supabase.from('drive_files').delete().eq('folder_id', id);
    // 2. Delete folder
    const { error } = await supabase.from('drive_folders').delete().eq('id', id);
    return !error;
  },

  // FILES
  async fetchFiles(): Promise<DriveFile[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('drive_files').select('*');
      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        accountId: row.account_id || '',
        folderId: row.folder_id,
        brandId: row.brand_id,
        deliverableId: row.deliverable_id,
        name: row.name,
        type: row.type,
        mimeType: row.mime_type || 'application/octet-stream',
        sizeBytes: Number(row.size_bytes) || 0,
        sizeFormatted: row.size_formatted || '0 MB',
        url: row.url,
        previewUrl: row.preview_url,
        proxyUrl: row.proxy_url,
        isOriginalMaster: row.is_original_master ?? false,
        technicalSpecs: row.technical_specs,
        generatedDocument: row.generated_document,
        uploadedByName: row.uploaded_by_name || 'Sistema',
        createdAt: row.created_at || new Date().toISOString().split('T')[0],
        updatedAt: row.updated_at || new Date().toISOString().split('T')[0],
      }));
    } catch {
      return [];
    }
  },

  async createFile(file: DriveFile): Promise<DriveFile> {
    if (!isSupabaseConfigured) return file;

    const { error } = await supabase.from('drive_files').insert({
      id: file.id,
      account_id: file.accountId,
      folder_id: file.folderId,
      brand_id: file.brandId,
      deliverable_id: file.deliverableId,
      name: file.name,
      type: file.type,
      mime_type: file.mimeType,
      size_bytes: file.sizeBytes,
      size_formatted: file.sizeFormatted,
      url: file.url,
      preview_url: file.previewUrl,
      proxy_url: file.proxyUrl,
      is_original_master: file.isOriginalMaster,
      technical_specs: file.technicalSpecs,
      generated_document: file.generatedDocument,
      uploaded_by_name: file.uploadedByName,
      created_at: file.createdAt,
      updated_at: file.updatedAt,
    });
    if (error) console.error('Error inserting drive file in Supabase:', error);
    return file;
  },

  async deleteFile(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase.from('drive_files').delete().eq('id', id);
    return !error;
  },
};
