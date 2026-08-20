import React from 'react';
import { Filter, Building2, Sparkles, Plus } from 'lucide-react';
import { Brand, UserProfile } from '../../types';

interface KanbanFiltersProps {
  isClient: boolean;
  brands: Brand[];
  users: UserProfile[];
  selectedBrandId: string;
  setSelectedBrandId: (id: string) => void;
  selectedPriority: string;
  setSelectedPriority: (priority: string) => void;
  selectedAssignee: string;
  setSelectedAssignee: (id: string) => void;
  visibleCount: number;
  openAiModalWithContext: (opts: any) => void;
  setIsCreateClientDeliverableModalOpen: (val: boolean) => void;
  setIsCreateModalOpen: (val: boolean) => void;
}

export const KanbanFilters: React.FC<KanbanFiltersProps> = ({
  isClient,
  brands,
  users,
  selectedBrandId,
  setSelectedBrandId,
  selectedPriority,
  setSelectedPriority,
  selectedAssignee,
  setSelectedAssignee,
  visibleCount,
  openAiModalWithContext,
  setIsCreateClientDeliverableModalOpen,
  setIsCreateModalOpen,
}) => {
  return (
    <div className="glass-panel rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs bg-white border border-slate-200">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filtros:</span>
        </div>

        {!isClient && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-1.5 transition-all shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">
                🏢 Todos los Clientes ({brands.length})
              </option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs text-slate-800 font-medium rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none cursor-pointer transition-all shadow-2xs"
        >
          <option value="all">Todas las Prioridades</option>
          <option value="urgent">🔴 Urgente</option>
          <option value="high">🟠 Alta</option>
          <option value="medium">🟡 Media</option>
          <option value="low">⚪ Baja</option>
        </select>

        <select
          value={selectedAssignee}
          onChange={(e) => setSelectedAssignee(e.target.value)}
          className="bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs text-slate-800 font-medium rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none cursor-pointer transition-all shadow-2xs"
        >
          <option value="all">Todos los Responsables</option>
          {users
            .filter((u) => u.role === 'colaborador' || u.role === 'director')
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.roleTitle.split(' ')[0]})
              </option>
            ))}
        </select>

        <span className="text-xs text-slate-600 font-mono bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
          {visibleCount} entregable(s) visibles
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            openAiModalWithContext({
              action: 'ideate',
              brandId: selectedBrandId !== 'all' ? selectedBrandId : brands[0]?.id,
            })
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold transition-all cursor-pointer hover:scale-[1.01] shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-subtle-pulse" />
          <span>Co-crear con Gemini</span>
        </button>

        {isClient ? (
          <button
            onClick={() => setIsCreateClientDeliverableModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Proponer Entregable</span>
          </button>
        ) : (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nuevo Entregable</span>
          </button>
        )}
      </div>
    </div>
  );
};
