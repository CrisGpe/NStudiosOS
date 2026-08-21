import React from 'react';
import { Deliverable, Brand, CommunicationTerritory, UserProfile } from '../../types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  col: any;
  colIdx: number;
  columnItems: Deliverable[];
  brands: Brand[];
  territories: CommunicationTerritory[];
  users: UserProfile[];
  isGraphicMode: boolean;
  isClient: boolean;
  setSelectedDeliverable: (item: Deliverable) => void;
  moveDeliverablePhase: (id: string, phase: any) => void;
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

  return (
    <div className="bg-slate-100/70 rounded-2xl flex flex-col max-h-[83vh] shadow-2xs overflow-hidden border border-slate-200">
      <div className="h-1.5 w-full shrink-0 shadow-2xs" style={{ backgroundColor: col.accentHex }} />
      <div className="px-3 py-2.5 border-b border-slate-200 bg-white shadow-2xs h-[68px] flex flex-col justify-between">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: col.accentHex }} />
            <span className="text-xs font-bold text-slate-900 truncate" title={colTitle}>{colTitle}</span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
            {columnItems.length}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10.5px] gap-1.5 pt-0.5">
          <span className="text-slate-500 truncate" title={colSubtitle}>{colSubtitle}</span>
          <span className="font-semibold text-slate-700 font-mono text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 whitespace-nowrap shrink-0">
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
