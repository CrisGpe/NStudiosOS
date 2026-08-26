import React, { createContext, useContext, useState, useEffect } from 'react';
import { DriveAccount, DriveFolder, DriveFile, Brand, CommunicationTerritory, DigitalAsset, HardwareEquipment, ClientOrganization } from '../types';
import { DriveVaultRepository } from '../repositories/drive.repository';
import { driveVaultService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { deriveOrganizationsFromBrands } from './BrandsContext';

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
    territories?: CommunicationTerritory[];
    digitalAssets?: DigitalAsset[];
    equipment?: HardwareEquipment[];
    accountId?: string;
  }) => { brandFolderId: string; createdFoldersCount: number; createdDocsCount: number };
  generateFullHierarchyForHoldingsAndBrands: (brandsList: Brand[], orgsList?: ClientOrganization[]) => void;
  refreshDriveFromSupabase: () => Promise<void>;
}

export const createDefaultVaultHierarchy = (
  brandsList: Brand[],
  orgsList: ClientOrganization[] = [],
  accId: string = 'acc_default'
): { folders: DriveFolder[]; files: DriveFile[] } => {
  const folders: DriveFolder[] = [];
  const files: DriveFile[] = [];

  const effectiveOrgs = orgsList.length > 0 ? orgsList : deriveOrganizationsFromBrands(brandsList);

  effectiveOrgs.forEach((org) => {
    // 1. Holding Root Folder
    const orgFolderId = `fld_org_${org.id}`;
    folders.push({
      id: orgFolderId,
      name: org.name,
      accountId: accId,
      path: `/${org.name}`,
      parentFolderId: undefined,
      isSystemGenerated: true,
      itemCount: 0,
      createdAt: '2026-01-01',
    });

    const orgBrands = brandsList.filter(
      (b) => b.clientOrganizationId === org.id || (org.brandIds || []).includes(b.id)
    );

    orgBrands.forEach((brand) => {
      // 2. Brand Folder inside Holding
      const brandFolderId = `fld_brand_${brand.id}`;
      folders.push({
        id: brandFolderId,
        name: brand.name,
        accountId: accId,
        brandId: brand.id,
        path: `/${org.name}/${brand.name}`,
        parentFolderId: orgFolderId,
        isSystemGenerated: true,
        itemCount: 6,
        createdAt: '2026-01-01',
      });

      // 3. 6 Standard Production Subfolders
      const subfolders = [
        { key: '01_Brand_Strategy_And_Territories', label: '01 Estrategia & Territorios' },
        { key: '02_PreProduccion_Cronogramas', label: '02 Pre-Producción & Cronogramas' },
        { key: '03_Raw_Footage_Shoots', label: '03 Rodajes & Raw Footage' },
        { key: '04_Post_Production_Masters', label: '04 Post-Producción & Masters' },
        { key: '05_Client_Review_Proxies', label: '05 Proxies & Revisión Cliente' },
        { key: '06_Published_Deliverables', label: '06 Entregables Publicados' },
      ];

      subfolders.forEach((sub) => {
        const subFolderId = `fld_${brand.id}_${sub.key}`;
        folders.push({
          id: subFolderId,
          name: sub.label,
          accountId: accId,
          brandId: brand.id,
          path: `/${org.name}/${brand.name}/${sub.key}`,
          parentFolderId: brandFolderId,
          isSystemGenerated: true,
          itemCount: 1,
          createdAt: '2026-01-01',
        });

        // Add pre-calendar spreadsheet in 02_PreProduccion_Cronogramas
        if (sub.key === '02_PreProduccion_Cronogramas') {
          files.push({
            id: `file_${brand.id}_precalendar`,
            accountId: accId,
            folderId: subFolderId,
            brandId: brand.id,
            name: `01_Cronograma_PreCalendario_${brand.name.replace(/\s+/g, '_')}.csv`,
            type: 'document',
            mimeType: 'text/csv',
            sizeFormatted: '48 KB',
            sizeBytes: 48000,
            url: `https://drive.google.com/open?id=demo_precalendar_${brand.id}`,
            uploadedByName: 'Nataraja Studio OS',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
          });
        }

        // Add brand guidelines in 01_Brand_Strategy_And_Territories
        if (sub.key === '01_Brand_Strategy_And_Territories') {
          files.push({
            id: `file_${brand.id}_manual`,
            accountId: accId,
            folderId: subFolderId,
            brandId: brand.id,
            name: `Manual_Identidad_Visual_${brand.name.replace(/\s+/g, '_')}.pdf`,
            type: 'document',
            mimeType: 'application/pdf',
            sizeFormatted: '12.4 MB',
            sizeBytes: 12400000,
            url: `https://drive.google.com/open?id=demo_manual_${brand.id}`,
            uploadedByName: 'Creative Director',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
          });
        }
      });
    });
  });

  return { folders, files };
};

const DriveVaultContext = createContext<DriveVaultContextType | undefined>(undefined);

export const DriveVaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [driveAccounts, setDriveAccounts] = useState<DriveAccount[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_drive_accounts');
      const parsed = saved ? JSON.parse(saved) : [];
      if (parsed.length > 0) return parsed;
    } catch {
      // fallback
    }
    return [
      {
        id: 'acc_default',
        name: 'NStudIOS Workspace Vault',
        type: 'corporate_workspace',
        email: 'cria10810@gmail.com',
        rootFolderId: '1mYfiTe9fwkD8OOCSeW8b63mNmUmhZZpo',
        quotaTotalGB: 5000,
        quotaUsedGB: 20.2,
        isConnected: true,
        status: 'active',
        lastSyncedAt: new Date().toISOString(),
      },
    ];
  });

  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_drive_folders');
      const parsed = saved ? JSON.parse(saved) : [];
      if (parsed.length > 0) return parsed;
    } catch {
      // fallback
    }
    return [];
  });

  const [driveFiles, setDriveFiles] = useState<DriveFile[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_drive_files');
      const parsed = saved ? JSON.parse(saved) : [];
      if (parsed.length > 0) return parsed;
    } catch {
      // fallback
    }
    return [];
  });

  const [selectedDriveAccountId, setSelectedDriveAccountId] = useState<string>(
    driveAccounts[0]?.id || 'acc_default'
  );
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
      if (dbAccounts && dbAccounts.length > 0) setDriveAccounts(dbAccounts);
      if (dbFolders && dbFolders.length > 0) setDriveFolders(dbFolders);
      if (dbFiles && dbFiles.length > 0) setDriveFiles(dbFiles);
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
      parentFolderId: folderData.parentFolderId,
      path: folderData.path || `/${folderData.name}`,
      isSystemGenerated: false,
      itemCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      ...folderData,
      id: folderData.id || 'fld_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    };
    setDriveFolders((prev) => {
      const filtered = prev.filter((f) => f.id !== newFolder.id);
      return [...filtered, newFolder];
    });
    DriveVaultRepository.createFolder(newFolder).catch((err) => console.warn('Supabase createDriveFolder sync error:', err));
    return newFolder;
  };

  const createDriveFile = (fileData: Omit<DriveFile, 'id' | 'createdAt' | 'updatedAt'>): DriveFile => {
    const newFile: DriveFile = {
      ...fileData,
      id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
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
    setDriveFolders((prev) => prev.filter((f) => f.id !== id && f.parentFolderId !== id));
    setDriveFiles((prev) => prev.filter((f) => f.folderId !== id));
    if (selectedFolderId === id) setSelectedFolderId(null);
    DriveVaultRepository.deleteFolder(id).catch((err) => console.warn('Supabase deleteDriveFolder sync error:', err));
  };

  const updateDriveAccount = (id: string, updates: Partial<DriveAccount>) => {
    setDriveAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    DriveVaultRepository.updateAccount(id, updates).catch((err) =>
      console.warn('Supabase updateDriveAccount sync error:', err)
    );
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
    territories?: CommunicationTerritory[];
    digitalAssets?: DigitalAsset[];
    equipment?: HardwareEquipment[];
    accountId?: string;
  }) => {
    const accId = params.accountId || selectedDriveAccountId || 'acc_default';
    const rootFolder = createDriveFolder({
      name: params.brand.name.toUpperCase() + ' [BRAND ROOT]',
      accountId: accId,
      brandId: params.brand.id,
      path: `/${params.brand.name}`,
      parentFolderId: undefined,
    });

    const subfolders = [
      '01_Brand_Strategy_And_Territories',
      '02_PreProduccion_Cronogramas',
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

    const generateFullHierarchyForHoldingsAndBrands = (brandsList: Brand[], orgsList: ClientOrganization[] = []) => {
    const accId = selectedDriveAccountId || (driveAccounts[0]?.id) || 'acc_default';
    const { folders, files } = createDefaultVaultHierarchy(brandsList, orgsList, accId);
    
    setDriveFolders((prev) => {
      const mergedMap = new Map<string, DriveFolder>();
      // Put default generated first
      folders.forEach((f) => mergedMap.set(f.id, f));
      // Put custom user-created folders that are not system generated
      prev.forEach((f) => {
        if (!f.isSystemGenerated || !mergedMap.has(f.id)) {
          mergedMap.set(f.id, f);
        }
      });
      const result = Array.from(mergedMap.values());
      localStorage.setItem('nataraja_drive_folders', JSON.stringify(result));
      return result;
    });

    setDriveFiles((prev) => {
      const mergedMap = new Map<string, DriveFile>();
      files.forEach((f) => mergedMap.set(f.id, f));
      prev.forEach((f) => {
        mergedMap.set(f.id, f);
      });
      const result = Array.from(mergedMap.values());
      localStorage.setItem('nataraja_drive_files', JSON.stringify(result));
      return result;
    });
  };

  const contextValue = React.useMemo(
    () => ({
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
      generateFullHierarchyForHoldingsAndBrands,
      refreshDriveFromSupabase,
    }),
    [
      driveAccounts,
      driveFolders,
      driveFiles,
      selectedDriveAccountId,
      selectedFolderId,
      activePreviewFile,
    ]
  );

  return <DriveVaultContext.Provider value={contextValue}>{children}</DriveVaultContext.Provider>;
};

export const useDriveVaultContext = (): DriveVaultContextType => {
  const context = useContext(DriveVaultContext);
  if (!context) {
    throw new Error('useDriveVaultContext must be used within a DriveVaultProvider');
  }
  return context;
};
