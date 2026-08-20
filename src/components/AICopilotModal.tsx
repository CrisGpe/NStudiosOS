import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  X,
  Send,
  Film,
  Camera,
  Layers,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Cpu,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { Deliverable, TechnicalGuide } from '../types';

export const AICopilotModal: React.FC = () => {
  const {
    isAiModalOpen,
    setIsAiModalOpen,
    aiModalContext,
    brands,
    territories,
    currentUser,
    createDeliverable,
    updateTechnicalGuide,
    deliverables,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ideate' | 'techGuide' | 'evaluate'>(
    aiModalContext?.action || 'ideate'
  );

  // Ideation Form State
  const [selectedBrandId, setSelectedBrandId] = useState<string>(
    aiModalContext?.brandId || brands[0]?.id || ''
  );
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string>('');
  const [creativeBrief, setCreativeBrief] = useState<string>(
    'Campaña de lanzamiento para nuevo producto destacando innovación, alto impacto visual y retención en los primeros 3 segundos.'
  );
  const [isIdeating, setIsIdeating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);

  // Tech Guide Form State
  const [targetDeliverableId, setTargetDeliverableId] = useState<string>(
    aiModalContext?.deliverable?.id || deliverables[0]?.id || ''
  );
  const [techStyleNotes, setTechStyleNotes] = useState<string>(
    'Estilo cinematográfico anamórfico, alto contraste, grano 35mm fino, iluminación de tres puntos con luces prácticas de neón y sonido ASMR binaural inmersivo.'
  );
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [generatedGuideResult, setGeneratedGuideResult] = useState<any>(null);

  if (!isAiModalOpen) return null;

  const currentBrand = brands.find((b) => b.id === selectedBrandId) || brands[0];
  const brandTerritories = territories.filter((t) => t.brandId === currentBrand?.id && t.active);
  const activeTerritory =
    brandTerritories.find((t) => t.id === selectedTerritoryId) || brandTerritories[0];

  const handleRunIdeation = async () => {
    if (!currentBrand) return;
    setIsIdeating(true);
    setGeneratedIdeas([]);

    try {
      const response = await fetch('/api/gemini/ideate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: currentBrand.name,
          industry: currentBrand.industry,
          brandTone: `${currentBrand.name} estilo ${currentBrand.industry}`,
          territory: activeTerritory ? activeTerritory.name : 'Innovación y Performance',
          briefPrompt: creativeBrief,
        }),
      });

      const data = await response.json();
      if (data.ideas) {
        setGeneratedIdeas(data.ideas);
      }
    } catch (err) {
      console.error('Error generating ideas with AI', err);
      alert('Error comunicando con Gemini API.');
    } finally {
      setIsIdeating(false);
    }
  };

  const handleApplyIdeaAsDeliverable = (idea: any) => {
    const newDeliverable = createDeliverable({
      title: idea.title,
      brandId: currentBrand.id,
      territoryId: activeTerritory ? activeTerritory.id : territories[0].id,
      assigneeId: currentUser.id,
      phase: 'ideacion',
      priority: 'high',
      format: idea.format || 'Video 9:16 UHD',
      conceptHook: idea.hook,
      description: idea.narrativeConcept,
      productionStartDate: '2026-08-28',
      productionEndDate: '2026-08-29',
      publishDate: '2026-09-08',
      equipmentReservedIds: [],
      assetsLinked: [],
      technicalGuide: {
        aspectRatios: ['9:16', '16:9'],
        frameRate: '24fps',
        colorSpace: 'S-Log3 / Rec.709',
        audioSpecs: idea.audioDesign || 'Audio limpio estéreo',
        lightingScheme: idea.visualStyle || 'Cinematográfico contemporáneo',
        equipmentList: [],
        exportTargets: ['Instagram Reels', 'TikTok', 'YouTube Shorts'],
        shotlist: [],
      },
    });

    alert(`¡Entregable "${newDeliverable.title}" creado con éxito en Fase de Ideación!`);
    setIsAiModalOpen(false);
  };

  const handleRunTechGuideGeneration = async () => {
    const targetDel = deliverables.find((d) => d.id === targetDeliverableId);
    if (!targetDel) return;

    setIsGeneratingGuide(true);
    setGeneratedGuideResult(null);

    try {
      const response = await fetch('/api/gemini/technical-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliverable: targetDel,
          styleNotes: techStyleNotes,
        }),
      });

      const data = await response.json();
      setGeneratedGuideResult(data);
    } catch (err) {
      console.error('Error compiling tech guide with AI', err);
      alert('Error comunicando con Gemini API.');
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  const handleApplyTechGuideToDeliverable = () => {
    if (!generatedGuideResult || !targetDeliverableId) return;

    const formattedGuide: TechnicalGuide = {
      aspectRatios: generatedGuideResult.aspectRatios || ['9:16'],
      frameRate: generatedGuideResult.frameRate || '24fps',
      colorSpace: generatedGuideResult.colorSpace || 'Rec.709',
      audioSpecs: generatedGuideResult.audioSpecs || 'Audio estéreo',
      lightingScheme: generatedGuideResult.lightingScheme || '3-point standard',
      equipmentList: generatedGuideResult.equipmentList || [],
      exportTargets: generatedGuideResult.exportTargets || ['Social Reels / TikTok'],
      shotlist: (generatedGuideResult.shotlist || []).map((s: any, idx: number) => ({
        shotNumber: idx + 1,
        description: s.description || '',
        cameraAngle: s.cameraAngle || 'Medium Shot',
        movement: s.movement || 'Estático',
        durationSec: s.durationSec || 3,
        audioNote: s.audioNote || '',
      })),
    };

    updateTechnicalGuide(targetDeliverableId, formattedGuide);
    alert('¡Guía Técnica y Shotlist sincronizados con el entregable correctamente!');
    setIsAiModalOpen(false);
  };

  return (
    <div
      onClick={() => setIsAiModalOpen(false)}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in-scale"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel-elevated rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-white/15 text-slate-100"
      >
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-slate-950/80 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-xs">
                <Sparkles className="w-4 h-4 animate-subtle-pulse" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>Asistente de Producción Audiovisual</span>
                  <span className="text-[9.5px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                    Gemini Flash Thinking
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Co-creación conceptual, compilación de shotlists cinematográficos y análisis de impacto T-3.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAiModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 mt-3.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('ideate')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'ideate'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40'
                  : 'bg-slate-950/60 text-slate-400 border border-white/10 hover:text-white hover:bg-white/5'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>1. Ideación & Conceptos</span>
            </button>

            <button
              onClick={() => setActiveTab('techGuide')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'techGuide'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/40'
                  : 'bg-slate-950/60 text-slate-400 border border-white/10 hover:text-white hover:bg-white/5'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>2. Compilador de Guía Técnica</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-slate-300">
          
          {/* TAB 1: IDEATION */}
          {activeTab === 'ideate' && (
            <div className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Marca / Cliente *</label>
                  <select
                    value={selectedBrandId}
                    onChange={(e) => {
                      setSelectedBrandId(e.target.value);
                      const terrs = territories.filter((t) => t.brandId === e.target.value && t.active);
                      if (terrs[0]) setSelectedTerritoryId(terrs[0].id);
                    }}
                    className="input-impeccable cursor-pointer"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                        {b.name} ({b.industry})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Territorio de Comunicación *</label>
                  <select
                    value={selectedTerritoryId}
                    onChange={(e) => setSelectedTerritoryId(e.target.value)}
                    className="input-impeccable cursor-pointer"
                  >
                    {brandTerritories.map((t) => (
                      <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Brief Creativo / Objetivo del Spot *</label>
                <textarea
                  value={creativeBrief}
                  onChange={(e) => setCreativeBrief(e.target.value)}
                  rows={2}
                  className="input-impeccable"
                  placeholder="Describe la intención narrativa, arquetipo de personaje y llamado a la acción..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleRunIdeation}
                  disabled={isIdeating}
                  className="btn-primary"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isIdeating ? 'Generando Conceptos...' : 'Generar 3 Propuestas Creativas'}</span>
                </button>
              </div>

              {/* Generated Ideas Result Cards */}
              {generatedIdeas.length > 0 && (
                <div className="space-y-3 pt-3.5 border-t border-white/10">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>Propuestas Creativas Co-creadas</span>
                  </h4>

                  <div className="space-y-3">
                    {generatedIdeas.map((idea, iIdx) => (
                      <div
                        key={iIdx}
                        className="bg-slate-950/70 p-4 rounded-xl border border-white/10 space-y-2.5 hover:border-purple-500/50 transition-all shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[9.5px] uppercase font-bold text-purple-400 font-mono">
                              Propuesta #{iIdx + 1} • {idea.format || '9:16 UHD'}
                            </span>
                            <h5 className="text-xs font-bold text-white mt-0.5">{idea.title}</h5>
                          </div>

                          <button
                            onClick={() => handleApplyIdeaAsDeliverable(idea)}
                            className="btn-primary py-1 px-2.5 text-[11px] shrink-0"
                          >
                            <span>Convertir en Entregable</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Hook */}
                        <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/30">
                          <span className="text-[9.5px] font-bold text-indigo-400 block mb-0.5">
                            Hook de 3 Segundos:
                          </span>
                          <p className="text-indigo-200 italic text-xs">"{idea.hook}"</p>
                        </div>

                        {/* Narrative */}
                        <p className="text-slate-300 leading-relaxed text-xs">
                          {idea.narrativeConcept}
                        </p>

                        {/* Tags */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1.5 border-t border-white/5">
                          <div className="text-slate-400">
                            <strong className="text-slate-200">Estilo Visual:</strong> {idea.visualStyle}
                          </div>
                          <div className="text-slate-400">
                            <strong className="text-slate-200">Diseño Sonoro:</strong> {idea.audioDesign}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: TECHNICAL GUIDE COMPILER */}
          {activeTab === 'techGuide' && (
            <div className="space-y-4">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Entregable a Compilar *</label>
                <select
                  value={targetDeliverableId}
                  onChange={(e) => setTargetDeliverableId(e.target.value)}
                  className="input-impeccable cursor-pointer"
                >
                  {deliverables.map((del) => {
                    const b = brands.find((brand) => brand.id === del.brandId);
                    return (
                      <option key={del.id} value={del.id} className="bg-slate-900 text-white">
                        [{del.code}] {del.title} ({b?.name})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Instrucciones de Estilo & Cinematografía</label>
                <textarea
                  value={techStyleNotes}
                  onChange={(e) => setTechStyleNotes(e.target.value)}
                  rows={2}
                  className="input-impeccable"
                  placeholder="Detalles sobre temperatura de color, tipo de lente (anamórfico/esférico), movimientos de cámara..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleRunTechGuideGeneration}
                  disabled={isGeneratingGuide}
                  className="btn-primary"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{isGeneratingGuide ? 'Compilando Guía Técnica...' : 'Compilar Guía Técnica & Shotlist'}</span>
                </button>
              </div>

              {/* Generated Tech Guide Result */}
              {generatedGuideResult && (
                <div className="bg-slate-950/70 p-4 rounded-xl border border-white/10 space-y-3 pt-3.5 animate-in-scale shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Guía Técnica Compilada con Éxito</span>
                    </h4>

                    <button
                      onClick={handleApplyTechGuideToDeliverable}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
                    >
                      Sincronizar con Entregable
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-white/10">
                      <span className="text-slate-400 text-[10px] block">Ratios & Formato</span>
                      <span className="font-mono text-white text-xs">
                        {generatedGuideResult.aspectRatios?.join(', ')} • {generatedGuideResult.frameRate}
                      </span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-white/10">
                      <span className="text-slate-400 text-[10px] block">Perfil de Color</span>
                      <span className="font-mono text-white text-xs">{generatedGuideResult.colorSpace}</span>
                    </div>
                  </div>

                  {/* Shotlist table */}
                  {generatedGuideResult.shotlist && (
                    <div className="space-y-2 pt-1">
                      <span className="font-bold text-white text-xs">Shotlist Cinematográfico:</span>
                      <div className="overflow-x-auto rounded-xl border border-white/10">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 bg-slate-900/80 text-slate-400 uppercase text-[9.5px]">
                              <th className="py-2 px-2.5">#</th>
                              <th className="py-2 px-3">Descripción</th>
                              <th className="py-2 px-2.5">Ángulo</th>
                              <th className="py-2 px-2.5">Movimiento</th>
                              <th className="py-2 px-2.5">Duración</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 bg-slate-950/40">
                            {generatedGuideResult.shotlist.map((s: any, idx: number) => (
                              <tr key={idx} className="hover:bg-white/5 transition-colors">
                                <td className="py-2 px-2.5 font-mono text-indigo-400 font-bold">#{idx + 1}</td>
                                <td className="py-2 px-3 text-slate-200">{s.description}</td>
                                <td className="py-2 px-2.5 text-slate-300 font-mono">{s.cameraAngle}</td>
                                <td className="py-2 px-2.5 text-slate-300">{s.movement}</td>
                                <td className="py-2 px-2.5 font-mono text-amber-400 font-bold">{s.durationSec}s</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
