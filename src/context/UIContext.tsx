import React, { createContext, useContext, useState, useEffect } from 'react';
import { NavigationPosition, ThemePalette, UserPreferences, DriveFile } from '../types';

export type AppTab =
  | 'kanban'
  | 'calendar'
  | 'campaigns'
  | 'drive'
  | 'brand_hub'
  | 'brands'
  | 'equipment'
  | 'specs'
  | 'operations'
  | 'admin';

export interface UIContextType {
  theme: ThemePalette;
  setTheme: (theme: ThemePalette) => void;
  navPosition: NavigationPosition;
  setNavPosition: (pos: NavigationPosition) => void;
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;

  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  deliverableTypeFilter: 'all' | 'audiovisual' | 'graphic';
  setDeliverableTypeFilter: (type: 'all' | 'audiovisual' | 'graphic') => void;
  selectedClientFilter: string;
  setSelectedClientFilter: (brandId: string) => void;

  // Modals & Aliases
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  aiModalContext: any;
  openAiModalWithContext: (context: any) => void;

  isUserProfileModalOpen: boolean;
  setIsUserProfileModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;

  isCreateBrandModalOpen: boolean;
  setIsCreateBrandModalOpen: (open: boolean) => void;
  isCreateCampaignModalOpen: boolean;
  setIsCreateCampaignModalOpen: (open: boolean) => void;
  isCreateEquipmentModalOpen: boolean;
  setIsCreateEquipmentModalOpen: (open: boolean) => void;

  isDeliverableDetailModalOpen: boolean;
  setIsDeliverableDetailModalOpen: (open: boolean) => void;
  detailDeliverableId: string | null;
  openDeliverableDetailModal: (id: string) => void;

  isClientDeliverableModalOpen: boolean;
  setIsClientDeliverableModalOpen: (open: boolean) => void;
  isCreateClientDeliverableModalOpen: boolean;
  setIsCreateClientDeliverableModalOpen: (open: boolean) => void;

  activePreviewFile: DriveFile | null;
  setActivePreviewFile: (file: DriveFile | null) => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'light-density',
  navPosition: 'topbar',
  compactCards: false,
  enableNotifications: true,
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('nataraja_preferences');
      return saved ? JSON.parse(saved) : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  const [theme, setThemeState] = useState<ThemePalette>(() => 'light-density');
  const [navPosition, setNavPositionState] = useState<NavigationPosition>(() => preferences.navPosition || 'topbar');
  const [activeTab, setActiveTab] = useState<AppTab>('kanban');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deliverableTypeFilter, setDeliverableTypeFilter] = useState<'all' | 'audiovisual' | 'graphic'>('all');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('all');

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalContext, setAiModalContext] = useState<any>(null);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isCreateBrandModalOpen, setIsCreateBrandModalOpen] = useState(false);
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState(false);
  const [isCreateEquipmentModalOpen, setIsCreateEquipmentModalOpen] = useState(false);
  const [isDeliverableDetailModalOpen, setIsDeliverableDetailModalOpen] = useState(false);
  const [detailDeliverableId, setDetailDeliverableId] = useState<string | null>(null);
  const [isClientDeliverableModalOpen, setIsClientDeliverableModalOpen] = useState(false);
  const [activePreviewFile, setActivePreviewFile] = useState<DriveFile | null>(null);

  useEffect(() => {
    localStorage.setItem('nataraja_preferences', JSON.stringify(preferences));
  }, [preferences]);

  const setTheme = (t: ThemePalette) => {
    setThemeState(t);
    setPreferences((prev) => ({ ...prev, theme: t }));
    document.documentElement.setAttribute('data-theme', t);
  };

  const setNavPosition = (pos: NavigationPosition) => {
    setNavPositionState(pos);
    setPreferences((prev) => ({ ...prev, navPosition: pos }));
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...prefs }));
    if (prefs.theme) setThemeState(prefs.theme);
    if (prefs.navPosition) setNavPositionState(prefs.navPosition);
  };

  const openAiModalWithContext = (context: any) => {
    setAiModalContext(context);
    setIsAiModalOpen(true);
  };

  const openDeliverableDetailModal = (id: string) => {
    setDetailDeliverableId(id);
    setIsDeliverableDetailModalOpen(true);
  };

  return (
    <UIContext.Provider
      value={{
        theme,
        setTheme,
        navPosition,
        setNavPosition,
        preferences,
        updatePreferences,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        deliverableTypeFilter,
        setDeliverableTypeFilter,
        selectedClientFilter,
        setSelectedClientFilter,
        isAiModalOpen,
        setIsAiModalOpen,
        aiModalContext,
        openAiModalWithContext,
        isUserProfileModalOpen,
        setIsUserProfileModalOpen,
        isProfileModalOpen: isUserProfileModalOpen,
        setIsProfileModalOpen: setIsUserProfileModalOpen,
        isCreateBrandModalOpen,
        setIsCreateBrandModalOpen,
        isCreateCampaignModalOpen,
        setIsCreateCampaignModalOpen,
        isCreateEquipmentModalOpen,
        setIsCreateEquipmentModalOpen,
        isDeliverableDetailModalOpen,
        setIsDeliverableDetailModalOpen,
        detailDeliverableId,
        openDeliverableDetailModal,
        isClientDeliverableModalOpen,
        setIsClientDeliverableModalOpen,
        isCreateClientDeliverableModalOpen: isClientDeliverableModalOpen,
        setIsCreateClientDeliverableModalOpen: setIsClientDeliverableModalOpen,
        activePreviewFile,
        setActivePreviewFile,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
