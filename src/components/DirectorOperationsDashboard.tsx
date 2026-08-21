import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  Users,
  Building2,
  Camera,
  Layers,
  Clock,
  Palmtree,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

export const DirectorOperationsDashboard: React.FC = () => {
  const {
    users,
    brands,
    equipment,
    deliverables,
    updateCollaboratorSchedule,
    checkCollaboratorAvailability,
    setSelectedDeliverable,
    setIsDeliverableDetailModalOpen,
  } = useApp();

  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  const activeReservationsCount = equipment.filter((e) => e.status !== 'available').length;
  const hardwareUtilizationRate =
    equipment.length > 0 ? Math.round((activeReservationsCount / equipment.length) * 100) : 0;

  const teamCollaborators = users.filter(
    (u) => u.role === 'colaborador' || u.role === 'director' || u.role === 'webadmin'
  );

  // Pending T-3 approvals
  const pendingApprovals = deliverables.filter(
    (d) => d.phase === 'aprobacion_cliente' || d.phase === 'post_produccion'
  );

  // Active production shootings
  const shootingDeliverables = deliverables.filter((d) => d.phase === 'produccion');

  const handleToggleVacation = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const currentSched = user.schedule || {
      workDays: [1, 2, 3, 4, 5],
      startHour: '09:00',
      endHour: '19:00',
      isOnVacation: false,
      alertsEnabled: true,
      vacationNotes: '',
    };

    updateCollaboratorSchedule(userId, {
      ...currentSched,
      isOnVacation: !currentSched.isOnVacation,
      vacationNotes: !currentSched.isOnVacation
        ? 'Vacaciones autorizadas por Dirección General'
        : '',
    });

    setTogglingUserId(userId);
    setTimeout(() => setTogglingUserId(null), 1500);
  };

  return (
    <div className="space-y-4 text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 shadow-2xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Panel de Dirección General & Operaciones
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Dirección Creativa & Studio
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Gobernanza de horarios laborales, gestión de vacaciones, utilización de recursos y bandeja de alertas operativas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Estudio en Operación Activa</span>
          </span>
        </div>
      </div>

      {/* 4 Health Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Marcas Activas</span>
            <Building2 className="w-4 h-4 text-pink-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{brands.length}</div>
          <div className="text-[11px] text-slate-500 font-medium">
            {brands.length} marca(s) registradas
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Equipo Asignado</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{teamCollaborators.length} Asignados</div>
          <div className="text-[11px] text-slate-500 font-medium truncate">
            {teamCollaborators.map((c) => c.name.split(' ')[0]).join(', ') || 'Sin equipo registrado'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Utilización de Hardware</span>
            <Camera className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{hardwareUtilizationRate}%</div>
          <div className="text-[11px] text-amber-700 font-medium">
            {activeReservationsCount} de {equipment.length} equipos en rodaje
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Entregables en Pipeline</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{deliverables.length}</div>
          <div className="text-[11px] text-indigo-700 font-medium">
            {deliverables.length} entregable(s) en ciclo de vida
          </div>
        </div>
      </div>

      {/* Operational Alerts & Production Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alerts Box: T-3 Approvals */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Bandeja de Aprobaciones T-3 (Ventana Crítica)</span>
            </h3>
            <span className="text-amber-800 font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
              {pendingApprovals.length} Pendientes
            </span>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400">
              No hay entregables en espera de aprobación de cliente.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
              {pendingApprovals.map((item) => {
                const brand = brands.find((b) => b.id === item.brandId);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedDeliverable(item);
                      setIsDeliverableDetailModalOpen(true);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{item.title}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                          {brand?.name}
                        </span>
                      </div>
                      <span className="text-[10.5px] text-slate-500">
                        Publicación: {item.publishDate || 'Sin fecha'} • {item.format}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Alerts Box: Active Shootings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-rose-600" />
              <span>Rodajes & Producción en Set Activa</span>
            </h3>
            <span className="text-rose-800 font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200">
              {shootingDeliverables.length} En Rodaje
            </span>
          </div>

          {shootingDeliverables.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400">
              No hay rodajes activos en este momento.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
              {shootingDeliverables.map((item) => {
                const brand = brands.find((b) => b.id === item.brandId);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedDeliverable(item);
                      setIsDeliverableDetailModalOpen(true);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-rose-300 transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{item.title}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700">
                          {brand?.name}
                        </span>
                      </div>
                      <span className="text-[10.5px] text-slate-500">
                        Fecha Inicio: {item.productionStartDate || 'Inmediato'} • Asignado: {users.find((u) => u.id === item.assigneeId)?.name || 'Sin asignar'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Team Working Hours & Vacation Governance Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Gobernanza de Horarios Laborales & Modo Vacaciones</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Reglas de disponibilidad asíncrona: Fuera de jornada laboral o durante vacaciones autorizadas, las notificaciones se silencian automáticamente.
            </p>
          </div>

          <span className="text-[10px] font-mono text-indigo-700 font-bold px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200">
            Motor de Disponibilidad Asíncrona Activo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {teamCollaborators.length === 0 ? (
            <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-bold text-xs text-slate-800">Sin colaboradores registrados</h4>
              <p className="text-[11px] text-slate-500">
                Registra miembros del equipo para gestionar sus horarios y disponibilidad.
              </p>
            </div>
          ) : (
            teamCollaborators.map((member) => {
              const sched = member.schedule || {
                workDays: [1, 2, 3, 4, 5],
                startHour: '09:00',
                endHour: '19:00',
                isOnVacation: false,
                alertsEnabled: true,
                vacationNotes: '',
              };
              const avail = checkCollaboratorAvailability(member.id);

              return (
                <div
                  key={member.id}
                  className={`p-3.5 rounded-2xl border space-y-2.5 transition-all shadow-2xs ${
                    sched.isOnVacation
                      ? 'bg-amber-50/60 border-amber-300'
                      : avail.isAvailable
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-slate-50/60 border-slate-200 opacity-90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-tight">
                          {member.name}
                        </h4>
                        <span className="text-[10.5px] text-slate-500 block truncate">
                          {member.roleTitle}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        avail.isAvailable
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : sched.isOnVacation
                          ? 'bg-amber-100 border-amber-300 text-amber-800'
                          : 'bg-slate-200 border-slate-300 text-slate-700'
                      }`}
                    >
                      {avail.isAvailable ? '🟢 ACTIVO' : sched.isOnVacation ? '🌴 VACACIONES' : '🌙 ASÍNCRONO'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs font-mono text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span>Horario:</span>
                      <strong className="text-slate-900">
                        {sched.startHour} - {sched.endHour}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Días:</span>
                      <span className="text-slate-700 font-sans text-[11px]">
                        {sched.workDays.length === 5 ? 'Lun a Vie' : `${sched.workDays.length} días/sem`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Alertas:</span>
                      <span className={sched.alertsEnabled ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                        {sched.alertsEnabled ? '✓ Habilitadas' : '✕ Silenciadas'}
                      </span>
                    </div>
                  </div>

                  {/* Director Vacation Toggle Action */}
                  <div className="pt-1">
                    <button
                      onClick={() => handleToggleVacation(member.id)}
                      className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-2xs ${
                        sched.isOnVacation
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-white hover:bg-amber-500 hover:text-white text-slate-700 border border-slate-200 hover:border-amber-500'
                      }`}
                    >
                      <Palmtree className="w-3.5 h-3.5" />
                      <span>{sched.isOnVacation ? 'Finalizar Vacaciones' : 'Activar Modo Vacaciones'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
