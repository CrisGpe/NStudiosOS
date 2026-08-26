import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useDriveVaultContext } from '../context/DriveVaultContext';
import { useBrandsContext } from '../context/BrandsContext';
import {
  Sparkles,
  Lightbulb,
  Plus,
  ArrowRight,
  ExternalLink,
  Trash2,
  FileText,
  CheckCircle2,
  Target,
  HardDrive,
  Compass,
  Link,
  Building2,
  ShieldCheck,
  Lock,
  Send,
} from 'lucide-react';
import { ClientOrganizationTeamManager } from './client/ClientOrganizationTeamManager';
import { CreateSandboxIdeaModal } from './client/CreateSandboxIdeaModal';
import { RequestTerritoryReviewModal } from './client/RequestTerritoryReviewModal';

export const ClientBrandHub: React.FC = () => {
  const {
    currentUser,
    brands,
    organizations,
    selectedBrandId,
    setSelectedBrandId,
    territories,
    deliverables,
    campaigns,
    sandboxIdeas,
    createSandboxIdea,
    deleteSandboxIdea,
    convertSandboxIdeaToDeliverable,
    generateAIBriefForSandboxIdea,
    canClientPerform,
    setActiveTab,
    addAuditLog,
    toast,
  } = useApp();

  const { driveFiles, setActivePreviewFile } = useDriveVaultContext();
  const { digitalAssets } = useBrandsContext();

  // Determine allowed brands for this user
  const isClientRole = currentUser.role === 'cliente';
  const allowedBrands = isClientRole && currentUser.assignedBrandIds && currentUser.assignedBrandIds.length > 0
    ? brands.filter((b) => currentUser.assignedBrandIds!.includes(b.id))
    : brands;

  // Active brand resolution
  const activeBrandId = (selectedBrandId && selectedBrandId !== 'all' && allowedBrands.some((b) => b.id === selectedBrandId))
    ? selectedBrandId
    : (allowedBrands[0]?.id || brands[0]?.id || 'brd_apex');

  const brand = brands.find((b) => b.id === activeBrandId) || allowedBrands[0] || brands[0];
  const userOrg = organizations.find((o) => o.id === currentUser.clientOrganizationId) ||
    organizations.find((o) => (brand?.id && o.brandIds.includes(brand.id)) || (brand?.clientOrganizationId && o.id === brand.clientOrganizationId)) ||
    (currentUser.role === 'webadmin' || currentUser.role === 'director' ? organizations[0] : undefined);

  const brandTerritories = territories.filter((t) => t.brandId === brand?.id && t.active);
  const brandIdeas = sandboxIdeas.filter((i) => i.brandId === brand?.id);
  const brandDeliverables = deliverables.filter((d) => d.brandId === brand?.id);
  const brandCampaigns = campaigns.filter((c) => c.brandId === brand?.id);
  const brandDocs = driveFiles.filter((f) => f.brandId === brand?.id && f.type === 'document');
  const brandAssets = digitalAssets.filter((a) => a.brandId === brand?.id);

  const [activeSubTab, setActiveSubTab] = useState<'sandbox' | 'identity' | 'drive' | 'organization'>('sandbox');
  const [showCreateIdeaModal, setShowCreateIdeaModal] = useState(false);
  const [showTerritoryReviewModal, setShowTerritoryReviewModal] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState<string | null>(null);

  const handleCreateIdeaFromModal = (data: {
    brandId: string;
    title: string;
    notes: string;
    targetTerritoryId?: string;
    formatSuggested: string;
    referenceUrls: string[];
    ideaType: 'campaign' | 'video' | 'graphic';
  }) => {
    createSandboxIdea({
      brandId: data.brandId,
      title: data.title,
      notes: data.notes,
      targetTerritoryId: data.targetTerritoryId,
      formatSuggested: data.formatSuggested,
      referenceUrls: data.referenceUrls,
    });
    toast.success('¡Idea guardada exitosamente en el Sandbox de la marca!');
  };

  const handleRequestTerritoryReview = (data: {
    brandId: string;
    requestType: 'propose_new' | 'modify_existing';
    territoryName: string;
    existingTerritoryId?: string;
    motive: string;
    notes: string;
  }) => {
    addAuditLog(
      'SOLICITUD_REVISION_TERRITORIO',
      `Solicitud de ${data.requestType === 'propose_new' ? 'nuevo territorio' : 'ajuste de territorio'} (${data.territoryName}): Motivo: ${data.motive}`,
      currentUser.id,
      'brand',
      data.brandId,
      currentUser.name,
      currentUser.role
    );
    toast.success('Tu propuesta ha sido enviada al Director Creativo de la agencia para su revisión.');
  };

  const handleTriggerAi = async (ideaId: string) => {
    setIsGeneratingAi(ideaId);
    await generateAIBriefForSandboxIdea(ideaId);
    setIsGeneratingAi(null);
  };

  const handleConvertToDeliverable = (ideaId: string) => {
    convertSandboxIdeaToDeliverable(ideaId);
  };

  if (!brand) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-slate-500">
        No se encontró información de marca disponible.
      </div>
    );
  }

  return (
    <div className="space-y-3.5 text-slate-800">
      
      {/* Top Holding Context & Brand Cards Selector */}
      {allowedBrands.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-2.5">
          {userOrg && (
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {userOrg.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono font-semibold">
                      {allowedBrands.length} {allowedBrands.length === 1 ? 'Unidad de Negocio' : 'Unidades de Negocio'}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-slate-500">
                    Selecciona una marca para gestionar su Sandbox de Ideas, Territorios y Documentos
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveSubTab('organization')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100/70 px-2.5 py-1 rounded-lg border border-indigo-200/60"
              >
                <span>Gestión de Equipo & Permisos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Brand Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {allowedBrands.map((b) => {
              const isSelected = b.id === brand.id;
              const bIdeasCount = sandboxIdeas.filter((i) => i.brandId === b.id).length;
              const bTerrCount = territories.filter((t) => t.brandId === b.id && t.active).length;

              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBrandId(b.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/25 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Brand Color Header line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: b.primaryColor }}
                  />

                  <div className="flex items-center gap-2 mb-1.5 pt-0.5 min-w-0">
                    <img
                      src={b.logo}
                      alt={b.name}
                      className="w-6 h-6 rounded-md object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <span className={`text-xs truncate ${isSelected ? 'font-extrabold text-slate-900' : 'font-bold text-slate-700'}`}>
                      {b.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[9.5px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="font-medium">{bTerrCount} Territorios</span>
                    <span className={`px-1.5 py-0.2 rounded-full font-mono font-bold ${bIdeasCount > 0 ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-50 text-slate-500'}`}>
                      {bIdeasCount} {bIdeasCount === 1 ? 'idea' : 'ideas'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Brand Hero Masthead */}
      <div
        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs relative overflow-hidden"
        style={{ borderTop: `4px solid ${brand.primaryColor}` }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shadow-xs"
                style={{ backgroundColor: brand.primaryColor }}
              />
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-500">
                Portal de Marca & Co-Creación • {brand.industry}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {brand.name}
              </h1>
            </div>

            <p className="text-xs text-slate-600 italic">
              "{brand.slogan || 'Innovación y excelencia en producción de contenido'}"
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center min-w-[95px] shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">En Pipeline</span>
              <span className="text-lg font-extrabold font-mono text-indigo-600">
                {brandDeliverables.length}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center min-w-[95px] shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">En Sandbox</span>
              <span className="text-lg font-extrabold font-mono text-purple-600">
                {brandIdeas.length}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center min-w-[95px] shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Campañas</span>
              <span className="text-lg font-extrabold font-mono text-rose-600">
                {brandCampaigns.length}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveSubTab('sandbox')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeSubTab === 'sandbox'
                ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Sandbox Co-Creativo & Ideas ({brandIdeas.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('identity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeSubTab === 'identity'
                ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Identidad & Territorios ({brandTerritories.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('drive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeSubTab === 'drive'
                ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Documentos Oficiales Drive ({brandDocs.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('organization')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeSubTab === 'organization'
                ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>🏢 Mi Organización & Equipo</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: SANDBOX CO-CREATIVO & BÓVEDA DE IDEAS
          ======================================================== */}
      {activeSubTab === 'sandbox' && (
        <div className="space-y-4">
          
          {/* Header & Add Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Bóveda de Ideas, Tendencias & Referencias de {brand.name}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Guarda enlaces de TikTok, Reels, audios o notas espontáneas. Cuando estés listo, transfórmalas en entregables con 1 clic.
              </p>
            </div>

            {canClientPerform('sandbox', brand.id) ? (
              <button
                onClick={() => setShowCreateIdeaModal(true)}
                className="btn-primary"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nueva Idea / Referencia</span>
              </button>
            ) : (
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Solo Lectura (Pre-prod)</span>
              </span>
            )}
          </div>

          {/* Ideas Grid */}
          {brandIdeas.length === 0 ? (
            <div className="p-12 text-center bg-white border border-dashed border-slate-300 rounded-2xl space-y-3">
              <Lightbulb className="w-10 h-10 text-amber-500 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">Tu Sandbox de Ideas está vacío</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Utiliza este espacio para guardar ideas sin presión técnica. Puedes agregar enlaces de inspiración o notas rápidas.
              </p>
              <button
                onClick={() => setShowCreateIdeaModal(true)}
                className="btn-primary mx-auto"
              >
                + Crear Primera Idea
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {brandIdeas.map((idea) => {
                const territory = territories.find((t) => t.id === idea.targetTerritoryId);
                const isConverted = idea.status === 'converted_to_deliverable';

                return (
                  <div
                    key={idea.id}
                    className={`bg-white border rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-3 transition-all relative ${
                      isConverted
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-slate-200 hover:border-indigo-400 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          {idea.formatSuggested || 'Idea / Concepto'}
                        </span>

                        {isConverted ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>En Pipeline</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => deleteSandboxIdea(idea.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar idea"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs leading-snug">
                        {idea.title}
                      </h4>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {idea.notes}
                      </p>

                      {/* Territory Badge */}
                      {territory && (
                        <div className="flex items-center gap-1 text-[10.5px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                          <Target className="w-3 h-3 text-indigo-600" />
                          <span>Territorio: <strong className="text-slate-900">{territory.name}</strong></span>
                        </div>
                      )}

                      {/* Reference URLs */}
                      {idea.referenceUrls && idea.referenceUrls.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-slate-100">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">
                            Referencias ({idea.referenceUrls.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {idea.referenceUrls.map((url, uIdx) => (
                              <a
                                key={uIdx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-[10px] font-mono text-indigo-700 border border-slate-200 flex items-center gap-1 max-w-[200px] truncate transition-colors"
                              >
                                <Link className="w-2.5 h-2.5" />
                                <span className="truncate">{url.replace('https://', '')}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Brief Suggestion Box */}
                      {idea.aiGeneratedBrief && (
                        <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-[11px] space-y-1">
                          <div className="flex items-center gap-1 text-indigo-700 font-bold text-[10px]">
                            <Sparkles className="w-3 h-3" />
                            <span>Hook Sugerido (0-3s):</span>
                          </div>
                          <p className="text-indigo-950 italic font-medium">
                            "{idea.aiGeneratedBrief.hook}"
                          </p>
                          <p className="text-[10px] text-slate-600 pt-0.5">
                            {idea.aiGeneratedBrief.narrativeAngle}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {!idea.aiGeneratedBrief ? (
                        <button
                          onClick={() => handleTriggerAi(idea.id)}
                          disabled={isGeneratingAi === idea.id}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10.5px] font-semibold border border-purple-200 cursor-pointer shadow-2xs transition-colors"
                        >
                          <Sparkles className={`w-3 h-3 ${isGeneratingAi === idea.id ? 'animate-spin' : ''}`} />
                          <span>{isGeneratingAi === idea.id ? 'Optimizando...' : 'Brand Strategist IA'}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          Optimizado por IA
                        </span>
                      )}

                      {!isConverted ? (
                        <button
                          onClick={() => handleConvertToDeliverable(idea.id)}
                          className="btn-primary py-1 px-2.5 text-xs"
                        >
                          <span>🚀 Enviar al Pipeline</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveTab('kanban')}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Ver en Kanban</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ========================================================
          TAB 2: IDENTIDAD VISUAL & TERRITORIOS ACTIVOS
          ======================================================== */}
      {activeSubTab === 'identity' && (
        <div className="space-y-4">
          
          {/* Identity Card */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Manual de Identidad & ADN de {brand.name}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Paleta Cromática Primaria</span>
                <div className="flex items-center gap-2 pt-1">
                  <div
                    className="w-8 h-8 rounded-lg shadow-2xs ring-1 ring-slate-200"
                    style={{ backgroundColor: brand.primaryColor }}
                  />
                  <div>
                    <span className="font-bold font-mono block text-slate-900">{brand.primaryColor}</span>
                    <span className="text-[10px] text-slate-500">Color Primario Oficial</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Contacto de Cuentas</span>
                <div className="pt-1">
                  <span className="font-bold text-slate-900 block">{brand.contactPerson}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{brand.contactEmail}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Canales Digitales</span>
                <div className="pt-1 font-mono text-[11px] text-indigo-700 font-semibold">
                  {brandAssets.length} activos vinculados
                </div>
              </div>
            </div>
          </div>

          {/* Territories Table & Cards */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span>Territorios de Comunicación Activos ({brandTerritories.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilares temáticos aprobados que guían la creación de guiones y piezas audiovisuales.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTerritoryReviewModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Propón un nuevo pilar de comunicación o solicita ajustes a los existentes"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Solicitar Revisión / Proponer Territorio</span>
                </button>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                  Regla ≥ 3 Cumplida
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {brandTerritories.map((terr, idx) => (
                <div
                  key={terr.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-indigo-700">
                      Territorio #{idx + 1}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>

                  <h4 className="font-bold text-xs text-slate-900">
                    {terr.name}
                  </h4>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {terr.objective}
                  </p>

                  <div className="pt-2 border-t border-slate-200 space-y-1 text-[10px]">
                    <span className="text-slate-500 font-bold block uppercase">Audiencia:</span>
                    <span className="text-slate-800">{terr.targetAudience}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 3: DOCUMENTOS OFICIALES EN GOOGLE DRIVE
          ======================================================== */}
      {activeSubTab === 'drive' && (
        <div className="space-y-4">
          
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-cyan-600" />
              <span>Documentos Oficiales Generados en Google Workspace</span>
            </h3>
            <p className="text-xs text-slate-500">
              Documentos maestros generados por el motor Folder-as-Code de la agencia vinculados a tu cuenta.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {brandDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between hover:border-indigo-400 hover:shadow-md transition-all shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <span className="text-[9px] font-mono text-slate-500">{doc.sizeFormatted}</span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900">
                      {doc.name}
                    </h4>

                    {doc.generatedDocument && (
                      <p className="text-xs text-slate-600">
                        {doc.generatedDocument.title}
                      </p>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between">
                    <button
                      onClick={() => setActivePreviewFile(doc)}
                      className="btn-primary py-1 px-2.5 text-xs"
                    >
                      Previsualizar
                    </button>

                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                      title="Abrir en Google Drive"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 4: MI ORGANIZACIÓN & EQUIPO (HOLDING / MULTI-MARCA)
          ======================================================== */}
      {activeSubTab === 'organization' && (
        <ClientOrganizationTeamManager />
      )}

      {/* Modal 1: Create Idea in 2 Steps */}
      <CreateSandboxIdeaModal
        brand={brand}
        territories={brandTerritories}
        isOpen={showCreateIdeaModal}
        onClose={() => setShowCreateIdeaModal(false)}
        onSubmit={handleCreateIdeaFromModal}
      />

      {/* Modal 2: Request Territory Revision */}
      <RequestTerritoryReviewModal
        brand={brand}
        territories={brandTerritories}
        isOpen={showTerritoryReviewModal}
        onClose={() => setShowTerritoryReviewModal(false)}
        onSubmit={handleRequestTerritoryReview}
      />

    </div>
  );
};
