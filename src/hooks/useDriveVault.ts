import { useApp } from '../context/AppContext';
import { Brand, CommunicationTerritory } from '../types';

export const useDriveVault = () => {
  const {
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
    generateBrandDriveTreeAndDocs
  } = useApp();

  return {
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
    generateBrandDriveTreeAndDocs
  };
};
