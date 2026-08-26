import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Plus, ShieldCheck, AlertTriangle, Layers, Globe, Smartphone, BookOpen, FileText, ExternalLink, Edit2, Sparkles, X, Folder, ChevronRight, ArrowLeft } from 'lucide-react';
import { Brand, CommunicationTerritory, DigitalAsset, AssetType, ClientOrganization } from '../types';
import { deriveOrganizationsFromBrands } from '../context/BrandsContext';
import { InlineDeleteConfirm } from './ui/InlineDeleteConfirm';
import { CreateHoldingModal } from './CreateHoldingModal';

export const BrandTerritoryManager: React.FC = () => {
  const {
    brands,
    organizations,
    territories,
    digitalAssets,
    createTerritory,
    updateTerritory,
    deleteTerritory,
    validateBrandTerritories,
    createDigitalAsset,
    updateDigitalAsset,
    deleteDigitalAsset,
    currentUser,
    selectedOrgId,
    setSelectedOrgId,
    selectedBrandId,
    setSelectedBrandId,
    toast,
    openAiModalWithContext,
    setIsCreateBrandModalOpen,
  } = useApp();

  const [navLevel, setNavLevel] = useState<'holdings' | 'brands' | 'detail'>('detail');
  const [isCreateHoldingModalOpen, setIsCreateHoldingModalOpen] = useState(false);

  const [activeBrandId, setActiveBrandId] = useState<string>(
    (selectedBrandId && selectedBrandId !== 'all') ? selectedBrandId : (brands[0]?.id || '')
  );
  const [activeSubTab, setActiveSubTab] = useState<'territories' | 'assets'>('territories');

  // Territory Modal State
  const [isTerritoryModalOpen, setIsTerritoryModalOpen] = useState(false);
  const [editingTerritory, setEditingTerritory] = useState<CommunicationTerritory | null>(null);
  const [terrName, setTerrName] = useState('');
  const [terrDescription, setTerrDescription] = useState('');
  const [terrObjective, setTerrObjective] = useState('');
  const [terrPillars, setTerrPillars] = useState('');
  const [terrAudience, setTerrAudience] = useState('');
  const [terrActive, setTerrActive] = useState(true);

  // Asset Modal State
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<DigitalAsset | null>(null);
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('website');
  const [assetUrl, setAssetUrl] = useState('');
  const [assetNotes, setAssetNotes] = useState('');

  // Effective organizations (guaranteed non-empty)
  const effectiveOrgs: ClientOrganization[] =
    organizations.length > 0 ? organizations : deriveOrganizationsFromBrands(brands);

  const currentOrg = effectiveOrgs.find((o) => o.id === selectedOrgId) || effectiveOrgs[0] || { id: 'org_grupo_gonzales', name: 'Grupo Empresarial Gonzales', brandIds: [] };

  // Filter brands based on selected organization/holding
  const displayedBrands = selectedOrgId === 'all'
    ? brands
    : (brands.filter((b) => b.clientOrganizationId === selectedOrgId || (currentOrg?.brandIds || []).includes(b.id)).length > 0
      ? brands.filter((b) => b.clientOrganizationId === selectedOrgId || (currentOrg?.brandIds || []).includes(b.id))
      : brands);

  const currentBrand = (brands || []).find((b) => b.id === (selectedBrandId && selectedBrandId !== 'all' ? selectedBrandId : activeBrandId)) || (displayedBrands && displayedBrands[0]) || (brands && brands[0]);
  const brandTerritories = (territories || []).filter((t) => t.brandId === currentBrand?.id);
  const brandAssets = (digitalAssets || []).filter((a) => a.brandId === currentBrand?.id);
  const validationStatus = validateBrandTerritories(currentBrand?.id);

  // Open Territory Edit/Create Modal
  const openTerritoryModal = (territory?: CommunicationTerritory) => {
    if (territory) {
      setEditingTerritory(territory);
      setTerrName(territory.name);
      setTerrDescription(territory.description);
      setTerrObjective(territory.objective);
      setTerrPillars(territory.contentPillars.join(', '));
      setTerrAudience(territory.targetAudience);
      setTerrActive(territory.active);
    } else {
      setEditingTerritory(null);
      setTerrName('');
      setTerrDescription('');
      setTerrObjective('');
      setTerrPillars('');
      setTerrAudience('');
      setTerrActive(true);
    }
    setIsTerritoryModalOpen(true);
  };

  const handleTerritorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terrName.trim()) return;

    const pillarsArray = terrPillars
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (editingTerritory) {
      const res = updateTerritory(editingTerritory.id, {
        name: terrName,
        description: terrDescription,
        objective: terrObjective,
        contentPillars: pillarsArray.length > 0 ? pillarsArray : ['Pilar General'],
        targetAudience: terrAudience,
        active: terrActive,
      });

      if (!res.success) {
        toast.warning(res.error || 'No se pudo actualizar el territorio.', 'Validación de Territorios');
        return;
      }
      toast.success('Territorio actualizado correctamente.');
    } else {
      const res = createTerritory({
        brandId: currentBrand.id,
        name: terrName,
        description: terrDescription,
        objective: terrObjective,
        contentPillars: pillarsArray.length > 0 ? pillarsArray : ['Pilar General'],
        targetAudience: terrAudience,
        active: terrActive,
        colorTag: currentBrand.primaryColor || '#6366f1',
      });

      if (!res.success) {
        toast.warning(res.error || 'No se pudo crear el territorio.', 'Validación de Territorios');
        return;
      }
      toast.success('Territorio de comunicación creado.');
    }

    setIsTerritoryModalOpen(false);
  };

  const openAssetModal = (asset?: DigitalAsset) => {
    if (asset) {
      setEditingAsset(asset);
      setAssetName(asset.name);
      setAssetType(asset.type);
      setAssetUrl(asset.url);
      setAssetNotes(asset.notes || '');
    } else {
      setEditingAsset(null);
      setAssetName('');
      setAssetType('website');
      setAssetUrl('');
      setAssetNotes('');
    }
    setIsAssetModalOpen(true);
  };

  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim() || !assetUrl.trim()) return;

    if (editingAsset) {
      updateDigitalAsset(editingAsset.id, {
        name: assetName,
        type: assetType,
        url: assetUrl,
        notes: assetNotes,
      });
    } else {
      createDigitalAsset({
        brandId: currentBrand.id,
        name: assetName,
        type: assetType,
        url: assetUrl,
        status: 'active',
        notes: assetNotes,
      });
    }

    setIsAssetModalOpen(false);
  };

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case 'website':
      case 'landing_page':
        return <Globe className="w-4 h-4 text-blue-600" />;
      case 'mobile_app':
        return <Smartphone className="w-4 h-4 text-purple-600" />;
      case 'brand_guidelines':
      case 'catalog':
        return <BookOpen className="w-4 h-4 text-amber-600" />;
      case 'media_kit':
      case 'social_channel':
        return <FileText className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* 🧭 Top Drive-Vault Breadcrumbs Bar */}
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
                  {displayedBrands.length}
                </span>
              </button>
            </>
          )}

          {navLevel === 'detail' && currentBrand && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-900 font-bold border border-slate-200/80">
                <img
                  src={currentBrand.logo}
                  alt={currentBrand.name}
                  className="w-4 h-4 rounded-md object-cover ring-1 ring-slate-200"
                />
                <span>{currentBrand.name}</span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons on Breadcrumb Bar */}
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

      {/* 📁 VIEW LEVEL 1: Holdings Directory (Folder-style Cards) */}
      {navLevel === 'holdings' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Folder className="w-5 h-5 text-indigo-600" />
                <span>Directorio de Holdings Empresariales & Clientes</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Explora las organizaciones matrices para gestionar sus marcas, territorios y activos digitales
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
                      {org.legalName && (
                        <span className="text-[11px] text-slate-400 block font-medium">
                          {org.legalName}
                        </span>
                      )}
                      {org.contactEmail && (
                        <span className="text-[11px] text-slate-500 block font-mono mt-0.5">
                          ✉️ {org.contactEmail}
                        </span>
                      )}
                    </div>

                    {/* Preview of Brands inside */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1.5">
                        Marcas en cartera:
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
                    <span>Explorar Marcas del Holding</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}

            {/* Create Holding Action Card */}
            {(currentUser.role === 'webadmin' || currentUser.role === 'director') && (
              <div
                onClick={() => setIsCreateHoldingModalOpen(true)}
                className="bg-indigo-50/40 hover:bg-indigo-50/80 border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer group min-h-[220px]"
              >
                <div className="p-3.5 rounded-2xl bg-white text-indigo-600 shadow-xs group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-indigo-900">
                    + Registrar Nuevo Holding
                  </h4>
                  <p className="text-xs text-indigo-600/80 mt-1 max-w-xs">
                    Crea una nueva organización para agrupar marcas comerciales
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🌿 VIEW LEVEL 2: Brands Directory within Selected Holding */}
      {navLevel === 'brands' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                  {currentOrg?.name} — Cartera de Marcas
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Selecciona una marca para configurar sus territorios de comunicación y activos
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
            {displayedBrands.map((brand) => {
              const terrStatus = validateBrandTerritories(brand.id);
              const bAssets = digitalAssets.filter((a) => a.brandId === brand.id);

              return (
                <div
                  key={brand.id}
                  onClick={() => {
                    setActiveBrandId(brand.id);
                    setSelectedBrandId(brand.id);
                    setNavLevel('detail');
                  }}
                  className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-400 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Color Stripe */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: brand.primaryColor }}
                  />

                  <div className="space-y-3 pt-1">
                    <div className="flex items-center gap-3">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 shadow-2xs shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-extrabold text-sm text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {brand.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {brand.industry}
                        </span>
                      </div>
                    </div>

                    {brand.slogan && (
                      <p className="text-xs text-slate-500 italic line-clamp-1">
                        "{brand.slogan}"
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-500 font-medium">Territorios</span>
                        <span className="font-mono font-bold text-slate-800">{terrStatus.activeCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-500 font-medium">Activos</span>
                        <span className="font-mono font-bold text-slate-800">{bAssets.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Gestionar Territorios</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}

            {/* Add Brand Action Card */}
            {(currentUser.role === 'webadmin' || currentUser.role === 'director') && (
              <div
                onClick={() => setIsCreateBrandModalOpen(true)}
                className="bg-indigo-50/40 hover:bg-indigo-50/80 border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer group min-h-[180px]"
              >
                <div className="p-3 rounded-2xl bg-white text-indigo-600 shadow-xs group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-indigo-900">
                    + Nueva Marca
                  </h4>
                  <p className="text-[11px] text-indigo-600/80 mt-0.5">
                    Añadir unidad comercial a este holding
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔍 VIEW LEVEL 3: Brand Detail Workspace */}
      {navLevel === 'detail' && (
        <div className="space-y-4">
          {/* Sister Brands Quick-Switcher Bar */}
          {displayedBrands.length > 1 && (
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-2 shadow-2xs flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase font-mono px-2 shrink-0">
                Marcas de {currentOrg?.name}:
              </span>
              {displayedBrands.map((b) => {
                const isSelected = b.id === currentBrand?.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      setActiveBrandId(b.id);
                      setSelectedBrandId(b.id);
                    }}
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

          {/* Current Brand Active Header */}
          {currentBrand && (() => {
            const activeOrg = effectiveOrgs.find((o) => o.id === currentBrand.clientOrganizationId || (o.brandIds || []).includes(currentBrand.id)) || currentOrg;
            return (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentBrand.logo}
                      alt={currentBrand.name}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shadow-2xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900">{currentBrand.name}</h2>
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: currentBrand.primaryColor }}
                          title="Color de Marca"
                        />
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                          {currentBrand.industry}
                        </span>
                        {activeOrg && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            <span>Holding: {activeOrg.name}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 italic font-serif">"{currentBrand.slogan}"</p>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Contacto: <span className="text-slate-700 font-medium">{currentBrand.contactPerson}</span> ({currentBrand.contactEmail})
                      </div>
                    </div>
                  </div>

                  {/* Strict Territory Validation Badge */}
                  <div
                    className={`p-2.5 rounded-xl border max-w-sm text-xs ${
                      validationStatus.isValid
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      {validationStatus.isValid ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <span>Regla de Negocio: Min. 3 Territorios Activos</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{validationStatus.message}</p>
                  </div>
                </div>

                {/* Sub-tabs: Territorios vs Activos */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      onClick={() => setActiveSubTab('territories')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        activeSubTab === 'territories'
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Territorios ({brandTerritories.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveSubTab('assets')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        activeSubTab === 'assets'
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Activos Digitales ({brandAssets.length})</span>
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {activeSubTab === 'territories' ? (
                      <>
                        <button
                          onClick={() =>
                            openAiModalWithContext({
                              action: 'ideate',
                              brandId: currentBrand.id,
                            })
                          }
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>Brainstorming IA</span>
                        </button>

                        <button
                          onClick={() => openTerritoryModal()}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Nuevo Territorio</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => openAssetModal()}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Registrar Activo</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Tab 1: Territorios de Comunicación */}
                {activeSubTab === 'territories' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {brandTerritories.map((territory) => (
                      <div
                        key={territory.id}
                        className={`bg-slate-50/70 border rounded-lg p-3 space-y-2.5 relative group transition-all hover:z-20 ${
                          territory.active
                            ? 'border-slate-200 hover:border-blue-400 bg-white shadow-2xs'
                            : 'border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: territory.colorTag || currentBrand.primaryColor }}
                            />
                            <span className="font-bold text-xs text-slate-900">{territory.name}</span>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openTerritoryModal(territory)}
                              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Editar Territorio"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <InlineDeleteConfirm
                              itemId={territory.id}
                              itemType="territorio"
                              itemName={territory.name}
                              onConfirm={() => deleteTerritory(territory.id)}
                            />
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 leading-snug">{territory.description}</p>

                        <div className="space-y-1 text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                          <div>
                            <span className="font-semibold text-slate-700">🎯 Objetivo: </span>
                            {territory.objective}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">👥 Audiencia: </span>
                            {territory.targetAudience}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Pilares: </span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {territory.contentPillars.map((p, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[9px]"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[9px] text-slate-400">
                          <span>
                            Estado:{' '}
                            <span
                              className={`font-semibold uppercase ${
                                territory.active ? 'text-emerald-600' : 'text-slate-400'
                              }`}
                            >
                              {territory.active ? 'Activo' : 'Inactivo'}
                            </span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 2: Activos Digitales */}
                {activeSubTab === 'assets' && (
                  <div className="space-y-3">
                    {brandAssets.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">No hay activos digitales registrados para esta marca.</p>
                        <button
                          onClick={() => openAssetModal()}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                        >
                          + Registrar Primer Activo
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {brandAssets.map((asset) => (
                          <div
                            key={asset.id}
                            className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-3 space-y-2 shadow-2xs group relative transition-all hover:z-20"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="p-1 rounded bg-slate-50 border border-slate-100">
                                  {getAssetIcon(asset.type)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-xs text-slate-900">{asset.name}</h4>
                                  <span className="text-[9px] font-mono text-slate-400 uppercase">
                                    {asset.type.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openAssetModal(asset)}
                                  className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <InlineDeleteConfirm
                                  itemId={asset.id}
                                  itemType="activo"
                                  itemName={asset.name}
                                  onConfirm={() => deleteDigitalAsset(asset.id)}
                                />
                              </div>
                            </div>

                            {asset.notes && <p className="text-[11px] text-slate-500">{asset.notes}</p>}

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <a
                                href={asset.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 text-[11px]"
                              >
                                <span>Abrir Enlace</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium uppercase">
                                {asset.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Territory Modal */}
      {isTerritoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                {editingTerritory ? 'Editar Territorio' : 'Nuevo Territorio de Comunicación'}
              </h3>
              <button
                onClick={() => setIsTerritoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTerritorySubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nombre del Territorio *</label>
                <input
                  type="text"
                  required
                  value={terrName}
                  onChange={(e) => setTerrName(e.target.value)}
                  placeholder="Ej. Sostenibilidad & Vanguardia"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Descripción / Enfoque</label>
                <textarea
                  rows={2}
                  value={terrDescription}
                  onChange={(e) => setTerrDescription(e.target.value)}
                  placeholder="De qué habla la marca en este territorio..."
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Objetivo Estratégico</label>
                <input
                  type="text"
                  value={terrObjective}
                  onChange={(e) => setTerrObjective(e.target.value)}
                  placeholder="Ej. Posicionar a la marca como líder ético"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Pilares de Contenido (separados por coma)
                </label>
                <input
                  type="text"
                  value={terrPillars}
                  onChange={(e) => setTerrPillars(e.target.value)}
                  placeholder="Ej. Eco-Friendly, Trazabilidad, Orgánico"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Audiencia Objetivo</label>
                <input
                  type="text"
                  value={terrAudience}
                  onChange={(e) => setTerrAudience(e.target.value)}
                  placeholder="Ej. Consumidores conscientes 25-40 años"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terrActive"
                  checked={terrActive}
                  onChange={(e) => setTerrActive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="terrActive" className="text-slate-700 font-medium">
                  Territorio Activo (cuenta para regla de consistencia de 3 territorios)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTerritoryModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  {editingTerritory ? 'Guardar Cambios' : 'Crear Territorio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Modal */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                {editingAsset ? 'Editar Activo Digital' : 'Registrar Activo Digital'}
              </h3>
              <button
                onClick={() => setIsAssetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssetSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nombre del Activo *</label>
                <input
                  type="text"
                  required
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="Ej. Sitio Web Oficial / Manual de Marca"
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tipo de Activo</label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value as AssetType)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                >
                  <option value="website">🌐 Sitio Web</option>
                  <option value="landing_page">📄 Landing Page</option>
                  <option value="mobile_app">📱 Aplicación Móvil</option>
                  <option value="brand_guidelines">📘 Manual de Marca</option>
                  <option value="catalog">📚 Catálogo de Productos</option>
                  <option value="media_kit">📑 Media Kit</option>
                  <option value="social_channel">📱 Canal Social</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">URL / Enlace *</label>
                <input
                  type="url"
                  required
                  value={assetUrl}
                  onChange={(e) => setAssetUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notas / Especificaciones</label>
                <textarea
                  rows={2}
                  value={assetNotes}
                  onChange={(e) => setAssetNotes(e.target.value)}
                  placeholder="Acceso, credenciales o consideraciones..."
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  {editingAsset ? 'Guardar Cambios' : 'Registrar Activo'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
