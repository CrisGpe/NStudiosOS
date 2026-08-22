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
    toast,
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
        toast.success('¡Ideas de campaña co-creadas con éxito por Gemini!');
      }
    } catch (err) {
      console.error('Error generating ideas with AI', err);
      toast.error('Error comunicando con Gemini API.');
    } finally {
      setIsIdeating(false);
    }
  };

  const handleApplyIdeaAsDeliverable = (idea: any) => {
    const newDeliverable = createDeliverable({
      title: idea.title,
      brandId: currentBrand?.id || brands[0]?.id || 'brd_default',
      territoryId: activeTerritory ? activeTerritory.id : territories[0]?.id || 'ter_default',
      assigneeId: currentUser.id,
      phase: 'ideacion',
      priority: 'high',
      format: idea.format || 'Video 9:16 UHD',
      conceptHook: idea.hook,
      description: idea.narrativeConcept,
      productionStartDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      productionEndDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      publishDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
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

    toast.success(`¡Entregable "${newDeliverable.title}" creado con éxito en Fase de Ideación!`);
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
      toast.success('Guía técnica generada por Gemini.');
    } catch (err) {
      console.error('Error compiling tech guide with AI', err);
      toast.error('Error comunicando con Gemini API.');
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
    toast.success('¡Guía Técnica y Shotlist sincronizados con el entregable correctamente!');
    setIsAiModalOpen(false);
  };

  return (
    <div
      onClick={() => setIsAiModalOpen(false)}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-slate-200 text-slate-800 animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-2xs">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Asistente de Producción Audiovisual</span>
                  <span className="text-[9.5px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                    Gemini Flash Thinking
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Co-creación conceptual, compilación de shotlists cinematográficos y análisis de impacto T-3.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAiModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 mt-3.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('ideate')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
                activeTab === 'ideate'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 border border-purple-600'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>1. Ideación & Conceptos</span>
            </button>

            <button
              onClick={() => setActiveTab('techGuide')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
                activeTab === 'techGuide'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 border border-purple-600'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>2. Compilador de Guía Técnica</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-slate-700">
          {/* TAB 1: IDEATION */}
          {activeTab === 'ideate' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Marca / Cliente *</label>
                  <select
                    value={selectedBrandId}
                    onChange={(e) => {
                      setSelectedBrandId(e.target.value);
                      const terrs = territories.filter((t) => t.brandId === e.target.value && t.active);
                      if (terrs[0]) setSelectedTerritoryId(terrs[0].id);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none cursor-pointer"
                  >
                    {brands.length === 0 ? (
                      <option value="">Sin marcas disponibles</option>
                    ) : (
                      brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.industry})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Territorio de Comunicación *</label>
                  <select
                    value={selectedTerritoryId}
                    onChange={(e) => setSelectedTerritoryId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none cursor-pointer"
                  >
                    {brandTerritories.length === 0 ? (
                      <option value="">Sin territorios</option>
                    ) : (
                      brandTerritories.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Brief Creativo / Objetivo del Spot *</label>
                <textarea
                  value={creativeBrief}
                  onChange={(e) => setCreativeBrief(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                  placeholder="Describe la intención narrativa, arquetipo de personaje y llamado a la acción..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleRunIdeation}
                  disabled={isIdeating}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 transition-all cursor-pointer active:scale-98 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isIdeating ? 'Generando Conceptos...' : 'Generar 3 Propuestas Creativas'}</span>
                </button>
              </div>

              {/* Generated Ideas Result Cards */}
              {generatedIdeas.length > 0 && (
                <div className="space-y-3 pt-3.5 border-t border-slate-100">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>Propuestas Creativas Co-creadas</span>
                  </h4>

                  <div className="space-y-3">
                    {generatedIdeas.map((idea, iIdx) => (
                      <div
                        key={iIdx}
                        className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 hover:border-purple-300 transition-all shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[9.5px] uppercase font-bold text-purple-700 font-mono">
                              Propuesta #{iIdx + 1} • {idea.format || '9:16 UHD'}
                            </span>
                            <h5 className="text-xs font-bold text-slate-900 mt-0.5">{idea.title}</h5>
                          </div>

                          <button
                            onClick={() => handleApplyIdeaAsDeliverable(idea)}
                            className="px-3 py-1 rounded-xl text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-all cursor-pointer active:scale-95 flex items-center gap-1 shrink-0"
                          >
                            <span>Convertir en Entregable</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Hook */}
                        <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-200">
                          <span className="text-[9.5px] font-bold text-indigo-700 block mb-0.5">
                            Hook de 3 Segundos:
                          </span>
                          <p className="text-indigo-950 italic text-xs">"{idea.hook}"</p>
                        </div>

                        {/* Narrative */}
                        <p className="text-slate-700 leading-relaxed text-xs">
                          {idea.narrativeConcept}
                        </p>

                        {/* Tags */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1.5 border-t border-slate-200">
                          <div className="text-slate-500">
                            <strong className="text-slate-800">Estilo Visual:</strong> {idea.visualStyle}
                          </div>
                          <div className="text-slate-500">
                            <strong className="text-slate-800">Diseño Sonoro:</strong> {idea.audioDesign}
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
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Entregable a Compilar *</label>
                <select
                  value={targetDeliverableId}
                  onChange={(e) => setTargetDeliverableId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none cursor-pointer"
                >
                  {deliverables.length === 0 ? (
                    <option value="">Sin entregables registrados</option>
                  ) : (
                    deliverables.map((del) => {
                      const b = brands.find((brand) => brand.id === del.brandId);
                      return (
                        <option key={del.id} value={del.id}>
                          [{del.code}] {del.title} ({b?.name})
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Instrucciones de Estilo & Cinematografía</label>
                <textarea
                  value={techStyleNotes}
                  onChange={(e) => setTechStyleNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                  placeholder="Detalles sobre temperatura de color, tipo de lente (anamórfico/esférico), movimientos de cámara..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleRunTechGuideGeneration}
                  disabled={isGeneratingGuide}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 transition-all cursor-pointer active:scale-98 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{isGeneratingGuide ? 'Compilando Guía Técnica...' : 'Compilar Guía Técnica & Shotlist'}</span>
                </button>
              </div>

              {/* Generated Tech Guide Result */}
              {generatedGuideResult && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 pt-3.5 animate-in fade-in shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Guía Técnica Compilada con Éxito</span>
                    </h4>

                    <button
                      onClick={handleApplyTechGuideToDeliverable}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs cursor-pointer transition-all active:scale-95"
                    >
                      Sincronizar con Entregable
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 text-[10px] block">Ratios & Formato</span>
                      <span className="font-mono text-slate-900 text-xs">
                        {generatedGuideResult.aspectRatios?.join(', ')} • {generatedGuideResult.frameRate}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 text-[10px] block">Perfil de Color</span>
                      <span className="font-mono text-slate-900 text-xs">{generatedGuideResult.colorSpace}</span>
                    </div>
                  </div>

                  {/* Shotlist table */}
                  {generatedGuideResult.shotlist && (
                    <div className="space-y-2 pt-1">
                      <span className="font-bold text-slate-900 text-xs">Shotlist Cinematográfico:</span>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase text-[9.5px]">
                              <th className="py-2 px-2.5">#</th>
                              <th className="py-2 px-3">Descripción</th>
                              <th className="py-2 px-2.5">Ángulo</th>
                              <th className="py-2 px-2.5">Movimiento</th>
                              <th className="py-2 px-2.5">Duración</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {generatedGuideResult.shotlist.map((s: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="py-2 px-2.5 font-mono text-indigo-600 font-bold">#{idx + 1}</td>
                                <td className="py-2 px-3 text-slate-800">{s.description}</td>
                                <td className="py-2 px-2.5 text-slate-600 font-mono">{s.cameraAngle}</td>
                                <td className="py-2 px-2.5 text-slate-600">{s.movement}</td>
                                <td className="py-2 px-2.5 font-mono text-amber-700 font-bold">{s.durationSec}s</td>
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
