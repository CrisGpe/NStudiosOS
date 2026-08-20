import React, { useState } from 'react';
import { Film } from 'lucide-react';
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
      territoryId: chosenTerritory ? chosenTerritory.id : territories[0].id,
      assigneeId: newAssigneeId || users[2]?.id,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in-scale">
      <div className="glass-panel-elevated rounded-2xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/15">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Film className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Crear Nuevo Entregable</h3>
              <p className="text-xs text-slate-400">Configura la pieza audiovisual o gráfica para la marca</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-200 font-semibold mb-1">Título del Entregable *</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej: Apex Kinetic Aero - Spot de Lanzamiento"
                className="input-impeccable"
                required
              />
            </div>

            <div>
              <label className="block text-slate-200 font-semibold mb-1">Tipo de Proceso *</label>
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
                className="input-impeccable cursor-pointer"
              >
                <option value="audiovisual" className="bg-slate-900 text-white">🎬 Audiovisual (Video)</option>
                <option value="graphic" className="bg-slate-900 text-white">🎨 Visual Gráfica (Diseño)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-200 font-semibold mb-1">Marca / Cliente *</label>
              <select
                value={newBrandId}
                onChange={(e) => {
                  setNewBrandId(e.target.value);
                  const brandTerrs = territories.filter((t) => t.brandId === e.target.value && t.active);
                  if (brandTerrs[0]) setNewTerritoryId(brandTerrs[0].id);
                }}
                className="input-impeccable cursor-pointer"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                    {b.name} ({b.industry.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-200 font-semibold mb-1">Territorio de Comunicación *</label>
              <select
                value={newTerritoryId}
                onChange={(e) => setNewTerritoryId(e.target.value)}
                className="input-impeccable cursor-pointer"
              >
                {territories
                  .filter((t) => t.brandId === newBrandId && t.active)
                  .map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-200 font-semibold mb-1">Formato</label>
              <input
                type="text"
                value={newFormat}
                onChange={(e) => setNewFormat(e.target.value)}
                className="input-impeccable"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-semibold mb-1">Nivel de Prioridad</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as DeliverablePriority)}
                className="input-impeccable cursor-pointer"
              >
                <option value="urgent" className="bg-slate-900 text-white">🔴 Urgente (Palpitando)</option>
                <option value="high" className="bg-slate-900 text-white">🟠 Alta (Rojo)</option>
                <option value="medium" className="bg-slate-900 text-white">🟡 Media (Amarillo)</option>
                <option value="low" className="bg-slate-900 text-white">⚪ Baja (Gris)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-200 font-semibold mb-1">Responsable Asignado</label>
              <select
                value={newAssigneeId}
                onChange={(e) => setNewAssigneeId(e.target.value)}
                className="input-impeccable cursor-pointer"
              >
                {users
                  .filter((u) => u.role === 'colaborador' || u.role === 'director')
                  .map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                      {u.name} ({u.quotaSlot || u.roleTitle.split(' ')[0]})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-200 font-semibold mb-1">Gancho Inicial / Hook (0-3s)</label>
            <input
              type="text"
              value={newConceptHook}
              onChange={(e) => setNewConceptHook(e.target.value)}
              placeholder="Ej: ¿Qué se siente correr a 30km/h en medio de la niebla?"
              className="input-impeccable"
            />
          </div>

          <div>
            <label className="block text-slate-200 font-semibold mb-1">Descripción / Brief</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              placeholder="Describe el concepto, locación, requerimientos..."
              className="input-impeccable"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-200 font-semibold mb-1">Inicio Producción</label>
              <input
                type="date"
                value={newProdStart}
                onChange={(e) => setNewProdStart(e.target.value)}
                className="input-impeccable"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-semibold mb-1">Fin Producción</label>
              <input
                type="date"
                value={newProdEnd}
                onChange={(e) => setNewProdEnd(e.target.value)}
                className="input-impeccable"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-semibold mb-1">Publicación</label>
              <input
                type="date"
                value={newPublishDate}
                onChange={(e) => setNewPublishDate(e.target.value)}
                className="input-impeccable"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-white/10">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Crear Entregable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
