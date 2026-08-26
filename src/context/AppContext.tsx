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
import { ToastProvider, useToast } from './ToastContext';

export { useAuth } from './AuthContext';
export { useUI } from './UIContext';
export { useBrandsContext } from './BrandsContext';
export { useDeliverablesContext } from './DeliverablesContext';
export { useCampaignsContext } from './CampaignsContext';
export { useDriveVaultContext } from './DriveVaultContext';
export { useEquipmentContext } from './EquipmentContext';
export { useClientSandboxContext } from './ClientSandboxContext';
export { useAuditContext } from './AuditContext';
export { useToast } from './ToastContext';
export type { AppTab };

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
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
    </ToastProvider>
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
  const toast = useToast();

  return {
    // Toast Notifications
    toast,
    showToast: toast.showToast,
    toastSuccess: toast.success,
    toastError: toast.error,
    toastWarning: toast.warning,
    toastInfo: toast.info,

    // Auth & User Profile
    isAuthenticated: auth.isAuthenticated,
    isLoadingAuth: auth.isLoadingAuth,
    login: auth.login,
    loginWithPassword: auth.loginWithPassword,
    signUpWithPassword: auth.signUpWithPassword,
    logout: auth.logout,
    currentUser: auth.currentUser,
    setCurrentUser: auth.setCurrentUser,
    users: auth.users,
    refreshProfiles: auth.refreshProfiles,

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

    // Brands, Organizations & Territories
    brands: brands.brands,
    selectedBrandId: brands.selectedBrandId,
    setSelectedBrandId: brands.setSelectedBrandId,
    selectedOrgId: brands.selectedOrgId,
    setSelectedOrgId: brands.setSelectedOrgId,
    createBrand: brands.createBrand,
    updateBrand: brands.updateBrand,
    deleteBrand: brands.deleteBrand,
    organizations: brands.organizations,
    createOrganization: brands.createOrganization,
    syncBrandContacts: brands.syncBrandContacts,
    inviteClientTeamMember: brands.inviteClientTeamMember,
    updateMemberPermissions: brands.updateMemberPermissions,
    refreshOrganizationsFromSupabase: brands.refreshOrganizationsFromSupabase,
    territories: brands.territories,
    createTerritory: brands.createTerritory,
    updateTerritory: brands.updateTerritory,
    deleteTerritory: brands.deleteTerritory,
    validateBrandTerritories: brands.validateBrandTerritories,
    digitalAssets: brands.digitalAssets,
    createDigitalAsset: brands.createDigitalAsset,
    updateDigitalAsset: brands.updateDigitalAsset,
    deleteDigitalAsset: brands.deleteDigitalAsset,

    // Permission evaluation helper for Clients
    canClientPerform: (
      action: 'sandbox' | 'production' | 't3' | 'drive' | 'lead',
      brandId?: string
    ): boolean => {
      if (!auth.currentUser) return false;
      // Global roles always have full permissions
      if (auth.currentUser.role === 'webadmin' || auth.currentUser.role === 'director' || auth.currentUser.role === 'colaborador') {
        return true;
      }
      if (auth.currentUser.role !== 'cliente') return false;

      // Holding Admin has full access to all assigned brands
      if (auth.currentUser.clientRole === 'holding_admin') return true;

      // Check matrix for team_member
      const targetBrandId = brandId || brands.selectedBrandId;
      if (!targetBrandId) return false;

      const matrix = auth.currentUser.clientPermissionsMatrix?.[targetBrandId];
      if (!matrix) return false;

      if (action === 'sandbox') return !!matrix.canAccessSandbox || !!matrix.isBrandLead;
      if (action === 'production') return !!matrix.canViewProduction || !!matrix.isBrandLead;
      if (action === 't3') return !!matrix.canApproveT3 || !!matrix.isBrandLead;
      if (action === 'drive') return !!matrix.canAccessDrive || !!matrix.isBrandLead;
      if (action === 'lead') return !!matrix.isBrandLead;

      return false;
    },

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
    createDriveAccount: drive.createDriveAccount,
    deleteDriveAccount: drive.deleteDriveAccount,
    createDriveFolder: drive.createDriveFolder,
    deleteDriveFolder: drive.deleteDriveFolder,
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
    refreshAuditLogs: audit.refreshAuditLogs,
    resetSystemData: audit.resetSystemData,
  };
};
