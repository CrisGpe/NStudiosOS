import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Sparkles,
  Target,
  Calendar,
  Layers,
  Link,
  Info,
  CheckCircle2,
} from 'lucide-react';

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
      territoryId: territoryId || brandTerritories[0]?.id || '',
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in-scale"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel-elevated rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-auto border border-white/15 text-slate-100"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-3.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-xs ring-1 ring-white/20"
                style={{ backgroundColor: brand?.primaryColor || '#6366f1' }}
              />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                {brand?.name} • Co-Creación de Contenido
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              Proponer Nueva Pieza Audiovisual
            </h3>
          </div>

          <button
            onClick={() => setIsCreateClientDeliverableModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Agency Guidance Alert */}
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-3 text-xs text-indigo-200 shadow-xs">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            Tu propuesta entrará directamente a la fase de <strong>Ideación</strong> del Pipeline Kanban. El equipo de dirección técnica de N. Studios evaluará el concepto, asignará al personal de rodaje y preparará la Guía Técnica.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div>
            <label className="block text-slate-300 mb-1 font-semibold text-[11px]">
              Título de la Pieza Audiovisual *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Lanzamiento Zapatillas Kinetic Aero - POV Runner"
              required
              className="input-impeccable"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold text-[11px]">
                Territorio de Comunicación *
              </label>
              <select
                value={territoryId}
                onChange={(e) => setTerritoryId(e.target.value)}
                required
                className="input-impeccable cursor-pointer"
              >
                {brandTerritories.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold text-[11px]">
                Formato Deseado
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="input-impeccable cursor-pointer font-mono"
              >
                <option value="9:16 Vertical Reel (45s)" className="bg-slate-900 text-white">9:16 Vertical Reel / TikTok (45s)</option>
                <option value="16:9 Master 4K (60s)" className="bg-slate-900 text-white">16:9 Master Horizontal (60s)</option>
                <option value="4:5 Social Cut (30s)" className="bg-slate-900 text-white">4:5 Instagram Feed (30s)</option>
                <option value="1:1 Square Ad (15s)" className="bg-slate-900 text-white">1:1 Cuadrado Anuncio (15s)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold text-[11px]">
                Hook / Frase de Impacto (0-3 Segundos)
              </label>
              <input
                type="text"
                value={conceptHook}
                onChange={(e) => setConceptHook(e.target.value)}
                placeholder="Ej: ¿Listo para romper tu récord personal?"
                className="input-impeccable"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold text-[11px]">
                Fecha Deseada de Publicación *
              </label>
              <input
                type="date"
                value={desiredPublishDate}
                onChange={(e) => setDesiredPublishDate(e.target.value)}
                required
                className="input-impeccable font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold text-[11px]">
              Descripción & Mensaje Clave *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué quieres transmitir, qué producto o servicio mostrar y cualquier detalle relevante para el equipo de producción."
              rows={3}
              required
              className="input-impeccable"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold text-[11px]">
              Enlaces de Referencia o Inspiración (Opcional)
            </label>
            <textarea
              value={references}
              onChange={(e) => setReferences(e.target.value)}
              placeholder="https://tiktok.com/@...\nhttps://instagram.com/reel/..."
              rows={2}
              className="input-impeccable font-mono"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3.5 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsCreateClientDeliverableModalOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Enviar Propuesta a la Agencia
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
