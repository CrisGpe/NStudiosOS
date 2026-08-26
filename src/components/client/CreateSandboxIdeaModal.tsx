import React, { useState } from 'react';
import { Sparkles, X, Target, Film, Palette, CheckCircle2, ArrowRight, ArrowLeft, Link as LinkIcon, FileText } from 'lucide-react';
import { Brand, CommunicationTerritory } from '../../types';

interface CreateSandboxIdeaModalProps {
  brand: Brand;
  territories: CommunicationTerritory[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    brandId: string;
    title: string;
    notes: string;
    targetTerritoryId?: string;
    formatSuggested: string;
    referenceUrls: string[];
    ideaType: 'campaign' | 'video' | 'graphic';
  }) => void;
}

export const CreateSandboxIdeaModal: React.FC<CreateSandboxIdeaModalProps> = ({
  brand,
  territories,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [ideaType, setIdeaType] = useState<'campaign' | 'video' | 'graphic'>('video');
  const [title, setTitle] = useState('');
  const [territoryId, setTerritoryId] = useState(territories[0]?.id || '');
  const [formatSuggested, setFormatSuggested] = useState('9:16 Vertical Reel (45s)');
  const [referenceUrls, setReferenceUrls] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSelectType = (type: 'campaign' | 'video' | 'graphic') => {
    setIdeaType(type);
    if (type === 'video') {
      setFormatSuggested('9:16 Vertical Reel (45s)');
    } else if (type === 'graphic') {
      setFormatSuggested('1:1 Feed Post (Carrusel 5 slides)');
    } else if (type === 'campaign') {
      setFormatSuggested('Campaña Multi-pieza 360° (Video + Gráficos)');
    }
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !notes.trim()) return;

    const urls = referenceUrls
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    onSubmit({
      brandId: brand.id,
      title: title.trim(),
      notes: notes.trim(),
      targetTerritoryId: territoryId || undefined,
      formatSuggested,
      referenceUrls: urls,
      ideaType,
    });

    // Reset
    setTitle('');
    setNotes('');
    setReferenceUrls('');
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <span>Nueva Idea Co-Creativa para {brand.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                  Paso {step} de 2
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {step === 1
                  ? 'Selecciona el tipo de contenido que deseas proponer'
                  : 'Completa los detalles creativos y referencias de la propuesta'}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {step === 1 && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                ¿Qué tipo de pieza o propuesta deseas idear?
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Option 1: Video / Audiovisual */}
                <button
                  type="button"
                  onClick={() => handleSelectType('video')}
                  className="p-4.5 rounded-2xl border text-left transition-all hover:border-indigo-500 hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3 border-slate-200 bg-white group hover:bg-indigo-50/30"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 group-hover:scale-105 transition-transform">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-700">
                      Contenido Audiovisual
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Reels, TikToks, Shorts, video corporativo o tomas de set.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                    <span>Elegir Video</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </button>

                {/* Option 2: Visual Graphic */}
                <button
                  type="button"
                  onClick={() => handleSelectType('graphic')}
                  className="p-4.5 rounded-2xl border text-left transition-all hover:border-teal-500 hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3 border-slate-200 bg-white group hover:bg-teal-50/30"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200 group-hover:scale-105 transition-transform">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-teal-700">
                      Contenido Gráfico
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Carruseles, piezas de feed, banners, infografías o mockups.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-teal-600 flex items-center gap-1">
                    <span>Elegir Gráfico</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </button>

                {/* Option 3: Campaign */}
                <button
                  type="button"
                  onClick={() => handleSelectType('campaign')}
                  className="p-4.5 rounded-2xl border text-left transition-all hover:border-rose-500 hover:shadow-md cursor-pointer flex flex-col justify-between space-y-3 border-slate-200 bg-white group hover:bg-rose-50/30"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 group-hover:scale-105 transition-transform">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-rose-700">
                      Campaña Comercial
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Estrategia multi-pieza 360°, lanzamientos o pauta pagada.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                    <span>Elegir Campaña</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form id="create-idea-form" onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/60 border border-purple-200">
                <span className="text-[11px] font-semibold text-purple-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Tipo: <strong>{ideaType === 'video' ? 'Audiovisual (Video)' : ideaType === 'graphic' ? 'Contenido Visual (Gráfico)' : 'Campaña Comercial'}</strong></span>
                </span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[10.5px] font-bold text-purple-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Cambiar tipo</span>
                </button>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Título o Concepto Clave *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    ideaType === 'video'
                      ? 'Ej: Video POV dinámico probando producto en exterior'
                      : ideaType === 'graphic'
                      ? 'Ej: Carrusel educativo: 5 claves para el cuidado del cabello'
                      : 'Ej: Campaña de Primavera 2026 - Renovación Total'
                  }
                  className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Territorio de Comunicación Objetivo
                  </label>
                  <select
                    value={territoryId}
                    onChange={(e) => setTerritoryId(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  >
                    <option value="">(Sin asignar - General)</option>
                    {territories.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Formato Sugerido
                  </label>
                  <input
                    type="text"
                    value={formatSuggested}
                    onChange={(e) => setFormatSuggested(e.target.value)}
                    placeholder="Ej: 9:16 Vertical Reel (45s)"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Enlaces de Referencia (TikTok, Reel, Pinterest, YouTube)
                </label>
                <textarea
                  rows={2}
                  value={referenceUrls}
                  onChange={(e) => setReferenceUrls(e.target.value)}
                  placeholder="https://instagram.com/reel/...&#10;https://tiktok.com/@creator/video/..."
                  className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Notas Creativas, Ángulo o Detalle de la Idea *
                </label>
                <textarea
                  required
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe la idea, qué te gustó de la referencia, música sugerida o intención..."
                  className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Atrás</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          )}

          {step === 2 && (
            <button
              type="submit"
              form="create-idea-form"
              disabled={!title.trim() || !notes.trim()}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guardar Idea en Sandbox</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
