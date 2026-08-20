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
      path: folderData.path || '/' + folderData.name,
      isSystemGenerated: folderData.isSystemGenerated ?? false,
      itemCount: folderData.itemCount ?? 0,
      ...folderData,
      id: folderData.id || 'folder_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDriveFolders((prev) => [...prev, newFolder]);
    return newFolder;
  };

  const createDriveFile = (fileData: Omit<DriveFile, 'id' | 'createdAt' | 'updatedAt'>): DriveFile => {
    const now = new Date().toISOString().split('T')[0];
    const newFile: DriveFile = {
      ...fileData,
      id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: now,
      updatedAt: now,
    };
    setDriveFiles((prev) => [...prev, newFile]);
    return newFile;
  };

  const deleteDriveFile = (id: string) => {
    setDriveFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateDriveAccount = (id: string, updates: Partial<DriveAccount>) => {
    setDriveAccounts((prev) => prev.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc)));
  };

  const syncDriveAccount = async (id: string) => {
    updateDriveAccount(id, { status: 'syncing' });
    await new Promise((resolve) => setTimeout(resolve, 800));
    updateDriveAccount(id, {
      status: 'active',
      lastSyncedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
  };

  const generateBrandDriveTreeAndDocs = (params: {
    brand: Brand;
    territories: CommunicationTerritory[];
    digitalAssets?: DigitalAsset[];
    equipment?: HardwareEquipment[];
    accountId?: string;
  }) => {
    const targetAccountId = params.accountId || selectedDriveAccountId;
    const now = new Date().toISOString().split('T')[0];

    const brandFolderId = 'folder_' + params.brand.id + '_root_' + Date.now();
    const rootFolder: DriveFolder = {
      id: brandFolderId,
      name: params.brand.name,
      accountId: targetAccountId,
      brandId: params.brand.id,
      parentFolderId: undefined,
      path: '/Nataraja Workspace/' + params.brand.name,
      isSystemGenerated: true,
      itemCount: 6,
      createdAt: now,
    };

    const subfolderNames = [
      '00_Sandbox_CoCreativo',
      '01_Identidad_y_Estrategia',
      '02_Campañas_y_Entregables',
      '03_Raw_Footage_Masters',
      '04_Audio_Stems_SFX',
      '05_Social_Cuts_Exports',
    ];

    const newFolders: DriveFolder[] = [rootFolder];

    subfolderNames.forEach((subName, idx) => {
      const subFolderId = 'folder_' + params.brand.id + '_sub_' + idx + '_' + Date.now();
      newFolders.push({
        id: subFolderId,
        name: subName,
        accountId: targetAccountId,
        brandId: params.brand.id,
        parentFolderId: brandFolderId,
        path: '/Nataraja Workspace/' + params.brand.name + '/' + subName,
        isSystemGenerated: true,
        itemCount: 0,
        createdAt: now,
      });
    });

    const docsFolderId = newFolders[2]?.id || brandFolderId;
    const docFileId = 'file_' + params.brand.id + '_doc_01_' + Date.now();
    const newDocFile: DriveFile = {
      id: docFileId,
      accountId: targetAccountId,
      folderId: docsFolderId,
      brandId: params.brand.id,
      name: '01_Manual_de_Identidad_y_Territorios.gdoc',
      type: 'document',
      mimeType: 'application/vnd.google-apps.document',
      sizeFormatted: '480 KB',
      sizeBytes: 491520,
      url: 'https://docs.google.com/document/d/sample/edit',
      uploadedByName: 'Sistema Nataraja (Auto-Generado)',
      createdAt: now,
      updatedAt: now,
      generatedDocument: {
        id: 'gdoc_' + params.brand.id + '_01',
        type: 'brand_manual',
        brandId: params.brand.id,
        title: 'Manual de Identidad Visual y Territorios de Comunicación',
        subtitle: params.brand.name + ' • ' + params.brand.industry,
        version: 'v1.0 (Oficial)',
        generatedAt: now + ' 12:00',
        sections: [
          {
            title: '1. Manifiesto de Marca',
            content: params.brand.slogan || 'Innovación, liderazgo y excelencia estética.',
          },
          {
            title: '2. Territorios de Comunicación Activos (' + params.territories.length + ' configurados)',
            content: 'Matriz estratégica generada según las reglas de negocio de N. Studios:',
            tableData: {
              headers: ['Territorio', 'Objetivo Estratégico', 'Pilares de Contenido', 'Audiencia Objetivo'],
              rows: params.territories.map((t) => [
                t.name,
                t.objective,
                Array.isArray(t.contentPillars) ? t.contentPillars.join(', ') : (t.contentPillars as string),
                t.targetAudience,
              ]),
            },
          },
        ],
      },
    };

    setDriveFolders((prev) => [...prev, ...newFolders]);
    setDriveFiles((prev) => [...prev, newDocFile]);

    params.brand.driveFolderId = brandFolderId;

    return {
      brandFolderId,
      createdFoldersCount: newFolders.length,
      createdDocsCount: 1,
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
