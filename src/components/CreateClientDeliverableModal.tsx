import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Info, Send } from 'lucide-react';

export const CreateClientDeliverableModal: React.FC = () => {
  const {
    currentUser,
    brands,
    territories,
    isCreateClientDeliverableModalOpen,
    setIsCreateClientDeliverableModalOpen,
    createClientDeliverableProposal,
    selectedBrandId,
  } = useApp();

  const clientBrandId = currentUser.assignedBrandIds?.[0] || selectedBrandId;
  const brand = brands.find((b) => b.id === clientBrandId) || brands[0];
  const brandTerritories = territories.filter((t) => t.brandId === brand?.id && t.active);

  const [title, setTitle] = useState('');
  const [territoryId, setTerritoryId] = useState(brandTerritories[0]?.id || '');
  const [format, setFormat] = useState('9:16 Vertical Reel (45s)');
  const [conceptHook, setConceptHook] = useState('');
  const [desiredPublishDate, setDesiredPublishDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().substring(0, 10);
  });
  const [description, setDescription] = useState('');
  const [references, setReferences] = useState('');

  if (!isCreateClientDeliverableModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !desiredPublishDate) return;

    const refList = references
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    createClientDeliverableProposal({
      title: title.trim(),
      territoryId: territoryId || brandTerritories[0]?.id || 'ter_default',
      conceptHook: conceptHook.trim() || title.trim(),
      description: description.trim(),
      desiredPublishDate,
      format,
      references: refList,
    });

    setTitle('');
    setConceptHook('');
    setDescription('');
    setReferences('');
    setIsCreateClientDeliverableModalOpen(false);
  };

  return (
    <div
      onClick={() => setIsCreateClientDeliverableModalOpen(false)}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-auto border border-slate-200 text-slate-800 animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-xs ring-1 ring-slate-200"
                style={{ backgroundColor: brand?.primaryColor || '#6366f1' }}
              />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                {brand?.name || 'Cliente'} • Co-Creación de Contenido
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Proponer Nueva Pieza Audiovisual
            </h3>
          </div>

          <button
            onClick={() => setIsCreateClientDeliverableModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Agency Guidance Alert */}
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start gap-3 text-xs text-indigo-900 shadow-2xs">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            Tu propuesta entrará directamente a la fase de <strong>Ideación</strong> del Pipeline Kanban. El equipo de dirección técnica de N. Studios evaluará el concepto, asignará al personal de rodaje y preparará la Guía Técnica.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 mb-1 font-semibold text-[11px]">
              Título de la Pieza Audiovisual *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Lanzamiento Zapatillas Kinetic Aero - POV Runner"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1 font-semibold text-[11px]">
                Territorio de Comunicación *
              </label>
              <select
                value={territoryId}
                onChange={(e) => setTerritoryId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
              >
                {brandTerritories.length === 0 ? (
                  <option value="">Sin territorios activos</option>
                ) : (
                  brandTerritories.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-semibold text-[11px]">
                Formato Deseado
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
              >
                <option value="9:16 Vertical Reel (45s)">9:16 Vertical Reel / TikTok (45s)</option>
                <option value="16:9 Master 4K (60s)">16:9 Master Horizontal (60s)</option>
                <option value="4:5 Social Cut (30s)">4:5 Instagram Feed (30s)</option>
                <option value="1:1 Square Ad (15s)">1:1 Cuadrado Anuncio (15s)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1 font-semibold text-[11px]">
                Hook / Frase de Impacto (0-3 Segundos)
              </label>
              <input
                type="text"
                value={conceptHook}
                onChange={(e) => setConceptHook(e.target.value)}
                placeholder="Ej: ¿Listo para romper tu récord personal?"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-semibold text-[11px]">
                Fecha Deseada de Publicación *
              </label>
              <input
                type="date"
                value={desiredPublishDate}
                onChange={(e) => setDesiredPublishDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-semibold text-[11px]">
              Descripción & Mensaje Clave *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué quieres transmitir, qué producto o servicio mostrar y cualquier detalle relevante para el equipo de producción."
              rows={3}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-semibold text-[11px]">
              Enlaces de Referencia o Inspiración (Opcional)
            </label>
            <textarea
              value={references}
              onChange={(e) => setReferences(e.target.value)}
              placeholder="https://tiktok.com/@...&#10;https://instagram.com/reel/..."
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateClientDeliverableModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer active:scale-98"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-98 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Propuesta a la Agencia</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
