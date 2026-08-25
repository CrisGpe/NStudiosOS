import React from 'react';
import { Deliverable, DeliverablePhase, Brand, CommunicationTerritory, UserProfile } from '../../types';
import { KanbanCard } from './KanbanCard';
import { KanbanColumnConfig } from './constants';

const MACRO_PHASE_INFO = {
  pre_produccion: {
    label: 'M1 • Pre-producción',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  },
  produccion: {
    label: 'M2 • Producción',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
  },
  post_produccion: {
    label: 'M3 • Post-producción',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200/80',
  },
};

interface KanbanColumnProps {
  col: KanbanColumnConfig;
  colIdx: number;
  columnItems: Deliverable[];
  brands: Brand[];
  territories: CommunicationTerritory[];
  users: UserProfile[];
  isGraphicMode: boolean;
  isClient: boolean;
  setSelectedDeliverable: (item: Deliverable) => void;
  moveDeliverablePhase: (id: string, phase: DeliverablePhase) => void;
  calculateDaysToPublish: (date: string) => number;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  col,
  colIdx,
  columnItems,
  brands,
  territories,
  users,
  isGraphicMode,
  isClient,
  setSelectedDeliverable,
  moveDeliverablePhase,
  calculateDaysToPublish,
}) => {
  const colTitle = isGraphicMode && col.graphicTitle ? col.graphicTitle : col.title;
  const colSubtitle = isGraphicMode && col.graphicSubtitle ? col.graphicSubtitle : col.subtitle;
  const macroInfo = MACRO_PHASE_INFO[col.macroPhase as keyof typeof MACRO_PHASE_INFO];

  return (
    <div className="bg-slate-100/70 rounded-2xl flex flex-col max-h-[85vh] shadow-2xs overflow-hidden border border-slate-200">
      {/* Top accent bar indicating Column phase color */}
      <div className="h-1.5 w-full shrink-0 shadow-2xs" style={{ backgroundColor: col.accentHex }} />

      {/* Column Header with integrated Macro-Phase Tag */}
      <div className="px-3 py-2 border-b border-slate-200 bg-white shadow-2xs flex flex-col gap-1">
        {/* Row 1: Macro-Phase Tag + Item Count */}
        <div className="flex items-center justify-between gap-1.5">
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${macroInfo?.badgeClass || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
            {macroInfo?.label || 'Fase'}
          </span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
            {columnItems.length}
          </span>
        </div>

        {/* Row 2: Phase Title */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: col.accentHex }} />
          <span className="text-xs font-bold text-slate-900 truncate" title={colTitle}>{colTitle}</span>
        </div>

        {/* Row 3: Subtitle & Chronology Tag */}
        <div className="flex items-center justify-between text-[10px] gap-1.5 pt-0.5 border-t border-slate-100">
          <span className="text-slate-500 truncate" title={colSubtitle}>{colSubtitle}</span>
          <span className="font-semibold text-slate-700 font-mono text-[9px] px-1.5 py-0.2 rounded bg-slate-50 border border-slate-200 whitespace-nowrap shrink-0">
            {col.chronologyTag}
          </span>
        </div>
      </div>

      <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1 custom-scrollbar">
        {columnItems.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-300 rounded-xl bg-white/50 font-medium">
            Sin entregables
          </div>
        ) : (
          columnItems.map((item) => {
            const brand = brands.find((b) => b.id === item.brandId);
            const territory = territories.find((t) => t.id === item.territoryId);
            const assignee = users.find((u) => u.id === item.assigneeId);

            return (
              <KanbanCard
                key={item.id}
                item={item}
                brand={brand}
                territory={territory}
                assignee={assignee}
                colIdx={colIdx}
                colId={col.id}
                isClient={isClient}
                setSelectedDeliverable={setSelectedDeliverable}
                moveDeliverablePhase={moveDeliverablePhase}
                calculateDaysToPublish={calculateDaysToPublish}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
