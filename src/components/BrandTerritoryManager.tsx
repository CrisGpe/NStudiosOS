import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Globe,
  Smartphone,
  BookOpen,
  FileText,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  X,
} from 'lucide-react';
import {
  Brand,
  CommunicationTerritory,
  DigitalAsset,
  AssetType,
} from '../types';
import { InlineDeleteConfirm } from './ui/InlineDeleteConfirm';

export const BrandTerritoryManager: React.FC = () => {
  const {
    brands,
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
    toast,
    openAiModalWithContext,
    setIsCreateBrandModalOpen,
  } = useApp();

  const [activeBrandId, setActiveBrandId] = useState<string>(brands[0]?.id || '');
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

  const currentBrand = brands.find((b) => b.id === activeBrandId) || brands[0];
  const brandTerritories = territories.filter((t) => t.brandId === currentBrand?.id);
  const brandAssets = digitalAssets.filter((a) => a.brandId === currentBrand?.id);
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
      toast.success('Nuevo territorio de comunicación registrado.');
    }

    setIsTerritoryModalOpen(false);
  };

  const handleDeleteTerritory = (id: string) => {
    const res = deleteTerritory(id);
    if (!res.success) {
      toast.warning(res.error || 'No se puede eliminar el territorio.', 'Regla de Territorios Mínimos');
    } else {
      toast.success('Territorio eliminado.');
    }
  };

  // Open Asset Edit/Create Modal
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
      
      {/* Brand Horizontal Carousel / Selector - High Density */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
        {brands.map((brand) => {
          const isSelected = brand.id === currentBrand?.id;
          const terrStatus = validateBrandTerritories(brand.id);

          return (
            <button
              key={brand.id}
              onClick={() => setActiveBrandId(brand.id)}
              className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-white border-blue-600 ring-1 ring-blue-500 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              {/* Brand Color Header line */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: brand.primaryColor }}
              />

              <div className="flex items-center gap-2 mb-1.5 pt-0.5">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-6 h-6 rounded-md object-cover ring-1 ring-slate-200"
                />
                <span className="font-bold text-xs text-slate-900 truncate">{brand.name}</span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                <span className="font-medium">{terrStatus.activeCount} Territorios</span>
                {terrStatus.isValid ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                )}
              </div>
            </button>
          );
        })}

        {/* Add Brand Action Card */}
        {(currentUser.role === 'webadmin' || currentUser.role === 'director') && (
          <button
            onClick={() => setIsCreateBrandModalOpen(true)}
            className="p-2.5 rounded-lg border border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50 text-indigo-700 font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-5 h-5 text-indigo-600" />
            <span>+ Nueva Marca</span>
          </button>
        )}
      </div>

      {/* Current Brand Active Header */}
      {currentBrand && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-4">
          
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
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 italic font-serif">"{currentBrand.slogan}"</p>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Contacto: <span className="text-slate-700 font-medium">{currentBrand.contactPerson}</span> ({currentBrand.contactEmail})
                </div>
              </div>
            </div>

            {/* Strict Territory Validation Badge */}
            <div
              className={`p-2.5 rounded-lg border max-w-sm text-xs ${
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
                  className={`bg-slate-50/70 border rounded-lg p-3 space-y-2.5 relative group transition-all ${
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
                      <h4 className="text-xs font-bold text-slate-900">{territory.name}</h4>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openTerritoryModal(territory)}
                        className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <InlineDeleteConfirm
                        title="¿Eliminar territorio?"
                        description={territory.name}
                        onConfirm={() => handleDeleteTerritory(territory.id)}
                        triggerClassName="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer transition-colors"
                        triggerIcon={<Trash2 className="w-3 h-3" />}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {territory.description}
                  </p>

                  <div className="space-y-1 text-[11px] pt-1.5 border-t border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-700">🎯 Objetivo:</span>{' '}
                      <span className="text-slate-600">{territory.objective}</span>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-700">👥 Audiencia:</span>{' '}
                      <span className="text-slate-600">{territory.targetAudience}</span>
                    </div>
                  </div>

                  {/* Content Pillars */}
                  <div className="pt-1">
                    <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">Pilares de Contenido</div>
                    <div className="flex flex-wrap gap-1">
                      {territory.contentPillars.map((p, pIdx) => (
                        <span
                          key={pIdx}
                          className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100 text-slate-500 font-mono">
                    <span>Estado:</span>
                    <span
                      className={`font-bold ${
                        territory.active ? 'text-emerald-700' : 'text-slate-500'
                      }`}
                    >
                      {territory.active ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Activos Digitales de Marca */}
          {activeSubTab === 'assets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {brandAssets.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-500 text-xs border border-dashed border-slate-300 rounded-lg bg-slate-50">
                  No hay activos digitales registrados para esta marca.
                </div>
              ) : (
                brandAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-3 space-y-2 relative group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-slate-50 flex items-center justify-center border border-slate-200">
                          {getAssetIcon(asset.type)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{asset.name}</h4>
                          <span className="text-[9px] uppercase font-semibold text-slate-500">
                            {asset.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openAssetModal(asset)}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <InlineDeleteConfirm
                          title="¿Eliminar asset digital?"
                          description={asset.name}
                          onConfirm={() => {
                            deleteDigitalAsset(asset.id);
                            toast.success(`Asset '${asset.name}' eliminado permanentemente.`);
                          }}
                          triggerClassName="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer transition-colors"
                          triggerIcon={<Trash2 className="w-3 h-3" />}
                        />
                      </div>
                    </div>

                    {asset.notes && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {asset.notes}
                      </p>
                    )}

                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium truncate max-w-[180px]"
                      >
                        <span className="truncate">{asset.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                      <span className="text-[10px] font-mono text-slate-500">{asset.updatedAt}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      )}

      {/* Modal: Crear / Editar Territorio */}
      {isTerritoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95 text-slate-800 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingTerritory ? 'Editar Territorio de Comunicación' : 'Nuevo Territorio de Comunicación'}
              </h3>
              <button
                onClick={() => setIsTerritoryModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTerritorySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Nombre del Territorio *</label>
                <input
                  type="text"
                  value={terrName}
                  onChange={(e) => setTerrName(e.target.value)}
                  placeholder="Ej: Rendimiento Extremo & Atletas Pro"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Descripción del Territorio</label>
                <textarea
                  value={terrDescription}
                  onChange={(e) => setTerrDescription(e.target.value)}
                  rows={2}
                  placeholder="Describe la temática general, arquetipo de marca y narrativa..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Objetivo Estratégico</label>
                <input
                  type="text"
                  value={terrObjective}
                  onChange={(e) => setTerrObjective(e.target.value)}
                  placeholder="Ej: Posicionar la marca en segmento premium y generar conversión"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                  Pilares de Contenido (Separados por coma)
                </label>
                <input
                  type="text"
                  value={terrPillars}
                  onChange={(e) => setTerrPillars(e.target.value)}
                  placeholder="Ej: Rutinas Pro, Biometría y Fisiología, Entrevistas a Embajadores"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Audiencia Objetivo (Buyer Persona)</label>
                <input
                  type="text"
                  value={terrAudience}
                  onChange={(e) => setTerrAudience(e.target.value)}
                  placeholder="Ej: Maratónicos, deportistas y jóvenes profesionales de 25-40 años"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terrActiveCheck"
                  checked={terrActive}
                  onChange={(e) => setTerrActive(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="terrActiveCheck" className="text-slate-700 font-medium cursor-pointer text-xs">
                  Territorio Activo (Aporta al cumplimiento del mínimo de 3)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTerritoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer active:scale-98"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-98"
                >
                  {editingTerritory ? 'Guardar Cambios' : 'Crear Territorio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear / Editar Activo Digital */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95 text-slate-800 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingAsset ? 'Editar Activo Digital' : 'Registrar Activo Digital'}
              </h3>
              <button
                onClick={() => setIsAssetModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssetSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Nombre del Activo *</label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="Ej: Portal Web Oficial & E-commerce"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Tipo de Activo *</label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value as AssetType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none cursor-pointer"
                >
                  <option value="website">Sitio Web / E-Commerce</option>
                  <option value="mobile_app">Aplicación Móvil (iOS / Android)</option>
                  <option value="landing_page">Landing Page de Campaña</option>
                  <option value="brand_guidelines">Manual de Identidad & Guía de Marca</option>
                  <option value="catalog">Catálogo de Productos PDF / Digital</option>
                  <option value="media_kit">Media Kit & Recursos de Prensa</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">URL / Enlace del Activo *</label>
                <input
                  type="url"
                  value={assetUrl}
                  onChange={(e) => setAssetUrl(e.target.value)}
                  placeholder="https://ejemplo.com/recurso"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Notas Técnicas / Credenciales</label>
                <textarea
                  value={assetNotes}
                  onChange={(e) => setAssetNotes(e.target.value)}
                  rows={2}
                  placeholder="Detalles sobre tecnología, accesos o lineamientos..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer active:scale-98"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-98"
                >
                  {editingAsset ? 'Actualizar Activo' : 'Registrar Activo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

