import React from 'react';

interface KanbanMacroPhaseHeaderProps {
  deliverableTypeFilter: string;
}

export const KanbanMacroPhaseHeader: React.FC<KanbanMacroPhaseHeaderProps> = ({ deliverableTypeFilter }) => {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="grid grid-cols-7 gap-3 min-w-[1450px]">
        {/* Pre-producción Banner (Cols 1 to 3) */}
        <div className="col-span-3 bg-gradient-to-r from-indigo-50/90 via-blue-50/80 to-indigo-100/60 border border-indigo-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-2xs">
              Macro-Fase 1
            </span>
            <span className="font-bold text-indigo-950 text-xs">Pre-producción</span>
          </div>
          <span className="text-[11px] text-indigo-700 font-medium truncate ml-2">
            Ideación Co-creativa • Calendarización • {deliverableTypeFilter === 'graphic' ? 'Guía Gráfica' : 'Guía Técnica AV'}
          </span>
        </div>

        {/* Producción Banner (Col 4 - 1 exact column) */}
        <div className="col-span-1 bg-gradient-to-r from-rose-50/90 to-orange-50/80 border border-rose-200/80 rounded-xl px-2.5 py-2 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wider shadow-2xs shrink-0">
              M-F2
            </span>
            <span className="font-bold text-rose-950 text-xs truncate">Producción</span>
          </div>
          <span className="text-[10.5px] text-rose-700 font-semibold shrink-0">
            {deliverableTypeFilter === 'graphic' ? 'Diseño' : 'Rodaje / Set'}
          </span>
        </div>

        {/* Post-producción Banner (Cols 5 to 7) */}
        <div className="col-span-3 bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-cyan-50/70 border border-teal-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-700 text-white text-[10px] font-bold uppercase tracking-wider shadow-2xs">
              Macro-Fase 3
            </span>
            <span className="font-bold text-teal-950 text-xs">Post-producción</span>
          </div>
          <span className="text-[11px] text-teal-700 font-medium truncate ml-2">
            {deliverableTypeFilter === 'graphic' ? 'Ajustes' : 'Color/VFX'} • Aprobación Cliente (T-3) • Publicación
          </span>
        </div>
      </div>
    </div>
  );
};
