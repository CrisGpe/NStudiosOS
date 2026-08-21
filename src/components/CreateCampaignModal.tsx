import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Target,
  Plus,
  Trash2,
  BarChart3,
  ShoppingBag,
  Users,
  Megaphone,
} from 'lucide-react';
import { CampaignKPI, CampaignType, CampaignStatus } from '../types';

export const CreateCampaignModal: React.FC = () => {
  const {
    isCreateCampaignModalOpen,
    setIsCreateCampaignModalOpen,
    createCampaign,
    brands,
    deliverables,
    selectedBrandId,
    currentUser,
  } = useApp();

  const [name, setName] = useState('');
  const [brandId, setBrandId] = useState(
    currentUser.role === 'cliente'
      ? currentUser.assignedBrandIds[0] || brands[0]?.id || ''
      : selectedBrandId || brands[0]?.id || ''
  );
  const [objective, setObjective] = useState('');
  const [campaignType, setCampaignType] = useState<CampaignType>('performance_paid_ads');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [productionBudgetUSD, setProductionBudgetUSD] = useState<number>(3500);
  const [adSpendUSD, setAdSpendUSD] = useState<number>(5000);
  const [targetROAS, setTargetROAS] = useState<number>(4.2);
  const [targetCPAUSD, setTargetCPAUSD] = useState<number>(14.5);
  const [status, setStatus] = useState<CampaignStatus>('planning');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    'Meta Ads (Reels)',
    'TikTok Ads',
  ]);
  const [selectedDeliverableIds, setSelectedDeliverableIds] = useState<string[]>([]);

  const [kpis, setKpis] = useState<Omit<CampaignKPI, 'id'>[]>([
    { metric: 'Retorno de Inversión (ROAS)', targetValue: 4.2, currentValue: 0, unit: 'x' },
    { metric: 'Costo por Adquisición (CPA)', targetValue: 14.5, currentValue: 0, unit: 'S/.' },
    { metric: 'Visualizaciones 3s Retención', targetValue: 120000, currentValue: 0, unit: 'vistas' },
  ]);

  if (!isCreateCampaignModalOpen) return null;

  const brandDeliverables = deliverables.filter((d) => d.brandId === brandId);

  const toggleChannel = (channel: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const toggleDeliverable = (id: string) => {
    setSelectedDeliverableIds((prev) =>
      prev.includes(id) ? prev.filter((delId) => delId !== id) : [...prev, id]
    );
  };

  const handleAddKpi = () => {
    setKpis((prev) => [
      ...prev,
      { metric: 'Nuevo KPI', targetValue: 100, currentValue: 0, unit: 'unidades' },
    ]);
  };

  const handleRemoveKpi = (index: number) => {
    setKpis((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateKpi = (index: number, field: string, value: any) => {
    setKpis((prev) =>
      prev.map((k, idx) => (idx === index ? { ...k, [field]: value } : k))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !objective.trim() || !brandId) {
      alert('Por favor completa los campos obligatorios de la campaña.');
      return;
    }

    const campaignKpis: CampaignKPI[] = kpis.map((k, idx) => ({
      ...k,
      id: `kpi_${Date.now()}_${idx}`,
    }));

    const totalBudget = (Number(productionBudgetUSD) || 0) + (Number(adSpendUSD) || 0);

    createCampaign({
      brandId,
      name: name.trim(),
      description: objective.trim(),
      objective: objective.trim(),
      campaignType,
      startDate,
      endDate,
      budgetUSD: totalBudget,
      productionBudgetUSD: Number(productionBudgetUSD) || 0,
      adSpendUSD: Number(adSpendUSD) || 0,
      targetROAS: Number(targetROAS) || undefined,
      targetCPAUSD: Number(targetCPAUSD) || undefined,
      adChannels: selectedChannels,
      spentUSD: 0,
      status,
      deliverableIds: selectedDeliverableIds,
      kpis: campaignKpis,
    });

    setIsCreateCampaignModalOpen(false);
  };

  const availableChannels = [
    'Meta Ads (Instagram)',
    'Meta Ads (Reels)',
    'TikTok Ads',
    'Google Ads / PMax',
    'YouTube 4K In-Stream',
    'LinkedIn Ads',
  ];

  return (
    <div
      onClick={() => setIsCreateCampaignModalOpen(false)}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-slate-200 text-slate-800 animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Target className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Crear Nueva Campaña Comercial Digital</h3>
              <p className="text-[11px] text-slate-500">
                Configuración de pauta publicitaria (Paid Ads), entregables vinculados y métricas ROAS
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateCampaignModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nombre de la Campaña *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Lanzamiento Kinetic Aero Q3 2026"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Marca / Cliente *
              </label>
              <select
                value={brandId}
                onChange={(e) => {
                  setBrandId(e.target.value);
                  setSelectedDeliverableIds([]);
                }}
                disabled={currentUser.role === 'cliente'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer disabled:opacity-50"
              >
                {brands.length === 0 ? (
                  <option value="">Sin marcas disponibles</option>
                ) : (
                  brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Campaign Type Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
              Tipo de Campaña Comercial *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'performance_paid_ads', label: 'Paid Media (ROAS)', icon: BarChart3 },
                { id: 'ecommerce_launch', label: 'E-commerce Launch', icon: ShoppingBag },
                { id: 'lead_generation', label: 'Lead Gen (B2B)', icon: Users },
                { id: 'brand_awareness', label: 'Brand Awareness', icon: Megaphone },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = campaignType === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setCampaignType(t.id as CampaignType)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-[10.5px] leading-tight">{t.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Objetivo Estratégico & Comercial *
            </label>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              rows={2}
              placeholder="Ej: Generar 15k conversiones de compra directa y mantener ROAS > 4.0x..."
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Fecha de Cierre *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Presupuesto Producción (S/.)
              </label>
              <input
                type="number"
                value={productionBudgetUSD}
                onChange={(e) => setProductionBudgetUSD(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Pauta Publicitaria (S/.)
              </label>
              <input
                type="number"
                value={adSpendUSD}
                onChange={(e) => setAdSpendUSD(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-rose-700 font-bold font-mono focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                ROAS Objetivo (Retorno x)
              </label>
              <input
                type="number"
                step="0.1"
                value={targetROAS}
                onChange={(e) => setTargetROAS(Number(e.target.value))}
                placeholder="4.0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-emerald-700 font-bold font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                CPA Máximo Permitido (S/.)
              </label>
              <input
                type="number"
                step="0.5"
                value={targetCPAUSD}
                onChange={(e) => setTargetCPAUSD(Number(e.target.value))}
                placeholder="12.5"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-indigo-700 font-bold font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Estado Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CampaignStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
              >
                <option value="planning">🟡 En Planificación</option>
                <option value="active">🟢 Activa en Circulación</option>
                <option value="completed">🔵 Finalizada</option>
                <option value="paused">⚪ Pausada</option>
              </select>
            </div>
          </div>

          {/* Ad Channels Selector */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-[11px] font-semibold text-slate-700">
              Canales de Distribución & Paid Media:
            </label>
            <div className="flex flex-wrap gap-2">
              {availableChannels.map((chan) => {
                const isSelected = selectedChannels.includes(chan);
                return (
                  <button
                    type="button"
                    key={chan}
                    onClick={() => toggleChannel(chan)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs border border-indigo-600'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {chan}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Linked Deliverables Multi-Check */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-semibold text-slate-700">
              Vincular Entregables del Pipeline ({brandDeliverables.length} disponibles):
            </label>
            {brandDeliverables.length === 0 ? (
              <p className="text-slate-400 text-xs italic bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                No hay entregables registrados para esta marca aún.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
                {brandDeliverables.map((del) => {
                  const isChecked = selectedDeliverableIds.includes(del.id);
                  return (
                    <div
                      key={del.id}
                      onClick={() => toggleDeliverable(del.id)}
                      className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-98 ${
                        isChecked
                          ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-mono font-bold text-[10px] text-indigo-600 block truncate">
                          {del.code}
                        </span>
                        <span className="text-xs truncate block text-slate-800 font-medium">{del.title}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dynamic KPIs Setup */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-semibold text-slate-700">
                Métricas Clave de Rendimiento (KPIs Objetivos)
              </label>
              <button
                type="button"
                onClick={handleAddKpi}
                className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar KPI</span>
              </button>
            </div>

            <div className="space-y-2">
              {kpis.map((kpi, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-50/70 p-2.5 rounded-xl border border-slate-200"
                >
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={kpi.metric}
                      onChange={(e) => handleUpdateKpi(idx, 'metric', e.target.value)}
                      placeholder="Nombre de la Métrica"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      value={kpi.targetValue}
                      onChange={(e) => handleUpdateKpi(idx, 'targetValue', Number(e.target.value))}
                      placeholder="Meta"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={kpi.unit}
                      onChange={(e) => handleUpdateKpi(idx, 'unit', e.target.value)}
                      placeholder="Unidad (vistas, %)"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveKpi(idx)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateCampaignModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer active:scale-98"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-98 flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Crear Campaña Comercial</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
