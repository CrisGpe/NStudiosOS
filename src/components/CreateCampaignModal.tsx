import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Target,
  Plus,
  DollarSign,
  Trash2,
  BarChart3,
  Megaphone,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { CampaignStatus, CampaignKPI, CampaignType } from '../types';

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

  const initialBrand = currentUser.role === 'cliente' && currentUser.assignedBrandIds?.[0]
    ? currentUser.assignedBrandIds[0]
    : selectedBrandId !== 'all'
    ? selectedBrandId
    : brands[0]?.id || '';

  const [brandId, setBrandId] = useState(initialBrand);
  const [campaignType, setCampaignType] = useState<CampaignType>('performance_paid_ads');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [objective, setObjective] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
  );
  const [productionBudgetUSD, setProductionBudgetUSD] = useState<number>(10000);
  const [adSpendUSD, setAdSpendUSD] = useState<number>(15000);
  const [targetROAS, setTargetROAS] = useState<number>(4.0);
  const [targetCPAUSD, setTargetCPAUSD] = useState<number>(12.5);
  const [status, setStatus] = useState<CampaignStatus>('active');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    'Meta Ads (Instagram)',
    'TikTok Ads',
  ]);
  const [selectedDeliverableIds, setSelectedDeliverableIds] = useState<string[]>([]);
  
  const [kpis, setKpis] = useState<Omit<CampaignKPI, 'id'>[]>([
    { metric: 'Entregables Producidos', targetValue: 3, currentValue: 0, unit: 'spots' },
    { metric: 'Alcance Estimado', targetValue: 300000, currentValue: 0, unit: 'vistas' },
    { metric: 'Tasa de Interacción (CTR)', targetValue: 4.0, currentValue: 0, unit: '%' },
  ]);

  if (!isCreateCampaignModalOpen) return null;

  const brandDeliverables = deliverables.filter((d) => d.brandId === brandId);

  const toggleDeliverable = (delId: string) => {
    setSelectedDeliverableIds((prev) =>
      prev.includes(delId) ? prev.filter((id) => id !== delId) : [...prev, delId]
    );
  };

  const toggleChannel = (channel: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const handleAddKpi = () => {
    setKpis((prev) => [
      ...prev,
      { metric: 'Nueva Métrica', targetValue: 100, currentValue: 0, unit: 'unidades' },
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
      description: description.trim() || objective.trim(),
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in-scale"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel-elevated rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-white/15 text-slate-100"
      >
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Crear Nueva Campaña Comercial Digital</h3>
              <p className="text-[11px] text-slate-400">
                Configuración de pauta publicitaria (Paid Ads), entregables vinculados y métricas ROAS
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateCampaignModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Nombre de la Campaña *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Lanzamiento Kinetic Aero Q3 2026"
                required
                className="input-impeccable"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Marca / Cliente *
              </label>
              <select
                value={brandId}
                onChange={(e) => {
                  setBrandId(e.target.value);
                  setSelectedDeliverableIds([]);
                }}
                disabled={currentUser.role === 'cliente'}
                className="input-impeccable cursor-pointer"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Campaign Type Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
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
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center transition-all ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20'
                        : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10.5px] leading-tight">{t.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Objetivo Estratégico & Comercial *
            </label>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              rows={2}
              placeholder="Ej: Generar 15k conversiones de compra directa y mantener ROAS > 4.0x..."
              required
              className="input-impeccable"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="input-impeccable"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Fecha de Cierre *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="input-impeccable"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Presupuesto Producción (USD)
              </label>
              <input
                type="number"
                value={productionBudgetUSD}
                onChange={(e) => setProductionBudgetUSD(Number(e.target.value))}
                className="input-impeccable font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Pauta Publicitaria (USD)
              </label>
              <input
                type="number"
                value={adSpendUSD}
                onChange={(e) => setAdSpendUSD(Number(e.target.value))}
                className="input-impeccable font-mono text-rose-400 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                ROAS Objetivo (Retorno x)
              </label>
              <input
                type="number"
                step="0.1"
                value={targetROAS}
                onChange={(e) => setTargetROAS(Number(e.target.value))}
                placeholder="4.0"
                className="input-impeccable font-mono text-emerald-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                CPA Máximo Permitido (USD)
              </label>
              <input
                type="number"
                step="0.5"
                value={targetCPAUSD}
                onChange={(e) => setTargetCPAUSD(Number(e.target.value))}
                placeholder="12.5"
                className="input-impeccable font-mono text-indigo-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Estado Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CampaignStatus)}
                className="input-impeccable cursor-pointer"
              >
                <option value="planning" className="bg-slate-900 text-white">🟡 En Planificación</option>
                <option value="active" className="bg-slate-900 text-white">🟢 Activa en Circulación</option>
                <option value="completed" className="bg-slate-900 text-white">🔵 Finalizada</option>
                <option value="paused" className="bg-slate-900 text-white">⚪ Pausada</option>
              </select>
            </div>
          </div>

          {/* Ad Channels Selector */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-[11px] font-semibold text-slate-300">
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
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs border border-indigo-400/40'
                        : 'bg-slate-950/70 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {chan}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Linked Deliverables Multi-Check */}
          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <label className="block text-[11px] font-semibold text-slate-300">
              Vincular Entregables del Pipeline ({brandDeliverables.length} disponibles):
            </label>
            {brandDeliverables.length === 0 ? (
              <p className="text-slate-400 text-xs italic">
                No hay entregables registrados para esta marca aún.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto custom-scrollbar p-1">
                {brandDeliverables.map((del) => {
                  const isChecked = selectedDeliverableIds.includes(del.id);
                  return (
                    <div
                      key={del.id}
                      onClick={() => toggleDeliverable(del.id)}
                      className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-indigo-950/50 border-indigo-500/60 text-indigo-200 shadow-xs'
                          : 'bg-slate-950/60 border-white/10 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-mono font-bold text-[10px] text-indigo-400 block truncate">
                          {del.code}
                        </span>
                        <span className="text-xs truncate block text-slate-200">{del.title}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-white/20 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dynamic KPIs Setup */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-semibold text-slate-300">
                Métricas Clave de Rendimiento (KPIs Objetivos)
              </label>
              <button
                type="button"
                onClick={handleAddKpi}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Agregar KPI</span>
              </button>
            </div>

            <div className="space-y-2">
              {kpis.map((kpi, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-950/60 p-2 rounded-xl border border-white/10"
                >
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={kpi.metric}
                      onChange={(e) => handleUpdateKpi(idx, 'metric', e.target.value)}
                      placeholder="Nombre de la Métrica"
                      className="input-impeccable py-1"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      value={kpi.targetValue}
                      onChange={(e) => handleUpdateKpi(idx, 'targetValue', Number(e.target.value))}
                      placeholder="Meta"
                      className="input-impeccable py-1 font-mono"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={kpi.unit}
                      onChange={(e) => handleUpdateKpi(idx, 'unit', e.target.value)}
                      placeholder="Unidad (vistas, %)"
                      className="input-impeccable py-1"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveKpi(idx)}
                      className="p-1 rounded-md text-slate-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsCreateCampaignModalOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Crear Campaña Comercial
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
