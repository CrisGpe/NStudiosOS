import React, { useState } from 'react';
import { Film, X, Plus } from 'lucide-react';
import { Brand, CommunicationTerritory, UserProfile, DeliverableType, DeliverablePriority } from '../types';

interface CreateDeliverableModalProps {
  brands: Brand[];
  territories: CommunicationTerritory[];
  users: UserProfile[];
  createDeliverable: (data: any) => void;
  onClose: () => void;
}

export const CreateDeliverableModal: React.FC<CreateDeliverableModalProps> = ({
  brands,
  territories,
  users,
  createDeliverable,
  onClose,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newBrandId, setNewBrandId] = useState(brands[0]?.id || '');
  const [newTerritoryId, setNewTerritoryId] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState(users.find((u) => u.role === 'colaborador')?.id || '');
  const [newDeliverableType, setNewDeliverableType] = useState<DeliverableType>('audiovisual');
  const [newFormat, setNewFormat] = useState('Video Vertical 9:16 UHD (Reels/TikTok)');
  const [newPriority, setNewPriority] = useState<DeliverablePriority>('medium');
  const [newConceptHook, setNewConceptHook] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newProdStart, setNewProdStart] = useState('2026-08-25');
  const [newProdEnd, setNewProdEnd] = useState('2026-08-26');
  const [newPublishDate, setNewPublishDate] = useState('2026-09-02');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Por favor ingresa un título para el entregable');
      return;
    }

    const assignedBrand = brands.find((b) => b.id === newBrandId) || brands[0];
    const availableTerritories = territories.filter((t) => t.brandId === assignedBrand.id && t.active);
    const chosenTerritory = availableTerritories.find((t) => t.id === newTerritoryId) || availableTerritories[0];

    createDeliverable({
      title: newTitle,
      brandId: assignedBrand.id,
      territoryId: chosenTerritory ? chosenTerritory.id : territories[0]?.id || 'ter_default',
      assigneeId: newAssigneeId || users[0]?.id || 'usr_director_1',
      deliverableType: newDeliverableType,
      phase: 'ideacion',
      priority: newPriority,
      format: newFormat,
      conceptHook: newConceptHook,
      description: newDescription,
      productionStartDate: newProdStart,
      productionEndDate: newProdEnd,
      publishDate: newPublishDate,
      equipmentReservedIds: [],
      assetsLinked: [],
      technicalGuide: {
        aspectRatios: newDeliverableType === 'graphic' ? ['1:1', '4:5', '9:16'] : ['9:16'],
        frameRate: newDeliverableType === 'graphic' ? 'Estático / Vector' : '24fps',
        colorSpace: newDeliverableType === 'graphic' ? 'sRGB / CMYK' : 'Rec.709',
        audioSpecs: newDeliverableType === 'graphic' ? 'N/A Gráfico' : 'Audio limpio estéreo',
        lightingScheme: newDeliverableType === 'graphic' ? 'Composición Digital' : 'Iluminación estándar',
        equipmentList: [],
        exportTargets: newDeliverableType === 'graphic' ? ['Feed Carousel PNG', 'Story 1080x1920'] : ['Reels / TikTok'],
        shotlist: [],
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-slate-800 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Film className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Crear Nuevo Entregable</h3>
              <p className="text-xs text-slate-500">Configura la pieza audiovisual o gráfica para la marca</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Título del Entregable *</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej: Spot de Lanzamiento Cineflow"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Tipo de Proceso *</label>
              <select
                value={newDeliverableType}
                onChange={(e) => {
                  const type = e.target.value as DeliverableType;
                  setNewDeliverableType(type);
                  if (type === 'graphic') {
                    setNewFormat('Carousel Feed 4:5 + Story 9:16');
                  } else {
                    setNewFormat('Video Vertical 9:16 UHD (Reels/TikTok)');
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
              >
                <option value="audiovisual">🎬 Audiovisual (Video)</option>
                <option value="graphic">🎨 Visual Gráfica (Diseño)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Marca / Cliente *</label>
              <select
                value={newBrandId}
                onChange={(e) => {
                  setNewBrandId(e.target.value);
                  const brandTerrs = territories.filter((t) => t.brandId === e.target.value && t.active);
                  if (brandTerrs[0]) setNewTerritoryId(brandTerrs[0].id);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
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
                value={newTerritoryId}
                onChange={(e) => setNewTerritoryId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
              >
                {territories
                  .filter((t) => t.brandId === newBrandId && t.active)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Formato</label>
              <input
                type="text"
                value={newFormat}
                onChange={(e) => setNewFormat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Nivel de Prioridad</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as DeliverablePriority)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
              >
                <option value="urgent">🔴 Urgente (Alta prioridad)</option>
                <option value="high">🟠 Alta</option>
                <option value="medium">🟡 Media</option>
                <option value="low">⚪ Baja</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Responsable Asignado</label>
              <select
                value={newAssigneeId}
                onChange={(e) => setNewAssigneeId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
              >
                {users.length === 0 ? (
                  <option value="">Sin colaboradores</option>
                ) : (
                  users
                    .filter((u) => u.role === 'colaborador' || u.role === 'director' || u.role === 'webadmin')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.roleTitle || u.role})
                      </option>
                    ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Gancho Inicial / Hook (0-3s)</label>
            <input
              type="text"
              value={newConceptHook}
              onChange={(e) => setNewConceptHook(e.target.value)}
              placeholder="Ej: ¿Qué se siente correr a 30km/h en medio de la niebla?"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Descripción / Brief</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              placeholder="Describe el concepto, locación, requerimientos..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Inicio Producción</label>
              <input
                type="date"
                value={newProdStart}
                onChange={(e) => setNewProdStart(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Fin Producción</label>
              <input
                type="date"
                value={newProdEnd}
                onChange={(e) => setNewProdEnd(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Publicación</label>
              <input
                type="date"
                value={newPublishDate}
                onChange={(e) => setNewPublishDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer active:scale-98"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-98 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Entregable</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
