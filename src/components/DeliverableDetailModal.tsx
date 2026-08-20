import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Deliverable,
  DeliverablePhase,
  ChangeRequest,
} from '../types';
import {
  X,
  Calendar,
  Layers,
  Camera,
  AlertTriangle,
  FileCheck2,
  Clock,
  Sparkles,
  User,
  Building2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Video,
  DollarSign,
} from 'lucide-react';
import { TechnicalGuideViewer } from './TechnicalGuideViewer';

const PHASE_STEPS: { id: DeliverablePhase; label: string; tag: string }[] = [
  { id: 'ideacion', label: 'Ideación', tag: 'D1-15' },
  { id: 'calendarizacion', label: 'Calendarización', tag: 'D15-20' },
  { id: 'guia_tecnica', label: 'Guía Técnica', tag: 'D20-Fin' },
  { id: 'produccion', label: 'Rodaje', tag: 'Set' },
  { id: 'post_produccion', label: 'Post-Prod', tag: 'Color/VFX' },
  { id: 'aprobacion_cliente', label: 'Aprobación', tag: 'Ventana T-3' },
  { id: 'publicado', label: 'Publicado', tag: 'Listo' },
];

export const DeliverableDetailModal: React.FC = () => {
  const {
    selectedDeliverable,
    setSelectedDeliverable,
    brands,
    territories,
    users,
    equipment,
    moveDeliverablePhase,
    submitChangeRequest,
    respondToChangeRequest,
    currentUser,
    openAiModalWithContext,
    driveFiles,
    setActivePreviewFile,
    setActiveTab: setMainAppTab,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'changes' | 'guide' | 'equipment'>('overview');

  // Change request form state
  const [changeTitle, setChangeTitle] = useState('');
  const [changeReason, setChangeReason] = useState('Edición y Ritmo');
  const [changeDesc, setChangeDesc] = useState('');
  const [isAiEvaluating, setIsAiEvaluating] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  if (!selectedDeliverable) return null;

  const brand = brands.find((b) => b.id === selectedDeliverable.brandId);
  const territory = territories.find((t) => t.id === selectedDeliverable.territoryId);
  const assignee = users.find((u) => u.id === selectedDeliverable.assigneeId);
  const reservedGear = equipment.filter((e) => selectedDeliverable.equipmentReservedIds.includes(e.id));

  // T-3 calculation
  const now = new Date('2026-08-17').getTime();
  const pub = new Date(selectedDeliverable.publishDate).getTime();
  const daysToPublish = Math.ceil((pub - now) / (1000 * 60 * 60 * 24));
  const isTMinus3Active = daysToPublish <= 3 && daysToPublish >= 0;

  const currentPhaseIndex = PHASE_STEPS.findIndex((p) => p.id === selectedDeliverable.phase);

  const handleCreateChangeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeTitle.trim() || !changeDesc.trim()) return;

    submitChangeRequest(selectedDeliverable.id, {
      title: changeTitle,
      reason: changeReason,
      description: changeDesc,
      requestedById: currentUser.id,
      requestedByName: currentUser.name,
    });

    setChangeTitle('');
    setChangeDesc('');
    setAiAnalysisResult(null);
  };

  const handleEvaluateWithAI = async () => {
    if (!changeDesc.trim()) {
      alert('Por favor escribe primero la descripción del cambio solicitado para que Gemini pueda evaluarlo.');
      return;
    }

    setIsAiEvaluating(true);
    try {
      const response = await fetch('/api/gemini/evaluate-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliverable: selectedDeliverable,
          changeRequestDescription: `${changeTitle} (${changeReason}): ${changeDesc}`,
          daysToPublish,
        }),
      });

      const data = await response.json();
      setAiAnalysisResult(data);
    } catch (err) {
      console.error(err);
      alert('Error evaluando el cambio con IA');
    } finally {
      setIsAiEvaluating(false);
    }
  };

  return (
    <div
      onClick={() => setSelectedDeliverable(null)}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in-scale"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel-elevated rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-white/15 text-slate-100"
      >
        
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 bg-slate-950/80 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-indigo-400 border border-white/10">
                  {selectedDeliverable.code}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border bg-blue-500/15 text-blue-300 border-blue-500/30">
                  {selectedDeliverable.priority}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {selectedDeliverable.format}
                </span>
              </div>

              <h2 className="text-sm sm:text-base font-bold text-white mt-1.5 leading-snug">
                {selectedDeliverable.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs ring-1 ring-white/20"
                    style={{ backgroundColor: brand?.primaryColor || '#6366f1' }}
                  />
                  <span className="text-slate-200 font-semibold">{brand?.name}</span>
                </div>
                {territory && (
                  <span className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded-lg border border-white/5 text-[10.5px]">
                    🎯 {territory.name}
                  </span>
                )}
                {assignee && (
                  <span className="text-slate-400">
                    👤 Asignado: <strong className="text-slate-200">{assignee.name}</strong>
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedDeliverable(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper: Phase Progress Bar */}
          <div className="mt-3.5 pt-3 border-t border-white/10">
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {PHASE_STEPS.map((step, sIdx) => {
                const isCurrent = sIdx === currentPhaseIndex;
                const isPassed = sIdx < currentPhaseIndex;

                return (
                  <button
                    key={step.id}
                    onClick={() => moveDeliverablePhase(selectedDeliverable.id, step.id)}
                    className={`p-2 rounded-xl transition-all text-left flex flex-col justify-between cursor-pointer ${
                      isCurrent
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                        : isPassed
                        ? 'bg-white/10 text-slate-200 font-medium'
                        : 'bg-slate-950/60 text-slate-400 border border-white/5 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9.5px] w-full">
                      <span className="font-mono font-bold">#{sIdx + 1}</span>
                      <span className="text-[8.5px] opacity-80">{step.tag}</span>
                    </div>
                    <div className="text-[10.5px] truncate mt-0.5 font-semibold">{step.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 px-4 pt-2.5 border-b border-white/10 bg-slate-950/60 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Visión General & Fechas
          </button>

          <button
            onClick={() => setActiveTab('changes')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'changes'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>Control de Cambios & Regla T-3</span>
            {isTMinus3Active && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[8px] font-bold shadow-xs">
                T-3
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
              activeTab === 'guide'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Guía Técnica & Shotlist
          </button>

          <button
            onClick={() => setActiveTab('equipment')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
              activeTab === 'equipment'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Hardware & Reservas ({reservedGear.length})
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs text-slate-300">
              
              {/* Key Timeline Milestone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-white/10 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-[11px]">
                    <Video className="w-3.5 h-3.5 text-rose-400" />
                    <span>Fechas de Rodaje (Producción)</span>
                  </div>
                  <div className="text-xs font-bold text-white font-mono">
                    {selectedDeliverable.productionStartDate} al {selectedDeliverable.productionEndDate}
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-white/10 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-teal-400" />
                    <span>Fecha de Publicación Oficial</span>
                  </div>
                  <div className="text-xs font-bold text-white font-mono">
                    {selectedDeliverable.publishDate}
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-white/10 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cuenta Regresiva a Estreno</span>
                  </div>
                  <div className="text-xs font-bold text-amber-400 font-mono">
                    {daysToPublish} días restantes
                  </div>
                </div>
              </div>

              {/* Concept Hook / Logline */}
              {selectedDeliverable.conceptHook && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 p-3.5 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">
                    🎯 Hook Inicial / Logline (0-3 Segundos)
                  </span>
                  <p className="text-xs font-medium text-indigo-200 italic">
                    "{selectedDeliverable.conceptHook}"
                  </p>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-200 text-xs">Concepto Narrativo & Propuesta Visual:</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-white/10">
                  {selectedDeliverable.description}
                </p>
              </div>

              {/* Drive Vault Assets Link */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-cyan-400" />
                    <span>Archivos en Google Drive Vault:</span>
                  </span>
                  <button
                    onClick={() => {
                      setSelectedDeliverable(null);
                      setMainAppTab('drive');
                    }}
                    className="text-xs text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Abrir Bóveda Drive</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {driveFiles
                    .filter((f) => f.brandId === selectedDeliverable.brandId)
                    .slice(0, 2)
                    .map((file) => (
                      <div
                        key={file.id}
                        onClick={() => setActivePreviewFile(file)}
                        className="p-3 rounded-xl bg-slate-950/70 border border-white/10 hover:border-indigo-500/60 cursor-pointer transition-all flex items-center justify-between gap-2.5 group"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs truncate group-hover:text-indigo-300">
                            {file.name}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {file.sizeFormatted} • {file.type.toUpperCase()}
                          </span>
                        </div>
                        <span className="btn-primary py-0.5 px-2.5 text-[10px] shrink-0">
                          Ver
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Assets Linked */}
              {selectedDeliverable.assetsLinked && selectedDeliverable.assetsLinked.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-200 text-xs">Activos Digitales de Marca Vinculados:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedDeliverable.assetsLinked.map((asset, aIdx) => (
                      <span
                        key={aIdx}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-white/10 text-slate-300 font-mono text-xs flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        {asset}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: CHANGE REQUESTS & T-3 POLICY */}
          {activeTab === 'changes' && (
            <div className="space-y-4 text-xs text-slate-300">
              
              {/* T-3 Policy Banner */}
              <div
                className={`p-3.5 rounded-xl border shadow-sm ${
                  isTMinus3Active
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-200'
                    : 'bg-slate-950/70 border-white/10 text-slate-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <ShieldAlert
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      isTMinus3Active ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  />
                  <div className="space-y-1">
                    <div className="font-bold flex items-center gap-2">
                      <span className="text-xs">Política de Ventana T-3 (Bloqueo 3 Días Previos a Publicación)</span>
                      {isTMinus3Active ? (
                        <span className="bg-rose-600 text-white px-2 py-0.5 rounded-full text-[9px] font-mono font-bold shadow-xs">
                          BLOQUEO ACTIVO ({daysToPublish} días)
                        </span>
                      ) : (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium">
                          Ventana Regular ({daysToPublish} días)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      Cualquier solicitud de cambio a menos de 3 días de la fecha de publicación (T-3) queda
                      automáticamente clasificada como <strong>Bloqueada / Requiere Override de Dirección</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit New Change Request Form */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-white/10 space-y-3.5 shadow-sm">
                <h4 className="font-bold text-white text-xs">Nueva Solicitud de Cambio</h4>

                <form onSubmit={handleCreateChangeRequest} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1 text-[11px] font-semibold">Título del Cambio *</label>
                      <input
                        type="text"
                        value={changeTitle}
                        onChange={(e) => setChangeTitle(e.target.value)}
                        placeholder="Ej: Modificar música y etalonaje"
                        className="input-impeccable"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 text-[11px] font-semibold">Motivo / Tipo de Ajuste</label>
                      <select
                        value={changeReason}
                        onChange={(e) => setChangeReason(e.target.value)}
                        className="input-impeccable cursor-pointer"
                      >
                        <option value="Edición y Ritmo" className="bg-slate-900 text-white">Edición y Ritmo</option>
                        <option value="Audio / Música / Locución" className="bg-slate-900 text-white">Audio / Música / Locución</option>
                        <option value="Color Grading & Perfil" className="bg-slate-900 text-white">Color Grading & Perfil</option>
                        <option value="Textos & Gráficas de Marca" className="bg-slate-900 text-white">Textos & Gráficas de Marca</option>
                        <option value="Narrativa / Re-rodaje" className="bg-slate-900 text-white">Narrativa / Re-rodaje</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 text-[11px] font-semibold">Detalle del Cambio Solicitado *</label>
                    <textarea
                      value={changeDesc}
                      onChange={(e) => setChangeDesc(e.target.value)}
                      rows={2}
                      placeholder="Explica qué fragmento necesita ser modificado..."
                      className="input-impeccable"
                      required
                    />
                  </div>

                  {/* AI Evaluation trigger */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleEvaluateWithAI}
                      disabled={isAiEvaluating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-semibold text-xs cursor-pointer transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-subtle-pulse" />
                      <span>{isAiEvaluating ? 'Evaluando...' : 'Evaluar Viabilidad con Gemini AI'}</span>
                    </button>

                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      Enviar Solicitud
                    </button>
                  </div>
                </form>

                {/* AI Analysis Preview */}
                {aiAnalysisResult && (
                  <div className="bg-purple-950/40 border border-purple-500/40 rounded-xl p-3.5 space-y-2 animate-in-scale">
                    <div className="flex items-center justify-between text-purple-300 font-bold">
                      <span className="flex items-center gap-1.5 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        Diagnóstico Técnico Gemini AI:
                      </span>
                      <span className="font-mono text-[10px] uppercase bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                        {aiAnalysisResult.verdict}
                      </span>
                    </div>

                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {aiAnalysisResult.directorRationale}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-mono">
                      <div className="bg-slate-900 p-2 rounded-xl border border-white/10">
                        <span className="text-slate-400 block text-[9.5px]">Impacto T-3:</span>
                        <span className={aiAnalysisResult.incursTMinus3Penalty ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                          {aiAnalysisResult.incursTMinus3Penalty ? 'PENALIZADO' : 'DENTRO DE TIEMPO'}
                        </span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-xl border border-white/10">
                        <span className="text-slate-400 block text-[9.5px]">Retraso:</span>
                        <span className="text-amber-400 font-bold">{aiAnalysisResult.estimatedDelayHours} horas</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-xl border border-white/10">
                        <span className="text-slate-400 block text-[9.5px]">Sobrecosto:</span>
                        <span className="text-rose-400 font-bold">${aiAnalysisResult.additionalCostUSD} USD</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-xl border border-white/10">
                        <span className="text-slate-400 block text-[9.5px]">Riesgo:</span>
                        <span className="text-white font-bold truncate">{aiAnalysisResult.riskAssessment}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* History of Change Requests */}
              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs">Historial de Solicitudes de Cambio</h4>

                {(!selectedDeliverable.changeRequests || selectedDeliverable.changeRequests.length === 0) ? (
                  <div className="p-6 text-center text-slate-500 border border-dashed border-white/10 rounded-xl text-xs bg-slate-950/40">
                    No hay solicitudes de cambio registradas para este entregable.
                  </div>
                ) : (
                  selectedDeliverable.changeRequests.map((cr) => (
                    <div
                      key={cr.id}
                      className="bg-slate-950/70 p-3.5 rounded-xl border border-white/10 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{cr.title}</span>
                            <span className="text-[9.5px] bg-slate-900 px-2 py-0.5 rounded-full text-slate-300 border border-white/10 font-medium">
                              {cr.reason}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {cr.description}
                          </p>
                        </div>

                        <span
                          className={`text-[9.5px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                            cr.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : cr.status === 'blocked_t3'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : cr.status === 'rejected'
                              ? 'bg-white/10 text-slate-300 border-white/10'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {cr.status}
                        </span>
                      </div>

                      {/* Meta Footer & Director Action */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10.5px] text-slate-400">
                        <div>
                          Solicitado por <strong className="text-slate-200">{cr.requestedByName}</strong> el {cr.requestedAt} (T-{cr.daysToPublishAtSubmission}d)
                        </div>

                        {/* Director Controls */}
                        {(currentUser.role === 'director' || currentUser.role === 'webadmin') && cr.status !== 'approved' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => respondToChangeRequest(selectedDeliverable.id, cr.id, 'director_override', 'Aprobado con Override de Director de Proyecto.')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 font-semibold cursor-pointer transition-colors"
                            >
                              Director Override (Aprobar)
                            </button>
                            <button
                              onClick={() => respondToChangeRequest(selectedDeliverable.id, cr.id, 'rejected', 'Rechazado por impacto crítico en calendario de estreno.')}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 font-semibold cursor-pointer transition-colors"
                            >
                              Rechazar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* TAB 3: TECHNICAL GUIDE */}
          {activeTab === 'guide' && (
            <TechnicalGuideViewer deliverable={selectedDeliverable} />
          )}

          {/* TAB 4: EQUIPMENT RESERVED */}
          {activeTab === 'equipment' && (
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">
                  Hardware Asignado al Rodaje ({reservedGear.length})
                </span>
                <span className="text-amber-400 font-mono font-bold text-xs">
                  Total Kit: ${reservedGear.reduce((acc, curr) => acc + curr.dailyRateUSD, 0)} USD / día
                </span>
              </div>

              {reservedGear.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-xl bg-slate-950/40">
                  No hay equipos reservados directamente para este entregable.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {reservedGear.map((eq) => (
                    <div
                      key={eq.id}
                      className="bg-slate-950/70 p-3 rounded-xl border border-white/10 flex items-center gap-3 shadow-2xs"
                    >
                      <img
                        src={eq.image}
                        alt={eq.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white truncate text-xs">{eq.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{eq.model}</div>
                        <div className="text-[10.5px] text-amber-400 font-semibold mt-0.5">
                          ${eq.dailyRateUSD}/día • Serial: {eq.serialNumber}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-400 font-mono text-xs">
            Última actualización: {selectedDeliverable.updatedAt}
          </span>
          <button
            onClick={() => setSelectedDeliverable(null)}
            className="btn-secondary"
          >
            Cerrar Visor
          </button>
        </div>

      </div>
    </div>
  );
};
