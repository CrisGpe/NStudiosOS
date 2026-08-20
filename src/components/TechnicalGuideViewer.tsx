import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Deliverable,
  TechnicalGuide,
  ShotItem,
} from '../types';
import {
  Film,
  Camera,
  Layers,
  Sparkles,
  Sliders,
  Volume2,
  Sun,
  Tv,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  FileCheck2,
} from 'lucide-react';

interface TechnicalGuideViewerProps {
  deliverable: Deliverable;
  onUpdate?: (guide: TechnicalGuide) => void;
}

export const TechnicalGuideViewer: React.FC<TechnicalGuideViewerProps> = ({
  deliverable,
  onUpdate,
}) => {
  const { updateTechnicalGuide, currentUser, brands, openAiModalWithContext } = useApp();
  const [guide, setGuide] = useState<TechnicalGuide>(deliverable.technicalGuide);
  const [isEditingShotlist, setIsEditingShotlist] = useState(false);

  // New shot form state
  const [newShotDesc, setNewShotDesc] = useState('');
  const [newShotAngle, setNewShotAngle] = useState('Medium Shot');
  const [newShotMovement, setNewShotMovement] = useState('Estático');
  const [newShotDuration, setNewShotDuration] = useState(3);
  const [newShotAudio, setNewShotAudio] = useState('');

  const brand = brands.find((b) => b.id === deliverable.brandId);
  const isDirector = currentUser.role === 'director' || currentUser.role === 'webadmin';

  const handleAddShot = () => {
    if (!newShotDesc.trim()) return;

    const newShot: ShotItem = {
      shotNumber: (guide.shotlist?.length || 0) + 1,
      description: newShotDesc,
      cameraAngle: newShotAngle,
      movement: newShotMovement,
      durationSec: Number(newShotDuration),
      audioNote: newShotAudio,
    };

    const updatedGuide: TechnicalGuide = {
      ...guide,
      shotlist: [...(guide.shotlist || []), newShot],
    };

    setGuide(updatedGuide);
    updateTechnicalGuide(deliverable.id, updatedGuide);
    if (onUpdate) onUpdate(updatedGuide);

    setNewShotDesc('');
    setNewShotAudio('');
    setIsEditingShotlist(false);
  };

  const handleRemoveShot = (index: number) => {
    const updatedShots = guide.shotlist.filter((_, i) => i !== index).map((s, idx) => ({ ...s, shotNumber: idx + 1 }));
    const updatedGuide: TechnicalGuide = {
      ...guide,
      shotlist: updatedShots,
    };
    setGuide(updatedGuide);
    updateTechnicalGuide(deliverable.id, updatedGuide);
    if (onUpdate) onUpdate(updatedGuide);
  };

  const handleDirectorSignOff = () => {
    if (!isDirector) {
      alert('Solo el Director de Proyecto o WebAdmin pueden firmar formalmente la Guía Técnica.');
      return;
    }

    const updatedGuide: TechnicalGuide = {
      ...guide,
      directorSignOff: {
        approved: true,
        approvedBy: currentUser.name,
        approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        notes: 'Guía técnica validada para el plan de rodaje y kit de equipamiento.',
      },
    };

    setGuide(updatedGuide);
    updateTechnicalGuide(deliverable.id, updatedGuide);
    if (onUpdate) onUpdate(updatedGuide);
  };

  return (
    <div className="space-y-4 text-xs text-slate-300">
      
      {/* Header with Title and AI Generator trigger */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-indigo-400 font-bold text-xs bg-slate-900 px-2 py-0.5 rounded-lg border border-white/10">
              [{deliverable.code}]
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-white">{deliverable.title}</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Especificación Técnica Audiovisual y Matriz de Rodaje
          </p>
        </div>

        <button
          onClick={() =>
            openAiModalWithContext({
              action: 'techGuide',
              deliverable,
            })
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-semibold text-xs cursor-pointer transition-all shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-subtle-pulse" />
          <span>Compilar con Gemini AI</span>
        </button>
      </div>

      {/* Grid: 2 Technical Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* Pillar 1: Formato & Color */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-white/10 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-white border-b border-white/10 pb-2 text-xs">
            <Film className="w-4 h-4 text-indigo-400" />
            <span>Relación de Aspecto & Espacio de Color</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10.5px] text-slate-400 block mb-1 font-medium">Ratios de Aspecto:</span>
              <div className="flex flex-wrap gap-1.5">
                {guide.aspectRatios?.map((ratio, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono font-bold text-[10.5px]"
                  >
                    {ratio}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10.5px] text-slate-400 block font-medium">Velocidad de Cuadros (Frame Rate):</span>
              <span className="font-semibold text-white text-xs">{guide.frameRate || '24fps'}</span>
            </div>

            <div>
              <span className="text-[10.5px] text-slate-400 block font-medium">Espacio de Color / Log Profile:</span>
              <span className="font-mono text-white bg-slate-900 px-2 py-0.5 rounded-lg border border-white/10 inline-block text-xs">
                {guide.colorSpace || 'Rec.709'}
              </span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Audio & Iluminación */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-white/10 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-white border-b border-white/10 pb-2 text-xs">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Audio Specs & Esquema de Iluminación</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10.5px] text-slate-400 block flex items-center gap-1.5 font-medium">
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                Especificación de Audio:
              </span>
              <p className="text-slate-200 leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-white/10 text-xs">
                {guide.audioSpecs || 'Captura 32-bit Float (-18dB target)'}
              </p>
            </div>

            <div>
              <span className="text-[10.5px] text-slate-400 block flex items-center gap-1.5 font-medium">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Esquema de Iluminación Sugerido:
              </span>
              <p className="text-slate-200 leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-white/10 text-xs">
                {guide.lightingScheme || '3-Point Lighting (Key 5600K, Rim azul)'}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Shotlist Table */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-white/10 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 font-bold text-white text-xs">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Shotlist & Desglose de Planos ({guide.shotlist?.length || 0})</span>
          </div>

          <button
            onClick={() => setIsEditingShotlist(!isEditingShotlist)}
            className="btn-secondary py-1 px-2.5 text-[11px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Plano</span>
          </button>
        </div>

        {/* Add Shot Inline Form */}
        {isEditingShotlist && (
          <div className="bg-slate-900/90 p-4 rounded-xl border border-indigo-500/40 space-y-3 animate-in-scale">
            <div className="font-bold text-indigo-300 text-xs">Nuevo Plano al Shotlist:</div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 text-[10.5px] font-medium">Ángulo de Cámara</label>
                <input
                  type="text"
                  value={newShotAngle}
                  onChange={(e) => setNewShotAngle(e.target.value)}
                  placeholder="Ej: Close-Up"
                  className="input-impeccable py-1"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-[10.5px] font-medium">Movimiento de Cámara</label>
                <input
                  type="text"
                  value={newShotMovement}
                  onChange={(e) => setNewShotMovement(e.target.value)}
                  placeholder="Ej: Push-in"
                  className="input-impeccable py-1"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-[10.5px] font-medium">Duración (segundos)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={newShotDuration}
                  onChange={(e) => setNewShotDuration(Number(e.target.value))}
                  className="input-impeccable py-1 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[10.5px] font-medium">Descripción de la Acción *</label>
              <input
                type="text"
                value={newShotDesc}
                onChange={(e) => setNewShotDesc(e.target.value)}
                placeholder="Ej: Plano detalle de gota cayendo..."
                className="input-impeccable py-1"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-[10.5px] font-medium">Nota de Audio / Diseño Sonoro</label>
              <input
                type="text"
                value={newShotAudio}
                onChange={(e) => setNewShotAudio(e.target.value)}
                placeholder="Ej: Sonido ASMR nítido..."
                className="input-impeccable py-1"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => setIsEditingShotlist(false)}
                className="btn-secondary py-1"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddShot}
                className="btn-primary py-1"
              >
                Guardar Plano
              </button>
            </div>
          </div>
        )}

        {/* Shots List Table */}
        {(!guide.shotlist || guide.shotlist.length === 0) ? (
          <div className="py-6 text-center text-slate-500 border border-dashed border-white/10 rounded-xl text-xs bg-slate-950/40">
            No hay planos registrados en el shotlist. Compila con IA o agrega manualmente.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/80 text-slate-400 text-[10px] uppercase font-semibold">
                  <th className="py-2 px-2.5">#</th>
                  <th className="py-2 px-3">Descripción</th>
                  <th className="py-2 px-2.5">Ángulo</th>
                  <th className="py-2 px-2.5">Movimiento</th>
                  <th className="py-2 px-2.5">Duración</th>
                  <th className="py-2 px-2.5">Audio</th>
                  <th className="py-2 px-2 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-950/40">
                {guide.shotlist.map((shot, sIdx) => (
                  <tr key={sIdx} className="hover:bg-white/5 transition-colors">
                    <td className="py-2 px-2.5 font-mono font-bold text-indigo-400">
                      #{shot.shotNumber || sIdx + 1}
                    </td>
                    <td className="py-2 px-3 text-slate-200 font-medium">
                      {shot.description}
                    </td>
                    <td className="py-2 px-2.5 text-slate-300 font-mono text-xs">
                      {shot.cameraAngle}
                    </td>
                    <td className="py-2 px-2.5 text-slate-300 text-xs">
                      {shot.movement}
                    </td>
                    <td className="py-2 px-2.5 font-mono text-amber-400 font-bold">
                      {shot.durationSec}s
                    </td>
                    <td className="py-2 px-2.5 text-slate-400 italic text-xs">
                      {shot.audioNote || '-'}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <button
                        onClick={() => handleRemoveShot(sIdx)}
                        className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                        title="Eliminar plano"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Target Export Platforms */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-white/10 space-y-2 shadow-2xs">
        <span className="text-xs text-slate-400 block font-semibold flex items-center gap-2">
          <Tv className="w-3.5 h-3.5 text-teal-400" />
          Destinos de Exportación & Masters:
        </span>
        <div className="flex flex-wrap gap-2">
          {(guide.exportTargets || ['Master ProRes 422HQ', 'Instagram Reels 1080x1920', 'TikTok HQ']).map(
            (target, tIdx) => (
              <span
                key={tIdx}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-200 font-mono text-xs"
              >
                {target}
              </span>
            )
          )}
        </div>
      </div>

      {/* Director Sign-Off Block */}
      <div
        className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 shadow-2xs ${
          guide.directorSignOff?.approved
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
            : 'bg-slate-950/70 border-white/10'
        }`}
      >
        <div className="flex items-center gap-3">
          {guide.directorSignOff?.approved ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <FileCheck2 className="w-5 h-5 text-slate-400 shrink-0" />
          )}
          <div>
            <div className="font-bold text-white text-xs">
              {guide.directorSignOff?.approved
                ? 'Guía Técnica Firmada & Aprobada por Dirección'
                : 'Pendiente de Visto Bueno del Director de Proyecto'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {guide.directorSignOff?.approved
                ? `Firmado por ${guide.directorSignOff.approvedBy} el ${guide.directorSignOff.approvedAt}`
                : 'Requerido antes de habilitar la fase de Rodaje activo.'}
            </p>
          </div>
        </div>

        {!guide.directorSignOff?.approved && isDirector && (
          <button
            onClick={handleDirectorSignOff}
            className="btn-primary"
          >
            Firmar & Aprobar Guía Técnica
          </button>
        )}
      </div>

    </div>
  );
};
