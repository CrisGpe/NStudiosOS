import React from 'react';
import { Deliverable, DeliverablePriority, Brand, CommunicationTerritory, UserProfile } from '../../types';
import { Palette, Video, Calendar, FolderOpen, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { KANBAN_COLUMNS } from './constants';

interface KanbanCardProps {
  item: Deliverable;
  brand?: Brand;
  territory?: CommunicationTerritory;
  assignee?: UserProfile;
  colIdx: number;
  colId: string;
  isClient: boolean;
  setSelectedDeliverable: (item: Deliverable) => void;
  moveDeliverablePhase: (id: string, phase: any) => void;
  calculateDaysToPublish: (date: string) => number;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  item,
  brand,
  territory,
  assignee,
  colIdx,
  colId,
  isClient,
  setSelectedDeliverable,
  moveDeliverablePhase,
  calculateDaysToPublish,
}) => {
  const daysToPublish = calculateDaysToPublish(item.publishDate);
  const isTMinus3Active = daysToPublish <= 3 && daysToPublish >= 0;
  const hasOpenChangeRequests = item.changeRequests?.some((cr) => cr.status === 'submitted');
  const isGraphic = item.deliverableType === 'graphic';

  const renderPriorityDot = (priority: DeliverablePriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="relative flex h-2.5 w-2.5 shrink-0" title="Prioridad Urgente (Palpitando)">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600 ring-1 ring-rose-300"></span>
          </span>
        );
      case 'high':
        return <span className="inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-1 ring-rose-600/30 shrink-0" title="Prioridad Alta" />;
      case 'medium':
        return <span className="inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 ring-1 ring-amber-500/30 shrink-0" title="Prioridad Media" />;
      case 'low':
        return <span className="inline-flex rounded-full h-2.5 w-2.5 bg-slate-400 ring-1 ring-slate-500/30 shrink-0" title="Prioridad Baja" />;
    }
  };

  return (
    <div
      onClick={() => setSelectedDeliverable(item)}
      className="group bg-white border border-slate-200 rounded-xl shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
      style={{ borderLeftColor: brand?.primaryColor || '#4f46e5', borderLeftWidth: '4px' }}
    >
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-1.5 w-full">
          <div
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold truncate shadow-2xs"
            style={{ backgroundColor: brand?.primaryColor || '#4f46e5' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
            <span className="truncate max-w-[105px]">{brand?.name || 'Marca'}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {isGraphic ? '🎨 Gráfico' : '🎬 AV'}
            </span>
            {renderPriorityDot(item.priority)}
          </div>
        </div>

        <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
          {item.title}
        </h4>

        {territory && (
          <div className="text-[10px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200 truncate">
            🎯 {territory.name}
          </div>
        )}

        <div className="text-[10.5px] text-slate-500 space-y-1 pt-1.5 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              {isGraphic ? <Palette className="w-3.5 h-3.5 text-purple-600" /> : <Video className="w-3.5 h-3.5 text-indigo-600" />}
              {isGraphic ? 'Diseño:' : 'Rodaje:'}
            </span>
            <span className="font-mono text-slate-800 font-semibold">{item.productionStartDate.substring(5)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Publicación:
            </span>
            <span className="font-mono text-slate-800 font-semibold">{item.publishDate.substring(5)}</span>
          </div>
        </div>

        {(colId === 'produccion' || colId === 'post_produccion' || colId === 'aprobacion_cliente') && (
          <div className="flex items-center justify-between text-[9.5px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 shadow-2xs">
            <span className="flex items-center gap-1.5 font-medium">
              <FolderOpen className="w-3.5 h-3.5 text-emerald-600" />
              1ra Entrega en Drive Vault
            </span>
            <span className="font-mono font-bold text-emerald-700">Listo</span>
          </div>
        )}

        {isTMinus3Active && item.phase === 'aprobacion_cliente' && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg px-2 py-1 text-[10px] text-rose-700 flex items-center gap-1.5 font-bold animate-pulse shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Ventana T-3 ({daysToPublish}d restantes)</span>
          </div>
        )}

        {hasOpenChangeRequests && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 text-[9.5px] text-amber-800 flex items-center gap-1 font-semibold">
            <span>⚠️ Solicitud de cambio pendiente</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10.5px]">
          <div className="flex items-center gap-1.5">
            {assignee ? (
              <>
                <img
                  src={assignee.avatar}
                  alt={assignee.name}
                  className="w-4.5 h-4.5 rounded-full object-cover ring-1 ring-slate-200"
                />
                <span className="text-slate-700 truncate max-w-[85px] font-medium">
                  {assignee.name.split(' ')[0]}
                </span>
              </>
            ) : (
              <span className="text-slate-400 italic text-[10px]">Sin asignar</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {colIdx > 0 && !isClient && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const prevPhase = KANBAN_COLUMNS[colIdx - 1].id;
                  moveDeliverablePhase(item.id, prevPhase);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                title="Retroceder fase"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}

            {colIdx < KANBAN_COLUMNS.length - 1 && !isClient && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const nextPhase = KANBAN_COLUMNS[colIdx + 1].id;
                  moveDeliverablePhase(item.id, nextPhase);
                }}
                className="px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-semibold flex items-center gap-0.5 cursor-pointer transition-all border border-indigo-200"
                title="Avanzar a siguiente fase"
              >
                <span>Avanzar</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
