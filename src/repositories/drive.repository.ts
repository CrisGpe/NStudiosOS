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
        quotaTotalGB: row.storage_quota_bytes ? Math.round(Number(row.storage_quota_bytes) / (1024 * 1024 * 1024)) : (Number(row.quota_total_gb) || 200),
        quotaUsedGB: row.storage_used_bytes ? Math.round(Number(row.storage_used_bytes) / (1024 * 1024 * 1024)) : (Number(row.quota_used_gb) || 0),
        rootFolderId: row.root_folder_id || 'root',
        isConnected: row.service_account_connected ?? row.is_connected ?? true,
        lastSyncedAt: row.last_sync_at || row.last_synced_at || new Date().toISOString(),
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

    try {
      const { error } = await supabase.from('drive_accounts').insert({
        id: newAcc.id,
        name: newAcc.name,
        email: newAcc.email,
        storage_quota_bytes: (newAcc.quotaTotalGB || 200) * 1024 * 1024 * 1024,
        storage_used_bytes: (newAcc.quotaUsedGB || 0) * 1024 * 1024 * 1024,
        status: newAcc.status || 'connected',
        service_account_connected: newAcc.isConnected ?? true,
        last_sync_at: newAcc.lastSyncedAt,
      });
      if (error) console.warn('Supabase createAccount notice:', error.message);
    } catch (err) {
      console.warn('Supabase createAccount catch:', err);
    }
    return newAcc;
  },

  async updateAccount(id: string, updates: Partial<DriveAccount>): Promise<void> {
    if (!isSupabaseConfigured) return;
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.quotaTotalGB !== undefined) payload.storage_quota_bytes = updates.quotaTotalGB * 1024 * 1024 * 1024;
    if (updates.quotaUsedGB !== undefined) payload.storage_used_bytes = updates.quotaUsedGB * 1024 * 1024 * 1024;
    if (updates.isConnected !== undefined) payload.service_account_connected = updates.isConnected;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.lastSyncedAt !== undefined) payload.last_sync_at = updates.lastSyncedAt;

    if (Object.keys(payload).length > 0) {
      try {
        const { error } = await supabase.from('drive_accounts').update(payload).eq('id', id);
        if (error) console.warn('Supabase updateAccount notice:', error.message);
      } catch (err) {
        console.warn('Supabase updateAccount catch:', err);
      }
    }
  },

  async deleteAccount(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase.from('drive_accounts').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
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
        path: row.path || `/${row.name}`,
        parentFolderId: row.parent_id || row.parent_folder_id,
        brandId: row.brand_id,
        itemCount: Number(row.item_count) || 0,
        isSystemGenerated: row.is_system_folder ?? row.is_system_generated ?? false,
        createdAt: row.created_at || new Date().toISOString().split('T')[0],
      }));
    } catch {
      return [];
    }
  },

  async createFolder(folder: DriveFolder): Promise<DriveFolder> {
    if (!isSupabaseConfigured) return folder;

    try {
      const { error } = await supabase.from('drive_folders').insert({
        id: folder.id,
        account_id: folder.accountId || null,
        brand_id: folder.brandId || null,
        name: folder.name,
        parent_id: folder.parentFolderId || null,
        is_system_folder: folder.isSystemGenerated ?? false,
      });
      if (error) console.warn('Supabase createFolder notice:', error.message);
    } catch (err) {
      console.warn('Supabase createFolder catch:', err);
    }
    return folder;
  },

  async deleteFolder(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase.from('drive_folders').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  // FILES
  async fetchFiles(): Promise<DriveFile[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('drive_files').select('*');
      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        accountId: row.account_id,
        folderId: row.folder_id,
        brandId: row.brand_id,
        campaignId: row.campaign_id,
        deliverableId: row.deliverable_id,
        name: row.name,
        type: row.type || 'document',
        mimeType: row.mime_type,
        sizeFormatted: row.size_formatted,
        sizeBytes: Number(row.size_bytes) || 0,
        url: row.url,
        previewUrl: row.preview_url,
        proxyUrl: row.proxy_url,
        isOriginalMaster: row.is_original_master ?? false,
        uploadedByName: 'Nataraja Studio OS',
        createdAt: row.created_at ? row.created_at.split('T')[0] : '2026-01-01',
        updatedAt: row.updated_at ? row.updated_at.split('T')[0] : '2026-01-01',
      }));
    } catch {
      return [];
    }
  },

  async createFile(file: DriveFile): Promise<DriveFile> {
    if (!isSupabaseConfigured) return file;

    try {
      const { error } = await supabase.from('drive_files').insert({
        id: file.id,
        account_id: file.accountId || null,
        folder_id: file.folderId || null,
        brand_id: file.brandId || null,
        campaign_id: file.campaignId || null,
        deliverable_id: file.deliverableId || null,
        name: file.name,
        type: file.type,
        mime_type: file.mimeType || 'text/plain',
        size_formatted: file.sizeFormatted,
        size_bytes: file.sizeBytes,
        url: file.url || 'https://drive.google.com',
        preview_url: file.previewUrl || null,
        proxy_url: file.proxyUrl || null,
        is_original_master: file.isOriginalMaster || false,
      });
      if (error) console.warn('Supabase createFile notice:', error.message);
    } catch (err) {
      console.warn('Supabase createFile catch:', err);
    }
    return file;
  },

  async deleteFile(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase.from('drive_files').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },
};
