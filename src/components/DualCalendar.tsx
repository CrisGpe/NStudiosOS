import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar as CalendarIcon,
  Video,
  Send,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  Camera,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Deliverable } from '../types';

export const DualCalendar: React.FC = () => {
  const {
    deliverables,
    brands,
    territories,
    selectedBrandId,
    setSelectedBrandId,
    setSelectedDeliverable,
    equipment,
    reservations,
  } = useApp();

  const [viewMode, setViewMode] = useState<'dual' | 'production' | 'publishing'>('dual');
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth());

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Get calendar grid for the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Offset so Monday is index 0
  const startOffset = (firstDayOfMonth + 6) % 7;

  const filteredDeliverables = useMemo(() => {
    return deliverables.filter((d) => {
      if (selectedBrandId !== 'all' && d.brandId !== selectedBrandId) return false;
      return true;
    });
  }, [deliverables, selectedBrandId]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, { prodEvents: Deliverable[]; pubEvents: Deliverable[] }>();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const prodEvents: Deliverable[] = [];
      const pubEvents: Deliverable[] = [];

      filteredDeliverables.forEach((del) => {
        if (viewMode === 'dual' || viewMode === 'production') {
          if (del.productionStartDate <= dateStr && dateStr <= del.productionEndDate) {
            prodEvents.push(del);
          }
        }
        if (viewMode === 'dual' || viewMode === 'publishing') {
          if (del.publishDate === dateStr) {
            pubEvents.push(del);
          }
        }
      });

      map.set(dateStr, { prodEvents, pubEvents });
    }
    return map;
  }, [filteredDeliverables, daysInMonth, currentYear, currentMonth, viewMode]);

  const getEventsForDate = (dateStr: string) => {
    return eventsByDate.get(dateStr) || { prodEvents: [], pubEvents: [] };
  };

  return (
    <div className="space-y-4">
      
      {/* Calendar Header & View Switcher - High Density */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Calendario Dinámico de Producción & Publicación</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono font-semibold border border-slate-200">
                1 Pasado / 2 Futuro
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Fechas de rodaje, reserva de hardware y fechas límites con regla de ventana T-3.
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-md border border-slate-200 text-xs">
          <button
            onClick={() => setViewMode('dual')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              viewMode === 'dual'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Vista Dual</span>
          </button>

          <button
            onClick={() => setViewMode('production')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              viewMode === 'production'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-3 h-3" />
            <span>Rodaje / Producción</span>
          </button>

          <button
            onClick={() => setViewMode('publishing')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              viewMode === 'publishing'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3 h-3" />
            <span>Publicación & T-3</span>
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-bold text-xs text-slate-800 min-w-[120px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Legend & T-3 Rule Alert Info - High Density */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-3.5 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-50 border border-rose-300" />
            <span>Rodaje (Hardware Bloqueado)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-teal-50 border border-teal-300" />
            <span>Fecha de Publicación</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-100 border border-red-400 text-red-700 text-[8px] font-bold flex items-center justify-center">
              T-3
            </span>
            <span>Bloqueo de Cambios T-3 (≤3 días antes de estreno)</span>
          </div>
        </div>

        <span className="text-slate-500 font-mono text-[11px] font-medium">
          Hoy: {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
        </span>
      </div>

      {/* 7-Day Week Calendar Grid - High Density */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
          <div>Lunes</div>
          <div>Martes</div>
          <div>Miércoles</div>
          <div>Jueves</div>
          <div>Viernes</div>
          <div>Sábado</div>
          <div>Domingo</div>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200 bg-white">
          {/* Empty cells before start of month */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[110px] p-2 bg-slate-50/50 text-slate-300 text-xs select-none" />
          ))}

          {/* Days in Month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const { prodEvents, pubEvents } = getEventsForDate(dateStr);
            const nowObj = new Date();
            const isToday =
              currentYear === nowObj.getFullYear() &&
              currentMonth === nowObj.getMonth() &&
              dayNum === nowObj.getDate();

            return (
              <div
                key={dateStr}
                className={`min-h-[115px] p-2 transition-colors flex flex-col justify-between ${
                  isToday ? 'bg-blue-50/40 ring-1 ring-inset ring-blue-500' : 'hover:bg-slate-50/60'
                }`}
              >
                {/* Date Header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold font-mono px-1.5 py-0.2 rounded ${
                      isToday
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {isToday && (
                    <span className="text-[9px] uppercase font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                      HOY
                    </span>
                  )}
                </div>

                {/* Events in this day */}
                <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar flex-1">
                  
                  {/* Production / Shoot Events */}
                  {prodEvents.map((del) => {
                    const brand = brands.find((b) => b.id === del.brandId);
                    return (
                      <div
                        key={`prod-${del.id}`}
                        onClick={() => setSelectedDeliverable(del)}
                        className="bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded p-1 text-[10px] text-rose-800 cursor-pointer transition-all truncate"
                        title={`Rodaje: ${del.title} (${brand?.name})`}
                      >
                        <div className="flex items-center gap-1">
                          <Video className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                          <span className="font-bold text-rose-700 font-mono">[{del.code}]</span>
                          <span className="truncate font-medium">{del.title}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Publishing Events */}
                  {pubEvents.map((del) => {
                    const brand = brands.find((b) => b.id === del.brandId);
                    const now = new Date().getTime();
                    const pub = new Date(del.publishDate).getTime();
                    const diffDays = Math.ceil((pub - now) / (1000 * 60 * 60 * 24));
                    const isTMinus3 = diffDays <= 3 && diffDays >= 0;

                    return (
                      <div
                        key={`pub-${del.id}`}
                        onClick={() => setSelectedDeliverable(del)}
                        className={`rounded p-1 text-[10px] cursor-pointer transition-all border ${
                          isTMinus3
                            ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-800 font-bold animate-pulse'
                            : 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-800'
                        }`}
                        title={`Publicación: ${del.title} (${brand?.name})`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1 truncate font-medium">
                            <Send className="w-2.5 h-2.5 text-teal-600 shrink-0" />
                            <span className="truncate">{del.title}</span>
                          </div>
                          {isTMinus3 && (
                            <span className="bg-red-600 text-white font-bold px-1 rounded text-[8px]">
                              T-3
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                </div>

                {/* Day Summary Indicators */}
                {(prodEvents.length > 0 || pubEvents.length > 0) && (
                  <div className="text-[9px] text-slate-400 font-mono pt-1 text-right">
                    {prodEvents.length > 0 && `${prodEvents.length} rodaje `}
                    {pubEvents.length > 0 && `• ${pubEvents.length} estreno`}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
