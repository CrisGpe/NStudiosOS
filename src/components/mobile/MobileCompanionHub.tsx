import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useDriveVaultContext } from '../../context/DriveVaultContext';
import {
  Sparkles,
  Plus,
  HardDrive,
  CheckCircle2,
  Link,
  FileText,
  ExternalLink,
  Monitor,
  User,
  Trash2,
  Clock,
  Video,
  Eye,
  Building2,
  Check,
  LogOut,
} from 'lucide-react';
import { MobileFlashCaptureModal } from './MobileFlashCaptureModal';
import { MobileCaptureType, Brand } from '../../types';

type FeedFilterType = 'all' | 'social' | 'media' | 'notes';

export const MobileCompanionHub: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    users,
    brands,
    territories,
    deliverables,
    sandboxIdeas,
    createSandboxIdea,
    deleteSandboxIdea,
    convertSandboxIdeaToDeliverable,
    moveDeliverablePhase,
    login,
    logout,
  } = useApp();

  const { driveFiles, createDriveFile, setActivePreviewFile } = useDriveVaultContext();

  const isClient = currentUser.role === 'cliente';

  // Strictly isolated brand for client
  const fallbackBrand: Brand = {
    id: 'brd_default',
    name: 'Estudio General',
    industry: 'Producción & Publicidad',
    logo: '',
    primaryColor: '#4f46e5',
    slogan: 'Creatividad & Producción',
    contactPerson: 'Director de Estudio',
    contactEmail: 'contacto@estudio.com',
    createdAt: new Date().toISOString(),
  };

  const activeBrandId = isClient
    ? (currentUser.assignedBrandIds?.[0] || 'brd_default')
    : (currentUser.assignedBrandIds?.[0] || brands[0]?.id || 'brd_default');

  const brand = brands.find((b) => b.id === activeBrandId) || brands[0] || fallbackBrand;
  const brandTerritories = territories.filter((t) => t.brandId === brand.id && t.active);
  const brandIdeas = sandboxIdeas.filter((i) => i.brandId === brand.id);
  const brandDeliverables = deliverables.filter((d) => d.brandId === brand.id);
  const brandDocs = driveFiles.filter((f) => f.brandId === brand.id);

  const calculateDaysToPublish = (publishDate: string) => {
    const target = new Date(publishDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Deliverables pending client approval in T-3
  const tMinus3Deliverables = brandDeliverables.filter(
    (d) => d.phase === 'aprobacion_cliente' || d.phase === 'post_produccion'
  );

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'feed' | 'drive' | 'approvals' | 'profile'>('feed');
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [feedFilter, setFeedFilter] = useState<FeedFilterType>('all');
  const [approvedToast, setApprovedToast] = useState<string | null>(null);

  // Handle Save from Flash Capture Modal
  const handleSaveMobileCapture = (data: {
    title: string;
    notes: string;
    targetTerritoryId?: string;
    formatSuggested: string;
    referenceUrls: string[];
    captureType: MobileCaptureType;
    sourcePlatform: 'tiktok' | 'instagram' | 'pinterest' | 'youtube' | 'facebook' | 'camera' | 'voice' | 'manual';
    attachmentUrl?: string;
    audioDurationSeconds?: number;
  }) => {
    // 1. Save in Sandbox Ideas with all mobile metadata
    createSandboxIdea({
      brandId: brand.id,
      title: data.title,
      notes: data.notes,
      targetTerritoryId: data.targetTerritoryId,
      formatSuggested: data.formatSuggested,
      referenceUrls: data.referenceUrls,
      captureType: data.captureType,
      sourcePlatform: data.sourcePlatform,
      attachmentUrl: data.attachmentUrl,
      audioDurationSeconds: data.audioDurationSeconds,
    });

    // 2. If camera photo or media attachment, also create Drive File in client's Sandbox folder
    if (data.attachmentUrl) {
      createDriveFile({
        accountId: 'acc_workspace_corp',
        folderId: 'folder_sandbox_ideas',
        brandId: brand.id,
        name: `Móvil_${data.title.replace(/\s+/g, '_')}.jpg`,
        type: 'image',
        mimeType: 'image/jpeg',
        sizeFormatted: '3.2 MB',
        sizeBytes: 3200000,
        url: data.attachmentUrl,
        previewUrl: data.attachmentUrl,
        uploadedByName: currentUser.name,
      });
    }

    setApprovedToast('¡Referencia capturada y sincronizada con Google Drive!');
    setTimeout(() => setApprovedToast(null), 3000);
  };

  const handleApproveDeliverable = (deliverableId: string) => {
    moveDeliverablePhase(deliverableId, 'publicado');
    setApprovedToast('¡Entregable Aprobado para Publicación Oficial!');
    setTimeout(() => setApprovedToast(null), 3000);
  };

  const filteredIdeas = brandIdeas.filter((idea) => {
    if (feedFilter === 'all') return true;
    if (feedFilter === 'social') return idea.referenceUrls && idea.referenceUrls.length > 0;
    if (feedFilter === 'media') return idea.attachmentUrl !== undefined;
    if (feedFilter === 'notes') return !idea.referenceUrls?.length && !idea.attachmentUrl;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center font-sans antialiased text-slate-800 selection:bg-indigo-500 selection:text-white">
      
      {/* Mobile Shell Wrapper (max-w-md for smartphone emulation or responsive on mobile devices) */}
      <div className="w-full max-w-md min-h-screen bg-slate-50 flex flex-col justify-between shadow-2xl border-x border-slate-200 relative pb-20">
        
        {/* Top Floating Notification Toast */}
        {approvedToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-xl border border-white/20 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{approvedToast}</span>
          </div>
        )}

        {/* ========================================================
            MOBILE HEADER
            ======================================================== */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-2xs font-extrabold text-xs"
                style={{ backgroundColor: brand.primaryColor }}
              >
                {brand.name.substring(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs font-extrabold text-slate-900 truncate max-w-[130px]">
                    {brand.name}
                  </h2>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Drive Sync
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate max-w-[170px]">
                  {currentUser.name} • {currentUser.roleTitle}
                </p>
              </div>
            </div>

            {/* Desktop Switch & Logout Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate(isClient ? '/client/hub' : '/kanban')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-[11px] font-semibold border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                title="Cambiar a versión de escritorio completa"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Escritorio</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors shadow-2xs cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* ========================================================
            MAIN SCROLLABLE CONTENT (BY TAB)
            ======================================================== */}
        <main className="flex-1 p-4 space-y-4">
          
          {/* TAB 1: QUICK CAPTURE FEED */}
          {activeTab === 'feed' && (
            <div className="space-y-3.5">
              
              {/* Quick Hero Banner */}
              <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-4 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 block">
                    Mobile Companion • N. Studios OS
                  </span>
                  <h3 className="text-base font-black leading-snug">
                    Captura Ideas & Referencias
                  </h3>
                  <p className="text-xs text-indigo-100 leading-relaxed">
                    TikTok, Reels, fotos o notas guardadas aquí llegan directo al equipo de producción.
                  </p>
                </div>
                <button
                  onClick={() => setIsCaptureModalOpen(true)}
                  className="mt-3 w-full bg-white text-indigo-700 font-bold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Capturar Nueva Referencia</span>
                </button>
              </div>

              {/* Feed Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs custom-scrollbar">
                {([
                  { id: 'all' as const, label: 'Todo' },
                  { id: 'social' as const, label: '🔗 Redes' },
                  { id: 'media' as const, label: '📸 Fotos' },
                  { id: 'notes' as const, label: '📝 Notas' },
                ]).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFeedFilter(f.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      feedFilter === f.id
                        ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Ideas Timeline */}
              {filteredIdeas.length === 0 ? (
                <div className="p-8 text-center bg-white border border-dashed border-slate-300 rounded-3xl space-y-2">
                  <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
                  <h4 className="font-bold text-xs text-slate-800">No hay referencias aún</h4>
                  <p className="text-[11px] text-slate-500">
                    Toca el botón '+' abajo para subir tu primer link de TikTok, foto o nota.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredIdeas.map((idea) => {
                    const territory = territories.find((t) => t.id === idea.targetTerritoryId);
                    const isConverted = idea.status === 'converted_to_deliverable';

                    return (
                      <div
                        key={idea.id}
                        className={`bg-white border rounded-2xl p-4 shadow-2xs space-y-2.5 transition-all relative ${
                          isConverted ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                              {idea.formatSuggested || 'Idea / Concepto'}
                            </span>
                            {territory && (
                              <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 truncate max-w-[120px]">
                                {territory.name}
                              </span>
                            )}
                            {idea.captureType === 'voice_memo' && (
                              <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                🎙️ Voz {idea.audioDurationSeconds ? `${idea.audioDurationSeconds}s` : ''}
                              </span>
                            )}
                          </div>

                          {isConverted ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>En Kanban</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => deleteSandboxIdea(idea.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                          {idea.title}
                        </h4>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {idea.notes}
                        </p>

                        {/* Photo attachment preview */}
                        {idea.attachmentUrl && (
                          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-48 flex items-center justify-center">
                            <img
                              src={idea.attachmentUrl}
                              alt={idea.title}
                              className="w-full h-auto max-h-48 object-cover"
                            />
                          </div>
                        )}

                        {/* Reference link pills */}
                        {idea.referenceUrls && idea.referenceUrls.length > 0 && (
                          <div className="space-y-1">
                            {idea.referenceUrls.map((url, uIdx) => (
                              <a
                                key={uIdx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-indigo-50 text-[10.5px] font-mono text-indigo-700 border border-slate-200 truncate max-w-full"
                              >
                                <Link className="w-3 h-3 text-indigo-600 shrink-0" />
                                <span className="truncate">{url.replace('https://', '')}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 ml-auto" />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* AI Hook suggestion */}
                        {idea.aiGeneratedBrief && (
                          <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs space-y-1">
                            <span className="text-[10px] font-bold text-indigo-700 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Hook Sugerido por Gemini:
                            </span>
                            <p className="italic text-indigo-950 text-[11.5px]">"{idea.aiGeneratedBrief.hook}"</p>
                          </div>
                        )}

                        {/* Footer Action */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {idea.createdAt.split('T')[0]}
                          </span>

                          {!isConverted ? (
                            <button
                              onClick={() => convertSandboxIdeaToDeliverable(idea.id)}
                              className="btn-primary py-1 px-3 text-xs"
                            >
                              <span>🚀 Pasar a Producción</span>
                            </button>
                          ) : (
                            <span className="text-[10.5px] text-emerald-700 font-semibold">
                              Sincronizado con Equipo
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: DRIVE VAULT MOBILE */}
          {activeTab === 'drive' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-cyan-600" />
                  <h3 className="font-bold text-xs text-slate-900">Bóveda de Documentos & Masters</h3>
                </div>
                <p className="text-[11px] text-slate-500">
                  Archivos oficiales generados por N. Studios para {brand.name}.
                </p>
              </div>

              <div className="space-y-2">
                {brandDocs.map((file) => (
                  <div
                    key={file.id}
                    className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-indigo-400 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        {file.type === 'video' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {file.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {file.sizeFormatted} • {file.createdAt}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActivePreviewFile(file)}
                      className="btn-primary py-1 px-2.5 text-xs shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: T-3 APPROVALS ON MOBILE */}
          {activeTab === 'approvals' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <h3 className="font-bold text-xs text-slate-900">Entregables en Ventana T-3</h3>
                </div>
                <p className="text-[11px] text-slate-500">
                  Piezas listas para revisión y aprobación final antes de publicación en redes.
                </p>
              </div>

              {tMinus3Deliverables.length === 0 ? (
                <div className="p-8 text-center bg-white border border-dashed border-slate-300 rounded-3xl space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-xs text-slate-800">Al día sin pendientes</h4>
                  <p className="text-[11px] text-slate-500">
                    No tienes entregables esperando aprobación en este momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tMinus3Deliverables.map((del) => {
                    const daysLeft = calculateDaysToPublish(del.publishDate);
                    return (
                      <div
                        key={del.id}
                        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {del.code}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                            T-3 ({daysLeft}d restantes)
                          </span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900">
                            {del.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Publicación programada: {del.publishDate}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleApproveDeliverable(del.id)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Aprobar</span>
                          </button>

                          <button
                            onClick={() => {
                              setApprovedToast(`Solicitud de ajuste para ${del.code} enviada al Director.`);
                              setTimeout(() => setApprovedToast(null), 3000);
                            }}
                            className="w-full btn-secondary text-xs py-2"
                          >
                            <span>Pedir Ajuste</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE & SETTINGS */}
          {activeTab === 'profile' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{currentUser.name}</h3>
                    <p className="text-xs text-slate-500">{currentUser.roleTitle}</p>
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 mt-1">
                      {currentUser.role.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Email:</span>
                    <strong className="text-slate-800 font-mono text-[11px]">{currentUser.email}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Marca Oficial:</span>
                    <strong className="text-slate-800">{brand.name} ({brand.industry})</strong>
                  </div>
                  {isClient && (
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Director de Cuentas:</span>
                      <strong className="text-indigo-700">Valeria Benítez</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Client SLA / Support Card */}
              {isClient ? (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>SLA de Producción & Soporte Nataraja</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tu cuenta cuenta con revisión garantizada en ventana T-3 y sincronización 24/7 con Google Drive Vault.
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Estado de Cuenta:</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ● Activa & Verificada
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Switch User Quick Demo */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <h4 className="font-bold text-xs text-slate-900">
                  {isClient ? 'Cambiar de Cliente Demo' : 'Cambiar de Usuario (Demo)'}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {(isClient ? users.filter((u) => u.role === 'cliente') : users.slice(0, 4)).map((u) => (
                    <button
                      key={u.id}
                      onClick={() => login(u.id)}
                      className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        currentUser.id === u.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate block font-semibold">{u.name.split(' ')[0]}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{u.roleTitle}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Desktop Link */}
              <button
                onClick={() => navigate(isClient ? '/client/hub' : '/kanban')}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold text-xs py-3 rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Monitor className="w-4 h-4" />
                <span>{isClient ? 'Abrir Hub de Marca Completo (Escritorio)' : 'Abrir Tablero Kanban (Escritorio)'}</span>
              </button>

              {/* Logout Button in Profile */}
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs py-3 rounded-2xl border border-rose-200 shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}

        </main>

        {/* ========================================================
            BOTTOM NAVIGATION BAR & FLOATING ACTION BUTTON (FAB)
            ======================================================== */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 max-w-md mx-auto shadow-lg">
          <div className="grid grid-cols-5 items-center py-1.5 px-2 relative">
            
            {/* Tab 1: Feed */}
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex flex-col items-center gap-0.5 py-1 transition-colors cursor-pointer ${
                activeTab === 'feed' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-[10px]">Feed</span>
            </button>

            {/* Tab 2: Drive */}
            <button
              onClick={() => setActiveTab('drive')}
              className={`flex flex-col items-center gap-0.5 py-1 transition-colors cursor-pointer ${
                activeTab === 'drive' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <HardDrive className="w-5 h-5" />
              <span className="text-[10px]">Drive</span>
            </button>

            {/* Central Floating Action Button (FAB) */}
            <div className="flex justify-center -mt-6">
              <button
                onClick={() => setIsCaptureModalOpen(true)}
                className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-transform cursor-pointer ring-4 ring-white"
                title="Captura Flash Rápida"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>

            {/* Tab 3: T-3 Approvals */}
            <button
              onClick={() => setActiveTab('approvals')}
              className={`flex flex-col items-center gap-0.5 py-1 transition-colors relative cursor-pointer ${
                activeTab === 'approvals' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="text-[10px]">T-3</span>
              {tMinus3Deliverables.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-5" />
              )}
            </button>

            {/* Tab 4: Profile */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-0.5 py-1 transition-colors cursor-pointer ${
                activeTab === 'profile' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px]">Perfil</span>
            </button>

          </div>
        </nav>

        {/* Modal Sheet for Flash Capture */}
        <MobileFlashCaptureModal
          isOpen={isCaptureModalOpen}
          onClose={() => setIsCaptureModalOpen(false)}
          brand={brand}
          territories={brandTerritories}
          onSaveIdea={handleSaveMobileCapture}
        />

      </div>
    </div>
  );
};
