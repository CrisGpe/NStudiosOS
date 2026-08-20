import React from 'react';
import { Layers, Film, Palette } from 'lucide-react';

interface KanbanProcessToggleProps {
  deliverableTypeFilter: string;
  setDeliverableTypeFilter: (filter: 'all' | 'audiovisual' | 'graphic') => void;
}

export const KanbanProcessToggle: React.FC<KanbanProcessToggleProps> = ({
  deliverableTypeFilter,
  setDeliverableTypeFilter,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs bg-white border border-slate-200">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-700 font-bold uppercase tracking-wider">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Tipo de Proceso:</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setDeliverableTypeFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              deliverableTypeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>🎬 Todo el Pipeline</span>
          </button>

          <button
            onClick={() => setDeliverableTypeFilter('audiovisual')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              deliverableTypeFilter === 'audiovisual'
                ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-indigo-100" />
            <span>Audiovisual (Video/Cine)</span>
          </button>

          <button
            onClick={() => setDeliverableTypeFilter('graphic')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              deliverableTypeFilter === 'graphic'
                ? 'bg-purple-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-purple-100" />
            <span>Visual Gráfica (Diseño/Social)</span>
          </button>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-3.5 text-[11.5px] text-slate-700 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
        <span className="font-bold text-slate-500 uppercase text-[9.5px] tracking-wider">Prioridad:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <span>Baja</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Media</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Alta</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
          <span className="font-semibold text-purple-700">Urgente</span>
        </div>
      </div>
    </div>
  );
};
