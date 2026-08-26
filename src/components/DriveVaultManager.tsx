import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useDriveVaultContext } from '../context/DriveVaultContext';
import { HardDrive, Folder, Film, Music, FileText, Plus, Search, ExternalLink, Eye, ChevronRight, UploadCloud, X, Building2, ArrowLeft, LayoutGrid, List, FileSpreadsheet } from 'lucide-react';
import { DriveFileType, DriveAccount, DriveFolder, DriveFile } from '../types';
import { InlineDeleteConfirm } from './ui/InlineDeleteConfirm';
import { deriveOrganizationsFromBrands } from '../context/BrandsContext';

export const DriveVaultManager: React.FC = () => {
  const {
    driveAccounts,
    selectedDriveAccountId,
    setSelectedDriveAccountId,
    driveFolders,
    driveFiles,
    selectedBrandId,
    brands,
    organizations,
    currentUser,
    setActivePreviewFile,
    createDriveFolder,
    deleteDriveFolder,
    createDriveFile,
    deleteDriveFile,
    syncDriveAccount,
    toast,
  } = useApp();

  const { generateFullHierarchyForHoldingsAndBrands } = useDriveVaultContext();

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals for creation
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderBrandId, setNewFolderBrandId] = useState(selectedBrandId !== 'all' ? selectedBrandId : brands[0]?.id || 'brd_apex');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadBrandId, setUploadBrandId] = useState(selectedBrandId !== 'all' ? selectedBrandId : brands[0]?.id || 'brd_apex');
  const [uploadFileType, setUploadFileType] = useState<DriveFileType>('video');
  const [uploadFileSize, setUploadFileSize] = useState('250 MB');
  const [uploadFileUrl, setUploadFileUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Auto-generate hierarchy on first mount if folders are empty
  useEffect(() => {
    if (driveFolders.length < 10 && brands.length > 0) {
      generateFullHierarchyForHoldingsAndBrands(brands, organizations);
    }
  }, [brands, driveFolders.length]);

  const fallbackAccount: DriveAccount = {
    id: 'acc_default',
    name: 'NStudIOS Workspace Vault',
    type: 'corporate_workspace',
    email: 'cria10810@gmail.com',
    rootFolderId: 'root',
    quotaTotalGB: 200,
    quotaUsedGB: 18.5,
    isConnected: true,
    status: 'active',
    lastSyncedAt: new Date().toISOString(),
  };

  const currentAccount =
    driveAccounts.find((a) => a.id === selectedDriveAccountId) || driveAccounts[0] || fallbackAccount;

  // Active Brand Isolation for Client role
  const activeBrandFilter =
    currentUser.role === 'cliente' && currentUser.assignedBrandIds?.[0]
      ? currentUser.assignedBrandIds[0]
      : selectedBrandId;

  // Effective organizations
  const effectiveOrgs = organizations.length > 0 ? organizations : deriveOrganizationsFromBrands(brands);

  // Calculate current folder and breadcrumbs chain
  const currentFolder = driveFolders.find((f) => f.id === currentFolderId);

  // Build breadcrumbs path
  const breadcrumbs: DriveFolder[] = [];
  let tempFld = currentFolder;
  while (tempFld) {
    breadcrumbs.unshift(tempFld);
    tempFld = driveFolders.find((f) => f.id === tempFld?.parentFolderId);
  }

  // Get parent folder for the "Go up" button
  const parentFolder = currentFolder?.parentFolderId
    ? driveFolders.find((f) => f.id === currentFolder.parentFolderId)
    : null;

  // Visible folders in current view level
  const visibleFolders = driveFolders.filter((f) => {
    if (currentFolderId) {
      return f.parentFolderId === currentFolderId;
    }
    // At root: show folders without parentFolderId
    return !f.parentFolderId;
  });

  // Visible files in current folder (or filtered by brand/type/search)
  const visibleFiles = driveFiles.filter((file) => {
    // If inside a specific folder, show files belonging to this folder
    const matchFolder = currentFolderId ? file.folderId === currentFolderId : !file.folderId;
    
    // Type filter
    const matchType =
      selectedTypeFilter === 'all' ||
      (selectedTypeFilter === 'video' && file.type === 'video') ||
      (selectedTypeFilter === 'audio' && file.type === 'audio') ||
      (selectedTypeFilter === 'document' && (file.type === 'document' || file.name.endsWith('.csv') || file.name.endsWith('.xlsx')));

    // Search query
    const matchSearch =
      !fileSearchQuery ||
      file.name.toLowerCase().includes(fileSearchQuery.toLowerCase());

    return matchFolder && matchType && matchSearch;
  });

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setUploadFileName(file.name);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadFileSize(`${sizeMB} MB`);
      
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['mp4', 'mov', 'mkv', 'avi', 'prores'].includes(ext || '')) {
        setUploadFileType('video');
      } else if (['mp3', 'wav', 'aac', 'flac'].includes(ext || '')) {
        setUploadFileType('audio');
      } else if (['pdf', 'docx', 'xlsx', 'csv', 'txt'].includes(ext || '')) {
        setUploadFileType('document');
      } else {
        setUploadFileType('archive');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadFileName(file.name);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadFileSize(`${sizeMB} MB`);
      
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['mp4', 'mov', 'mkv', 'avi', 'prores'].includes(ext || '')) {
        setUploadFileType('video');
      } else if (['mp3', 'wav', 'aac', 'flac'].includes(ext || '')) {
        setUploadFileType('audio');
      } else if (['pdf', 'docx', 'xlsx', 'csv', 'txt'].includes(ext || '')) {
        setUploadFileType('document');
      } else {
        setUploadFileType('archive');
      }
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;

    createDriveFile({
      name: uploadFileName,
      type: uploadFileType,
      brandId: uploadBrandId || (brands && brands[0]?.id) || 'brd_apex',
      folderId: currentFolderId || 'fld_root',
      sizeFormatted: uploadFileSize || '150 MB',
      sizeBytes: 150000000,
      mimeType: uploadFileType === 'video' ? 'video/mp4' : uploadFileType === 'audio' ? 'audio/wav' : 'application/pdf',
      accountId: currentAccount.id,
      url: uploadFileUrl || `https://drive.google.com/open?id=demo_${Date.now()}`,
      uploadedByName: currentUser.name,
    });

    toast.success(`Archivo "${uploadFileName}" subido exitosamente al Vault.`);
    setIsUploadModalOpen(false);
    setUploadFileName('');
    setUploadFileUrl('');
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    createDriveFolder({
      name: newFolderName,
      accountId: currentAccount.id,
      brandId: newFolderBrandId || (currentFolder?.brandId) || (brands && brands[0]?.id) || 'brd_apex',
      parentFolderId: currentFolderId || undefined,
      path: currentFolder ? `${currentFolder.path}/${newFolderName}` : `/${newFolderName}`,
    });

    toast.success(`Carpeta "${newFolderName}" creada correctamente.`);
    setIsNewFolderModalOpen(false);
    setNewFolderName('');
  };

  const handleGenerateFullVault = () => {
    generateFullHierarchyForHoldingsAndBrands(brands, organizations);
    toast.success('¡Estructura de Vault para Holdings y Marcas generada con éxito!');
  };

  const handleSyncAccount = async () => {
    setIsSyncing(true);
    try {
      await syncDriveAccount(currentAccount.id);
      toast.success('Cuenta sincronizada con Google Drive API v3.');
    } catch {
      toast.error('Error al sincronizar con Google Drive.');
    } finally {
      setIsSyncing(false);
    }
  };

  const getFileIcon = (file: DriveFile) => {
    if (file.type === 'video') return <Film className="w-5 h-5 text-indigo-600" />;
    if (file.type === 'audio') return <Music className="w-5 h-5 text-purple-600" />;
    if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    return <FileText className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Connected Drive Account Status */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-slate-900">
                  Drive Vault & Media Hub
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Google Drive API v3 Activo
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Almacenamiento multi-cuenta jerárquico • Holdings ➔ Marcas ➔ Subcarpetas Operativas 4K / ProRes & Masters
              </p>
            </div>
          </div>

                    {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={currentAccount.rootFolderId && currentAccount.rootFolderId !== 'root' ? `https://drive.google.com/drive/folders/${currentAccount.rootFolderId}` : 'https://drive.google.com/drive/folders/1mYfiTe9fwkD8OOCSeW8b63mNmUmhZZpo'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-98"
              title="Abrir esta bóveda directamente en Google Drive Web"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span>Abrir en Google Drive ↗</span>
            </a>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-98"
            >
              <UploadCloud className="w-4 h-4" />
              <span>+ Subir Archivo</span>
            </button>
          </div>
        </div>

        {/* Storage and Account Specs Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                Espacio Utilizado
              </span>
              <span className="font-extrabold text-slate-800">
                {currentAccount.quotaUsedGB} GB / {currentAccount.quotaTotalGB} GB
              </span>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
              {((currentAccount.quotaUsedGB / currentAccount.quotaTotalGB) * 100).toFixed(0)}% ocupado
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                Estructura en Vault
              </span>
              <span className="font-extrabold text-slate-800">
                {driveFolders.length} Carpetas • {driveFiles.length} Archivos
              </span>
            </div>
            <Folder className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                Cuenta Conectada
              </span>
              <span className="font-mono text-slate-800 font-semibold truncate block max-w-[150px]">
                {currentAccount.email}
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </div>

      {/* 🧭 2. Google Drive Hierarchical Breadcrumbs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-2.5 shadow-2xs">
        <div className="flex items-center gap-1 text-xs font-semibold overflow-x-auto no-scrollbar">
          {/* Root Breadcrumb */}
          <button
            type="button"
            onClick={() => setCurrentFolderId(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              currentFolderId === null
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Drive Vault (Raíz)</span>
          </button>

          {/* Dynamic Breadcrumbs chain */}
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            const crumbBrand = brands.find((b) => b.id === crumb.brandId);

            return (
              <React.Fragment key={crumb.id}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <button
                  type="button"
                  onClick={() => setCurrentFolderId(crumb.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer max-w-[200px] truncate ${
                    isLast
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {crumbBrand ? (
                    <img src={crumbBrand.logo} alt="" className="w-3.5 h-3.5 rounded object-cover" />
                  ) : (
                    <Folder className="w-3.5 h-3.5" />
                  )}
                  <span className="truncate">{crumb.name}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-2">
          {currentFolderId && (
            <button
              onClick={() => setCurrentFolderId(parentFolder?.id || null)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Subir Nivel</span>
            </button>
          )}

          <button
            onClick={() => setIsNewFolderModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Carpeta</span>
          </button>
        </div>
      </div>

      {/* 📁 3. Google Drive Folders Explorer Grid */}
      {visibleFolders.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                Carpetas en {currentFolder ? currentFolder.name : 'Directorio Raíz'} ({visibleFolders.length})
              </span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {visibleFolders.map((folder) => {
              const folderBrand = brands.find((b) => b.id === folder.brandId);
              const subItemsCount = driveFolders.filter((f) => f.parentFolderId === folder.id).length;
              const filesInsideCount = driveFiles.filter((f) => f.folderId === folder.id).length;

              const isHoldingFolder = !folder.parentFolderId && folder.name.includes('Grupo');
              const isBrandFolder = folder.brandId && !folder.name.includes('01') && !folder.name.includes('02') && !folder.name.includes('03') && !folder.name.includes('04') && !folder.name.includes('05') && !folder.name.includes('06');

              return (
                <div
                  key={folder.id}
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-indigo-400 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:scale-105 transition-transform">
                        {isHoldingFolder ? (
                          <Building2 className="w-5 h-5" />
                        ) : folderBrand ? (
                          <img src={folderBrand.logo} alt="" className="w-5 h-5 rounded object-cover" />
                        ) : (
                          <Folder className="w-5 h-5" />
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <InlineDeleteConfirm
                          itemId={folder.id}
                          itemType="carpeta"
                          itemName={folder.name}
                          onConfirm={() => deleteDriveFolder(folder.id)}
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {folder.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        {subItemsCount > 0
                          ? `${subItemsCount} subcarpetas`
                          : filesInsideCount > 0
                          ? `${filesInsideCount} archivos`
                          : 'Carpeta operativa'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Abrir</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 📄 4. Files Section & Filter Toolbar */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* File Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedTypeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTypeFilter === 'all'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Todos los Assets
            </button>
            <button
              onClick={() => setSelectedTypeFilter('video')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTypeFilter === 'video'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Videos (4K/ProRes)
            </button>
            <button
              onClick={() => setSelectedTypeFilter('audio')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTypeFilter === 'audio'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Audios 32-bit Float
            </button>
            <button
              onClick={() => setSelectedTypeFilter('document')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTypeFilter === 'document'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Documentos & Hojas
            </button>
          </div>

          {/* Search and View Mode */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fileSearchQuery}
                onChange={(e) => setFileSearchQuery(e.target.value)}
                placeholder="Buscar archivo o códec..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-44"
              />
            </div>

            <div className="flex items-center border border-slate-200 bg-white rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Vista en Cuadrícula"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Vista en Lista"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Files Display */}
        {visibleFiles.length === 0 && visibleFolders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-2xs">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-12 h-12 mx-auto flex items-center justify-center">
              <Folder className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-sm">
              Esta carpeta está vacía
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Sube un nuevo master 4K, audio stem o auto-genera el árbol de carpetas de marcas para empezar.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
              >
                + Subir Archivo
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleFiles.map((file) => {
              const fileBrand = brands.find((b) => b.id === file.brandId);

              return (
                <div
                  key={file.id}
                  className="bg-white hover:bg-slate-50/60 border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between group relative"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                          {getFileIcon(file)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 truncate block group-hover:text-indigo-600 transition-colors">
                            {file.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono uppercase block">
                            {file.type} • {file.sizeFormatted}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setActivePreviewFile(file)}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Previsualizar"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <InlineDeleteConfirm
                          itemId={file.id}
                          itemType="archivo"
                          itemName={file.name}
                          onConfirm={() => deleteDriveFile(file.id)}
                        />
                      </div>
                    </div>

                    {fileBrand && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 w-fit text-[10px] font-semibold text-slate-700">
                        <img src={fileBrand.logo} alt="" className="w-3 h-3 rounded object-cover" />
                        <span>{fileBrand.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-slate-400">
                      {file.createdAt ? file.createdAt.split('T')[0] : 'Drive Vault'}
                    </span>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Abrir en Drive</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Nombre del Archivo</th>
                  <th className="py-2.5 px-3 font-bold">Marca</th>
                  <th className="py-2.5 px-3 font-bold">Tipo</th>
                  <th className="py-2.5 px-3 font-bold">Tamaño</th>
                  <th className="py-2.5 px-3 font-bold">Subido por</th>
                  <th className="py-2.5 px-3 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleFiles.map((file) => {
                  const fileBrand = brands.find((b) => b.id === file.brandId);
                  return (
                    <tr key={file.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-[200px] truncate flex items-center gap-2">
                        {getFileIcon(file)}
                        <span className="truncate">{file.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {fileBrand?.name || 'General'}
                      </td>
                      <td className="py-2.5 px-3 uppercase font-mono text-[10px] text-slate-500">
                        {file.type}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                        {file.sizeFormatted}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {file.uploadedByName}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActivePreviewFile(file)}
                            className="text-indigo-600 hover:underline font-bold text-xs"
                          >
                            Previsualizar
                          </button>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-slate-700"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload File Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-600" />
                <span>Subir Archivo al Vault</span>
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              {/* Drag & Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDropFile}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-indigo-400 bg-slate-50/60'
                }`}
              >
                <input
                  type="file"
                  id="vault-file-input"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <label htmlFor="vault-file-input" className="cursor-pointer space-y-1 block">
                  <UploadCloud className="w-8 h-8 text-indigo-600 mx-auto" />
                  <p className="font-bold text-slate-800 text-xs">
                    Arrastra tu archivo aquí o haz clic para explorar
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Soporta Video 4K ProRes, Audio WAV 32-bit, Hojas CSV / Excel y PDFs
                  </p>
                </label>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre del Archivo *</label>
                <input
                  type="text"
                  required
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="Ej. Spot_GlossSalon_Master_4K.mov"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Marca</label>
                  <select
                    value={uploadBrandId}
                    onChange={(e) => setUploadBrandId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Archivo</label>
                  <select
                    value={uploadFileType}
                    onChange={(e) => setUploadFileType(e.target.value as DriveFileType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                  >
                    <option value="video">🎥 Video (Master 4K / ProRes)</option>
                    <option value="audio">🎵 Audio (Stem 32-bit Float)</option>
                    <option value="document">📄 Documento / Hoja de Cálculo</option>
                    <option value="archive">📦 Archivo Comprimido (ZIP/RAR)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">URL de Google Drive / Web (Opcional)</label>
                <input
                  type="url"
                  value={uploadFileUrl}
                  onChange={(e) => setUploadFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-xs hover:bg-indigo-700 transition-all"
                >
                  Subir al Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Folder className="w-5 h-5 text-indigo-600" />
                <span>Crear Nueva Carpeta</span>
              </h3>
              <button
                onClick={() => setIsNewFolderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolderSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre de la Carpeta *</label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Ej. 07_Material_Promocional_Q3"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Marca Asociada</label>
                <select
                  value={newFolderBrandId}
                  onChange={(e) => setNewFolderBrandId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-xs hover:bg-indigo-700 transition-all"
                >
                  Crear Carpeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
  );
};
