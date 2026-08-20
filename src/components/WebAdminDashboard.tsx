import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Users,
  Building2,
  Camera,
  Activity,
  Layers,
  Clock,
  HardDrive,
  Palmtree,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { seedDemoDataToSupabase } from '../services/supabaseService';

export const WebAdminDashboard: React.FC = () => {
  const {
    users,
    brands,
    equipment,
    deliverables,
    auditLogs,
    currentUser,
    driveAccounts,
    updateCollaboratorSchedule,
    checkCollaboratorAvailability,
  } = useApp();

  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedToast, setSeedToast] = useState<string | null>(null);

  const activeReservationsCount = equipment.filter((e) => e.status !== 'available').length;
  const hardwareUtilizationRate = Math.round((activeReservationsCount / equipment.length) * 100);

  const teamCollaborators = users.filter(
    (u) => u.role === 'colaborador' || u.role === 'director' || u.role === 'webadmin'
  );

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
      vacationNotes: !currentSched.isOnVacation ? 'Vacaciones autorizadas por Dirección General' : '',
    });

    setTogglingUserId(userId);
    setTimeout(() => setTogglingUserId(null), 1500);
  };

  return (
    <div className="space-y-4 text-slate-800">
      
      {/* Header - High Density */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Panel de Gobernanza, Horarios & WebAdmin
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Control Global RBAC
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitoreo de infraestructura, matriz de permisos, horarios de trabajo, vacaciones y registro de auditoría.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              setSeeding(true);
              const res = await seedDemoDataToSupabase();
              setSeedToast(res.message);
              setSeeding(false);
              setTimeout(() => setSeedToast(null), 4000);
            }}
            disabled={seeding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Importar marcas, territorios y entregables de prueba a Supabase"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>{seeding ? 'Importando a Supabase...' : 'Importar Datos Demo'}</span>
          </button>

          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Supabase PostgreSQL</span>
          </span>
        </div>
      </div>

      {seedToast && (
        <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{seedToast}</span>
        </div>
      )}

      {/* 4 Health Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Marcas Activas</span>
            <Building2 className="w-4 h-4 text-pink-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{brands.length}</div>
          <div className="text-[11px] text-emerald-700 font-medium">
            6 de 6 marcas con territorios válidos
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Cupos de Colaborador</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">2 / 2 Asignados</div>
          <div className="text-[11px] text-slate-500 font-medium">
            Carlos Méndez & Sofía Alarcón
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
            En 7 fases de ciclo de vida
          </div>
        </div>

      </div>

      {/* Team Working Hours & Vacation Governance Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Gobernanza de Horarios Laborales & Modo Vacaciones (Dirección General)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Reglas de alertas asíncronas: Fuera de jornada laboral o durante vacaciones autorizadas, las notificaciones se silencian automáticamente.
            </p>
          </div>

          <span className="text-[10px] font-mono text-indigo-700 font-bold px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200">
            Motor de Disponibilidad Asíncrona Activo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {teamCollaborators.map((member) => {
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
                    <strong className="text-slate-900">{sched.startHour} - {sched.endHour}</strong>
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
          })}
        </div>
      </div>

      {/* Infrastructure Storage Multi-Account */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-cyan-600" />
            <span>Infraestructura de Almacenamiento: Google Drive Multi-Cuenta</span>
          </h3>
          <span className="text-emerald-800 font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
            2 Cuentas Activas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {driveAccounts.map((account) => (
            <div
              key={account.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{account.name}</h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{account.email}</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  {account.type === 'corporate_workspace' ? 'Shared Drive Agencia' : 'Drive Personal / Bóveda'}
                </span>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-600">
                  <span>Cuota: {account.quotaUsedGB} GB / {account.quotaTotalGB} GB</span>
                  <span className="font-bold text-slate-900">{Math.round((account.quotaUsedGB / account.quotaTotalGB) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                    style={{ width: `${(account.quotaUsedGB / account.quotaTotalGB) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10.5px] text-slate-500 pt-1.5 border-t border-slate-200 font-mono">
                <span>Último sync: {account.lastSyncedAt}</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sincronizado</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs Live Feed */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Registro de Auditoría & Trazabilidad de Eventos</span>
          </h3>
          <span className="text-slate-500 font-mono text-xs">
            {auditLogs.length} eventos registrados
          </span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-slate-500 ml-2 font-mono text-[10.5px]">
                    {log.entityType} ({log.entityId})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-500 text-[10.5px]">
                <span>Por: <strong className="text-slate-800">{log.userName || log.userId}</strong></span>
                <span className="font-mono text-slate-400">{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
