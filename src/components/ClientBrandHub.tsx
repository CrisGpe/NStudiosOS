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
  Folder,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { ClientOrganizationTeamManager } from './client/ClientOrganizationTeamManager';
import { CreateSandboxIdeaModal } from './client/CreateSandboxIdeaModal';
import { RequestTerritoryReviewModal } from './client/RequestTerritoryReviewModal';
import { deriveOrganizationsFromBrands } from '../context/BrandsContext';
import { ClientOrganization } from '../types';
import { CreateHoldingModal } from './CreateHoldingModal';

export const ClientBrandHub: React.FC = () => {
  const {
    currentUser,
    brands,
    organizations,
    selectedOrgId,
    setSelectedOrgId,
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
    setIsCreateBrandModalOpen,
  } = useApp();

  const { driveFiles, setActivePreviewFile } = useDriveVaultContext();
  const { digitalAssets } = useBrandsContext();

  const [navLevel, setNavLevel] = useState<'holdings' | 'brands' | 'detail'>('detail');
  const [isCreateHoldingModalOpen, setIsCreateHoldingModalOpen] = useState(false);

  // Effective organizations (guaranteed non-empty)
  const effectiveOrgs: ClientOrganization[] =
    organizations.length > 0 ? organizations : deriveOrganizationsFromBrands(brands);

  const isClientRole = currentUser.role === 'cliente';
  const currentOrg = effectiveOrgs.find((o) => o.id === (isClientRole ? currentUser.clientOrganizationId : selectedOrgId)) || effectiveOrgs[0] || { id: 'org_grupo_gonzales', name: 'Grupo Empresarial Gonzales', brandIds: [] };

  // Determine allowed brands for this user / holding
  const allowedBrands = isClientRole && currentUser.assignedBrandIds && currentUser.assignedBrandIds.length > 0
    ? brands.filter((b) => currentUser.assignedBrandIds!.includes(b.id))
    : isClientRole && currentUser.clientOrganizationId
    ? brands.filter((b) => b.clientOrganizationId === currentUser.clientOrganizationId || (currentOrg?.brandIds || []).includes(b.id))
    : (selectedOrgId === 'all'
      ? brands
      : (brands.filter((b) => b.clientOrganizationId === selectedOrgId || (currentOrg?.brandIds || []).includes(b.id)).length > 0
        ? brands.filter((b) => b.clientOrganizationId === selectedOrgId || (currentOrg?.brandIds || []).includes(b.id))
        : brands));

  // Active brand resolution
  const activeBrandId = (selectedBrandId && selectedBrandId !== 'all' && allowedBrands.some((b) => b.id === selectedBrandId))
    ? selectedBrandId
    : (allowedBrands[0]?.id || brands[0]?.id || 'brd_apex');

  const brand = brands.find((b) => b.id === activeBrandId) || allowedBrands[0] || brands[0];
  const userOrg = effectiveOrgs.find((o) => o.id === currentUser.clientOrganizationId) ||
    effectiveOrgs.find((o) => (brand?.id && o.brandIds?.includes(brand.id)) || (brand?.clientOrganizationId && o.id === brand.clientOrganizationId)) ||
    currentOrg;

  const brandTerritories = (territories || []).filter((t) => t.brandId === brand?.id && t.active);
  const brandIdeas = (sandboxIdeas || []).filter((i) => i.brandId === brand?.id);
  const brandDeliverables = (deliverables || []).filter((d) => d.brandId === brand?.id);
  const brandCampaigns = (campaigns || []).filter((c) => c.brandId === brand?.id);
  const brandDocs = (driveFiles || []).filter((f) => f.brandId === brand?.id && f.type === 'document');
  const brandAssets = (digitalAssets || []).filter((a) => a.brandId === brand?.id);

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
    try {
      await generateAIBriefForSandboxIdea(ideaId);
      toast.success('¡Propuesta técnica generada con Inteligencia Artificial!');
    } catch {
      toast.error('Error al generar la propuesta con IA.');
    } finally {
      setIsGeneratingAi(null);
    }
  };

  const handleConvertToDeliverable = (ideaId: string) => {
    if (!canClientPerform('production', brand?.id)) {
      toast.error('No tienes permisos para enviar ideas al pipeline de producción.');
      return;
    }
    convertSandboxIdeaToDeliverable(ideaId);
    toast.success('¡Idea transformada en Entregable activo en el Pipeline!');
  };

  if (!brand) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm">
        <Building2 className="w-12 h-12 text-indigo-500 animate-pulse mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Cargando Espacio de Marca...</h2>
        <p className="text-sm text-slate-500">
          Sincronizando información de holdings y unidades de negocio.
        </p>
      </div>
    );
  }

  if (allowedBrands.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Sin Marcas Asignadas</h2>
        <p className="text-sm text-slate-500">
          No tienes acceso a ninguna marca en este momento. Contacta al administrador del sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 text-slate-800">
      {/* 🧭 Top Drive-Vault Breadcrumbs Bar */}
      {!isClientRole && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-2.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setSelectedOrgId('all');
                setNavLevel('holdings');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                navLevel === 'holdings'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Holdings & Clientes ({effectiveOrgs.length})</span>
            </button>

            {currentOrg && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrgId(currentOrg.id);
                    setNavLevel('brands');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    navLevel === 'brands'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{currentOrg.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/80 text-slate-700 font-mono font-bold">
                    {allowedBrands.length}
                  </span>
                </button>
              </>
            )}

            {navLevel === 'detail' && brand && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-900 font-bold border border-slate-200/80">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-4 h-4 rounded-md object-cover ring-1 ring-slate-200"
                  />
                  <span>{brand.name}</span>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {navLevel === 'holdings' && (currentUser.role === 'webadmin' || currentUser.role === 'director') && (
              <button
                onClick={() => setIsCreateHoldingModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-xs hover:shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nuevo Holding</span>
              </button>
            )}

            {navLevel === 'brands' && (currentUser.role === 'webadmin' || currentUser.role === 'director') && (
              <button
                onClick={() => setIsCreateBrandModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-xs hover:shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nueva Marca</span>
              </button>
            )}

            {navLevel === 'detail' && (
              <button
                onClick={() => setNavLevel('brands')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ver todas las marcas del holding</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 📁 VIEW LEVEL 1: Holdings Directory */}
      {navLevel === 'holdings' && !isClientRole && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Folder className="w-5 h-5 text-indigo-600" />
                <span>Holdings & Cuentas de Cliente</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Selecciona una organización matriz para entrar a sus Sandboxes de Marca y Co-Creación
              </p>
            </div>
            {(currentUser.role === 'webadmin' || currentUser.role === 'director') && (
              <button
                onClick={() => setIsCreateHoldingModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Crear Nuevo Holding</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {effectiveOrgs.map((org) => {
              const orgBrands = brands.filter((b) => b.clientOrganizationId === org.id || (org.brandIds || []).includes(b.id));

              return (
                <div
                  key={org.id}
                  onClick={() => {
                    setSelectedOrgId(org.id);
                    setNavLevel('brands');
                  }}
                  className="bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:scale-105 transition-transform">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 group-hover:bg-indigo-50 text-slate-700 group-hover:text-indigo-700 text-xs font-mono font-bold border border-slate-200">
                        {orgBrands.length} {orgBrands.length === 1 ? 'Marca' : 'Marcas'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                        {org.name}
                      </h3>
                      {org.contactEmail && (
                        <span className="text-[11px] text-slate-500 block font-mono mt-0.5">
                          ✉️ {org.contactEmail}
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1.5">
                        Marcas del holding:
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {orgBrands.map((b) => (
                          <div
                            key={b.id}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700"
                          >
                            <img src={b.logo} alt="" className="w-3.5 h-3.5 rounded object-cover" />
                            <span>{b.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Entrar al Sandbox del Holding</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}

            {/* Create Holding Action Card */}
            {(currentUser.role === 'webadmin' || currentUser.role === 'director') && (
              <div
                onClick={() => setIsCreateHoldingModalOpen(true)}
                className="bg-indigo-50/40 hover:bg-indigo-50/80 border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer group min-h-[200px]"
              >
                <div className="p-3.5 rounded-2xl bg-white text-indigo-600 shadow-xs group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-indigo-900">
                    + Registrar Nuevo Holding
                  </h4>
                  <p className="text-xs text-indigo-600/80 mt-1 max-w-xs">
                    Crea una nueva organización para co-crear con sus marcas
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🌿 VIEW LEVEL 2: Brands Directory within Selected Holding */}
      {navLevel === 'brands' && !isClientRole && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                  {currentOrg?.name} — Marcas en Sandbox
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Selecciona una marca para abrir su espacio de ideas, territorios y documentos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setNavLevel('holdings')}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
              >
                ← Cambiar de Holding
              </button>
              {(currentUser.role === 'webadmin' || currentUser.role === 'director') && (
                <button
                  onClick={() => setIsCreateBrandModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Nueva Marca en {currentOrg?.name}</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {allowedBrands.map((b) => {
              const bIdeasCount = sandboxIdeas.filter((i) => i.brandId === b.id).length;
              const bTerrCount = territories.filter((t) => t.brandId === b.id && t.active).length;

              return (
                <div
                  key={b.id}
                  onClick={() => {
                    setSelectedBrandId(b.id);
                    setNavLevel('detail');
                  }}
                  className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-400 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: b.primaryColor }}
                  />

                  <div className="space-y-3 pt-1">
                    <div className="flex items-center gap-3">
                      <img
                        src={b.logo}
                        alt={b.name}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 shadow-2xs shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-extrabold text-sm text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {b.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {b.industry}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-500 font-medium">Ideas</span>
                        <span className="font-mono font-bold text-purple-700">{bIdeasCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-500 font-medium">Territorios</span>
                        <span className="font-mono font-bold text-indigo-700">{bTerrCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Abrir Sandbox de Marca</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}

            {/* Add Brand Card */}
            {(currentUser.role === 'webadmin' || currentUser.role === 'director') && (
              <div
                onClick={() => setIsCreateBrandModalOpen(true)}
                className="bg-indigo-50/40 hover:bg-indigo-50/80 border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer group min-h-[170px]"
              >
                <div className="p-3 rounded-2xl bg-white text-indigo-600 shadow-xs group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-indigo-900">
                    + Nueva Marca
                  </h4>
                  <p className="text-[11px] text-indigo-600/80 mt-0.5">
                    Añadir marca comercial
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔍 VIEW LEVEL 3: Brand Detail Sandbox Workspace */}
      {(navLevel === 'detail' || isClientRole) && (
        <div className="space-y-3.5">
          {/* Sister Brands Quick-Switcher Bar (within the same holding) */}
          {allowedBrands.length > 1 && (
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-2 shadow-2xs flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase font-mono px-2 shrink-0">
                Marcas de {userOrg?.name || currentOrg?.name}:
              </span>
              {allowedBrands.map((b) => {
                const isSelected = b.id === brand.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrandId(b.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs scale-[1.02]'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/70'
                    }`}
                  >
                    <img src={b.logo} alt="" className="w-4 h-4 rounded-md object-cover" />
                    <span>{b.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Active Brand Header & Counter Badges */}
          <div
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3"
            style={{ borderTop: `4px solid ${brand.primaryColor}` }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 shadow-2xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                      Portal de Marca & Co-Creación • {brand.industry}
                    </span>
                  </div>
                  <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <span>{brand.name}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: brand.primaryColor }}
                    />
                  </h1>
                  {brand.slogan && (
                    <p className="text-xs text-slate-500 italic mt-0.5">"{brand.slogan}"</p>
                  )}
                </div>
              </div>

              {/* Counters */}
              <div className="flex items-center gap-2 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">En Pipeline</span>
                  <span className="font-extrabold text-slate-900">{brandDeliverables.length}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-purple-600 block font-mono">En Sandbox</span>
                  <span className="font-extrabold text-purple-700">{brandIdeas.length}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 block font-mono">Campañas</span>
                  <span className="font-extrabold text-indigo-700">{brandCampaigns.length}</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveSubTab('sandbox')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeSubTab === 'sandbox'
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Sandbox Co-Creativo & Ideas ({brandIdeas.length})</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('identity')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeSubTab === 'identity'
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Identidad & Territorios ({brandTerritories.length})</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('drive')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeSubTab === 'drive'
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Documentos Oficiales Drive ({brandDocs.length})</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('organization')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeSubTab === 'organization'
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Mi Organización & Equipo</span>
                </button>
              </div>

              {activeSubTab === 'sandbox' && (
                <button
                  onClick={() => setShowCreateIdeaModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Nueva Idea / Referencia</span>
                </button>
              )}
            </div>
          </div>

          {/* SubTab 1: Sandbox Co-Creativo */}
          {activeSubTab === 'sandbox' && (
            <div className="space-y-3">
              {brandIdeas.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-2xs">
                  <div className="p-3 bg-amber-50 text-amber-500 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">Tu Sandbox de Ideas está vacío</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Utiliza este espacio para guardar ideas sin presión técnica. Puedes agregar enlaces de inspiración o notas rápidas.
                  </p>
                  <button
                    onClick={() => setShowCreateIdeaModal(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
                  >
                    + Crear Primera Idea
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {brandIdeas.map((idea) => {
                    const ideaTerr = territories.find((t) => t.id === idea.targetTerritoryId);
                    return (
                      <div
                        key={idea.id}
                        className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between transition-all"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-slate-900 text-sm leading-tight">{idea.title}</h4>
                            <button
                              onClick={() => deleteSandboxIdea(idea.id)}
                              className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                              title="Eliminar idea"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {idea.notes && <p className="text-xs text-slate-600 line-clamp-3">{idea.notes}</p>}

                          <div className="flex flex-wrap gap-1 pt-1">
                            {ideaTerr && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold flex items-center gap-1">
                                <Target className="w-2.5 h-2.5" />
                                {ideaTerr.name}
                              </span>
                            )}
                            {idea.formatSuggested && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                                {idea.formatSuggested}
                              </span>
                            )}
                          </div>

                          {idea.referenceUrls && idea.referenceUrls.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 space-y-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                                Referencias:
                              </span>
                              {idea.referenceUrls.map((url, idx) => (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 truncate block"
                                >
                                  <Link className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{url}</span>
                                </a>
                              ))}
                            </div>
                          )}

                          {idea.aiGeneratedBrief && (
                            <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900 space-y-1">
                              <span className="font-bold flex items-center gap-1 text-purple-700 text-[11px]">
                                <Sparkles className="w-3.5 h-3.5" /> Propuesta IA Generada
                              </span>
                              <p className="text-[11px] leading-relaxed text-purple-950">{idea.aiGeneratedBrief ? (idea.aiGeneratedBrief.narrativeAngle || idea.aiGeneratedBrief.hook) : ''}</p>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleTriggerAi(idea.id)}
                            disabled={isGeneratingAi === idea.id}
                            className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isGeneratingAi === idea.id ? 'Generando...' : 'Optimizar con IA'}</span>
                          </button>

                          <button
                            onClick={() => handleConvertToDeliverable(idea.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer transition-all"
                          >
                            <span>Enviar a Producción</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SubTab 2: Identidad & Territorios */}
          {activeSubTab === 'identity' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-indigo-600" />
                      <span>Territorios de Comunicación Activos ({brandTerritories.length})</span>
                    </h3>
                    <button
                      onClick={() => setShowTerritoryReviewModal(true)}
                      className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> Proponer Ajuste / Nuevo Territorio
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {brandTerritories.map((t) => (
                      <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: t.colorTag || brand.primaryColor }}
                          />
                          <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                        </div>
                        <p className="text-xs text-slate-600">{t.description}</p>
                        {t.contentPillars && t.contentPillars.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {t.contentPillars.map((p, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                                {p}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Digital Assets Sidebar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span>Activos Digitales ({brandAssets.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {brandAssets.map((asset) => (
                      <a
                        key={asset.id}
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
                      >
                        <div>
                          <span className="font-bold text-xs text-slate-900 block group-hover:text-indigo-600">
                            {asset.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono uppercase">
                            {asset.type}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 3: Documentos Oficiales Drive */}
          {activeSubTab === 'drive' && (
            <div className="space-y-3">
              {brandDocs.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2 shadow-2xs">
                  <HardDrive className="w-8 h-8 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-800 text-sm">No hay documentos cargados en Drive Vault</h3>
                  <p className="text-xs text-slate-500">
                    Los entregables, manuales y contratos oficiales aparecerán aquí sincronizados con Google Drive.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {brandDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setActivePreviewFile(doc)}
                      className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-4 shadow-2xs flex items-center justify-between cursor-pointer group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-900 block group-hover:text-indigo-600 truncate max-w-[180px]">
                            {doc.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {doc.sizeFormatted || 'Drive Vault'}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SubTab 4: Mi Organización & Equipo */}
          {activeSubTab === 'organization' && userOrg && (
            <ClientOrganizationTeamManager organizationId={userOrg.id} />
          )}
        </div>
      )}

      {/* Modals */}
      {brand && (
        <>
          <CreateSandboxIdeaModal
            isOpen={showCreateIdeaModal}
            onClose={() => setShowCreateIdeaModal(false)}
            brand={brand}
            territories={brandTerritories}
            onSubmit={handleCreateIdeaFromModal}
          />
          <RequestTerritoryReviewModal
            isOpen={showTerritoryReviewModal}
            onClose={() => setShowTerritoryReviewModal(false)}
            brand={brand}
            existingTerritories={brandTerritories}
            onSubmit={handleRequestTerritoryReview}
          />
        </>
      )}

      {/* Create Holding Modal */}
      <CreateHoldingModal
        isOpen={isCreateHoldingModalOpen}
        onClose={() => setIsCreateHoldingModalOpen(false)}
        onHoldingCreated={(newOrgId) => {
          setSelectedOrgId(newOrgId);
          setNavLevel('brands');
        }}
      />
    </div>
  );
};
