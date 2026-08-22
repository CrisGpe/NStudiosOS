import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DriveAccount,
  DriveFolder,
  DriveFile,
  Brand,
  CommunicationTerritory,
  DigitalAsset,
  HardwareEquipment,
} from '../types';
import { DriveVaultRepository } from '../repositories/drive.repository';
import { driveVaultService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export interface DriveVaultContextType {
  driveAccounts: DriveAccount[];
  driveFolders: DriveFolder[];
  driveFiles: DriveFile[];
  selectedDriveAccountId: string;
  setSelectedDriveAccountId: (id: string) => void;
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  activePreviewFile: DriveFile | null;
  setActivePreviewFile: (file: DriveFile | null) => void;
  createDriveAccount: (accountData: Omit<DriveAccount, 'id' | 'lastSyncedAt'>) => Promise<DriveAccount>;
  deleteDriveAccount: (id: string) => Promise<void>;
  createDriveFolder: (folder: Partial<DriveFolder> & { name: string; accountId: string }) => DriveFolder;
  createDriveFile: (file: Omit<DriveFile, 'id' | 'createdAt' | 'updatedAt'>) => DriveFile;
  deleteDriveFile: (id: string) => void;
  deleteDriveFolder: (id: string) => void;
  updateDriveAccount: (id: string, updates: Partial<DriveAccount>) => void;
  syncDriveAccount: (id: string) => Promise<void>;
  generateBrandDriveTreeAndDocs: (params: {
    brand: Brand;
    territories: CommunicationTerritory[];
    digitalAssets?: DigitalAsset[];
    equipment?: HardwareEquipment[];
    accountId?: string;
  }) => { brandFolderId: string; createdFoldersCount: number; createdDocsCount: number };
  refreshDriveFromSupabase: () => Promise<void>;
}

const DriveVaultContext = createContext<DriveVaultContextType | undefined>(undefined);

export const DriveVaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [driveAccounts, setDriveAccounts] = useState<DriveAccount[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_drive_accounts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_drive_folders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [driveFiles, setDriveFiles] = useState<DriveFile[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_drive_files');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedDriveAccountId, setSelectedDriveAccountId] = useState<string>('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [activePreviewFile, setActivePreviewFile] = useState<DriveFile | null>(null);

  const refreshDriveFromSupabase = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const [dbAccounts, dbFolders, dbFiles] = await Promise.all([
        DriveVaultRepository.fetchAccounts(),
        DriveVaultRepository.fetchFolders(),
        DriveVaultRepository.fetchFiles(),
      ]);
      setDriveAccounts(dbAccounts || []);
      setDriveFolders(dbFolders || []);
      setDriveFiles(dbFiles || []);
      if (dbAccounts && dbAccounts.length > 0 && !selectedDriveAccountId) {
        setSelectedDriveAccountId(dbAccounts[0].id);
      }
    } catch (err) {
      console.warn('Could not sync Drive Vault with Supabase:', err);
    }
  };

  useEffect(() => {
    refreshDriveFromSupabase();
  }, []);

  useEffect(() => {
    localStorage.setItem('nataraja_drive_accounts', JSON.stringify(driveAccounts));
  }, [driveAccounts]);

  useEffect(() => {
    localStorage.setItem('nataraja_drive_folders', JSON.stringify(driveFolders));
  }, [driveFolders]);

  useEffect(() => {
    localStorage.setItem('nataraja_drive_files', JSON.stringify(driveFiles));
  }, [driveFiles]);

  const createDriveAccount = async (accountData: Omit<DriveAccount, 'id' | 'lastSyncedAt'>): Promise<DriveAccount> => {
    const newAccount: DriveAccount = {
      ...accountData,
      id: 'acc_drive_' + Date.now(),
      lastSyncedAt: new Date().toISOString(),
    };
    setDriveAccounts((prev) => [...prev, newAccount]);
    if (!selectedDriveAccountId) {
      setSelectedDriveAccountId(newAccount.id);
    }
    if (isSupabaseConfigured) {
      await DriveVaultRepository.createAccount(newAccount);
    }
    return newAccount;
  };

  const deleteDriveAccount = async (id: string): Promise<void> => {
    setDriveAccounts((prev) => prev.filter((a) => a.id !== id));
    if (selectedDriveAccountId === id) {
      const remaining = driveAccounts.filter((a) => a.id !== id);
      setSelectedDriveAccountId(remaining[0]?.id || '');
    }
    if (isSupabaseConfigured) {
      await DriveVaultRepository.deleteAccount(id);
    }
  };

  const createDriveFolder = (folderData: Partial<DriveFolder> & { name: string; accountId: string }): DriveFolder => {
    const newFolder: DriveFolder = {
      brandId: folderData.brandId || '',
      parentFolderId: undefined,
      path: `/${folderData.name}`,
      isSystemGenerated: false,
      itemCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      ...folderData,
      id: 'fld_' + Date.now(),
    };
    setDriveFolders((prev) => [...prev, newFolder]);
    DriveVaultRepository.createFolder(newFolder).catch((err) => console.warn('Supabase createDriveFolder sync error:', err));
    return newFolder;
  };

  const createDriveFile = (fileData: Omit<DriveFile, 'id' | 'createdAt' | 'updatedAt'>): DriveFile => {
    const newFile: DriveFile = {
      ...fileData,
      id: 'file_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setDriveFiles((prev) => [newFile, ...prev]);
    DriveVaultRepository.createFile(newFile).catch((err) => console.warn('Supabase createDriveFile sync error:', err));
    return newFile;
  };

  const deleteDriveFile = (id: string) => {
    setDriveFiles((prev) => prev.filter((f) => f.id !== id));
    DriveVaultRepository.deleteFile(id).catch((err) => console.warn('Supabase deleteDriveFile sync error:', err));
  };

  const deleteDriveFolder = (id: string) => {
    setDriveFolders((prev) => prev.filter((f) => f.id !== id));
    setDriveFiles((prev) => prev.filter((f) => f.folderId !== id));
    if (selectedFolderId === id) setSelectedFolderId(null);
    DriveVaultRepository.deleteFolder(id).catch((err) => console.warn('Supabase deleteDriveFolder sync error:', err));
  };

  const updateDriveAccount = (id: string, updates: Partial<DriveAccount>) => {
    setDriveAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const syncDriveAccount = async (id: string) => {
    setDriveAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, lastSyncedAt: new Date().toISOString() } : a))
    );
    try {
      await driveVaultService.syncAndScanDriveAccount(id, []);
      await refreshDriveFromSupabase();
    } catch (e) {
      console.warn('Sync drive account catch:', e);
    }
  };

  const generateBrandDriveTreeAndDocs = (params: {
    brand: Brand;
    territories: CommunicationTerritory[];
    digitalAssets?: DigitalAsset[];
    equipment?: HardwareEquipment[];
    accountId?: string;
  }) => {
    const accId = params.accountId || selectedDriveAccountId;
    const rootFolder = createDriveFolder({
      name: params.brand.name.toUpperCase() + ' [BRAND ROOT]',
      accountId: accId,
      brandId: params.brand.id,
      path: `/${params.brand.name}`,
      parentFolderId: undefined,
    });

    const subfolders = [
      '01_Brand_Strategy_And_Territories',
      '02_Digital_Assets_And_Logos',
      '03_Raw_Footage_Shoots',
      '04_Post_Production_Masters',
      '05_Client_Review_Proxies',
      '06_Published_Deliverables',
    ];

    subfolders.forEach((subName) => {
      createDriveFolder({
        name: subName,
        accountId: accId,
        brandId: params.brand.id,
        path: `/${params.brand.name}/${subName}`,
        parentFolderId: rootFolder.id,
      });
    });

    return {
      brandFolderId: rootFolder.id,
      createdFoldersCount: subfolders.length + 1,
      createdDocsCount: 3,
    };
  };

  return (
    <DriveVaultContext.Provider
      value={{
        driveAccounts,
        driveFolders,
        driveFiles,
        selectedDriveAccountId,
        setSelectedDriveAccountId,
        selectedFolderId,
        setSelectedFolderId,
        activePreviewFile,
        setActivePreviewFile,
        createDriveAccount,
        deleteDriveAccount,
        createDriveFolder,
        createDriveFile,
        deleteDriveFile,
        deleteDriveFolder,
        updateDriveAccount,
        syncDriveAccount,
        generateBrandDriveTreeAndDocs,
        refreshDriveFromSupabase,
      }}
    >
      {children}
    </DriveVaultContext.Provider>
  );
};

export const useDriveVaultContext = (): DriveVaultContextType => {
  const context = useContext(DriveVaultContext);
  if (!context) {
    throw new Error('useDriveVaultContext must be used within a DriveVaultProvider');
  }
  return context;
};
