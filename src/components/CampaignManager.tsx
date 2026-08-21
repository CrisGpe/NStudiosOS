import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Target,
  Plus,
  DollarSign,
  TrendingUp,
  Layers,
  ChevronRight,
  BarChart3,
  Megaphone,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { CampaignStatus, CampaignType } from '../types';

export const CampaignManager: React.FC = () => {
  const {
    campaigns,
    brands,
    deliverables,
    selectedBrandId,
    setIsCreateCampaignModalOpen,
    setSelectedDeliverable,
    currentUser,
  } = useApp();

  const isClient = currentUser.role === 'cliente';
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredCampaigns = campaigns.filter((camp) => {
    if (isClient && currentUser.assignedBrandIds?.[0]) {
      if (camp.brandId !== currentUser.assignedBrandIds[0]) return false;
    } else if (selectedBrandId !== 'all' && camp.brandId !== selectedBrandId) {
      return false;
    }

    const matchesStatus = statusFilter === 'all' || camp.status === statusFilter;
    const matchesType = typeFilter === 'all' || camp.campaignType === typeFilter;
    const matchesSearch =
      camp.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      camp.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      camp.objective.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const totalBudget = filteredCampaigns.reduce((acc, c) => acc + c.budgetUSD, 0);
  const totalAdSpend = filteredCampaigns.reduce((acc, c) => acc + (c.adSpendUSD || 0), 0);
  const totalSpent = filteredCampaigns.reduce((acc, c) => acc + (c.spentUSD || 0), 0);
  const totalLinkedDeliverables = filteredCampaigns.reduce(
    (acc, c) => acc + (c.deliverableIds?.length || 0),
    0
  );

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'planning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'completed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'paused':
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getCampaignTypeBadge = (type?: CampaignType) => {
    switch (type) {
      case 'performance_paid_ads':
        return {
          label: 'Paid Media & ROAS',
          icon: BarChart3,
          color: 'bg-rose-50 text-rose-800 border-rose-200',
        };
      case 'ecommerce_launch':
        return {
          label: 'Lanzamiento E-Commerce',
          icon: ShoppingBag,
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'lead_generation':
        return {
          label: 'Lead Generation B2B/D2C',
          icon: Users,
          color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        };
      case 'brand_awareness':
      default:
        return {
          label: 'Brand Awareness / Orgánico',
          icon: Megaphone,
          color: 'bg-purple-50 text-purple-800 border-purple-200',
        };
    }
  };

  return (
    <div className="space-y-4 text-slate-800">
      
      {/* Top Header & Metrics Bar */}
      <div className="glass-panel rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs bg-white border border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-2xs shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Gestor de Campañas Digitales & Comerciales
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {filteredCampaigns.length} Activas
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Agrupación estratégica de entregables, balance de producción vs pauta publicitaria (Paid Ads) y ROAS.
              </p>
            </div>
          </div>
        </div>

        {!isClient && (
          <button
            onClick={() => setIsCreateCampaignModalOpen(true)}
            className="btn-primary self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Campaña Comercial</span>
          </button>
        )}
      </div>

      {/* High Density Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
              Presupuesto Total (S/.)
            </span>
            <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">
              S/. {totalBudget.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10.5px] text-slate-500 font-mono mt-0.5 block">
              Ejecutado: S/. {totalSpent.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%)
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
              Inversión en Pauta (Ad Spend)
            </span>
            <div className="text-xl font-extrabold text-rose-600 font-mono mt-1">
              S/. {totalAdSpend.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10.5px] text-slate-500 mt-0.5 block">
              Meta Ads • Google • TikTok
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-2xs shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
              Entregables Vinculados
            </span>
            <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">
              {totalLinkedDeliverables} Piezas AV / Gráficas
            </div>
            <span className="text-[10.5px] text-slate-500 mt-0.5 block">
              En {filteredCampaigns.length} campañas
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
              ROAS Promedio Objetivo
            </span>
            <div className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
              4.1x Retorno
            </div>
            <span className="text-[10.5px] text-emerald-700 font-semibold mt-0.5 block">
              ✓ Rendimiento óptimo
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-2xs shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs bg-white border border-slate-200">
        {/* Campaign Type Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 px-1">Tipo:</span>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'performance_paid_ads', label: '🎯 Paid Ads' },
            { id: 'ecommerce_launch', label: '🛒 E-commerce' },
            { id: 'lead_generation', label: '👥 Leads' },
            { id: 'brand_awareness', label: '✨ Branding' },
          ].map((tp) => (
            <button
              key={tp.id}
              onClick={() => setTypeFilter(tp.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                typeFilter === tp.id
                  ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {tp.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filtrar campañas por nombre u objetivo..."
            className="input-impeccable w-72"
          />
        </div>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-slate-300 rounded-2xl space-y-3">
          <Target className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="font-bold text-slate-700 text-sm">No hay campañas que coincidan</h4>
          <p className="text-xs text-slate-500">Crea una nueva campaña comercial para agrupar entregables y monitorear el ROAS.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCampaigns.map((camp) => {
            const brand = brands.find((b) => b.id === camp.brandId);
            const linkedDels = deliverables.filter((d) => camp.deliverableIds?.includes(d.id));
            const completedDels = linkedDels.filter((d) => d.phase === 'publicado');
            const progressPercent = linkedDels.length > 0
              ? Math.round((completedDels.length / linkedDels.length) * 100)
              : 0;
            const typeBadge = getCampaignTypeBadge(camp.campaignType);
            const TypeIcon = typeBadge.icon;

            return (
              <div
                key={camp.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all space-y-3.5 relative overflow-hidden"
                style={{ borderTopColor: brand?.primaryColor || '#4f46e5', borderTopWidth: '4px' }}
              >
                {/* Header Meta */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-mono font-bold text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        {camp.code}
                      </span>
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(camp.status)}`}>
                        {camp.status}
                      </span>
                      <span className={`text-[9.5px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 shadow-2xs ${typeBadge.color}`}>
                        <TypeIcon className="w-3 h-3" />
                        <span>{typeBadge.label}</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {camp.name}
                    </h3>
                  </div>

                  {brand && (
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-[10.5px] font-bold shrink-0 shadow-2xs"
                      style={{ backgroundColor: brand.primaryColor }}
                    >
                      <span>{brand.name}</span>
                    </div>
                  )}
                </div>

                {/* Objective Description */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-[10.5px] text-slate-900 block">
                    🎯 Objetivo Estratégico & Comercial:
                  </span>
                  <p className="leading-relaxed text-slate-600">{camp.objective}</p>
                </div>

                {/* Commercial Metrics Grid (Ad Spend, Production, ROAS, CPA) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-slate-500 text-[9.5px] block font-medium">Presupuesto Total</span>
                    <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">
                      S/. {camp.budgetUSD.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-slate-500 text-[9.5px] block font-medium">Pauta (Ad Spend)</span>
                    <span className="font-mono font-bold text-rose-600 text-xs mt-0.5 block">
                      S/. {(camp.adSpendUSD || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-slate-500 text-[9.5px] block font-medium">ROAS Objetivo</span>
                    <span className="font-mono font-bold text-emerald-700 text-xs mt-0.5 block">
                      {camp.targetROAS ? `${camp.targetROAS}x` : 'N/A'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-slate-500 text-[9.5px] block font-medium">CPA Objetivo</span>
                    <span className="font-mono font-bold text-indigo-600 text-xs mt-0.5 block">
                      {camp.targetCPAUSD ? `S/. ${Number(camp.targetCPAUSD).toFixed(2)}` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Ad Channels Pills */}
                {camp.adChannels && camp.adChannels.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">Canales de Pauta:</span>
                    {camp.adChannels.map((channel, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700 border border-slate-200"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                )}

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Avance de Producción ({completedDels.length}/{linkedDels.length} entregables listos)</span>
                    <span className="font-mono font-bold text-indigo-600">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, progressPercent)}%` }}
                    />
                  </div>
                </div>

                {/* KPIs Target List */}
                {camp.kpis && camp.kpis.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="font-bold text-[10px] uppercase text-slate-500 tracking-wider block">
                      Métricas Clave de Campaña (KPIs)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {camp.kpis.map((kpi) => {
                        return (
                          <div
                            key={kpi.id}
                            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-2xs"
                          >
                            <span className="text-slate-500 text-[10px] truncate block">{kpi.metric}</span>
                            <div className="flex items-center justify-between font-mono font-bold text-slate-900 mt-1">
                              <span>{kpi.currentValue.toLocaleString()} {kpi.unit}</span>
                              <span className="text-[10px] text-slate-500">/ {kpi.targetValue.toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Linked Deliverables Pills */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase text-slate-500 text-[10px] tracking-wider">
                      Entregables en Campaña ({linkedDels.length})
                    </span>
                    <span className="text-slate-500 text-[10.5px]">Haz clic para inspeccionar</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {linkedDels.map((del) => (
                      <button
                        key={del.id}
                        onClick={() => setSelectedDeliverable(del)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 text-xs font-mono cursor-pointer transition-all shadow-2xs"
                      >
                        <span className="font-bold text-indigo-600">{del.code}</span>
                        <span className="truncate max-w-[130px]">({del.title})</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
