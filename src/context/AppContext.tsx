import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { UIProvider, useUI, AppTab } from './UIContext';
import { BrandsProvider, useBrandsContext } from './BrandsContext';
import { DeliverablesProvider, useDeliverablesContext } from './DeliverablesContext';
import { CampaignsProvider, useCampaignsContext } from './CampaignsContext';
import { DriveVaultProvider, useDriveVaultContext } from './DriveVaultContext';
import { EquipmentProvider, useEquipmentContext } from './EquipmentContext';
import { ClientSandboxProvider, useClientSandboxContext } from './ClientSandboxContext';
import { AuditProvider, useAuditContext } from './AuditContext';

export { useAuth } from './AuthContext';
export { useUI } from './UIContext';
export { useBrandsContext } from './BrandsContext';
export { useDeliverablesContext } from './DeliverablesContext';
export { useCampaignsContext } from './CampaignsContext';
export { useDriveVaultContext } from './DriveVaultContext';
export { useEquipmentContext } from './EquipmentContext';
export { useClientSandboxContext } from './ClientSandboxContext';
export { useAuditContext } from './AuditContext';
export type { AppTab };

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <UIProvider>
        <BrandsProvider>
          <DeliverablesProvider>
            <CampaignsProvider>
              <DriveVaultProvider>
                <EquipmentProvider>
                  <ClientSandboxProvider>
                    <AuditProvider>{children}</AuditProvider>
                  </ClientSandboxProvider>
                </EquipmentProvider>
              </DriveVaultProvider>
            </CampaignsProvider>
          </DeliverablesProvider>
        </BrandsProvider>
      </UIProvider>
    </AuthProvider>
  );
};

export const useApp = () => {
  const auth = useAuth();
  const ui = useUI();
  const brands = useBrandsContext();
  const deliverables = useDeliverablesContext();
  const campaigns = useCampaignsContext();
  const drive = useDriveVaultContext();
  const equipment = useEquipmentContext();
  const sandbox = useClientSandboxContext();
  const audit = useAuditContext();

  return {
    // Auth & User Profile
    isAuthenticated: auth.isAuthenticated,
    login: auth.login,
    logout: auth.logout,
    currentUser: auth.currentUser,
    setCurrentUser: auth.setCurrentUser,
    users: auth.users,

    // UI & Appearance
    theme: ui.theme,
    setTheme: ui.setTheme,
    navPosition: ui.navPosition,
    setNavPosition: ui.setNavPosition,
    preferences: ui.preferences,
    updatePreferences: ui.updatePreferences,
    activeTab: ui.activeTab,
    setActiveTab: ui.setActiveTab,
    searchQuery: ui.searchQuery,
    setSearchQuery: ui.setSearchQuery,
    deliverableTypeFilter: ui.deliverableTypeFilter,
    setDeliverableTypeFilter: ui.setDeliverableTypeFilter,
    selectedClientFilter: ui.selectedClientFilter,
    setSelectedClientFilter: ui.setSelectedClientFilter,

    // Modals & Aliases
    isAiModalOpen: ui.isAiModalOpen,
    setIsAiModalOpen: ui.setIsAiModalOpen,
    aiModalContext: ui.aiModalContext,
    openAiModalWithContext: ui.openAiModalWithContext,
    isUserProfileModalOpen: ui.isUserProfileModalOpen,
    setIsUserProfileModalOpen: ui.setIsUserProfileModalOpen,
    isProfileModalOpen: ui.isProfileModalOpen,
    setIsProfileModalOpen: ui.setIsProfileModalOpen,
    isCreateBrandModalOpen: ui.isCreateBrandModalOpen,
    setIsCreateBrandModalOpen: ui.setIsCreateBrandModalOpen,
    isCreateCampaignModalOpen: ui.isCreateCampaignModalOpen,
    setIsCreateCampaignModalOpen: ui.setIsCreateCampaignModalOpen,
    isCreateEquipmentModalOpen: ui.isCreateEquipmentModalOpen,
    setIsCreateEquipmentModalOpen: ui.setIsCreateEquipmentModalOpen,
    isDeliverableDetailModalOpen: ui.isDeliverableDetailModalOpen,
    setIsDeliverableDetailModalOpen: ui.setIsDeliverableDetailModalOpen,
    detailDeliverableId: ui.detailDeliverableId,
    openDeliverableDetailModal: ui.openDeliverableDetailModal,
    isClientDeliverableModalOpen: ui.isClientDeliverableModalOpen,
    setIsClientDeliverableModalOpen: ui.setIsClientDeliverableModalOpen,
    isCreateClientDeliverableModalOpen: ui.isCreateClientDeliverableModalOpen,
    setIsCreateClientDeliverableModalOpen: ui.setIsCreateClientDeliverableModalOpen,
    activePreviewFile: ui.activePreviewFile,
    setActivePreviewFile: ui.setActivePreviewFile,

    // Brands & Territories
    brands: brands.brands,
    selectedBrandId: brands.selectedBrandId,
    setSelectedBrandId: brands.setSelectedBrandId,
    createBrand: brands.createBrand,
    updateBrand: brands.updateBrand,
    deleteBrand: brands.deleteBrand,
    territories: brands.territories,
    createTerritory: brands.createTerritory,
    updateTerritory: brands.updateTerritory,
    deleteTerritory: brands.deleteTerritory,
    validateBrandTerritories: brands.validateBrandTerritories,
    digitalAssets: brands.digitalAssets,
    createDigitalAsset: brands.createDigitalAsset,
    updateDigitalAsset: brands.updateDigitalAsset,
    deleteDigitalAsset: brands.deleteDigitalAsset,

    // Deliverables
    deliverables: deliverables.deliverables,
    selectedDeliverable: deliverables.selectedDeliverable,
    setSelectedDeliverable: deliverables.setSelectedDeliverable,
    createDeliverable: deliverables.createDeliverable,
    updateDeliverable: deliverables.updateDeliverable,
    deleteDeliverable: deliverables.deleteDeliverable,
    moveDeliverablePhase: deliverables.moveDeliverablePhase,
    updateTechnicalGuide: deliverables.updateTechnicalGuide,
    submitChangeRequest: deliverables.submitChangeRequest,
    respondToChangeRequest: deliverables.respondToChangeRequest,
    createClientDeliverableProposal: deliverables.createClientDeliverableProposal,

    // Campaigns
    campaigns: campaigns.campaigns,
    selectedCampaignId: campaigns.selectedCampaignId,
    setSelectedCampaignId: campaigns.setSelectedCampaignId,
    createCampaign: campaigns.createCampaign,
    updateCampaign: campaigns.updateCampaign,
    deleteCampaign: campaigns.deleteCampaign,

    // Drive Vault
    driveAccounts: drive.driveAccounts,
    driveFolders: drive.driveFolders,
    driveFiles: drive.driveFiles,
    selectedDriveAccountId: drive.selectedDriveAccountId,
    setSelectedDriveAccountId: drive.setSelectedDriveAccountId,
    selectedFolderId: drive.selectedFolderId,
    setSelectedFolderId: drive.setSelectedFolderId,
    createDriveFolder: drive.createDriveFolder,
    createDriveFile: drive.createDriveFile,
    deleteDriveFile: drive.deleteDriveFile,
    updateDriveAccount: drive.updateDriveAccount,
    syncDriveAccount: drive.syncDriveAccount,
    generateBrandDriveTreeAndDocs: drive.generateBrandDriveTreeAndDocs,

    // Equipment & Schedules
    equipment: equipment.equipment,
    createEquipment: equipment.createEquipment,
    updateEquipment: equipment.updateEquipment,
    deleteEquipment: equipment.deleteEquipment,
    reservations: equipment.reservations,
    checkEquipmentCollision: equipment.checkEquipmentCollision,
    createEquipmentReservation: equipment.createEquipmentReservation,
    cancelEquipmentReservation: equipment.cancelEquipmentReservation,
    collaboratorSchedules: equipment.collaboratorSchedules,
    updateCollaboratorSchedule: equipment.updateCollaboratorSchedule,
    checkCollaboratorAvailability: equipment.checkCollaboratorAvailability,

    // Sandbox
    sandboxIdeas: sandbox.sandboxIdeas,
    createSandboxIdea: sandbox.createSandboxIdea,
    updateSandboxIdea: sandbox.updateSandboxIdea,
    deleteSandboxIdea: sandbox.deleteSandboxIdea,
    convertSandboxIdeaToDeliverable: sandbox.convertSandboxIdeaToDeliverable,
    generateAIBriefForSandboxIdea: sandbox.generateAIBriefForSandboxIdea,

    // Audit
    auditLogs: audit.auditLogs,
    addAuditLog: audit.addAuditLog,
    resetSystemData: audit.resetSystemData,
  };
};
