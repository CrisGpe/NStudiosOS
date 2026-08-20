import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Brand,
  CommunicationTerritory,
  DigitalAsset,
  HardwareEquipment,
  EquipmentReservation,
  Deliverable,
  AuditLog,
  DeliverablePhase,
  ChangeRequest,
  TechnicalGuide,
  Campaign,
  NavigationPosition,
  ThemePalette,
  UserPreferences,
  DriveAccount,
  DriveFolder,
  DriveFile,
  GeneratedDocument,
  ClientIdeaSandboxItem,
  CollaboratorSchedule,
  DeliverableType,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_BRANDS,
  INITIAL_TERRITORIES,
  INITIAL_DIGITAL_ASSETS,
  INITIAL_EQUIPMENT,
  INITIAL_RESERVATIONS,
  INITIAL_DELIVERABLES,
  INITIAL_CAMPAIGNS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DRIVE_ACCOUNTS,
  INITIAL_DRIVE_FOLDERS,
  INITIAL_DRIVE_FILES,
  INITIAL_SANDBOX_IDEAS,
} from '../data/initialData';

export type AppTab =
  | 'kanban'
  | 'calendar'
  | 'campaigns'
  | 'drive'
  | 'brand_hub'
  | 'brands'
  | 'equipment'
  | 'specs'
  | 'admin';

interface AppContextType {
  // Auth & User Profile
  isAuthenticated: boolean;
  login: (userId: string) => void;
  logout: () => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  users: UserProfile[];
  
  // Appearance & Preferences
  theme: ThemePalette;
  setTheme: (theme: ThemePalette) => void;
  navPosition: NavigationPosition;
  setNavPosition: (pos: NavigationPosition) => void;
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  
  // Brands & Territories
  brands: Brand[];
  selectedBrandId: string;
  setSelectedBrandId: (id: string) => void;
  createBrand: (
    brand: Omit<Brand, 'id' | 'createdAt'>,
    initialTerritories?: Omit<CommunicationTerritory, 'id' | 'brandId'>[]
  ) => Brand;
  updateBrand: (id: string, brand: Partial<Brand>) => void;
  deleteBrand?: (id: string) => void;
  
  territories: CommunicationTerritory[];
  createTerritory: (territory: Omit<CommunicationTerritory, 'id'>) => { success: boolean; error?: string };
  updateTerritory: (id: string, territory: Partial<CommunicationTerritory>) => { success: boolean; error?: string };
  deleteTerritory: (id: string) => { success: boolean; error?: string };
  validateBrandTerritories: (brandId: string) => { isValid: boolean; activeCount: number; message: string };
  
  // Digital Assets
  digitalAssets: DigitalAsset[];
  createDigitalAsset: (asset: Omit<DigitalAsset, 'id' | 'updatedAt'>) => void;
  updateDigitalAsset: (id: string, asset: Partial<DigitalAsset>) => void;
  deleteDigitalAsset: (id: string) => void;
  
  // Equipment & Hardware
  equipment: HardwareEquipment[];
  createEquipment: (eq: Omit<HardwareEquipment, 'id'>) => HardwareEquipment;
  updateEquipment: (id: string, updates: Partial<HardwareEquipment>) => void;
  deleteEquipment: (id: string) => void;
  reservations: EquipmentReservation[];
  checkEquipmentCollision: (
    equipmentId: string,
    startDate: string,
    endDate: string,
    excludeReservationId?: string
  ) => { hasCollision: boolean; collidingWith?: EquipmentReservation };
  createEquipmentReservation: (
    reservation: Omit<EquipmentReservation, 'id' | 'createdAt' | 'status'>
  ) => { success: boolean; error?: string };
  cancelEquipmentReservation: (reservationId: string) => void;
  
  // Campaigns
  campaigns: Campaign[];
  selectedCampaignId: string;
  setSelectedCampaignId: (id: string) => void;
  createCampaign: (campaign: Omit<Campaign, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => Campaign;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  
  // Deliverables
  deliverables: Deliverable[];
  selectedDeliverable: Deliverable | null;
  setSelectedDeliverable: (deliverable: Deliverable | null) => void;
  createDeliverable: (
    deliverable: Omit<
      Deliverable,
      'id' | 'code' | 'createdAt' | 'updatedAt' | 'changeRequests' | 'clientApproved' | 'directorApproved'
    >
  ) => Deliverable;
  updateDeliverable: (id: string, updates: Partial<Deliverable>) => void;
  deleteDeliverable?: (id: string) => void;
  moveDeliverablePhase: (id: string, newPhase: DeliverablePhase) => { success: boolean; error?: string };
  updateTechnicalGuide: (deliverableId: string, guide: TechnicalGuide) => void;
  submitChangeRequest: (
    deliverableId: string,
    req: Omit<ChangeRequest, 'id' | 'requestedAt' | 'requestedByRole' | 'requestedByName' | 'isWithinTMinus3' | 'status'>
  ) => { success: boolean; isTMinus3: boolean; error?: string };
  respondToChangeRequest: (
    deliverableId: string,
    requestId: string,
    response: 'approved' | 'rejected' | 'director_override',
    directorNotes?: string
  ) => void;
  
  // Google Drive Multi-Account & Media Vault
  driveAccounts: DriveAccount[];
  selectedDriveAccountId: string;
  setSelectedDriveAccountId: (id: string) => void;
  driveFolders: DriveFolder[];
  driveFiles: DriveFile[];
  selectedFolderId: string | null;
  setSelectedFolderId: (folderId: string | null) => void;
  activePreviewFile: DriveFile | null;
  setActivePreviewFile: (file: DriveFile | null) => void;
  createDriveFolder: (folder: Omit<DriveFolder, 'id' | 'createdAt'>) => DriveFolder;
  createDriveFile: (file: Omit<DriveFile, 'id' | 'createdAt' | 'updatedAt'>) => DriveFile;
  deleteDriveFile: (id: string) => void;
  updateDriveAccount: (id: string, updates: Partial<DriveAccount>) => void;
  syncDriveAccount: (id: string) => Promise<void>;
  generateBrandDriveTreeAndDocs: (
    brand: Brand,
    territories: Omit<CommunicationTerritory, 'id' | 'brandId'>[]
  ) => { folders: DriveFolder[]; files: DriveFile[] };
  
  // Deliverable Format & Client Filters in Kanban
  deliverableTypeFilter: 'all' | 'audiovisual' | 'graphic';
  setDeliverableTypeFilter: (filter: 'all' | 'audiovisual' | 'graphic') => void;
  selectedClientFilter: string;
  setSelectedClientFilter: (clientId: string) => void;

  // Collaborator Schedule & Working Hours Management
  updateCollaboratorSchedule: (userId: string, schedule: Partial<CollaboratorSchedule>) => void;
  checkCollaboratorAvailability: (userId: string) => {
    isAvailableNow: boolean;
    reason?: 'outside_hours' | 'vacation' | 'alerts_disabled';
    nextActiveSlot?: string;
    scheduleSummary?: string;
  };

  // Client Sandbox & Co-Creation Hub
  sandboxIdeas: ClientIdeaSandboxItem[];
  createSandboxIdea: (idea: Omit<ClientIdeaSandboxItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => ClientIdeaSandboxItem;
  updateSandboxIdea: (id: string, updates: Partial<ClientIdeaSandboxItem>) => void;
  deleteSandboxIdea: (id: string) => void;
  convertSandboxIdeaToDeliverable: (ideaId: string) => Deliverable;
  createClientDeliverableProposal: (proposal: {
    title: string;
    territoryId: string;
    conceptHook: string;
    description: string;
    desiredPublishDate: string;
    format?: string;
    references?: string[];
  }) => Deliverable;
  generateAIBriefForSandboxIdea: (ideaId: string) => Promise<void>;

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (action: string, entityType: AuditLog['entityType'], entityId: string, details: string) => void;
  
  // Navigation & Tabs
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  
  // Global search & filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Global Modals
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  aiModalInitialContext?: any;
  openAiModalWithContext: (context: any) => void;
  
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  
  isCreateBrandModalOpen: boolean;
  setIsCreateBrandModalOpen: (open: boolean) => void;
  
  isCreateEquipmentModalOpen: boolean;
  setIsCreateEquipmentModalOpen: (open: boolean) => void;
  
  isCreateCampaignModalOpen: boolean;
  setIsCreateCampaignModalOpen: (open: boolean) => void;

  isCreateClientDeliverableModalOpen: boolean;
  setIsCreateClientDeliverableModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  AUTH: 'cineflow_is_authenticated_v3',
  USER: 'cineflow_current_user_v3',
  USERS: 'cineflow_users_v3',
  PREFS: 'cineflow_user_prefs_v3',
  BRANDS: 'cineflow_brands_v3',
  TERRITORIES: 'cineflow_territories_v3',
  ASSETS: 'cineflow_assets_v3',
  EQUIPMENT: 'cineflow_equipment_v3',
  RESERVATIONS: 'cineflow_reservations_v3',
  DELIVERABLES: 'cineflow_deliverables_v3',
  CAMPAIGNS: 'cineflow_campaigns_v3',
  SANDBOX: 'cineflow_sandbox_ideas_v3',
  DRIVE_ACCOUNTS: 'cineflow_drive_accounts_v3',
  DRIVE_FOLDERS: 'cineflow_drive_folders_v3',
  DRIVE_FILES: 'cineflow_drive_files_v3',
  LOGS: 'cineflow_logs_v3',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  navPosition: 'topbar',
  theme: 'nataraja-dark',
  compactCards: false,
  enableNotifications: true,
  defaultView: 'kanban',
  kanbanViewMode: 'toggle_pipeline',
  kanbanTypeFilter: 'all',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_USERS[1]; // Default to Director de Producción
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PREFS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return currentUser.preferences || DEFAULT_PREFERENCES;
  });

  // Filters for Kanban & Pipeline
  const [deliverableTypeFilter, setDeliverableTypeFilter] = useState<'all' | 'audiovisual' | 'graphic'>('all');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('all');

  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BRANDS);
    return saved ? JSON.parse(saved) : INITIAL_BRANDS;
  });

  const [selectedBrandId, setSelectedBrandId] = useState<string>('all');

  const [territories, setTerritories] = useState<CommunicationTerritory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TERRITORIES);
    return saved ? JSON.parse(saved) : INITIAL_TERRITORIES;
  });

  const [digitalAssets, setDigitalAssets] = useState<DigitalAsset[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSETS);
    return saved ? JSON.parse(saved) : INITIAL_DIGITAL_ASSETS;
  });

  const [equipment, setEquipment] = useState<HardwareEquipment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENT;
  });

  const [reservations, setReservations] = useState<EquipmentReservation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');

  const [deliverables, setDeliverables] = useState<Deliverable[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DELIVERABLES);
    return saved ? JSON.parse(saved) : INITIAL_DELIVERABLES;
  });

  // Client Sandbox & Ideas State
  const [sandboxIdeas, setSandboxIdeas] = useState<ClientIdeaSandboxItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SANDBOX);
    return saved ? JSON.parse(saved) : INITIAL_SANDBOX_IDEAS;
  });

  // Google Drive Multi-Account State
  const [driveAccounts, setDriveAccounts] = useState<DriveAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DRIVE_ACCOUNTS);
    return saved ? JSON.parse(saved) : INITIAL_DRIVE_ACCOUNTS;
  });

  const [selectedDriveAccountId, setSelectedDriveAccountId] = useState<string>('acc_corp');

  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DRIVE_FOLDERS);
    return saved ? JSON.parse(saved) : INITIAL_DRIVE_FOLDERS;
  });

  const [driveFiles, setDriveFiles] = useState<DriveFile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DRIVE_FILES);
    return saved ? JSON.parse(saved) : INITIAL_DRIVE_FILES;
  });

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [activePreviewFile, setActivePreviewFile] = useState<DriveFile | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>('kanban');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiModalInitialContext, setAiModalInitialContext] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isCreateBrandModalOpen, setIsCreateBrandModalOpen] = useState<boolean>(false);
  const [isCreateEquipmentModalOpen, setIsCreateEquipmentModalOpen] = useState<boolean>(false);
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState<boolean>(false);
  const [isCreateClientDeliverableModalOpen, setIsCreateClientDeliverableModalOpen] = useState<boolean>(false);

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  // Sync theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', preferences.theme);
    if (preferences.theme === 'nataraja-dark' || preferences.theme === 'midnight-slate' || preferences.theme === 'cyber-cinema') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.theme]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TERRITORIES, JSON.stringify(territories));
  }, [territories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(digitalAssets));
  }, [digitalAssets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DELIVERABLES, JSON.stringify(deliverables));
  }, [deliverables]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SANDBOX, JSON.stringify(sandboxIdeas));
  }, [sandboxIdeas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DRIVE_ACCOUNTS, JSON.stringify(driveAccounts));
  }, [driveAccounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DRIVE_FOLDERS, JSON.stringify(driveFolders));
  }, [driveFolders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DRIVE_FILES, JSON.stringify(driveFiles));
  }, [driveFiles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Keep selected deliverable in sync if deliverables update
  useEffect(() => {
    if (selectedDeliverable) {
      const updated = deliverables.find((d) => d.id === selectedDeliverable.id);
      if (updated) setSelectedDeliverable(updated);
    }
  }, [deliverables]);

  // Automatic brand restriction for Client roles
  useEffect(() => {
    if (currentUser.role === 'cliente' && currentUser.assignedBrandIds && currentUser.assignedBrandIds.length > 0) {
      const clientBrandId = currentUser.assignedBrandIds[0];
      setSelectedBrandId(clientBrandId);
      if (activeTab === 'admin' || activeTab === 'specs' || activeTab === 'equipment' || activeTab === 'brands') {
        setActiveTab('kanban');
      }
    }
  }, [currentUser]);

  // ==========================================
  // Auth Functions
  // ==========================================
  const login = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    setCurrentUser(targetUser);
    setIsAuthenticated(true);
    if (targetUser.preferences) {
      setPreferences(targetUser.preferences);
    }
    
    if (targetUser.role === 'cliente' && targetUser.assignedBrandIds?.[0]) {
      setSelectedBrandId(targetUser.assignedBrandIds[0]);
    } else {
      setSelectedBrandId('all');
    }

    addAuditLog('SESION_INICIADA', 'system', targetUser.id, `Usuario ${targetUser.name} (${targetUser.role}) inició sesión`);
  };

  const logout = () => {
    setIsAuthenticated(false);
    addAuditLog('SESION_CERRADA', 'system', currentUser.id, `Usuario ${currentUser.name} cerró sesión`);
  };

  // ==========================================
  // Preferences & Appearance
  // ==========================================
  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPrefs };
      setCurrentUser((u) => ({ ...u, preferences: updated }));
      return updated;
    });
  };

  const setTheme = (theme: ThemePalette) => {
    updatePreferences({ theme });
  };

  const setNavPosition = (navPosition: NavigationPosition) => {
    updatePreferences({ navPosition });
  };

  const addAuditLog = (action: string, entityType: AuditLog['entityType'], entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: `${currentUser.name} (${currentUser.role})`,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // ==========================================
  // Brand & Territory Logic + Folder as Code
  // ==========================================
  const validateBrandTerritories = (brandId: string) => {
    const activeCount = territories.filter((t) => t.brandId === brandId && t.active).length;
    const isValid = activeCount >= 3;
    return {
      isValid,
      activeCount,
      message: isValid
        ? `Cumple la regla de negocio: ${activeCount} territorios activos.`
        : `INCUMPLIMIENTO DE REGLA: Tiene solo ${activeCount} territorios activos. Cada marca DEBE tener al menos 3.`,
    };
  };

  const generateBrandDriveTreeAndDocs = (
    brand: Brand,
    territoriesList: Omit<CommunicationTerritory, 'id' | 'brandId'>[]
  ) => {
    const accountId = 'acc_corp';
    const brandFolderId = `fld_${brand.id}_root`;
    const sandboxFolderId = `fld_${brand.id}_sandbox`;
    const assetsFolderId = `fld_${brand.id}_assets`;
    const docsFolderId = `fld_${brand.id}_docs`;
    const campFolderId = `fld_${brand.id}_camps`;

    const newFolders: DriveFolder[] = [
      {
        id: brandFolderId,
        accountId,
        brandId: brand.id,
        name: brand.name,
        path: `/Nataraja Workspace/${brand.name}`,
        isSystemGenerated: true,
        itemCount: 4,
        createdAt: new Date().toISOString().substring(0, 10),
      },
      {
        id: sandboxFolderId,
        accountId,
        brandId: brand.id,
        parentFolderId: brandFolderId,
        name: '00_Sandbox_CoCreativo',
        path: `/Nataraja Workspace/${brand.name}/00_Sandbox_CoCreativo`,
        isSystemGenerated: true,
        itemCount: 0,
        createdAt: new Date().toISOString().substring(0, 10),
      },
      {
        id: assetsFolderId,
        accountId,
        brandId: brand.id,
        parentFolderId: brandFolderId,
        name: '01_Brand_Assets',
        path: `/Nataraja Workspace/${brand.name}/01_Brand_Assets`,
        isSystemGenerated: true,
        itemCount: 0,
        createdAt: new Date().toISOString().substring(0, 10),
      },
      {
        id: docsFolderId,
        accountId,
        brandId: brand.id,
        parentFolderId: brandFolderId,
        name: '02_Documentos_Oficiales',
        path: `/Nataraja Workspace/${brand.name}/02_Documentos_Oficiales`,
        isSystemGenerated: true,
        itemCount: 3,
        createdAt: new Date().toISOString().substring(0, 10),
      },
      {
        id: campFolderId,
        accountId,
        brandId: brand.id,
        parentFolderId: brandFolderId,
        name: '03_Campañas_Produccion',
        path: `/Nataraja Workspace/${brand.name}/03_Campañas_Produccion`,
        isSystemGenerated: true,
        itemCount: 0,
        createdAt: new Date().toISOString().substring(0, 10),
      },
    ];

    const terrRows = territoriesList.map((t) => [
      t.name,
      t.objective,
      Array.isArray(t.contentPillars) ? t.contentPillars.join(', ') : (t.contentPillars as string),
      t.targetAudience,
    ]);

    const newFiles: DriveFile[] = [
      {
        id: `fil_${brand.id}_doc_01`,
        accountId,
        folderId: docsFolderId,
        brandId: brand.id,
        name: '01_Manual_de_Identidad_y_Territorios.gdoc',
        type: 'document',
        mimeType: 'application/vnd.google-apps.document',
        sizeFormatted: '490 KB',
        sizeBytes: 501760,
        url: `https://docs.google.com/document/d/1_NATARAJA_${brand.id.toUpperCase()}_MANUAL/edit`,
        uploadedByName: 'Sistema Nataraja (Auto-Generado)',
        createdAt: new Date().toISOString().substring(0, 10),
        updatedAt: new Date().toISOString().substring(0, 10),
        generatedDocument: {
          id: `gdoc_${brand.id}_01`,
          type: 'brand_manual',
          brandId: brand.id,
          title: `Manual de Identidad Visual, Manifiesto y Territorios de Comunicación`,
          subtitle: `${brand.name} • ${brand.industry}`,
          version: 'v1.0 (Oficial)',
          generatedAt: `${new Date().toISOString().substring(0, 10)} 12:00`,
          sections: [
            {
              title: '1. Manifiesto de Marca',
              content: brand.slogan || `Innovación, liderazgo y excelencia estética en el sector de ${brand.industry}.`,
            },
            {
              title: `2. Territorios de Comunicación Activos (${territoriesList.length} configurados)`,
              content: 'Matriz estratégica generada según las reglas de negocio de N. Studios:',
              tableData: {
                headers: ['Territorio', 'Objetivo Estratégico', 'Pilares de Contenido', 'Audiencia Objetivo'],
                rows: terrRows,
              },
            },
            {
              title: '3. Identidad Cromática & Contacto',
              content: `Color Primario: ${brand.primaryColor}. Contacto de Cuentas: ${brand.contactPerson} (${brand.contactEmail}).`,
            },
          ],
        },
      },
      {
        id: `fil_${brand.id}_doc_02`,
        accountId,
        folderId: docsFolderId,
        brandId: brand.id,
        name: '02_Inventario_Activos_Digitales.gsheet',
        type: 'document',
        mimeType: 'application/vnd.google-apps.spreadsheet',
        sizeFormatted: '310 KB',
        sizeBytes: 317440,
        url: `https://docs.google.com/spreadsheets/d/1_NATARAJA_${brand.id.toUpperCase()}_ASSETS/edit`,
        uploadedByName: 'Sistema Nataraja (Auto-Generado)',
        createdAt: new Date().toISOString().substring(0, 10),
        updatedAt: new Date().toISOString().substring(0, 10),
        generatedDocument: {
          id: `gsheet_${brand.id}_02`,
          type: 'digital_assets_inventory',
          brandId: brand.id,
          title: 'Inventario Maestro de Activos Digitales de Marca',
          subtitle: `Plataformas Web, Aplicaciones y Canales de Distribución • ${brand.name}`,
          version: 'v1.0',
          generatedAt: `${new Date().toISOString().substring(0, 10)} 12:00`,
          sections: [
            {
              title: 'Activos Digitales Registrados',
              content: 'Canales vinculados para despliegue de piezas audiovisuales.',
              tableData: {
                headers: ['Nombre del Activo', 'Tipo', 'URL / Endpoint', 'Estado'],
                rows: [
                  [`Portal Oficial ${brand.name}`, 'Website', `https://${brand.name.toLowerCase().replace(/\s+/g, '')}.com`, 'Activo'],
                  [`App Móvil ${brand.name}`, 'Mobile App', `https://apps.apple.com/app/${brand.name.toLowerCase().replace(/\s+/g, '-')}`, 'En Planificación'],
                ],
              },
            },
          ],
        },
      },
      {
        id: `fil_${brand.id}_doc_03`,
        accountId,
        folderId: docsFolderId,
        brandId: brand.id,
        name: '03_SLA_Equipamiento_Tecnico.gdoc',
        type: 'document',
        mimeType: 'application/vnd.google-apps.document',
        sizeFormatted: '350 KB',
        sizeBytes: 358400,
        url: `https://docs.google.com/document/d/1_NATARAJA_${brand.id.toUpperCase()}_SLA/edit`,
        uploadedByName: 'Sistema Nataraja (Auto-Generado)',
        createdAt: new Date().toISOString().substring(0, 10),
        updatedAt: new Date().toISOString().substring(0, 10),
        generatedDocument: {
          id: `gdoc_${brand.id}_03`,
          type: 'equipment_sla',
          brandId: brand.id,
          title: 'Acuerdo de Nivel de Servicio Técnico & Hardware Audiovisual',
          subtitle: `Asignación de Cámaras Cine, Ópticas, Audio y Estaciones VFX • ${brand.name}`,
          version: 'v1.0 (Contrato Activo)',
          generatedAt: `${new Date().toISOString().substring(0, 10)} 12:00`,
          sections: [
            {
              title: 'Kit Audiovisual Estándar Garantizado',
              content: 'N. Studios provee el siguiente hardware para todas las producciones del cliente:',
              tableData: {
                headers: ['Categoría', 'Dispositivo Específico', 'Especificación Técnica', 'Uso Asignado'],
                rows: [
                  ['Cámara Principal', 'Sony FX3 Cinema Line Full-Frame', '4K DCI 120p 10-bit 4:2:2 S-Log3', 'Tomas principales de alta gama'],
                  ['Audio Directo', 'Rode Wireless PRO 32-bit Float', 'Grabación 32-bit Float a bordo', 'Captura de sonido cristalino'],
                  ['Estación Edición', 'Mac Studio M2 Ultra 128GB', 'Render ProRes 422 HQ / DaVinci', 'Postproducción y entrega'],
                ],
              },
            },
          ],
        },
      },
    ];

    setDriveFolders((prev) => [...prev, ...newFolders]);
    setDriveFiles((prev) => [...prev, ...newFiles]);

    return { folders: newFolders, files: newFiles };
  };

  const createBrand = (
    brandData: Omit<Brand, 'id' | 'createdAt'>,
    initialTerritories?: Omit<CommunicationTerritory, 'id' | 'brandId'>[]
  ): Brand => {
    const newBrandId = `brd_${Date.now()}`;
    const newBrand: Brand = {
      ...brandData,
      id: newBrandId,
      driveFolderId: `fld_${newBrandId}_root`,
      driveFilesCount: 3,
      createdAt: new Date().toISOString().substring(0, 10),
    };
    
    setBrands((prev) => [...prev, newBrand]);

    const terrs = initialTerritories || [];
    if (terrs.length > 0) {
      const newTerrs: CommunicationTerritory[] = terrs.map((t, idx) => ({
        ...t,
        id: `ter_${Date.now()}_${idx}`,
        brandId: newBrand.id,
      }));
      setTerritories((prev) => [...prev, ...newTerrs]);
    }

    generateBrandDriveTreeAndDocs(newBrand, terrs);

    addAuditLog('MARCA_CREADA', 'brand', newBrand.id, `Nueva marca creada con árbol de Google Drive y documentos: ${newBrand.name}`);
    return newBrand;
  };

  const updateBrand = (id: string, brandData: Partial<Brand>) => {
    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, ...brandData } : b)));
    addAuditLog('MARCA_ACTUALIZADA', 'brand', id, `Marca actualizada: ${brandData.name || id}`);
  };

  const createTerritory = (territoryData: Omit<CommunicationTerritory, 'id'>) => {
    const newTerritory: CommunicationTerritory = {
      ...territoryData,
      id: `ter_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    };
    setTerritories((prev) => [...prev, newTerritory]);
    addAuditLog(
      'TERRITORIO_CREADO',
      'territory',
      newTerritory.id,
      `Territorio '${newTerritory.name}' añadido para la marca ${newTerritory.brandId}`
    );
    return { success: true };
  };

  const updateTerritory = (id: string, updates: Partial<CommunicationTerritory>) => {
    const target = territories.find((t) => t.id === id);
    if (!target) return { success: false, error: 'Territorio no encontrado' };

    if (updates.active === false && target.active === true) {
      const activeCount = territories.filter((t) => t.brandId === target.brandId && t.active).length;
      if (activeCount <= 3) {
        return {
          success: false,
          error: `Regla de Negocio Estricta: La marca no puede tener menos de 3 territorios activos (actualmente tiene ${activeCount}).`,
        };
      }
    }

    setTerritories((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    addAuditLog('TERRITORIO_ACTUALIZADO', 'territory', id, `Territorio '${target.name}' modificado`);
    return { success: true };
  };

  const deleteTerritory = (id: string) => {
    const target = territories.find((t) => t.id === id);
    if (!target) return { success: false, error: 'Territorio no encontrado' };

    const activeCount = territories.filter((t) => t.brandId === target.brandId && t.active).length;
    if (target.active && activeCount <= 3) {
      return {
        success: false,
        error: `Regla de Negocio Estricta: No se puede eliminar. La marca debe mantener al menos 3 territorios activos (actualmente tiene ${activeCount}).`,
      };
    }

    setTerritories((prev) => prev.filter((t) => t.id !== id));
    addAuditLog('TERRITORIO_ELIMINADO', 'territory', id, `Territorio '${target.name}' eliminado`);
    return { success: true };
  };

  // ==========================================
  // Digital Assets Logic
  // ==========================================
  const createDigitalAsset = (assetData: Omit<DigitalAsset, 'id' | 'updatedAt'>) => {
    const newAsset: DigitalAsset = {
      ...assetData,
      id: `ast_${Date.now()}`,
      updatedAt: new Date().toISOString().substring(0, 10),
    };
    setDigitalAssets((prev) => [...prev, newAsset]);
    addAuditLog('ACTIVO_DIGITAL_CREADO', 'brand', newAsset.id, `Activo digital '${newAsset.name}' registrado`);
  };

  const updateDigitalAsset = (id: string, updates: Partial<DigitalAsset>) => {
    setDigitalAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString().substring(0, 10) } : a))
    );
    addAuditLog('ACTIVO_DIGITAL_ACTUALIZADO', 'brand', id, `Activo digital modificado`);
  };

  const deleteDigitalAsset = (id: string) => {
    setDigitalAssets((prev) => prev.filter((a) => a.id !== id));
    addAuditLog('ACTIVO_DIGITAL_ELIMINADO', 'brand', id, `Activo digital eliminado`);
  };

  // ==========================================
  // Equipment & Hardware Booking Collision Engine
  // ==========================================
  const createEquipment = (eqData: Omit<HardwareEquipment, 'id'>): HardwareEquipment => {
    const newEq: HardwareEquipment = {
      ...eqData,
      id: `eq_${Date.now()}`,
    };
    setEquipment((prev) => [...prev, newEq]);
    addAuditLog('EQUIPO_REGISTRADO', 'equipment', newEq.id, `Nuevo equipo registrado: ${newEq.name} (${newEq.model})`);
    return newEq;
  };

  const updateEquipment = (id: string, updates: Partial<HardwareEquipment>) => {
    setEquipment((prev) => prev.map((eq) => (eq.id === id ? { ...eq, ...updates } : eq)));
    addAuditLog('EQUIPO_ACTUALIZADO', 'equipment', id, `Equipo actualizado`);
  };

  const deleteEquipment = (id: string) => {
    setEquipment((prev) => prev.filter((eq) => eq.id !== id));
    addAuditLog('EQUIPO_ELIMINADO', 'equipment', id, `Equipo eliminado del inventario`);
  };

  const checkEquipmentCollision = (
    equipmentId: string,
    startDate: string,
    endDate: string,
    excludeReservationId?: string
  ) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const colliding = reservations.find((res) => {
      if (res.id === excludeReservationId || res.equipmentId !== equipmentId || res.status === 'cancelled') {
        return false;
      }
      const resStart = new Date(res.startDate).getTime();
      const resEnd = new Date(res.endDate).getTime();
      return start <= resEnd && end >= resStart;
    });

    return {
      hasCollision: !!colliding,
      collidingWith: colliding,
    };
  };

  const createEquipmentReservation = (
    resData: Omit<EquipmentReservation, 'id' | 'createdAt' | 'status'>
  ) => {
    const collision = checkEquipmentCollision(resData.equipmentId, resData.startDate, resData.endDate);
    if (collision.hasCollision) {
      return {
        success: false,
        error: `COLISIÓN DETECTADA: El equipo ya está reservado para '${collision.collidingWith?.deliverableTitle}' del ${collision.collidingWith?.startDate} al ${collision.collidingWith?.endDate}.`,
      };
    }

    const newReservation: EquipmentReservation = {
      ...resData,
      id: `res_${Date.now()}`,
      status: 'confirmed',
      createdAt: new Date().toISOString().substring(0, 10),
    };

    setReservations((prev) => [...prev, newReservation]);

    setEquipment((prev) =>
      prev.map((eq) => (eq.id === resData.equipmentId ? { ...eq, status: 'reserved', currentReservationId: newReservation.id } : eq))
    );

    setDeliverables((prev) =>
      prev.map((del) =>
        del.id === resData.deliverableId
          ? {
              ...del,
              equipmentReservedIds: Array.from(new Set([...del.equipmentReservedIds, resData.equipmentId])),
            }
          : del
      )
    );

    addAuditLog(
      'HARDWARE_RESERVADO',
      'equipment',
      resData.equipmentId,
      `Reserva confirmada de hardware para '${resData.deliverableTitle}' (${resData.startDate} a ${resData.endDate})`
    );

    return { success: true };
  };

  const cancelEquipmentReservation = (reservationId: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return;

    setReservations((prev) => prev.map((r) => (r.id === reservationId ? { ...r, status: 'cancelled' } : r)));

    setEquipment((prev) =>
      prev.map((eq) => (eq.id === res.equipmentId ? { ...eq, status: 'available', currentReservationId: undefined } : eq))
    );

    setDeliverables((prev) =>
      prev.map((del) =>
        del.id === res.deliverableId
          ? {
              ...del,
              equipmentReservedIds: del.equipmentReservedIds.filter((id) => id !== res.equipmentId),
            }
          : del
      )
    );

    addAuditLog('RESERVA_HARDWARE_CANCELADA', 'equipment', res.equipmentId, `Reserva ${reservationId} cancelada`);
  };

  // ==========================================
  // Campaign Management Engine
  // ==========================================
  const createCampaign = (
    campData: Omit<Campaign, 'id' | 'code' | 'createdAt' | 'updatedAt'>
  ): Campaign => {
    const brand = brands.find((b) => b.id === campData.brandId);
    const brandCode = brand?.name.substring(0, 3).toUpperCase() || 'CMP';
    const year = new Date().getFullYear();
    const randomCode = `CMP-${brandCode}-${year}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;

    const newCampaign: Campaign = {
      ...campData,
      id: `cmp_${Date.now()}`,
      code: randomCode,
      createdAt: new Date().toISOString().substring(0, 10),
      updatedAt: new Date().toISOString().substring(0, 10),
    };

    setCampaigns((prev) => [newCampaign, ...prev]);

    if (newCampaign.deliverableIds && newCampaign.deliverableIds.length > 0) {
      setDeliverables((prev) =>
        prev.map((del) =>
          newCampaign.deliverableIds.includes(del.id)
            ? { ...del, campaignId: newCampaign.id }
            : del
        )
      );
    }

    addAuditLog('CAMPAÑA_CREADA', 'system', newCampaign.id, `Nueva campaña '${newCampaign.name}' (${newCampaign.code}) creada`);
    return newCampaign;
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString().substring(0, 10) } : c))
    );
    addAuditLog('CAMPAÑA_ACTUALIZADA', 'system', id, `Campaña actualizada`);
  };

  const deleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    setDeliverables((prev) =>
      prev.map((del) => (del.campaignId === id ? { ...del, campaignId: undefined } : del))
    );
    addAuditLog('CAMPAÑA_ELIMINADA', 'system', id, `Campaña eliminada`);
  };

  // ==========================================
  // Deliverable Lifecycle & State Machine
  // ==========================================
  const createDeliverable = (
    data: Omit<
      Deliverable,
      'id' | 'code' | 'createdAt' | 'updatedAt' | 'changeRequests' | 'clientApproved' | 'directorApproved'
    >
  ): Deliverable => {
    const brand = brands.find((b) => b.id === data.brandId);
    const brandCode = brand?.name.substring(0, 3).toUpperCase() || 'DEL';
    const randomCode = `NS-${brandCode}-${Math.floor(100 + Math.random() * 900)}`;

    const newDeliverable: Deliverable = {
      ...data,
      id: `del_${Date.now()}`,
      code: randomCode,
      changeRequests: [],
      clientApproved: false,
      directorApproved: false,
      createdAt: new Date().toISOString().substring(0, 10),
      updatedAt: new Date().toISOString().substring(0, 10),
    };

    setDeliverables((prev) => [newDeliverable, ...prev]);

    if (data.campaignId) {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === data.campaignId
            ? { ...c, deliverableIds: Array.from(new Set([...c.deliverableIds, newDeliverable.id])) }
            : c
        )
      );
    }

    addAuditLog('ENTREGABLE_CREADO', 'deliverable', newDeliverable.id, `Nuevo entregable '${newDeliverable.title}' (${newDeliverable.code}) creado en fase ${newDeliverable.phase}`);
    return newDeliverable;
  };

  const updateDeliverable = (id: string, updates: Partial<Deliverable>) => {
    setDeliverables((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString().substring(0, 10) } : d))
    );
    addAuditLog('ENTREGABLE_ACTUALIZADO', 'deliverable', id, `Entregable actualizado`);
  };

  const moveDeliverablePhase = (id: string, newPhase: DeliverablePhase) => {
    const target = deliverables.find((d) => d.id === id);
    if (!target) return { success: false, error: 'Entregable no encontrado' };

    if (newPhase === 'aprobacion_cliente' || newPhase === 'publicado') {
      if (currentUser.role !== 'director' && currentUser.role !== 'webadmin' && currentUser.role !== 'cliente') {
        return {
          success: false,
          error: 'Solo el Director de Proyecto o el Cliente pueden autorizar la aprobación o publicación final.',
        };
      }
    }

    if (newPhase === 'produccion') {
      if (!target.technicalGuide || !target.technicalGuide.aspectRatios || target.technicalGuide.aspectRatios.length === 0) {
        return {
          success: false,
          error: 'No se puede avanzar a Producción sin haber consolidado la Guía Técnica.',
        };
      }
    }

    setDeliverables((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              phase: newPhase,
              updatedAt: new Date().toISOString().substring(0, 10),
            }
          : d
      )
    );

    addAuditLog(
      'FASE_ENTREGABLE_CAMBIADA',
      'deliverable',
      id,
      `Entregable '${target.code}' movido de '${target.phase}' a '${newPhase}' por ${currentUser.name}`
    );

    return { success: true };
  };

  const updateTechnicalGuide = (deliverableId: string, guide: TechnicalGuide) => {
    setDeliverables((prev) =>
      prev.map((d) =>
        d.id === deliverableId
          ? {
              ...d,
              technicalGuide: guide,
              updatedAt: new Date().toISOString().substring(0, 10),
            }
          : d
      )
    );
    addAuditLog('GUIA_TECNICA_ACTUALIZADA', 'deliverable', deliverableId, `Guía técnica actualizada`);
  };

  // ==========================================
  // Change Requests & T-3 Window Policy
  // ==========================================
  const submitChangeRequest = (
    deliverableId: string,
    reqData: Omit<ChangeRequest, 'id' | 'requestedAt' | 'requestedByRole' | 'requestedByName' | 'isWithinTMinus3' | 'status'>
  ) => {
    const target = deliverables.find((d) => d.id === deliverableId);
    if (!target) return { success: false, isTMinus3: false, error: 'Entregable no encontrado' };

    const pubDate = new Date(target.publishDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((pubDate - now) / (1000 * 60 * 60 * 24));
    const isWithinTMinus3 = diffDays <= 3 && diffDays >= 0;

    const newRequest: ChangeRequest = {
      ...reqData,
      id: `cr_${Date.now()}`,
      requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      requestedByRole: currentUser.role,
      requestedByName: currentUser.name,
      isWithinTMinus3,
      status: 'submitted',
      costImpactUSD: isWithinTMinus3 ? (reqData.costImpactUSD || 250) : 0,
      delayHours: isWithinTMinus3 ? (reqData.delayHours || 24) : 0,
    };

    setDeliverables((prev) =>
      prev.map((d) =>
        d.id === deliverableId
          ? {
              ...d,
              changeRequests: [newRequest, ...d.changeRequests],
              updatedAt: new Date().toISOString().substring(0, 10),
            }
          : d
      )
    );

    addAuditLog(
      isWithinTMinus3 ? 'SOLICITUD_CAMBIO_T3_BLOQUEADA' : 'SOLICITUD_CAMBIO_CREADA',
      'deliverable',
      deliverableId,
      `Solicitud de cambio creada '${newRequest.title}'. Regla T-3: ${isWithinTMinus3 ? 'VENTANA BLOQUEADA (Requiere Override)' : 'A TIEMPO'}`
    );

    return { success: true, isTMinus3: isWithinTMinus3 };
  };

  const respondToChangeRequest = (
    deliverableId: string,
    requestId: string,
    status: 'approved' | 'rejected' | 'director_override',
    directorNotes?: string
  ) => {
    if (currentUser.role !== 'director' && currentUser.role !== 'webadmin') {
      alert('Solo el Director de Proyecto o WebAdmin pueden resolver solicitudes de cambio.');
      return;
    }

    setDeliverables((prev) =>
      prev.map((d) => {
        if (d.id !== deliverableId) return d;
        return {
          ...d,
          changeRequests: d.changeRequests.map((cr) =>
            cr.id === requestId
              ? {
                  ...cr,
                  status,
                  directorNotes: directorNotes || cr.directorNotes,
                }
              : cr
          ),
          updatedAt: new Date().toISOString().substring(0, 10),
        };
      })
    );

    addAuditLog(
      'SOLICITUD_CAMBIO_RESUELTA',
      'deliverable',
      deliverableId,
      `Solicitud ${requestId} resuelta con estado '${status}' por ${currentUser.name}`
    );
  };

  // ==========================================
  // Drive Vault Methods
  // ==========================================
  const createDriveFolder = (folderData: Omit<DriveFolder, 'id' | 'createdAt'>): DriveFolder => {
    const newFolder: DriveFolder = {
      ...folderData,
      id: `fld_${Date.now()}`,
      createdAt: new Date().toISOString().substring(0, 10),
    };
    setDriveFolders((prev) => [...prev, newFolder]);
    addAuditLog('CARPETA_DRIVE_CREADA', 'drive', newFolder.id, `Carpeta creada: ${newFolder.path}`);
    return newFolder;
  };

  const createDriveFile = (fileData: Omit<DriveFile, 'id' | 'createdAt' | 'updatedAt'>): DriveFile => {
    const newFile: DriveFile = {
      ...fileData,
      id: `fil_${Date.now()}`,
      createdAt: new Date().toISOString().substring(0, 10),
      updatedAt: new Date().toISOString().substring(0, 10),
    };
    setDriveFiles((prev) => [newFile, ...prev]);
    addAuditLog('ARCHIVO_DRIVE_SUBIDO', 'drive', newFile.id, `Archivo '${newFile.name}' añadido a Drive Vault`);
    return newFile;
  };

  const deleteDriveFile = (id: string) => {
    const target = driveFiles.find((f) => f.id === id);
    setDriveFiles((prev) => prev.filter((f) => f.id !== id));
    addAuditLog('ARCHIVO_DRIVE_ELIMINADO', 'drive', id, `Archivo '${target?.name || id}' eliminado`);
  };

  const updateDriveAccount = (id: string, updates: Partial<DriveAccount>) => {
    setDriveAccounts((prev) => prev.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc)));
    addAuditLog('CUENTA_DRIVE_ACTUALIZADA', 'system', id, `Configuración de cuenta Drive actualizada`);
  };

  const syncDriveAccount = async (id: string) => {
    updateDriveAccount(id, { status: 'syncing' });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updateDriveAccount(id, {
      status: 'active',
      lastSyncedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
    addAuditLog('DRIVE_SINCRONIZADO', 'system', id, `Sincronización manual completada para cuenta Drive`);
  };

  // ==========================================
  // Client Sandbox & Co-Creation Hub Methods
  // ==========================================
  const createSandboxIdea = (
    ideaData: Omit<ClientIdeaSandboxItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): ClientIdeaSandboxItem => {
    const newIdea: ClientIdeaSandboxItem = {
      ...ideaData,
      id: `sbx_${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString().substring(0, 10),
      updatedAt: new Date().toISOString().substring(0, 10),
    };

    setSandboxIdeas((prev) => [newIdea, ...prev]);
    addAuditLog('IDEA_SANDBOX_CREADA', 'brand', newIdea.brandId, `Nueva idea creada en Sandbox: '${newIdea.title}'`);
    return newIdea;
  };

  const updateSandboxIdea = (id: string, updates: Partial<ClientIdeaSandboxItem>) => {
    setSandboxIdeas((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString().substring(0, 10) } : item))
    );
    addAuditLog('IDEA_SANDBOX_ACTUALIZADA', 'brand', id, `Idea de Sandbox modificada`);
  };

  const deleteSandboxIdea = (id: string) => {
    const target = sandboxIdeas.find((i) => i.id === id);
    setSandboxIdeas((prev) => prev.filter((i) => i.id !== id));
    addAuditLog('IDEA_SANDBOX_ELIMINADA', 'brand', target?.brandId || 'system', `Idea '${target?.title || id}' eliminada del Sandbox`);
  };

  const convertSandboxIdeaToDeliverable = (ideaId: string): Deliverable => {
    const idea = sandboxIdeas.find((i) => i.id === ideaId);
    if (!idea) throw new Error('Idea no encontrada');

    const brand = brands.find((b) => b.id === idea.brandId);
    const brandPrefix = brand ? brand.name.substring(0, 3).toUpperCase() : 'DEL';
    const count = deliverables.filter((d) => d.brandId === idea.brandId).length + 1;
    const code = `CF-${brandPrefix}-${String(count).padStart(3, '0')}`;

    // Target territory fallback
    const targetTerritoryId = idea.targetTerritoryId || territories.find((t) => t.brandId === idea.brandId && t.active)?.id || '';

    // Calculate dates (tentative)
    const today = new Date();
    const desiredPub = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const prodStart = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const prodEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    const newDeliverable: Deliverable = {
      id: `del_${Date.now()}`,
      code,
      brandId: idea.brandId,
      title: idea.title,
      territoryId: targetTerritoryId,
      assigneeId: 'usr_director', // Automatically queued to Director for review
      phase: 'ideacion',
      priority: 'medium',
      format: idea.formatSuggested || '9:16 Vertical Reel (45s)',
      conceptHook: idea.aiGeneratedBrief?.hook || idea.title,
      description: `${idea.notes}\n\nPropuesta co-creada en Sandbox por el cliente. Referencias: ${idea.referenceUrls.join(', ') || 'Ninguna'}`,
      productionStartDate: prodStart,
      productionEndDate: prodEnd,
      publishDate: desiredPub,
      technicalGuide: {
        aspectRatios: ['9:16'],
        frameRate: '24fps',
        colorSpace: 'Rec.709 Natural Cinematic',
        audioSpecs: 'Voz en off limpia + Master 32-bit Float',
        lightingScheme: 'Iluminación ambiental de estudio',
        shotlist: [
          { shotNumber: 1, description: 'Toma inicial de apertura e impacto de marca', cameraAngle: 'Primer Plano (Close-up)', movement: 'Gimbal Push-in', durationSec: 3 },
          { shotNumber: 2, description: 'Desarrollo visual del concepto o producto', cameraAngle: 'Plano Medio', movement: 'Paneo suave', durationSec: 15 },
        ],
        equipmentList: [],
        exportTargets: ['Master 4K ProRes', 'Social Cut 1080p MP4'],
      },
      equipmentReservedIds: [],
      assetsLinked: [brand ? `Portal Oficial ${brand.name}` : 'Website'],
      changeRequests: [],
      clientApproved: false,
      directorApproved: false,
      driveFolderId: `fld_del_${Date.now()}`,
      driveFilesCount: 0,
      createdAt: new Date().toISOString().substring(0, 10),
      updatedAt: new Date().toISOString().substring(0, 10),
    };

    setDeliverables((prev) => [newDeliverable, ...prev]);

    // Update sandbox status
    setSandboxIdeas((prev) =>
      prev.map((i) =>
        i.id === ideaId ? { ...i, status: 'converted_to_deliverable', convertedDeliverableId: newDeliverable.id } : i
      )
    );

    addAuditLog(
      'IDEA_TRANSFORMADA_EN_ENTREGABLE',
      'deliverable',
      newDeliverable.id,
      `Idea '${idea.title}' convertida en entregable formal ${newDeliverable.code} en fase Ideación`
    );

    return newDeliverable;
  };

  const createClientDeliverableProposal = (proposal: {
    title: string;
    territoryId: string;
    conceptHook: string;
    description: string;
    desiredPublishDate: string;
    format?: string;
    references?: string[];
  }): Deliverable => {
    const clientBrandId = currentUser.assignedBrandIds?.[0] || selectedBrandId;
    const brand = brands.find((b) => b.id === clientBrandId);
    const brandPrefix = brand ? brand.name.substring(0, 3).toUpperCase() : 'CLI';
    const count = deliverables.filter((d) => d.brandId === clientBrandId).length + 1;
    const code = `CF-${brandPrefix}-${String(count).padStart(3, '0')}`;

    const today = new Date();
    const prodStart = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const prodEnd = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    const newDeliverable: Deliverable = {
      id: `del_${Date.now()}`,
      code,
      brandId: clientBrandId,
      title: proposal.title,
      territoryId: proposal.territoryId,
      assigneeId: 'usr_director',
      phase: 'ideacion',
      priority: 'medium',
      format: proposal.format || '9:16 Vertical Reel (45s)',
      conceptHook: proposal.conceptHook,
      description: proposal.description,
      productionStartDate: prodStart,
      productionEndDate: prodEnd,
      publishDate: proposal.desiredPublishDate,
      technicalGuide: {
        aspectRatios: ['9:16'],
        frameRate: '24fps',
        colorSpace: 'Rec.709 Estándar',
        audioSpecs: 'Audio directo + música con licencia comercial',
        lightingScheme: 'Natural / Set',
        shotlist: [],
        equipmentList: [],
        exportTargets: ['Master 4K ProRes', 'MP4 Web'],
      },
      equipmentReservedIds: [],
      assetsLinked: [brand ? `Portal Oficial ${brand.name}` : 'Website'],
      changeRequests: [],
      clientApproved: false,
      directorApproved: false,
      driveFolderId: `fld_del_${Date.now()}`,
      driveFilesCount: 0,
      createdAt: new Date().toISOString().substring(0, 10),
      updatedAt: new Date().toISOString().substring(0, 10),
    };

    setDeliverables((prev) => [newDeliverable, ...prev]);

    addAuditLog(
      'PROPUESTA_CLIENTE_CREADA',
      'deliverable',
      newDeliverable.id,
      `Cliente ${currentUser.name} propuso nueva pieza '${newDeliverable.title}' (${newDeliverable.code}) en fase Ideación`
    );

    return newDeliverable;
  };

  const generateAIBriefForSandboxIdea = async (ideaId: string) => {
    const idea = sandboxIdeas.find((i) => i.id === ideaId);
    if (!idea) return;

    const brand = brands.find((b) => b.id === idea.brandId);
    const terr = territories.find((t) => t.id === idea.targetTerritoryId);

    // Simulate AI generation with intelligent contextual briefs
    await new Promise((resolve) => setTimeout(resolve, 800));

    const generatedBrief = {
      hook: `¿Sabías que ${brand?.name || 'nuestra marca'} revoluciona tu rutina diaria? Mira esto:`,
      narrativeAngle: `Enfoque cinematográfico centrado en el territorio '${terr?.name || 'Estilo de Vida'}', con cortes dinámicos y audio inmersivo.`,
      suggestedDuration: '30 a 45 segundos',
      recommendedPlatforms: ['TikTok', 'Instagram Reels', 'YouTube Shorts'],
    };

    updateSandboxIdea(ideaId, { aiGeneratedBrief: generatedBrief });
  };

  const updateCollaboratorSchedule = (userId: string, scheduleUpdates: Partial<CollaboratorSchedule>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const currentSched: CollaboratorSchedule = u.schedule || {
            workDays: [1, 2, 3, 4, 5],
            startHour: '09:00',
            endHour: '18:00',
            isOnVacation: false,
            alertsEnabled: true,
          };
          const updated = { ...currentSched, ...scheduleUpdates };
          if (currentUser.id === userId) {
            setCurrentUser((curr) => ({ ...curr, schedule: updated }));
          }
          return { ...u, schedule: updated };
        }
        return u;
      })
    );
    addAuditLog('HORARIO_ACTUALIZADO', 'system', userId, `Horario o estado de vacaciones modificado para colaborador`);
  };

  const checkCollaboratorAvailability = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user || !user.schedule) {
      return { isAvailableNow: true, scheduleSummary: 'L-V 09:00 - 18:00' };
    }
    const sched = user.schedule;
    if (!sched.alertsEnabled) {
      return { isAvailableNow: false, reason: 'alerts_disabled' as const, scheduleSummary: 'Alertas desactivadas por el usuario' };
    }
    if (sched.isOnVacation) {
      return { isAvailableNow: false, reason: 'vacation' as const, scheduleSummary: `De vacaciones (${sched.vacationNotes || 'Mute Alerts activo'})` };
    }
    const now = new Date();
    const currentDay = now.getDay();
    const currentHours = now.getHours();
    const currentMins = now.getMinutes();
    const currentFormatted = `${String(currentHours).padStart(2, '0')}:${String(currentMins).padStart(2, '0')}`;

    const isWorkDay = sched.workDays.includes(currentDay);
    const isWithinHours = currentFormatted >= sched.startHour && currentFormatted <= sched.endHour;

    const daysLabel = sched.workDays.map((d) => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d]).join(', ');
    const scheduleSummary = `${daysLabel} ${sched.startHour} - ${sched.endHour}`;

    if (!isWorkDay || !isWithinHours) {
      return {
        isAvailableNow: false,
        reason: 'outside_hours' as const,
        nextActiveSlot: `Próxima jornada activa: ${sched.startHour}`,
        scheduleSummary,
      };
    }

    return { isAvailableNow: true, scheduleSummary };
  };

  const openAiModalWithContext = (context: any) => {
    setAiModalInitialContext(context);
    setIsAiModalOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        currentUser,
        setCurrentUser,
        users,
        theme: preferences.theme,
        setTheme,
        navPosition: preferences.navPosition,
        setNavPosition,
        preferences,
        updatePreferences,
        deliverableTypeFilter,
        setDeliverableTypeFilter,
        selectedClientFilter,
        setSelectedClientFilter,
        updateCollaboratorSchedule,
        checkCollaboratorAvailability,
        brands,
        selectedBrandId,
        setSelectedBrandId,
        createBrand,
        updateBrand,
        territories,
        createTerritory,
        updateTerritory,
        deleteTerritory,
        validateBrandTerritories,
        digitalAssets,
        createDigitalAsset,
        updateDigitalAsset,
        deleteDigitalAsset,
        equipment,
        createEquipment,
        updateEquipment,
        deleteEquipment,
        reservations,
        checkEquipmentCollision,
        createEquipmentReservation,
        cancelEquipmentReservation,
        campaigns,
        selectedCampaignId,
        setSelectedCampaignId,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        deliverables,
        selectedDeliverable,
        setSelectedDeliverable,
        createDeliverable,
        updateDeliverable,
        moveDeliverablePhase,
        updateTechnicalGuide,
        submitChangeRequest,
        respondToChangeRequest,
        driveAccounts,
        selectedDriveAccountId,
        setSelectedDriveAccountId,
        driveFolders,
        driveFiles,
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
        sandboxIdeas,
        createSandboxIdea,
        updateSandboxIdea,
        deleteSandboxIdea,
        convertSandboxIdeaToDeliverable,
        createClientDeliverableProposal,
        generateAIBriefForSandboxIdea,
        auditLogs,
        addAuditLog,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isAiModalOpen,
        setIsAiModalOpen,
        aiModalInitialContext,
        openAiModalWithContext,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isCreateBrandModalOpen,
        setIsCreateBrandModalOpen,
        isCreateEquipmentModalOpen,
        setIsCreateEquipmentModalOpen,
        isCreateCampaignModalOpen,
        setIsCreateCampaignModalOpen,
        isCreateClientDeliverableModalOpen,
        setIsCreateClientDeliverableModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

