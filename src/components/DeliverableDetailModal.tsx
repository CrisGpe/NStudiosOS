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
    toast,
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
  const reservedGear = equipment.filter((e) => (selectedDeliverable.equipmentReservedIds || []).includes(e.id));

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
      toast.warning('Por favor escribe la descripción del cambio solicitado para que Gemini pueda evaluarlo.', 'Evaluación de Cambio T-3');
      return;
    }

    setIsAiEvaluating(true);
    setAiAnalysisResult(null);

    try {
      const response = await fetch('/api/gemini/evaluate-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliverable: selectedDeliverable,
          changeRequest: {
            title: changeTitle || 'Ajuste solicitado',
            description: changeDesc,
            reason: changeReason,
          },
          currentDate: '2026-08-17',
        }),
      });

      const data = await response.json();
      setAiAnalysisResult(data);
      toast.success('Impacto técnico y financiero evaluado con Gemini AI.');
    } catch (err) {
      console.error('Error evaluating change with Gemini AI', err);
      toast.error('Error evaluando el cambio con Gemini AI.');
    } finally {
      setIsAiEvaluating(false);
    }
  };

  return (
    <div
      onClick={() => setSelectedDeliverable(null)}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-slate-200 text-slate-800 animate-in zoom-in-95"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {selectedDeliverable.code}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                  {selectedDeliverable.priority}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {selectedDeliverable.format}
                </span>
              </div>

              <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-1.5 leading-snug">
                {selectedDeliverable.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs ring-1 ring-slate-200"
                    style={{ backgroundColor: brand?.primaryColor || '#6366f1' }}
                  />
                  <span className="text-slate-800 font-semibold">{brand?.name}</span>
                </div>
                {territory && (
                  <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 text-[10.5px]">
                    🎯 {territory.name}
                  </span>
                )}
                {assignee && (
                  <span className="text-slate-500">
                    👤 Asignado: <strong className="text-slate-800">{assignee.name}</strong>
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedDeliverable(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper: Phase Progress Bar */}
          <div className="mt-3.5 pt-3 border-t border-slate-200/70">
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {PHASE_STEPS.map((step, sIdx) => {
                const isCurrent = sIdx === currentPhaseIndex;
                const isPassed = sIdx < currentPhaseIndex;

                return (
                  <button
                    key={step.id}
                    onClick={() => moveDeliverablePhase(selectedDeliverable.id, step.id)}
                    className={`p-2 rounded-xl transition-all text-left flex flex-col justify-between cursor-pointer active:scale-95 ${
                      isCurrent
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20 border border-indigo-600'
                        : isPassed
                        ? 'bg-slate-100 text-slate-800 font-medium hover:bg-slate-200'
                        : 'bg-slate-50 text-slate-400 border border-slate-200/60 hover:bg-slate-100'
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
        <div className="flex items-center gap-2 px-4 pt-2.5 border-b border-slate-100 bg-slate-50/50 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Visión General & Fechas
          </button>

          <button
            onClick={() => setActiveTab('changes')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'changes'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Control de Cambios & Regla T-3</span>
            {isTMinus3Active && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[8px] font-bold shadow-2xs">
                T-3
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
              activeTab === 'guide'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Guía Técnica & Shotlist
          </button>

          <button
            onClick={() => setActiveTab('equipment')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 cursor-pointer ${
              activeTab === 'equipment'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Hardware & Reservas ({reservedGear.length})
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-slate-700">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Key Timeline Milestone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1 text-[11px]">
                    <Video className="w-3.5 h-3.5 text-rose-600" />
                    <span>Fechas de Rodaje (Producción)</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    {selectedDeliverable.productionStartDate} al {selectedDeliverable.productionEndDate}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>Fecha de Publicación Oficial</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    {selectedDeliverable.publishDate}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Cuenta Regresiva a Estreno</span>
                  </div>
                  <div className="text-xs font-bold text-amber-700 font-mono">
                    {daysToPublish} días restantes
                  </div>
                </div>
              </div>

              {/* Concept Hook / Logline */}
              {selectedDeliverable.conceptHook && (
                <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 block tracking-wider">
                    🎯 Hook Inicial / Logline (0-3 Segundos)
                  </span>
                  <p className="text-xs font-medium text-indigo-900 italic">
                    "{selectedDeliverable.conceptHook}"
                  </p>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 text-xs">Concepto Narrativo & Propuesta Visual:</span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {selectedDeliverable.description || 'Sin descripción adicional.'}
                </p>
              </div>

              {/* Drive Vault Assets Link */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-cyan-600" />
                    <span>Archivos en Google Drive Vault:</span>
                  </span>
                  <button
                    onClick={() => {
                      setSelectedDeliverable(null);
                      setMainAppTab('drive');
                    }}
                    className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
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
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-all flex items-center justify-between gap-2.5 group shadow-2xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-xs truncate group-hover:text-indigo-600">
                            {file.name}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {file.sizeFormatted} • {file.type.toUpperCase()}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-semibold shrink-0 shadow-2xs">
                          Ver
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHANGE REQUESTS & T-3 POLICY */}
          {activeTab === 'changes' && (
            <div className="space-y-4">
              {/* T-3 Policy Banner */}
              <div
                className={`p-3.5 rounded-xl border shadow-2xs ${
                  isTMinus3Active
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <ShieldAlert
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      isTMinus3Active ? 'text-rose-600' : 'text-amber-600'
                    }`}
                  />
                  <div className="space-y-1">
                    <div className="font-bold flex items-center gap-2">
                      <span className="text-xs">Política de Ventana T-3 (Bloqueo 3 Días Previos a Publicación)</span>
                      {isTMinus3Active ? (
                        <span className="bg-rose-600 text-white px-2 py-0.5 rounded-full text-[9px] font-mono font-bold shadow-2xs">
                          BLOQUEO ACTIVO ({daysToPublish} días)
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium">
                          Ventana Regular ({daysToPublish} días)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-600">
                      Cualquier solicitud de cambio a menos de 3 días de la fecha de publicación (T-3) queda
                      automáticamente clasificada como <strong>Bloqueada / Requiere Override de Dirección</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit New Change Request Form */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5 shadow-2xs">
                <h4 className="font-bold text-slate-900 text-xs">Nueva Solicitud de Cambio</h4>

                <form onSubmit={handleCreateChangeRequest} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1 text-[11px] font-semibold">Título del Cambio *</label>
                      <input
                        type="text"
                        value={changeTitle}
                        onChange={(e) => setChangeTitle(e.target.value)}
                        placeholder="Ej: Modificar música y etalonaje"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 text-[11px] font-semibold">Motivo / Tipo de Ajuste</label>
                      <select
                        value={changeReason}
                        onChange={(e) => setChangeReason(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
                      >
                        <option value="Edición y Ritmo">Edición y Ritmo</option>
                        <option value="Audio / Música / Locución">Audio / Música / Locución</option>
                        <option value="Color Grading & Perfil">Color Grading & Perfil</option>
                        <option value="Textos & Gráficas de Marca">Textos & Gráficas de Marca</option>
                        <option value="Narrativa / Re-rodaje">Narrativa / Re-rodaje</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 text-[11px] font-semibold">Detalle del Cambio Solicitado *</label>
                    <textarea
                      value={changeDesc}
                      onChange={(e) => setChangeDesc(e.target.value)}
                      rows={2}
                      placeholder="Explica qué fragmento necesita ser modificado..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>

                  {/* AI Evaluation trigger */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleEvaluateWithAI}
                      disabled={isAiEvaluating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-semibold text-xs cursor-pointer transition-all active:scale-95 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>{isAiEvaluating ? 'Evaluando...' : 'Evaluar Viabilidad con Gemini AI'}</span>
                    </button>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-98"
                    >
                      Enviar Solicitud
                    </button>
                  </div>
                </form>

                {/* AI Analysis Preview */}
                {aiAnalysisResult && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-purple-900 font-bold">
                      <span className="flex items-center gap-1.5 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        Diagnóstico Técnico Gemini AI:
                      </span>
                      <span className="font-mono text-[10px] uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200 font-bold">
                        {aiAnalysisResult.verdict}
                      </span>
                    </div>

                    <p className="text-purple-950 text-[11px] leading-relaxed">
                      {aiAnalysisResult.directorRationale}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-mono">
                      <div className="bg-white p-2 rounded-xl border border-purple-100">
                        <span className="text-slate-500 block text-[9.5px]">Impacto T-3:</span>
                        <span className={aiAnalysisResult.incursTMinus3Penalty ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                          {aiAnalysisResult.incursTMinus3Penalty ? 'PENALIZADO' : 'DENTRO DE TIEMPO'}
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-purple-100">
                        <span className="text-slate-500 block text-[9.5px]">Retraso:</span>
                        <span className="text-amber-700 font-bold">{aiAnalysisResult.estimatedDelayHours} horas</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-purple-100">
                        <span className="text-slate-500 block text-[9.5px]">Sobrecosto:</span>
                        <span className="text-rose-600 font-bold">${aiAnalysisResult.additionalCostUSD} USD</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-purple-100">
                        <span className="text-slate-500 block text-[9.5px]">Riesgo:</span>
                        <span className="text-slate-800 font-bold truncate">{aiAnalysisResult.riskAssessment}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* History of Change Requests */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Historial de Solicitudes de Cambio</h4>

                {(!selectedDeliverable.changeRequests || selectedDeliverable.changeRequests.length === 0) ? (
                  <div className="p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs bg-slate-50/50">
                    No hay solicitudes de cambio registradas para este entregable.
                  </div>
                ) : (
                  selectedDeliverable.changeRequests.map((cr) => (
                    <div
                      key={cr.id}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{cr.title}</span>
                            <span className="text-[9.5px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 border border-slate-200 font-medium">
                              {cr.reason}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {cr.description}
                          </p>
                        </div>

                        <span
                          className={`text-[9.5px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                            cr.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : cr.status === 'blocked_t3'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : cr.status === 'rejected'
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {cr.status}
                        </span>
                      </div>

                      {/* Meta Footer & Director Action */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10.5px] text-slate-500">
                        <div>
                          Solicitado por <strong className="text-slate-800">{cr.requestedByName}</strong> el {cr.requestedAt}
                        </div>

                        {/* Director Controls */}
                        {(currentUser.role === 'director' || currentUser.role === 'webadmin') && cr.status !== 'approved' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => respondToChangeRequest(selectedDeliverable.id, cr.id, 'director_override', 'Aprobado con Override de Director de Proyecto.')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold cursor-pointer transition-colors active:scale-95"
                            >
                              Director Override (Aprobar)
                            </button>
                            <button
                              onClick={() => respondToChangeRequest(selectedDeliverable.id, cr.id, 'rejected', 'Rechazado por impacto crítico en calendario de estreno.')}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-semibold cursor-pointer transition-colors active:scale-95"
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
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">
                  Hardware Asignado al Rodaje ({reservedGear.length})
                </span>
                <span className="text-amber-700 font-mono font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Total Kit: ${reservedGear.reduce((acc, curr) => acc + curr.dailyRateUSD, 0)} USD / día
                </span>
              </div>

              {reservedGear.length === 0 ? (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  No hay equipos reservados directamente para este entregable.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {reservedGear.map((eq) => (
                    <div
                      key={eq.id}
                      className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-2xs"
                    >
                      <img
                        src={eq.image}
                        alt={eq.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 truncate text-xs">{eq.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">{eq.model}</div>
                        <div className="text-[10.5px] text-amber-700 font-semibold mt-0.5">
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
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 font-mono text-xs">
            Última actualización: {selectedDeliverable.updatedAt}
          </span>
          <button
            onClick={() => setSelectedDeliverable(null)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer active:scale-98"
          >
            Cerrar Visor
          </button>
        </div>
      </div>
    </div>
  );
};
