import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useDriveVaultContext } from '../../context/DriveVaultContext';
import { Sparkles, Plus, HardDrive, CheckCircle2, Link, FileText, ExternalLink, Monitor, User, Trash2, Clock, Video, Eye, Building2, Check, LogOut, Compass, Target, ArrowRight, ShieldCheck, ChevronRight, FileSpreadsheet, Image, Music } from 'lucide-react';
import { MobileFlashCaptureModal } from './MobileFlashCaptureModal';
import { WebAdminMobileHub } from './WebAdminMobileHub';
import { MobileCaptureType, Brand, Deliverable } from '../../types';

type FeedFilterType = 'all' | 'social' | 'media' | 'notes';
type MobileTabType = 'sandbox' | 'territories' | 'drive' | 'approvals' | 'holding';

export const MobileCompanionHub: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    brands,
    organizations,
    selectedBrandId,
    setSelectedBrandId,
    territories,
    deliverables,
    sandboxIdeas,
    createSandboxIdea,
    deleteSandboxIdea,
    convertSandboxIdeaToDeliverable,
    generateAIBriefForSandboxIdea,
    moveDeliverablePhase,
    logout,
    toast,
  } = useApp();

  // If user is WebAdmin, render the dedicated WebAdmin Mobile Governance Hub
  if (currentUser.role === 'webadmin') {
    return <WebAdminMobileHub />;
  }

  const { driveFiles, driveFolders, setActivePreviewFile } = useDriveVaultContext();

  const isClient = currentUser.role === 'cliente';

  const fallbackBrand: Brand = {
    id: 'brand_1787275758106',
    name: 'Gloss Salon',
    industry: 'Belleza & Cuidado Personal',
    logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150&auto=format&fit=crop&q=80',
    primaryColor: '#e11d48',
    secondaryColor: '#881337',
    slogan: 'Alta Peluquería & Estética',
    contactPerson: 'Valeria Benítez',
    contactEmail: 'contacto@glosssalon.com',
    createdAt: new Date().toISOString(),
  };

  // Raw allowed brands
  const rawAllowedBrands = isClient && currentUser.assignedBrandIds && currentUser.assignedBrandIds.length > 0
    ? brands.filter((b) => currentUser.assignedBrandIds?.includes(b.id))
    : brands;

  // Deduplicate and filter out mock prefixes
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const allowedBrands = rawAllowedBrands.filter((b) => {
    if (!b || !b.id || !b.name) return false;
    if (b.id.startsWith('brd_')) return false;
    const norm = b.name.trim().toLowerCase();
    if (seenIds.has(b.id) || seenNames.has(norm)) return false;
    seenIds.add(b.id);
    seenNames.add(norm);
    return true;
  });

  const activeBrandId =
    selectedBrandId !== 'all' && allowedBrands.some((b) => b.id === selectedBrandId)
      ? selectedBrandId
      : (allowedBrands[0]?.id || brands[0]?.id || fallbackBrand.id);

  const brand = allowedBrands.find((b) => b.id === activeBrandId) || allowedBrands[0] || fallbackBrand;
  const brandTerritories = (territories || []).filter((t) => t.brandId === brand.id && t.active);
  const brandIdeas = (sandboxIdeas || []).filter((i) => i.brandId === brand.id);
  const brandDeliverables = (deliverables || []).filter((d) => d.brandId === brand.id);
  const brandDocs = (driveFiles || []).filter((f) => f.brandId === brand.id);
  const brandFolders = (driveFolders || []).filter((f) => f.brandId === brand.id);

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
  const [activeTab, setActiveTab] = useState<MobileTabType>('sandbox');
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [feedFilter, setFeedFilter] = useState<FeedFilterType>('all');
  const [approvedToast, setApprovedToast] = useState<string | null>(null);
  const [generatingAiId, setGeneratingAiId] = useState<string | null>(null);

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

    setApprovedToast(`¡Referencia para "${brand.name}" guardada con éxito!`);
    setTimeout(() => setApprovedToast(null), 3000);
  };

  const handleGenerateAiHook = async (ideaId: string) => {
    setGeneratingAiId(ideaId);
    try {
      await generateAIBriefForSandboxIdea(ideaId);
      toast?.success('¡Hook y ángulo creativo generado por Gemini!');
    } catch {
      toast?.error('Error al generar brief con IA');
    } finally {
      setGeneratingAiId(null);
    }
  };

  const handleApproveDeliverable = (delId: string) => {
    moveDeliverablePhase(delId, 'publicado');
    setApprovedToast('¡Entregable aprobado para publicación!');
    setTimeout(() => setApprovedToast(null), 3000);
  };

  // Filter ideas
  const filteredIdeas = brandIdeas.filter((i) => {
    if (feedFilter === 'social') return i.referenceUrls && i.referenceUrls.length > 0;
    if (feedFilter === 'media') return Boolean(i.attachmentUrl);
    if (feedFilter === 'notes') return !i.attachmentUrl && (!i.referenceUrls || i.referenceUrls.length === 0);
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center text-slate-800 antialiased font-sans">
      {/* Mobile Shell Wrapper (max-w-md for smartphone layout) */}
      <div className="w-full max-w-md min-h-screen bg-slate-50 flex flex-col justify-between shadow-2xl border-x border-slate-200 relative pb-20">
        
        {/* Top Floating Notification Toast */}
        {approvedToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-xl border border-white/20 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{approvedToast}</span>
          </div>
        )}

        {/* ========================================================
            MOBILE HEADER & HOLDING CONTEXT
            ======================================================== */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-2xs font-black text-xs shrink-0 transition-colors"
                style={{ backgroundColor: brand.primaryColor || '#4f46e5' }}
              >
                {brand.name.substring(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs font-extrabold text-slate-900 truncate">
                    {brand.name}
                  </h2>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">
                  🏢 Grupo Empresarial Gonzales
                </p>
              </div>
            </div>

            {/* Desktop Switch & Logout Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => navigate(isClient ? '/client/hub' : '/kanban')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-[11px] font-semibold border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                title="Cambiar a versión de escritorio"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
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

          {/* ========================================================
              BRAND PILLS SLIDER (HORIZONTAL SELECTOR)
              ======================================================== */}
          <div className="px-3 pb-2.5 pt-1 overflow-x-auto flex items-center gap-2 custom-scrollbar bg-slate-50/70 border-t border-slate-100">
            {allowedBrands.map((b) => {
              const isActive = b.id === brand.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBrandId(b.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 active:scale-95 ${
                    isActive
                      ? 'text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                  style={isActive ? { backgroundColor: b.primaryColor || '#4f46e5' } : {}}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isActive ? '#ffffff' : (b.primaryColor || '#4f46e5') }} />
                  <span>{b.name}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* ========================================================
            MAIN SCROLLABLE CONTENT (BY TAB)
            ======================================================== */}
        <main className="flex-1 p-4 space-y-4">
          
          {/* TAB 1: SANDBOX & FEED */}
          {activeTab === 'sandbox' && (
            <div className="space-y-3.5">
              
              {/* Quick Hero Banner with active brand theme */}
              <div
                className="rounded-3xl p-4 text-white shadow-md relative overflow-hidden transition-colors"
                style={{
                  background: `linear-gradient(135deg, ${brand.primaryColor || '#4f46e5'} 0%, ${brand.secondaryColor || '#1e1b4b'} 100%)`
                }}
              >
                <div className="relative z-10 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 block">
                    Sandbox de Marca • {brand.name}
                  </span>
                  <h3 className="text-base font-black leading-snug">
                    Captura Ideas & Referencias
                  </h3>
                  <p className="text-xs text-white/90 leading-relaxed">
                    TikToks, Reels, fotos o notas de voz llegan directo al equipo de producción de {brand.name}.
                  </p>
                </div>
                <button
                  onClick={() => setIsCaptureModalOpen(true)}
                  className="mt-3 w-full bg-white text-slate-900 font-bold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
                >
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>+ Capturar Nueva Referencia</span>
                </button>
              </div>

              {/* Feed Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs custom-scrollbar">
                {([
                  { id: 'all' as const, label: 'Todo' },
                  { id: 'social' as const, label: '🔗 Redes & TikTok' },
                  { id: 'media' as const, label: '📸 Fotos' },
                  { id: 'notes' as const, label: '📝 Notas' },
                ]).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFeedFilter(f.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      feedFilter === f.id
                        ? 'bg-slate-900 text-white shadow-2xs font-bold'
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
                  <h4 className="font-bold text-xs text-slate-800">No hay referencias en {brand.name}</h4>
                  <p className="text-[11px] text-slate-500">
                    Toca el botón '+' para subir un link de TikTok, foto o nota de voz para esta marca.
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
                        {idea.aiGeneratedBrief ? (
                          <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs space-y-1">
                            <span className="text-[10px] font-bold text-indigo-700 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Hook Sugerido por Gemini:
                            </span>
                            <p className="italic text-indigo-950 text-[11.5px]">"{idea.aiGeneratedBrief.hook}"</p>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGenerateAiHook(idea.id)}
                            disabled={generatingAiId === idea.id}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{generatingAiId === idea.id ? 'Generando brief con IA...' : 'Generar Hook & Ángulo con Gemini'}</span>
                          </button>
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

          {/* TAB 2: TERRITORIOS & ESTRATEGIA */}
          {activeTab === 'territories' && (
            <div className="space-y-3.5">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" style={{ color: brand.primaryColor || '#4f46e5' }} />
                  <h3 className="font-bold text-xs text-slate-900">Territorios de Comunicación</h3>
                </div>
                <p className="text-[11px] text-slate-500">
                  Pilares de contenido acordados para {brand.name}.
                </p>
              </div>

              {brandTerritories.length === 0 ? (
                <div className="p-8 text-center bg-white border border-dashed border-slate-300 rounded-3xl space-y-2">
                  <Compass className="w-8 h-8 text-indigo-400 mx-auto" />
                  <h4 className="font-bold text-xs text-slate-800">Sin territorios configurados</h4>
                  <p className="text-[11px] text-slate-500">
                    Los pilares estratégicos de {brand.name} están siendo definidos por la dirección creativa.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {brandTerritories.map((terr) => (
                    <div
                      key={terr.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: terr.colorTag || brand.primaryColor || '#4f46e5' }}
                          />
                          <h4 className="font-extrabold text-xs text-slate-900">{terr.name}</h4>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {terr.targetAudience || 'Audiencia Principal'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {terr.description || 'Pilar estratégico enfocado en engagement, autoridad y conversión de marca.'}
                      </p>

                      {terr.contentPillars && terr.contentPillars.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {terr.contentPillars.map((p, pIdx) => (
                            <span key={pIdx} className="text-[9.5px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                              #{p}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Objetivo:</span>
                        <strong className="text-slate-800">{terr.objective || 'Posicionamiento'}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DRIVE VAULT MOBILE */}
          {activeTab === 'drive' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-xs text-slate-900">Bóveda de Documentos & Drive</h3>
                  </div>
                  <a
                    href="https://drive.google.com/drive/folders/1mYfiTe9fwkD8OOCSeW8b63mNmUmhZZpo"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10.5px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>Google Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500">
                  Carpetas y documentos de {brand.name} con visor interactivo integrado.
                </p>
              </div>

              {/* Subfolders list */}
              {brandFolders.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block px-1">
                    Estructura Operativa ({brandFolders.length} carpetas)
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {brandFolders.map((fld) => (
                      <div
                        key={fld.id}
                        className="bg-white p-2.5 px-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base">📁</span>
                          <span className="font-semibold text-xs text-slate-800 truncate">{fld.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                          Sincronizado
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block px-1">
                  Documentos & Masters ({brandDocs.length})
                </span>
                {brandDocs.length === 0 ? (
                  <div className="p-6 text-center bg-white border border-dashed border-slate-300 rounded-2xl space-y-1.5">
                    <FileText className="w-7 h-7 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Sin archivos vinculados todavía</p>
                    <p className="text-[11px] text-slate-500">
                      Usa la versión de escritorio o el botón "+ Subir Archivo" para vincular documentos de Google Drive.
                    </p>
                  </div>
                ) : (
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
                          className="btn-primary py-1 px-2.5 text-xs shrink-0 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: T-3 APPROVALS ON MOBILE */}
          {activeTab === 'approvals' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <h3 className="font-bold text-xs text-slate-900">Entregables en Ventana T-3</h3>
                </div>
                <p className="text-[11px] text-slate-500">
                  Piezas de {brand.name} listas para revisión y aprobación final.
                </p>
              </div>

              {tMinus3Deliverables.length === 0 ? (
                <div className="p-8 text-center bg-white border border-dashed border-slate-300 rounded-3xl space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-xs text-slate-800">Al día sin pendientes</h4>
                  <p className="text-[11px] text-slate-500">
                    No tienes entregables esperando aprobación para {brand.name} en este momento.
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

          {/* TAB 5: HOLDING & PROFILE */}
          {activeTab === 'holding' && (
            <div className="space-y-3">
              {/* Holding Multibrand Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4.5 h-4.5 text-indigo-600" />
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-900">Grupo Empresarial Gonzales</h3>
                    <p className="text-[10px] text-slate-500 font-mono">Holding Principal • 4 Marcas Asignadas</p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  {allowedBrands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBrandId(b.id);
                        setActiveTab('sandbox');
                        toast?.success(`Cambiado a ${b.name}`);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        b.id === brand.id
                          ? 'border-indigo-400 bg-indigo-50/40 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: b.primaryColor || '#4f46e5' }} />
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 truncate">{b.name}</h4>
                          <span className="text-[10px] text-slate-500 truncate block">{b.industry}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* User Details */}
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
                    <span className="text-slate-500">Director de Cuentas:</span>
                    <strong className="text-indigo-700">Valeria Benítez</strong>
                  </div>
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
            
            {/* Tab 1: Sandbox */}
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`flex flex-col items-center gap-0.5 py-1 transition-colors cursor-pointer ${
                activeTab === 'sandbox' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Sparkles className="w-4.5 h-4.5" />
              <span className="text-[10px]">Sandbox</span>
            </button>

            {/* Tab 2: Territorios */}
            <button
              onClick={() => setActiveTab('territories')}
              className={`flex flex-col items-center gap-0.5 py-1 transition-colors cursor-pointer ${
                activeTab === 'territories' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Target className="w-4.5 h-4.5" />
              <span className="text-[10px]">Estrategia</span>
            </button>

            {/* Central Floating Action Button (FAB) */}
            <div className="flex justify-center -mt-6">
              <button
                onClick={() => setIsCaptureModalOpen(true)}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-transform cursor-pointer ring-4 ring-white"
                title="Capturar Referencia"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>

            {/* Tab 3: Drive */}
            <button
              onClick={() => setActiveTab('drive')}
              className={`flex flex-col items-center gap-0.5 py-1 transition-colors cursor-pointer ${
                activeTab === 'drive' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <HardDrive className="w-4.5 h-4.5" />
              <span className="text-[10px]">Drive</span>
            </button>

            {/* Tab 4: Holding / Perfil */}
            <button
              onClick={() => setActiveTab('holding')}
              className={`flex flex-col items-center gap-0.5 py-1 transition-colors cursor-pointer ${
                activeTab === 'holding' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Building2 className="w-4.5 h-4.5" />
              <span className="text-[10px]">Holding</span>
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
