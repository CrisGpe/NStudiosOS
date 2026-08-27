import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Plus } from 'lucide-react';
import { CreateDeliverableModal } from './CreateDeliverableModal';
import { KanbanProcessToggle, KanbanFilters, KanbanColumn, KANBAN_COLUMNS } from './kanban';

export const KanbanBoard: React.FC = () => {
  const {
    deliverables,
    brands,
    territories,
    users,
    selectedBrandId,
    setSelectedBrandId,
    searchQuery,
    setSelectedDeliverable,
    moveDeliverablePhase,
    createDeliverable,
    currentUser,
    openAiModalWithContext,
    setIsCreateClientDeliverableModalOpen,
    setActiveTab,
    deliverableTypeFilter,
    setDeliverableTypeFilter,
  } = useApp();

  const isClient = currentUser.role === 'cliente';
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Filter deliverables
  const filteredDeliverables = deliverables.filter((d) => {
    if (isClient && currentUser.assignedBrandIds && currentUser.assignedBrandIds.length > 0) {
      if (!currentUser.assignedBrandIds.includes(d.brandId)) return false;
    } else if (selectedBrandId !== 'all' && d.brandId !== selectedBrandId) {
      return false;
    }

    if (deliverableTypeFilter !== 'all') {
      const type = d.deliverableType || 'audiovisual';
      if (type !== deliverableTypeFilter) return false;
    }

    if (selectedPriority !== 'all' && d.priority !== selectedPriority) return false;
    if (selectedAssignee !== 'all' && d.assigneeId !== selectedAssignee) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const brand = brands.find((b) => b.id === d.brandId);
      const territory = territories.find((t) => t.id === d.territoryId);
      const matchesTitle = d.title.toLowerCase().includes(q);
      const matchesBrand = brand?.name.toLowerCase().includes(q);
      const matchesTerritory = territory?.name.toLowerCase().includes(q);
      const matchesDesc = d.description.toLowerCase().includes(q);
      if (!matchesTitle && !matchesBrand && !matchesTerritory && !matchesDesc) {
        return false;
      }
    }
    return true;
  });

  const calculateDaysToPublish = (publishDate: string) => {
    const pub = new Date(publishDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((pub - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-3">
      {isClient && (
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/50 border border-indigo-500/30 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">
                Portal de Co-Creación & Seguimiento de Marca
              </span>
              <p className="text-slate-400 text-[11px]">
                Monitorea el progreso de tus piezas audiovisuales y gráficas. En la fase <strong>6. Aprobación Cliente</strong> podrás revisar cortes y aprobar piezas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('brand_hub')}
              className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/30 font-semibold text-[11px] cursor-pointer transition-all flex items-center gap-1"
            >
              <span>🎨 Abrir Sandbox & Ideas</span>
            </button>
            <button
              onClick={() => setIsCreateClientDeliverableModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] shadow-xs cursor-pointer transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Proponer Idea / Entregable</span>
            </button>
          </div>
        </div>
      )}

      <KanbanProcessToggle
        deliverableTypeFilter={deliverableTypeFilter}
        setDeliverableTypeFilter={setDeliverableTypeFilter}
      />

      <KanbanFilters
        isClient={isClient}
        brands={brands}
        users={users}
        selectedBrandId={selectedBrandId}
        setSelectedBrandId={setSelectedBrandId}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
        selectedAssignee={selectedAssignee}
        setSelectedAssignee={setSelectedAssignee}
        visibleCount={filteredDeliverables.length}
        openAiModalWithContext={openAiModalWithContext}
        setIsCreateClientDeliverableModalOpen={setIsCreateClientDeliverableModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
      />

      <div className="overflow-x-auto pb-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 min-w-[1450px]">
          {KANBAN_COLUMNS.map((col, colIdx) => {
            const columnItems = filteredDeliverables.filter((d) => d.phase === col.id);
            return (
              <KanbanColumn
                key={col.id}
                col={col}
                colIdx={colIdx}
                columnItems={columnItems}
                brands={brands}
                territories={territories}
                users={users}
                isGraphicMode={deliverableTypeFilter === 'graphic'}
                isClient={isClient}
                setSelectedDeliverable={setSelectedDeliverable}
                moveDeliverablePhase={moveDeliverablePhase}
                calculateDaysToPublish={calculateDaysToPublish}
              />
            );
          })}
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateDeliverableModal
          brands={brands}
          territories={territories}
          users={users}
          createDeliverable={createDeliverable}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
};
