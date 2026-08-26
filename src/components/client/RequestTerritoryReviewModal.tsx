import React, { useState } from 'react';
import { Target, X, Send, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Brand, CommunicationTerritory } from '../../types';

interface RequestTerritoryReviewModalProps {
  brand: Brand;
  territories: CommunicationTerritory[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    brandId: string;
    requestType: 'propose_new' | 'modify_existing';
    territoryName: string;
    existingTerritoryId?: string;
    motive: string;
    notes: string;
  }) => void;
}

export const RequestTerritoryReviewModal: React.FC<RequestTerritoryReviewModalProps> = ({
  brand,
  territories,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [requestType, setRequestType] = useState<'propose_new' | 'modify_existing'>('propose_new');
  const [existingTerritoryId, setExistingTerritoryId] = useState(territories[0]?.id || '');
  const [territoryName, setTerritoryName] = useState('');
  const [motive, setMotive] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motive.trim() || !notes.trim()) return;

    const finalName =
      requestType === 'modify_existing'
        ? territories.find((t) => t.id === existingTerritoryId)?.name || 'Territorio'
        : territoryName.trim();

    if (!finalName) return;

    onSubmit({
      brandId: brand.id,
      requestType,
      territoryName: finalName,
      existingTerritoryId: requestType === 'modify_existing' ? existingTerritoryId : undefined,
      motive: motive.trim(),
      notes: notes.trim(),
    });

    // Reset
    setTerritoryName('');
    setMotive('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Solicitar Revisión / Proponer Territorio
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Envía una propuesta formal al Director Creativo de la agencia para {brand.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form id="territory-review-form" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Request Type Selector */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 font-semibold">Tipo de Solicitud</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRequestType('propose_new')}
                className={`p-3 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                  requestType === 'propose_new'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs ring-1 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>➕ Proponer Nuevo</span>
                <span className="block text-[10.5px] font-normal text-slate-500 mt-0.5">Nuevo pilar temático</span>
              </button>

              <button
                type="button"
                onClick={() => setRequestType('modify_existing')}
                className={`p-3 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                  requestType === 'modify_existing'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs ring-1 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>✏️ Ajustar Existente</span>
                <span className="block text-[10.5px] font-normal text-slate-500 mt-0.5">Modificar territorio actual</span>
              </button>
            </div>
          </div>

          {requestType === 'propose_new' ? (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Nombre del Territorio Propuesto *
              </label>
              <input
                type="text"
                required
                value={territoryName}
                onChange={(e) => setTerritoryName(e.target.value)}
                placeholder="Ej: Innovación & Sostenibilidad en Set"
                className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          ) : (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Selecciona el Territorio a Modificar *
              </label>
              <select
                value={existingTerritoryId}
                onChange={(e) => setExistingTerritoryId(e.target.value)}
                className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
              >
                {territories.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.targetAudience})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Motivo o Justificación Estratégica *
            </label>
            <input
              type="text"
              required
              value={motive}
              onChange={(e) => setMotive(e.target.value)}
              placeholder="Ej: Lanzamiento de nueva línea de servicios para público joven"
              className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Notas Explicativas & Expectativas para la Agencia *
            </label>
            <textarea
              required
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explica qué contenido esperas que cubra este territorio, tono, competidores o ejemplos..."
              className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Para garantizar la coherencia de marca, los cambios en los territorios son revisados por el Director Creativo antes de activarse en el pipeline.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="territory-review-form"
            disabled={!motive.trim() || !notes.trim() || (requestType === 'propose_new' && !territoryName.trim())}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar Propuesta a la Agencia</span>
          </button>
        </div>
      </div>
    </div>
  );
};
