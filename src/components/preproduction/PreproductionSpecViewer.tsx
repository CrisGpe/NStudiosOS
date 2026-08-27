import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Deliverable,
  PreproductionSpec,
  DynamicField,
  LiteraryScriptScene,
  TechnicalShot,
  VisualReferenceItem,
  ShootingScheduleDay,
  ScriptBreakdownCategory,
} from '../../types';
import {
  FileText,
  Video,
  Image as ImageIcon,
  Calendar,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  MapPin,
  Palette,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Save,
  Check,
  Film,
  Camera,
  Music,
  Users,
  Shirt,
  Package,
} from 'lucide-react';

interface PreproductionSpecViewerProps {
  deliverable: Deliverable;
  onUpdateSpec?: (spec: PreproductionSpec) => void;
  onClose?: () => void;
}

export const PreproductionSpecViewer: React.FC<PreproductionSpecViewerProps> = ({
  deliverable,
  onUpdateSpec,
  onClose,
}) => {
  const { currentUser, brands, updateDeliverable, toast } = useApp();
  const brand = brands.find((b) => b.id === deliverable.brandId);

  const isClientRole = currentUser.role === 'cliente';
  const isDirectorOrAdmin =
    currentUser.role === 'director' ||
    currentUser.role === 'webadmin' ||
    currentUser.role === 'colaborador';

  // Toggle preview mode for directors to see client view
  const [directorPreviewMode, setDirectorPreviewMode] = useState<'director' | 'client'>(
    isClientRole ? 'client' : 'director'
  );

  const isViewingAsClient = directorPreviewMode === 'client';

  // Active modular tab
  const [activeTab, setActiveTab] = useState<'narrative' | 'visual' | 'shooting'>('narrative');

  // Initial Spec Builder / Fallback
  const [spec, setSpec] = useState<PreproductionSpec>(() => {
    if (deliverable.preproductionSpec) {
      return deliverable.preproductionSpec;
    }

    // Default template with realistic data for the brand
    return {
      deliverableId: deliverable.id,
      brandId: deliverable.brandId,
      version: 1,
      lastUpdatedBy: currentUser.name,
      lastUpdatedAt: new Date().toISOString(),

      logline: `Pieza audiovisual de alto impacto para ${brand?.name || 'la marca'}, destacando sofisticación y propuesta de valor única.`,
      targetMessage: 'Transmitir elegancia, confianza y calidad excepcional con una narrativa emocional y estética cinematográfica.',

      literaryScript: [
        {
          id: 'scene_1',
          sceneNumber: 1,
          slugline: 'INT. ESPACIO PRINCIPAL - DÍA',
          action: 'La luz suave de la mañana ilumina el ambiente. Nuestra protagonista interactúa con el producto/servicio con naturalidad y confianza.',
          dialogues: [
            {
              character: 'NARRADORA (VOZ EN OFF)',
              line: 'La verdadera belleza comienza cuando te sientes tú misma en cada detalle.',
            },
          ],
        },
        {
          id: 'scene_2',
          sceneNumber: 2,
          slugline: 'INT. DETALLE EN PRIMER PLANO - DÍA',
          action: 'Macro de texturas, reflejos dorados y gestos cuidados. El ritmo de corte es elegante y pausado.',
          dialogues: [
            {
              character: 'NARRADORA (VOZ EN OFF)',
              line: 'Descubre una experiencia diseñada exclusivamente para ti.',
            },
          ],
        },
      ],

      technicalShots: [
        {
          id: 'shot_1',
          shotNumber: '1A',
          framing: 'Plano General (Master Wide)',
          cameraMovement: 'Gimbal Slow Push-In',
          opticsLens: 'Sony GM 24mm f/1.4',
          lightingAudio: 'Luz difusa de ventana 5600K + Mic Lavalier inalámbrico',
          description: 'Establecimiento del espacio con atmósfera premium y profundidad de campo suave.',
          status: 'filmed',
        },
        {
          id: 'shot_2',
          shotNumber: '1B',
          framing: 'Plano Detalle Macro (Close-Up)',
          cameraMovement: 'Slider Lateral Suave',
          opticsLens: 'Macro 90mm f/2.8',
          lightingAudio: 'Luz puntual cálida de contra + Grabación ambiental estéreo 32-bit',
          description: 'Captura en cámara lenta (120fps) del detalle de aplicación y textura.',
          status: 'pending',
        },
        {
          id: 'shot_3',
          shotNumber: '2A',
          framing: 'Primer Plano Expresivo',
          cameraMovement: 'Trípode Fijo con paneo sutil',
          opticsLens: '85mm f/1.4 Anamorphic Feel',
          lightingAudio: 'Key Light Aputure 300d con Octabox + Relleno negativo',
          description: 'Mirada a cámara con sonrisa sutil y cierre con logo animado en post.',
          status: 'pending',
        },
      ],

      moodboard: [
        {
          id: 'vis_1',
          title: 'Atmósfera Lumínica Cálida',
          imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
          category: 'lighting',
          notes: 'Tonos dorados y contrastes suaves para proyectar elegancia.',
        },
        {
          id: 'vis_2',
          title: 'Estilo de Vestuario & Texturas',
          imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80',
          category: 'wardrobe',
          notes: 'Paleta neutra (marfil, beige, rosa cuarzo) con líneas contemporáneas.',
        },
        {
          id: 'vis_3',
          title: 'Composición y Encuadre Cinematográfico',
          imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80',
          category: 'framing',
          notes: 'Regla de tercios con fondos desenfocados (bokeh pronunciado).',
        },
      ],

      lookbookNotes: `El lookbook de ${brand?.name || 'esta producción'} busca reflejar pureza, vanguardia y lujo accesible, alineado estrictamente con los territorios de comunicación oficiales.`,
      colorPalette: [brand?.primaryColor || '#e11d48', brand?.secondaryColor || '#1e1b4b', '#f8fafc', '#d4af37'],

      shootingSchedule: [
        {
          id: 'sched_1',
          date: deliverable.productionStartDate || '2026-09-15',
          callTime: '08:30 AM',
          location: 'Set Principal / Locación Premium',
          scenesToFilm: ['Escena 1 (General)', 'Escena 2 (Detalles Macro)'],
          castEquipment: ['Talento Principal', 'Director DP', 'Gaffer', 'Sony FX3 + Rig Gimbal'],
          notes: 'Llegada del equipo de peinado y maquillaje a las 08:00 AM.',
        },
      ],

      scriptBreakdown: [
        {
          id: 'bk_1',
          category: 'wardrobe',
          items: ['2 cambios de vestuario en tonos claros', 'Accesorios dorados minimalistas'],
        },
        {
          id: 'bk_2',
          category: 'props',
          items: ['Envases y packaging oficial de marca', 'Espejo biselado de mano', 'Bandeja acrílica'],
        },
        {
          id: 'bk_3',
          category: 'cast_models',
          items: ['1 Modelo principal (Femenino 25-35)', '1 Especialista de marca'],
        },
        {
          id: 'bk_4',
          category: 'locations',
          items: ['Salón principal con luz natural', 'Área de tocador y fondo liso'],
        },
        {
          id: 'bk_5',
          category: 'special_gear',
          items: ['Lente Macro 90mm', 'Gimbal DJI RS3 Pro', 'Micrófono DJI Mic 2'],
        },
      ],

      customFields: [
        {
          id: 'cf_1',
          name: 'Relación de Aspecto (Aspect Ratio)',
          value: '9:16 Vertical (Reels/TikTok) + 16:9 Master 4K',
          type: 'text',
          isClientVisible: true,
          category: 'narrative',
        },
        {
          id: 'cf_2',
          name: 'Perfil de Color y Espacio',
          value: 'S-Log3 / S-Gamut3.Cine (Grading Rec.709 personalizado)',
          type: 'text',
          isClientVisible: false,
          category: 'visual',
        },
        {
          id: 'cf_3',
          name: 'Velocidad de Cuadros (Frame Rate)',
          value: '120fps en tomas macro • 24fps en narrativa principal',
          type: 'text',
          isClientVisible: false,
          category: 'shooting',
        },
      ],
    };
  });

  // Modal for Adding Dynamic Field
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [newFieldCategory, setNewFieldCategory] = useState<'narrative' | 'visual' | 'shooting'>('narrative');
  const [newFieldClientVisible, setNewFieldClientVisible] = useState(true);

  // Modal for Adding Technical Shot
  const [showAddShotModal, setShowAddShotModal] = useState(false);
  const [newShotNumber, setNewShotNumber] = useState('');
  const [newShotFraming, setNewShotFraming] = useState('Plano Medio');
  const [newShotOptics, setNewShotOptics] = useState('50mm f/1.4');
  const [newShotMovement, setNewShotMovement] = useState('Gimbal');
  const [newShotAudio, setNewShotAudio] = useState('Audio Ambiente');
  const [newShotDescription, setNewShotDescription] = useState('');

  // Save changes to deliverable
  const handleSaveSpec = () => {
    const updatedSpec: PreproductionSpec = {
      ...spec,
      version: spec.version + 1,
      lastUpdatedBy: currentUser.name,
      lastUpdatedAt: new Date().toISOString(),
    };

    setSpec(updatedSpec);
    updateDeliverable(deliverable.id, {
      preproductionSpec: updatedSpec,
    });

    if (onUpdateSpec) {
      onUpdateSpec(updatedSpec);
    }

    toast.success('¡Ficha de preproducción guardada exitosamente!');
  };

  // Add Dynamic Field
  const handleAddDynamicField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;

    const newField: DynamicField = {
      id: 'cf_' + Date.now(),
      name: newFieldName.trim(),
      value: newFieldValue.trim(),
      type: 'text',
      isClientVisible: newFieldClientVisible,
      category: newFieldCategory,
    };

    setSpec((prev) => ({
      ...prev,
      customFields: [...prev.customFields, newField],
    }));

    setShowAddFieldModal(false);
    setNewFieldName('');
    setNewFieldValue('');
    toast.success(`Campo "${newField.name}" añadido por el Director.`);
  };

  // Delete Dynamic Field
  const handleDeleteDynamicField = (fieldId: string) => {
    setSpec((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((f) => f.id !== fieldId),
    }));
    toast.success('Campo eliminado.');
  };

  // Toggle Shot Status (Filmed / Pending)
  const handleToggleShotStatus = (shotId: string) => {
    setSpec((prev) => ({
      ...prev,
      technicalShots: prev.technicalShots.map((s) => {
        if (s.id === shotId) {
          const nextStatus = s.status === 'filmed' ? 'pending' : 'filmed';
          return { ...s, status: nextStatus };
        }
        return s;
      }),
    }));
  };

  // Add Technical Shot
  const handleAddTechnicalShot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShotNumber.trim()) return;

    const shot: TechnicalShot = {
      id: 'shot_' + Date.now(),
      shotNumber: newShotNumber,
      framing: newShotFraming,
      opticsLens: newShotOptics,
      cameraMovement: newShotMovement,
      lightingAudio: newShotAudio,
      description: newShotDescription,
      status: 'pending',
    };

    setSpec((prev) => ({
      ...prev,
      technicalShots: [...prev.technicalShots, shot],
    }));

    setShowAddShotModal(false);
    setNewShotNumber('');
    setNewShotDescription('');
    toast.success('Nuevo plano añadido a la ficha técnica.');
  };

  // Filter custom fields by category and role visibility
  const getCategoryFields = (category: 'narrative' | 'visual' | 'shooting') => {
    return spec.customFields.filter((f) => {
      if (f.category !== category) return false;
      if (isViewingAsClient) return f.isClientVisible;
      return true;
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      {/* ========================================================
          HEADER & ROLE VIEW SWITCHER
          ======================================================== */}
      <div className="p-4 px-6 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-2xs font-extrabold text-sm shrink-0"
            style={{ backgroundColor: brand?.primaryColor || '#4f46e5' }}
          >
            {brand?.name.substring(0, 2).toUpperCase() || 'CF'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">
                Pre-Producción & Planificación Audiovisual
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {deliverable.code} • v{spec.version}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {deliverable.title} • {brand?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Dual Role Preview Toggle for Director/Admin */}
          {isDirectorOrAdmin && (
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs text-xs">
              <button
                onClick={() => setDirectorPreviewMode('director')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  directorPreviewMode === 'director'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Vista Técnica (Agencia)</span>
              </button>
              <button
                onClick={() => setDirectorPreviewMode('client')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  directorPreviewMode === 'client'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Vista Cliente (Simple)</span>
              </button>
            </div>
          )}

          {isDirectorOrAdmin && (
            <button
              onClick={handleSaveSpec}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Ficha</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          MODULAR TABS (3 MAIN SECTIONS)
          ======================================================== */}
      <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-white shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('narrative')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'narrative'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. Guion & Narrativa</span>
        </button>

        <button
          onClick={() => setActiveTab('visual')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'visual'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>2. Planificación Visual & Lookbook</span>
        </button>

        <button
          onClick={() => setActiveTab('shooting')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'shooting'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>3. Rodaje & Desglose de Producción</span>
        </button>
      </div>

      {/* ========================================================
          TAB CONTENT BODY
          ======================================================== */}
      <div className="p-6 flex-1 overflow-y-auto space-y-6 text-slate-800">
        
        {/* ========================================================
            TAB 1: GUION & NARRATIVA
            ======================================================== */}
        {activeTab === 'narrative' && (
          <div className="space-y-6">
            
            {/* Logline & Message Banner */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-indigo-700 font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Mensaje & Concepto Central
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold">
                  {isViewingAsClient ? 'Propuesta para el Cliente' : 'Estrategia Narrativa'}
                </span>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">
                "{spec.targetMessage}"
              </h3>
              {!isViewingAsClient && spec.logline && (
                <p className="text-xs text-slate-600 italic">
                  <strong>Logline Técnico:</strong> {spec.logline}
                </p>
              )}
            </div>

            {/* Guion Literario (Narrativa Escena por Escena) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Guion Literario (Historia & Diálogos)</span>
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {spec.literaryScript.length} Escenas
                </span>
              </div>

              <div className="space-y-3">
                {spec.literaryScript.map((scene) => (
                  <div
                    key={scene.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                        ESCENA #{scene.sceneNumber}: {scene.slugline}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {scene.action}
                    </p>

                    {scene.dialogues && scene.dialogues.length > 0 && (
                      <div className="pl-4 border-l-2 border-indigo-200 space-y-2 pt-1 text-xs">
                        {scene.dialogues.map((dlg, dIdx) => (
                          <div key={dIdx} className="space-y-0.5">
                            <span className="font-bold text-[11px] text-slate-900 block font-mono">
                              {dlg.character}:
                            </span>
                            <p className="italic text-slate-800 text-xs">"{dlg.line}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Guion Técnico (Solo visible en Modo Agencia / Técnico) */}
            {!isViewingAsClient && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Camera className="w-4 h-4 text-indigo-600" />
                      <span>Guion Técnico & Desglose de Planos (Nivel Producción)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Indicaciones de cámara, encuadres, óptica, iluminación y sonido directo para rodaje.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddShotModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Agregar Plano</span>
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-3">Toma</th>
                        <th className="p-3">Encuadre & Movimiento</th>
                        <th className="p-3">Óptica / Lente</th>
                        <th className="p-3">Audio & Iluminación</th>
                        <th className="p-3">Descripción de Acción</th>
                        <th className="p-3 text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {spec.technicalShots.map((shot) => (
                        <tr key={shot.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-900">
                            {shot.shotNumber}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-800 block">{shot.framing}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{shot.cameraMovement}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-700">
                            {shot.opticsLens || 'Master 50mm'}
                          </td>
                          <td className="p-3 text-slate-600 text-[11px]">
                            {shot.lightingAudio}
                          </td>
                          <td className="p-3 text-slate-700 max-w-xs leading-relaxed">
                            {shot.description}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleToggleShotStatus(shot.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${
                                shot.status === 'filmed'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              {shot.status === 'filmed' ? '✓ Grabado' : 'Pendiente'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Custom Fields for Narrative */}
            {getCategoryFields('narrative').length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                  Campos Personalizados de Dirección
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {getCategoryFields('narrative').map((field) => (
                    <div
                      key={field.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-2 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{field.name}</span>
                          {!field.isClientVisible && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              Interno
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{field.value}</p>
                      </div>

                      {!isViewingAsClient && (
                        <button
                          onClick={() => handleDeleteDynamicField(field.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Eliminar campo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Button for Director to Add Custom Field */}
            {!isViewingAsClient && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setNewFieldCategory('narrative');
                    setShowAddFieldModal(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar Campo Personalizado a esta Sección</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* ========================================================
            TAB 2: PLANIFICACIÓN VISUAL & LOOKBOOK
            ======================================================== */}
        {activeTab === 'visual' && (
          <div className="space-y-6">
            
            {/* Lookbook Narrative Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-600" />
                  <span>Lookbook Artístico & Estilo Visual de Marca</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {brand?.name}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {spec.lookbookNotes}
              </p>

              {/* Color Palette Samples */}
              <div className="pt-2 border-t border-slate-200 flex items-center gap-3">
                <span className="text-[11px] font-bold text-slate-500">Paleta Cromática:</span>
                <div className="flex items-center gap-2">
                  {spec.colorPalette.map((hex, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-1">
                      <div
                        className="w-5 h-5 rounded-lg border border-slate-300 shadow-2xs"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-[10px] font-mono text-slate-600">{hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Moodboard Visual Gallery */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span>Moodboard & Tablero de Inspiración</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Colección de referencias visuales, texturas, iluminación y planos para el rodaje.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {spec.moodboard.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs flex flex-col hover:border-indigo-300 transition-all group"
                  >
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-xs uppercase">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-3 space-y-1 flex-1 flex flex-col justify-between">
                      <div>
                        <h5 className="font-bold text-xs text-slate-900">{item.title}</h5>
                        {item.notes && (
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Fields for Visual */}
            {getCategoryFields('visual').length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                  Especificaciones Visuales de Dirección
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {getCategoryFields('visual').map((field) => (
                    <div
                      key={field.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-2 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{field.name}</span>
                          {!field.isClientVisible && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              Interno
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{field.value}</p>
                      </div>

                      {!isViewingAsClient && (
                        <button
                          onClick={() => handleDeleteDynamicField(field.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Eliminar campo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isViewingAsClient && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setNewFieldCategory('visual');
                    setShowAddFieldModal(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar Campo Personalizado a Planificación Visual</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* ========================================================
            TAB 3: RODAJE & DESGLOSE DE PRODUCCIÓN
            ======================================================== */}
        {activeTab === 'shooting' && (
          <div className="space-y-6">
            
            {/* Plan de Rodaje (Shooting Schedule) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>Plan de Rodaje (Shooting Schedule)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isViewingAsClient
                      ? 'Fechas clave y locación de grabación confirmadas para tu marca.'
                      : 'Horarios de citación (Call Time), talentos, locaciones y escenas asignadas por día.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {spec.shootingSchedule.map((sched) => (
                  <div
                    key={sched.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl border border-indigo-100">
                          📅 Día de Grabación: {sched.date}
                        </span>
                        {!isViewingAsClient && (
                          <span className="text-xs font-mono font-bold text-slate-600">
                            ⏰ Citación: {sched.callTime}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span className="font-semibold">{sched.location}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">Escenas a Grabar:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                          {sched.scenesToFilm.map((sc, scIdx) => (
                            <li key={scIdx}>{sc}</li>
                          ))}
                        </ul>
                      </div>

                      {!isViewingAsClient && (
                        <div>
                          <span className="font-bold text-slate-700 block mb-1">Equipo & Talento Asignado:</span>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                            {sched.castEquipment.map((eq, eqIdx) => (
                              <li key={eqIdx}>{eq}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {sched.notes && (
                      <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                        Nota: {sched.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Desglose de Guion (Script Breakdown) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>Desglose de Producción (Script Breakdown)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isViewingAsClient
                      ? 'Requerimientos clave y elementos preparados para la filmación.'
                      : 'Matriz técnica de vestuario, utilería, actores, locaciones y equipamiento de cámara.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {spec.scriptBreakdown.map((bk) => {
                  const getCategoryLabel = () => {
                    switch (bk.category) {
                      case 'wardrobe':
                        return { label: 'Vestuario & Estilismo', icon: <Shirt className="w-4 h-4 text-purple-600" /> };
                      case 'props':
                        return { label: 'Utilería & Props', icon: <Package className="w-4 h-4 text-amber-600" /> };
                      case 'cast_models':
                        return { label: 'Actores / Modelos', icon: <Users className="w-4 h-4 text-indigo-600" /> };
                      case 'locations':
                        return { label: 'Locaciones & Sets', icon: <MapPin className="w-4 h-4 text-rose-600" /> };
                      case 'special_gear':
                        return { label: 'Equipos Especiales', icon: <Camera className="w-4 h-4 text-cyan-600" /> };
                      default:
                        return { label: 'Producción', icon: <Layers className="w-4 h-4 text-slate-600" /> };
                    }
                  };

                  const catInfo = getCategoryLabel();

                  return (
                    <div
                      key={bk.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2"
                    >
                      <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                        {catInfo.icon}
                        <h5 className="font-bold text-xs text-slate-900">{catInfo.label}</h5>
                      </div>

                      <ul className="space-y-1 text-xs text-slate-600">
                        {bk.items.map((item, iIdx) => (
                          <li key={iIdx} className="flex items-start gap-1.5">
                            <span className="text-indigo-500 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Fields for Shooting */}
            {getCategoryFields('shooting').length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                  Campos Personalizados de Rodaje
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {getCategoryFields('shooting').map((field) => (
                    <div
                      key={field.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-2 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{field.name}</span>
                          {!field.isClientVisible && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              Interno
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{field.value}</p>
                      </div>

                      {!isViewingAsClient && (
                        <button
                          onClick={() => handleDeleteDynamicField(field.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Eliminar campo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isViewingAsClient && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setNewFieldCategory('shooting');
                    setShowAddFieldModal(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar Campo Personalizado a Rodaje & Desglose</span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ========================================================
          MODAL: ADD DYNAMIC FIELD (DIRECTOR)
          ======================================================== */}
      {showAddFieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Agregar Campo Personalizado</span>
              </h3>
              <button
                onClick={() => setShowAddFieldModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDynamicField} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre del Campo *</label>
                <input
                  type="text"
                  required
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="Ej. Óptica / Lente, Micrófono, Vestuario Clave..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Valor / Descripción *</label>
                <textarea
                  required
                  rows={2}
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  placeholder="Ej. Anamórfico 35mm T2.1 con flares azules"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Sección de Destino</label>
                <select
                  value={newFieldCategory}
                  onChange={(e) => setNewFieldCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="narrative">1. Guion & Narrativa</option>
                  <option value="visual">2. Planificación Visual & Lookbook</option>
                  <option value="shooting">3. Rodaje & Desglose de Producción</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="client-visible-check"
                  checked={newFieldClientVisible}
                  onChange={(e) => setNewFieldClientVisible(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="client-visible-check" className="text-slate-700 font-semibold cursor-pointer">
                  Hacer visible para el Cliente en su Portal
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddFieldModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-xs hover:bg-indigo-700"
                >
                  Guardar Campo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD TECHNICAL SHOT (DIRECTOR)
          ======================================================== */}
      {showAddShotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span>Agregar Plano Técnico a la Shot List</span>
              </h3>
              <button
                onClick={() => setShowAddShotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTechnicalShot} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nº de Toma *</label>
                  <input
                    type="text"
                    required
                    value={newShotNumber}
                    onChange={(e) => setNewShotNumber(e.target.value)}
                    placeholder="Ej. 2B"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Encuadre</label>
                  <input
                    type="text"
                    value={newShotFraming}
                    onChange={(e) => setNewShotFraming(e.target.value)}
                    placeholder="Ej. Plano Detalle"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Óptica / Lente</label>
                  <input
                    type="text"
                    value={newShotOptics}
                    onChange={(e) => setNewShotOptics(e.target.value)}
                    placeholder="Ej. 50mm f/1.4"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Movimiento</label>
                  <input
                    type="text"
                    value={newShotMovement}
                    onChange={(e) => setNewShotMovement(e.target.value)}
                    placeholder="Ej. Gimbal Push-in"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Iluminación & Audio</label>
                <input
                  type="text"
                  value={newShotAudio}
                  onChange={(e) => setNewShotAudio(e.target.value)}
                  placeholder="Ej. Luz natural + Mic Lavalier"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción de la Acción</label>
                <textarea
                  rows={2}
                  value={newShotDescription}
                  onChange={(e) => setNewShotDescription(e.target.value)}
                  placeholder="Qué sucede exactamente en este plano..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddShotModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-xs hover:bg-indigo-700"
                >
                  Agregar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
