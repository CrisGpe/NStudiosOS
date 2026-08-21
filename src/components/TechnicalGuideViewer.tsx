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
    <div className="space-y-4 text-xs text-slate-700">
      {/* Header with Title and AI Generator trigger */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-indigo-700 font-bold text-xs bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
              [{deliverable.code}]
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">{deliverable.title}</h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-semibold text-xs cursor-pointer transition-all shadow-2xs active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Compilar con Gemini AI</span>
        </button>
      </div>

      {/* Grid: 2 Technical Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Pillar 1: Formato & Color */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2 text-xs">
            <Film className="w-4 h-4 text-indigo-600" />
            <span>Relación de Aspecto & Espacio de Color</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10.5px] text-slate-500 block mb-1 font-medium">Ratios de Aspecto:</span>
              <div className="flex flex-wrap gap-1.5">
                {guide.aspectRatios?.map((ratio, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold text-[10.5px]"
                  >
                    {ratio}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10.5px] text-slate-500 block font-medium">Velocidad de Cuadros (Frame Rate):</span>
              <span className="font-semibold text-slate-900 text-xs">{guide.frameRate || '24fps'}</span>
            </div>

            <div>
              <span className="text-[10.5px] text-slate-500 block font-medium">Espacio de Color / Log Profile:</span>
              <span className="font-mono text-slate-900 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200 inline-block text-xs">
                {guide.colorSpace || 'Rec.709'}
              </span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Audio & Iluminación */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2 text-xs">
            <Sun className="w-4 h-4 text-amber-600" />
            <span>Audio Specs & Esquema de Iluminación</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10.5px] text-slate-500 block flex items-center gap-1.5 font-medium">
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                Especificación de Audio:
              </span>
              <p className="text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                {guide.audioSpecs || 'Captura 32-bit Float (-18dB target)'}
              </p>
            </div>

            <div>
              <span className="text-[10.5px] text-slate-500 block flex items-center gap-1.5 font-medium">
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                Esquema de Iluminación Sugerido:
              </span>
              <p className="text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                {guide.lightingScheme || '3-Point Lighting (Key 5600K, Rim azul)'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shotlist Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Matriz de Tomas & Shotlist ({guide.shotlist?.length || 0} tomas)</span>
          </div>

          <button
            onClick={() => setIsEditingShotlist(!isEditingShotlist)}
            className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isEditingShotlist ? 'Cancelar Toma' : 'Añadir Toma'}</span>
          </button>
        </div>

        {/* New Shot Inline Form */}
        {isEditingShotlist && (
          <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 space-y-3 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div className="sm:col-span-2">
                <label className="block text-[10.5px] font-semibold text-slate-700 mb-1">Descripción Visual de la Toma *</label>
                <input
                  type="text"
                  value={newShotDesc}
                  onChange={(e) => setNewShotDesc(e.target.value)}
                  placeholder="Ej: Primer plano del producto con luz rasante"
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-slate-700 mb-1">Ángulo de Cámara</label>
                <select
                  value={newShotAngle}
                  onChange={(e) => setNewShotAngle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
                >
                  <option value="Close Up">Close Up (Primer Plano)</option>
                  <option value="Medium Shot">Medium Shot (Plano Medio)</option>
                  <option value="Wide Shot">Wide Shot (Plano General)</option>
                  <option value="Overhead / Flatlay">Overhead / Cenital</option>
                  <option value="POV">POV (Primera Persona)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-slate-700 mb-1">Movimiento</label>
                <select
                  value={newShotMovement}
                  onChange={(e) => setNewShotMovement(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
                >
                  <option value="Estático">Estático (Trípode)</option>
                  <option value="Push In (Lento)">Push In (Acercamiento)</option>
                  <option value="Gimbal Orbit">Gimbal Orbit</option>
                  <option value="Pan / Tilt">Pan / Tilt</option>
                  <option value="Handheld Orgánico">Handheld Orgánico</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
              <div>
                <label className="block text-[10.5px] font-semibold text-slate-700 mb-1">Duración (seg)</label>
                <input
                  type="number"
                  value={newShotDuration}
                  onChange={(e) => setNewShotDuration(Number(e.target.value))}
                  min={1}
                  max={60}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10.5px] font-semibold text-slate-700 mb-1">Nota de Audio / Sonido</label>
                  <input
                    type="text"
                    value={newShotAudio}
                    onChange={(e) => setNewShotAudio(e.target.value)}
                    placeholder="Ej: Sonido de impacto + riser"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddShot}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shotlist Table */}
        {(!guide.shotlist || guide.shotlist.length === 0) ? (
          <div className="p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs bg-slate-50/50">
            No hay tomas en el shotlist. Haz clic en "Compilar con Gemini AI" o "Añadir Toma" para empezar.
          </div>
        ) : (
          <div className="space-y-2">
            {guide.shotlist.map((shot, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                    #{shot.shotNumber}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{shot.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                      <span>{shot.cameraAngle}</span>
                      <span>•</span>
                      <span>{shot.movement}</span>
                      <span>•</span>
                      <span className="text-amber-700 font-bold">{shot.durationSec}s</span>
                      {shot.audioNote && (
                        <>
                          <span>•</span>
                          <span className="truncate italic text-slate-600">🎧 {shot.audioNote}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveShot(idx)}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Director Sign-Off Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span>Validación Formal de Dirección Técnica</span>
          </div>
          {guide.directorSignOff?.approved ? (
            <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Aprobado por {guide.directorSignOff.approvedBy} el {guide.directorSignOff.approvedAt}</span>
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 mt-1">
              Pendiente de firma formal por la Dirección Técnica antes de rodaje.
            </p>
          )}
        </div>

        {!guide.directorSignOff?.approved && isDirector && (
          <button
            type="button"
            onClick={handleDirectorSignOff}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Firmar y Validar Guía Técnica</span>
          </button>
        )}
      </div>
    </div>
  );
};
