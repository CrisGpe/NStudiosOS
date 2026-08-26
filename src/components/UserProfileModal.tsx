import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, User, Layout, LogOut, Shield, Sun, Clock, Calendar, Bell, Palmtree, CheckCircle2, AlertCircle, Sliders } from 'lucide-react';
import { CollaboratorSchedule } from '../types';

export const UserProfileModal: React.FC = () => {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    currentUser,
    users,
    brands,
    navPosition,
    setNavPosition,
    preferences,
    updatePreferences,
    logout,
    login,
    updateCollaboratorSchedule,
    checkCollaboratorAvailability,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'appearance' | 'account'>('profile');

  // Schedule local state
  const currentSched: CollaboratorSchedule = currentUser.schedule || {
    workDays: [1, 2, 3, 4, 5],
    startHour: '09:00',
    endHour: '19:00',
    isOnVacation: false,
    alertsEnabled: true,
    vacationNotes: '',
  };

  const [startHour, setStartHour] = useState(currentSched.startHour);
  const [endHour, setEndHour] = useState(currentSched.endHour);
  const [workDays, setWorkDays] = useState<number[]>(currentSched.workDays);
  const [isOnVacation, setIsOnVacation] = useState<boolean>(currentSched.isOnVacation);
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(currentSched.alertsEnabled);
  const [vacationNotes, setVacationNotes] = useState<string>(currentSched.vacationNotes || '');
  const [isSavedSchedule, setIsSavedSchedule] = useState(false);

  if (!isProfileModalOpen) return null;

  const availability = checkCollaboratorAvailability(currentUser.id);

  const userBrand = currentUser.role === 'cliente' && currentUser.assignedBrandIds?.[0]
    ? brands.find((b) => b.id === currentUser.assignedBrandIds![0])
    : null;

  const daysLabels = [
    { id: 1, name: 'Lun' },
    { id: 2, name: 'Mar' },
    { id: 3, name: 'Mié' },
    { id: 4, name: 'Jue' },
    { id: 5, name: 'Vie' },
    { id: 6, name: 'Sáb' },
    { id: 0, name: 'Dom' },
  ];

  const toggleDay = (dayId: number) => {
    setWorkDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const handleSaveSchedule = () => {
    updateCollaboratorSchedule(currentUser.id, {
      workDays,
      startHour,
      endHour,
      isOnVacation,
      alertsEnabled,
      vacationNotes,
    });
    setIsSavedSchedule(true);
    setTimeout(() => setIsSavedSchedule(false), 2500);
  };

  return (
    <div
      onClick={() => setIsProfileModalOpen(false)}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in-scale"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-slate-200 text-slate-800"
      >
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/40 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">{currentUser.name}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-100/70 px-4 gap-2 text-xs font-semibold overflow-x-auto shrink-0 no-scrollbar">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Perfil & RBAC</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'schedule'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Horarios & Disponibilidad</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'appearance'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>Apariencia & Layout</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'account'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Switch de Rol Demo</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">

          {/* TAB 1: PROFILE & DETAILS */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    Cargo Operacional
                  </span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                    {currentUser.roleTitle}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    Cupo / Slot Asignado
                  </span>
                  <span className="text-xs font-bold text-indigo-600 mt-0.5 block">
                    {currentUser.quotaSlot || 'Acceso Ilimitado'}
                  </span>
                </div>
              </div>

              {userBrand && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Marca Asignada (Cliente RBAC)
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: userBrand.primaryColor }}
                    />
                    <strong className="text-xs">{userBrand.name}</strong>
                    <span className="text-[11px] text-emerald-700">• {userBrand.industry}</span>
                  </div>
                </div>
              )}

              {/* Status Alert */}
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
                {availability.isAvailable ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    Estado Actual de Disponibilidad
                  </span>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    {availability.isAvailable
                      ? 'Activo y disponible para rodajes, calendarización y asignación de piezas.'
                      : availability.reason || 'Fuera de horario laboral o en período de descanso.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEDULE & VACATIONS */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <span className="font-bold text-slate-900 text-xs block mb-1.5">
                    Días Laborales Activos
                  </span>
                  <div className="grid grid-cols-7 gap-1.5">
                    {daysLabels.map((d) => {
                      const isSelected = workDays.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => toggleDay(d.id)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 border border-indigo-600'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {d.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] text-slate-600 font-bold mb-1">
                      Hora de Inicio
                    </label>
                    <div className="relative">
                      <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="time"
                        value={startHour}
                        onChange={(e) => setStartHour(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-600 font-bold mb-1">
                      Hora de Fin
                    </label>
                    <div className="relative">
                      <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="time"
                        value={endHour}
                        onChange={(e) => setEndHour(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Vacation Switch */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <Palmtree className="w-4 h-4 text-amber-600" />
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">Modo Vacaciones Activo</span>
                        <span className="text-[10px] text-slate-500">Pausa avisos y reasigna asignaciones urgentes</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isOnVacation}
                      onChange={(e) => setIsOnVacation(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {isOnVacation && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <label className="block text-[10px] text-slate-700 font-semibold mb-1">
                        Motivo / Fechas de Vacaciones
                      </label>
                      <input
                        type="text"
                        value={vacationNotes}
                        onChange={(e) => setVacationNotes(e.target.value)}
                        placeholder="Ej: Vacaciones hasta el 30 de agosto"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4 text-indigo-600" />
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">Habilitar Alertas de Producción</span>
                        <span className="text-[10px] text-slate-500">Avisos de rodaje, T-3 y entregas de clientes</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={alertsEnabled}
                      onChange={(e) => setAlertsEnabled(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {isSavedSchedule ? (
                    <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ¡Horario guardado correctamente!
                    </span>
                  ) : <div />}

                  <button
                    type="button"
                    onClick={handleSaveSchedule}
                    className="btn-primary"
                  >
                    Guardar Configuración
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPEARANCE & LAYOUT (SIMPLIFIED LIGHT THEME) */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              
              {/* Default Light Theme Banner */}
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-indigo-200 flex items-center justify-center shadow-xs">
                    <Sun className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">Tema Claro Moderno & Minimalista</span>
                    <span className="text-[10.5px] text-slate-600">Estándar oficial N. Studios (Blanco, Slate & Acentos Índigo)</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                  Activo
                </span>
              </div>

              {/* Navigation Position Switcher */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Disposición de Navegación</span>
                  <span className="text-[10px] text-slate-500">Persiste en tu perfil</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setNavPosition('topbar');
                      updatePreferences({ navPosition: 'topbar' });
                    }}
                    className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold cursor-pointer transition-all ${
                      navPosition === 'topbar'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Layout className="w-4 h-4 rotate-90" />
                    <span>Barra Superior (Topbar)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNavPosition('sidebar');
                      updatePreferences({ navPosition: 'sidebar' });
                    }}
                    className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold cursor-pointer transition-all ${
                      navPosition === 'sidebar'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Layout className="w-4 h-4" />
                    <span>Barra Lateral (Sidebar)</span>
                  </button>
                </div>
              </div>

              {/* Density Switcher */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Densidad de Interfaz</span>
                  <span className="text-[10px] text-slate-500">Espaciado de tarjetas</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updatePreferences({ compactCards: false })}
                    className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold cursor-pointer transition-all ${
                      !preferences.compactCards
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Modo Normal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updatePreferences({ compactCards: true })}
                    className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold cursor-pointer transition-all ${
                      preferences.compactCards
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Modo Compacto</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: ACCOUNT & FAST SWITCH */}
          {activeTab === 'account' && (
            <div className="space-y-3">
              <span className="font-bold text-slate-900 text-xs block">
                Simulación de Sesión & Switch de Persona RBAC
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        login(u.id);
                        setIsProfileModalOpen(false);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-900 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-bold block truncate text-xs text-slate-900">
                            {u.name}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {u.roleTitle}
                          </span>
                        </div>
                      </div>

                      {isCurrent && (
                        <span className="text-[9.5px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200 shrink-0">
                          Actual
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all font-semibold cursor-pointer text-xs active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>

          <button
            type="button"
            onClick={() => setIsProfileModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer active:scale-98"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
