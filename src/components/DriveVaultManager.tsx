import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  HardDrive,
  Folder,
  Film,
  Music,
  FileText,
  Plus,
  Search,
  ExternalLink,
  RefreshCw,
  Eye,
  Trash2,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  UploadCloud,
  FileCode,
} from 'lucide-react';
import { DriveFileType } from '../types';

export const DriveVaultManager: React.FC = () => {
  const {
    driveAccounts,
    selectedDriveAccountId,
    setSelectedDriveAccountId,
    driveFolders,
    driveFiles,
    selectedBrandId,
    brands,
    currentUser,
    setActivePreviewFile,
    createDriveFolder,
    createDriveFile,
    deleteDriveFile,
    syncDriveAccount,
  } = useApp();

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals for creation
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState<DriveFileType>('video');
  const [uploadFileSize, setUploadFileSize] = useState('250 MB');
  const [uploadFileUrl, setUploadFileUrl] = useState('');

  const currentAccount =
    driveAccounts.find((a) => a.id === selectedDriveAccountId) || driveAccounts[0];

  // Brand Filtering (Enforce Client isolation)
  const activeBrandFilter =
    currentUser.role === 'cliente' && currentUser.assignedBrandIds?.[0]
      ? currentUser.assignedBrandIds[0]
      : selectedBrandId;

  // Filter folders by active account, brand, and parent
  const visibleFolders = driveFolders.filter((f) => {
    const matchAccount = f.accountId === selectedDriveAccountId;
    const matchBrand =
      activeBrandFilter === 'all' || !f.brandId || f.brandId === activeBrandFilter;
    const matchParent = currentFolderId ? f.parentFolderId === currentFolderId : !f.parentFolderId;
    return matchAccount && matchBrand && matchParent;
  });

  // Filter files
  const visibleFiles = driveFiles.filter((f) => {
    const matchAccount = f.accountId === selectedDriveAccountId;
    const matchBrand =
      activeBrandFilter === 'all' || !f.brandId || f.brandId === activeBrandFilter;
    const matchFolder = currentFolderId ? f.folderId === currentFolderId : true;
    const matchType = selectedTypeFilter === 'all' || f.type === selectedTypeFilter;
    const matchSearch =
      f.name.toLowerCase().includes(fileSearchQuery.toLowerCase()) ||
      (f.technicalSpecs?.codec || '').toLowerCase().includes(fileSearchQuery.toLowerCase()) ||
      (f.technicalSpecs?.resolution || '').toLowerCase().includes(fileSearchQuery.toLowerCase());
    return matchAccount && matchBrand && matchFolder && matchType && matchSearch;
  });

  const currentFolder = driveFolders.find((f) => f.id === currentFolderId);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncDriveAccount(selectedDriveAccountId);
    setIsSyncing(false);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    createDriveFolder({
      name: newFolderName.trim(),
      accountId: selectedDriveAccountId,
      parentFolderId: currentFolderId || undefined,
      brandId: activeBrandFilter !== 'all' ? activeBrandFilter : undefined,
    });

    setNewFolderName('');
    setIsNewFolderModalOpen(false);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;

    const brandForFile =
      activeBrandFilter !== 'all'
        ? activeBrandFilter
        : brands[0]?.id || 'brand_apex';

    const targetFolderId =
      currentFolderId ||
      driveFolders.find((f) => f.accountId === selectedDriveAccountId && f.brandId === brandForFile)?.id;

    createDriveFile({
      accountId: selectedDriveAccountId,
      folderId: targetFolderId,
      brandId: brandForFile,
      name: uploadFileName.trim(),
      type: uploadFileType,
      mimeType:
        uploadFileType === 'video'
          ? 'video/mp4'
          : uploadFileType === 'audio'
          ? 'audio/wav'
          : 'application/pdf',
      sizeFormatted: uploadFileSize,
      sizeBytes: 1024 * 1024 * 150,
      url: uploadFileUrl.trim() || 'https://drive.google.com/file/d/demo/view',
      uploadedByName: currentUser.name,
      technicalSpecs:
        uploadFileType === 'video'
          ? {
              resolution: '3840x2160 (4K)',
              codec: 'Apple ProRes 422',
              frameRate: '24.00 fps',
              duration: '00:00:30:00',
            }
          : uploadFileType === 'audio'
          ? {
              audioSpecs: '32-bit Float 48kHz Stereo',
              duration: '00:00:30:00',
            }
          : undefined,
    });

    setUploadFileName('');
    setUploadFileUrl('');
    setIsUploadModalOpen(false);
  };

  const getFileIcon = (type: DriveFileType) => {
    switch (type) {
      case 'video':
        return <Film className="w-4 h-4 text-rose-600" />;
      case 'audio':
        return <Music className="w-4 h-4 text-indigo-600" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-600" />;
      default:
        return <FileCode className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-4 text-slate-800">
      
      {/* Top Header & Multi-Account Switcher */}
      <div className="glass-panel rounded-2xl p-4.5 space-y-4 shadow-sm bg-white border border-slate-200">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20 shrink-0">
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Drive Vault & Media Hub
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                  Google Drive API v3 Activo
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Almacenamiento multi-cuenta centralizado • Masters 4K, Stems 32-bit Float y Documentos Generados
              </p>
            </div>
          </div>

          {/* Account selector pills (WebAdmin/Director) */}
          <div className="flex flex-wrap items-center gap-2">
            {currentUser.role !== 'cliente' && (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                {driveAccounts.map((acc) => {
                  const isSelected = acc.id === selectedDriveAccountId;
                  return (
                    <button
                      key={acc.id}
                      onClick={() => setSelectedDriveAccountId(acc.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>{acc.name.split('(')[0]}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="btn-secondary"
              title="Sincronizar con Google Drive"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>

            {currentUser.role !== 'cliente' && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="btn-primary"
              >
                <UploadCloud className="w-4 h-4" />
                <span>+ Subir Archivo</span>
              </button>
            )}
          </div>
        </div>

        {/* Quota & Storage Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2.5 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Espacio Utilizado</span>
              <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                {currentAccount.quotaUsedGB} GB / {currentAccount.quotaTotalGB} GB
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              {Math.round((currentAccount.quotaUsedGB / currentAccount.quotaTotalGB) * 100)}% ocupado
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Archivos Registrados</span>
              <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                {driveFiles.filter((f) => f.accountId === selectedDriveAccountId).length} Assets en Vault
              </div>
            </div>
            <span className="text-xs text-slate-600 font-mono">
              {driveFolders.filter((f) => f.accountId === selectedDriveAccountId).length} Carpetas
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Cuenta Conectada</span>
              <div className="font-mono text-slate-800 text-xs truncate mt-0.5">
                {currentAccount.email}
              </div>
            </div>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Online</span>
            </span>
          </div>
        </div>

      </div>

      {/* Filter & Breadcrumb Bar */}
      <div className="glass-panel rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs bg-white border border-slate-200">
        
        {/* Breadcrumb path */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setCurrentFolderId(null)}
            className={`font-semibold cursor-pointer transition-colors ${
              !currentFolderId ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nataraja Workspace
          </button>
          {currentFolder && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-900">{currentFolder.name}</span>
            </>
          )}
        </div>

        {/* Type filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {['all', 'video', 'audio', 'document'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTypeFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  selectedTypeFilter === t
                    ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {t === 'all' ? 'Todos' : t === 'video' ? 'Videos (4K/ProRes)' : t === 'audio' ? 'Audios 32-bit' : 'Documentos'}
              </button>
            ))}
          </div>

          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={fileSearchQuery}
              onChange={(e) => setFileSearchQuery(e.target.value)}
              placeholder="Buscar archivo, códec..."
              className="input-impeccable pl-8.5"
            />
          </div>

          {currentUser.role !== 'cliente' && (
            <button
              onClick={() => setIsNewFolderModalOpen(true)}
              className="btn-secondary"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Carpeta</span>
            </button>
          )}
        </div>

      </div>

      {/* Folders Section (if any) */}
      {visibleFolders.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block px-1">
            Carpetas ({visibleFolders.length})
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {visibleFolders.map((fld) => {
              const brand = brands.find((b) => b.id === fld.brandId);
              const isSandbox = fld.name.includes('00_Sandbox_CoCreativo') || fld.name.toLowerCase().includes('sandbox');

              return (
                <div
                  key={fld.id}
                  onClick={() => setCurrentFolderId(fld.id)}
                  className={`rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-2.5 group bg-white border ${
                    isSandbox
                      ? 'bg-purple-50/50 border-purple-200 hover:border-purple-400'
                      : 'border-slate-200 hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {isSandbox ? (
                      <div className="flex items-center gap-1.5 text-purple-600">
                        <Folder className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <Sparkles className="w-3.5 h-3.5 animate-subtle-pulse" />
                      </div>
                    ) : (
                      <Folder className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                    )}

                    {brand && (
                      <span
                        className="w-2.5 h-2.5 rounded-full shadow-2xs ring-1 ring-slate-200"
                        style={{ backgroundColor: brand.primaryColor }}
                        title={brand.name}
                      />
                    )}
                  </div>

                  <div>
                    <h4 className={`font-bold text-xs truncate transition-colors ${
                      isSandbox ? 'text-purple-900 group-hover:text-purple-700' : 'text-slate-900 group-hover:text-indigo-600'
                    }`}>
                      {fld.name}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                      <span>{fld.itemCount} elementos</span>
                      {isSandbox && (
                        <span className="text-[9.5px] font-sans font-bold text-purple-600">
                          Sandbox
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Files Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Archivos & Assets ({visibleFiles.length})
          </span>
          <span className="text-xs text-slate-500">Haz clic en un archivo para reproducir o previsualizar</span>
        </div>

        {visibleFiles.length === 0 ? (
          <div className="p-12 text-center bg-white border border-dashed border-slate-300 rounded-2xl space-y-3">
            <HardDrive className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">No hay archivos en esta carpeta</h4>
            <p className="text-xs text-slate-500">Sube un nuevo master, audio stem o documento para visualizarlo aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {visibleFiles.map((file) => {
              const brand = brands.find((b) => b.id === file.brandId);

              return (
                <div
                  key={file.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all space-y-3 relative group overflow-hidden"
                  style={{ borderLeftColor: brand?.primaryColor || '#4f46e5', borderLeftWidth: '4px' }}
                >
                  {/* File Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                        {getFileIcon(file.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-slate-900 truncate leading-snug">
                          {file.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
                          <span>{file.sizeFormatted}</span>
                          <span>•</span>
                          <span className="capitalize">{file.type}</span>
                          {file.isOriginalMaster && (
                            <span className="px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[9px]">
                              MASTER 4K
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {brand && (
                      <span
                        className="text-[9.5px] font-bold px-2 py-0.5 rounded-full text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: brand.primaryColor }}
                      >
                        {brand.name}
                      </span>
                    )}
                  </div>

                  {/* Technical Specs Tags (if video/audio) */}
                  {file.technicalSpecs && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10.5px] font-mono text-slate-700 grid grid-cols-2 gap-1.5 shadow-2xs">
                      {file.technicalSpecs.resolution && (
                        <div>
                          <span className="text-slate-400 text-[9px] block">Resolución</span>
                          <span className="font-bold text-slate-900">{file.technicalSpecs.resolution}</span>
                        </div>
                      )}
                      {file.technicalSpecs.codec && (
                        <div>
                          <span className="text-slate-400 text-[9px] block">Códec</span>
                          <span className="font-bold text-slate-900 truncate block">{file.technicalSpecs.codec}</span>
                        </div>
                      )}
                      {file.technicalSpecs.audioSpecs && (
                        <div className="col-span-2">
                          <span className="text-slate-400 text-[9px] block">Audio</span>
                          <span className="font-bold text-slate-900">{file.technicalSpecs.audioSpecs}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Generated Document Summary (if doc) */}
                  {file.generatedDocument && (
                    <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[10.5px] text-indigo-900 shadow-2xs">
                      <span className="font-bold block text-slate-900">{file.generatedDocument.subtitle}</span>
                      <span className="text-slate-500 text-[10px]">
                        {file.generatedDocument.sections.length} secciones estructuradas
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Subido: {file.createdAt}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setActivePreviewFile(file)}
                        className="btn-primary py-1 px-2.5 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Previsualizar</span>
                      </button>

                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                        title="Abrir en Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {currentUser.role !== 'cliente' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar '${file.name}' del Drive Vault?`)) {
                              deleteDriveFile(file.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                          title="Eliminar archivo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE FOLDER MODAL */}
      {isNewFolderModalOpen && (
        <div
          onClick={() => setIsNewFolderModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in-scale"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 border border-slate-200 shadow-xl"
          >
            <h3 className="text-sm font-bold text-slate-900">Nueva Carpeta en Drive</h3>
            <form onSubmit={handleCreateFolder} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nombre de la Carpeta</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Ej: 04_Audio_Masters"
                  required
                  className="input-impeccable"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Crear Carpeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD FILE MODAL */}
      {isUploadModalOpen && (
        <div
          onClick={() => setIsUploadModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in-scale"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 border border-slate-200 shadow-xl"
          >
            <h3 className="text-sm font-bold text-slate-900">Subir Asset al Drive Vault</h3>
            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nombre del Archivo *</label>
                <input
                  type="text"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="Ej: CF-APX-001_Final_Master_Rec709.mov"
                  required
                  className="input-impeccable"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tipo de Archivo</label>
                  <select
                    value={uploadFileType}
                    onChange={(e) => setUploadFileType(e.target.value as DriveFileType)}
                    className="input-impeccable cursor-pointer"
                  >
                    <option value="video">Video Master / Proxy</option>
                    <option value="audio">Audio Stem / Track</option>
                    <option value="document">Documento / Guía</option>
                    <option value="archive">Brand Asset / Kit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tamaño Estimado</label>
                  <input
                    type="text"
                    value={uploadFileSize}
                    onChange={(e) => setUploadFileSize(e.target.value)}
                    placeholder="Ej: 1.85 GB"
                    className="input-impeccable font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">URL de Google Drive (opcional)</label>
                <input
                  type="url"
                  value={uploadFileUrl}
                  onChange={(e) => setUploadFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="input-impeccable font-mono"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Registrar en Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
