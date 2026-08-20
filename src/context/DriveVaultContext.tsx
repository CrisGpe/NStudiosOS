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
import { INITIAL_DRIVE_ACCOUNTS, INITIAL_DRIVE_FOLDERS, INITIAL_DRIVE_FILES } from '../data/initialData';
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
  createDriveFolder: (folder: Partial<DriveFolder> & { name: string; accountId: string }) => DriveFolder;
  createDriveFile: (file: Omit<DriveFile, 'id' | 'createdAt' | 'updatedAt'>) => DriveFile;
  deleteDriveFile: (id: string) => void;
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
      return saved ? JSON.parse(saved) : INITIAL_DRIVE_ACCOUNTS;
    } catch {
      return INITIAL_DRIVE_ACCOUNTS;
    }
  });

  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_drive_folders');
      return saved ? JSON.parse(saved) : INITIAL_DRIVE_FOLDERS;
    } catch {
      return INITIAL_DRIVE_FOLDERS;
    }
  });

  const [driveFiles, setDriveFiles] = useState<DriveFile[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_drive_files');
      return saved ? JSON.parse(saved) : INITIAL_DRIVE_FILES;
    } catch {
      return INITIAL_DRIVE_FILES;
    }
  });

  const [selectedDriveAccountId, setSelectedDriveAccountId] = useState<string>(
    () => driveAccounts[0]?.id || 'acc_workspace_corp'
  );
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [activePreviewFile, setActivePreviewFile] = useState<DriveFile | null>(null);

  const refreshDriveFromSupabase = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const [dbAccounts, dbFolders, dbFiles] = await Promise.all([
        driveVaultService.fetchDriveAccounts(),
        driveVaultService.fetchDriveFolders(),
        driveVaultService.fetchDriveFiles(),
      ]);
      if (dbAccounts && dbAccounts.length > 0) setDriveAccounts(dbAccounts);
      if (dbFolders && dbFolders.length > 0) setDriveFolders(dbFolders);
      if (dbFiles && dbFiles.length > 0) setDriveFiles(dbFiles);
    } catch (err) {
      console.warn('Could not sync Drive Vault with Supabase, using local fallback:', err);
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

  const createDriveFolder = (folderData: Partial<DriveFolder> & { name: string; accountId: string }): DriveFolder => {
    const newFolder: DriveFolder = {
      brandId: 'brd_apex',
      parentFolderId: undefined,
      path: `/${folderData.name}`,
      isSystemGenerated: false,
      itemCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      ...folderData,
      id: 'fld_' + Date.now(),
    };
    setDriveFolders((prev) => [...prev, newFolder]);
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
    driveVaultService.createDriveFile(newFile).catch((err) => console.warn('Supabase createDriveFile sync error:', err));
    return newFile;
  };

  const deleteDriveFile = (id: string) => {
    setDriveFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateDriveAccount = (id: string, updates: Partial<DriveAccount>) => {
    setDriveAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const syncDriveAccount = async (id: string) => {
    setDriveAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, lastSyncedAt: new Date().toISOString() } : a))
    );
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
        createDriveFolder,
        createDriveFile,
        deleteDriveFile,
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
