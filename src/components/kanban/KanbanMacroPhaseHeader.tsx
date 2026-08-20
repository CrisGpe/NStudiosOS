import React from 'react';

interface KanbanMacroPhaseHeaderProps {
  deliverableTypeFilter: string;
}

export const KanbanMacroPhaseHeader: React.FC<KanbanMacroPhaseHeaderProps> = ({ deliverableTypeFilter }) => {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="grid grid-cols-12 gap-3 min-w-[1450px]">
        {/* Pre-producción Banner (Cols 1 to 3) */}
        <div className="col-span-5 bg-gradient-to-r from-indigo-50/90 via-blue-50/80 to-indigo-100/60 border border-indigo-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-2xs">
              Macro-Fase 1
            </span>
            <span className="font-bold text-indigo-950 text-xs">Pre-producción</span>
          </div>
          <span className="text-[11px] text-indigo-700 font-medium">
            Ideación Co-creativa • Calendarización • {deliverableTypeFilter === 'graphic' ? 'Guía Gráfica' : 'Guía Técnica AV'}
          </span>
        </div>

        {/* Producción Banner (Col 4) */}
        <div className="col-span-2 bg-gradient-to-r from-rose-50/90 to-orange-50/80 border border-rose-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-2xs">
              Macro-Fase 2
            </span>
            <span className="font-bold text-rose-950 text-xs">Producción</span>
          </div>
          <span className="text-[11px] text-rose-700 truncate font-medium">
            {deliverableTypeFilter === 'graphic' ? 'Diseño Activo' : 'Grabación en Set'}
          </span>
        </div>

        {/* Post-producción Banner (Cols 5 to 7) */}
        <div className="col-span-5 bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-cyan-50/70 border border-teal-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-700 text-white text-[10px] font-bold uppercase tracking-wider shadow-2xs">
              Macro-Fase 3
            </span>
            <span className="font-bold text-teal-950 text-xs">Post-producción</span>
          </div>
          <span className="text-[11px] text-teal-700 font-medium">
            {deliverableTypeFilter === 'graphic' ? 'Ajustes' : 'Color/VFX'} • Aprobación Cliente (T-3) • Publicación
          </span>
        </div>
      </div>
    </div>
  );
};
