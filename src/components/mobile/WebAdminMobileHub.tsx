import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Users,
  KeyRound,
  HardDrive,
  Activity,
  Monitor,
  LogOut,
  Search,
  CheckCircle2,
  Database,
  Cpu,
  Edit3,
  X,
  Building2,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { UserRole } from '../../types';
import { supabaseService } from '../../services/supabaseService';

export const WebAdminMobileHub: React.FC = () => {
  const {
    currentUser,
    users,
    brands,
    driveAccounts,
    auditLogs,
    logout,
  } = useApp();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'users' | 'apis' | 'storage' | 'logs'>('users');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  // Edit User RBAC state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<UserRole>('cliente');
  const [editingBrands, setEditingBrands] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredUsers = users.filter((u) => {
    if (selectedRoleFilter !== 'all' && u.role !== selectedRoleFilter) return false;
    if (searchUserQuery.trim()) {
      const q = searchUserQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.roleTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenEditUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;
    setEditingUserId(userId);
    setEditingRole(targetUser.role);
    setEditingBrands(targetUser.assignedBrandIds || []);
  };

  const handleToggleBrand = (brandId: string) => {
    setEditingBrands((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]
    );
  };

  const handleSaveRBAC = async () => {
    if (!editingUserId) return;
    setIsSaving(true);
    try {
      await supabaseService.updateUserProfile(editingUserId, {
        role: editingRole,
        assigned_brand_ids: editingBrands,
      });
      showToast('Permisos guardados en Supabase');
      setEditingUserId(null);
    } catch (err: any) {
      console.error('Error saving user RBAC:', err);
      alert('Error: ' + (err.message || 'No se pudo guardar'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center font-sans antialiased text-slate-800">
      
      {/* Mobile Shell Container */}
      <div className="w-full max-w-md min-h-screen bg-slate-50 flex flex-col justify-between shadow-2xl border-x border-slate-200 relative pb-20">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-xl border border-white/20 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ========================================================
            HEADER WEBADMIN MOBILE
            ======================================================== */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-2xs font-extrabold text-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs font-extrabold text-slate-900">
                    WebAdmin Global
                  </h2>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Control RBAC
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate max-w-[170px]">
                  {currentUser.name} • Sistema
                </p>
              </div>
            </div>

            {/* Desktop Link & Logout */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-[11px] font-semibold border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                title="Cambiar a versión de escritorio"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[10px]">Escritorio</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors shadow-2xs cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* ========================================================
            MAIN CONTENT BY ACTIVE TAB
            ======================================================== */}
        <main className="flex-1 p-4 space-y-3">
          
          {/* TAB 1: GESTIÓN DE USUARIOS & ROLES */}
          {activeTab === 'users' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Usuarios Registrados ({users.length})</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    Supabase Auth
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchUserQuery}
                    onChange={(e) => setSearchUserQuery(e.target.value)}
                    placeholder="Buscar por nombre o correo..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Role Filter Chips */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-semibold">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'webadmin', label: 'Admin' },
                    { id: 'director', label: 'Directores' },
                    { id: 'colaborador', label: 'Equipo' },
                    { id: 'cliente', label: 'Clientes' },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => setSelectedRoleFilter(chip.id)}
                      className={`px-2.5 py-1 rounded-xl border transition-all shrink-0 cursor-pointer ${
                        selectedRoleFilter === chip.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Cards List */}
              <div className="space-y-2">
                {filteredUsers.length === 0 ? (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                    No se encontraron usuarios.
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const assignedBrandNames = (u.assignedBrandIds || [])
                      .map((bid) => brands.find((b) => b.id === bid)?.name)
                      .filter(Boolean);

                    return (
                      <div
                        key={u.id}
                        className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                            />
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 leading-tight">
                                {u.name}
                              </h4>
                              <span className="text-[11px] text-slate-400 font-mono block">
                                {u.email}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold uppercase tracking-wider border ${
                              u.role === 'webadmin'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : u.role === 'director'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : u.role === 'colaborador'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {u.role}
                          </span>
                        </div>

                        {/* Assigned Brands or Scope */}
                        <div className="text-[10.5px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                          <span className="text-slate-400">Alcance:</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                            {u.role === 'webadmin' || u.role === 'director'
                              ? 'Acceso Global Multimarca'
                              : assignedBrandNames.length > 0
                              ? assignedBrandNames.join(', ')
                              : 'Sin marcas asignadas'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleOpenEditUser(u.id)}
                          className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar Rol & Marcas</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: APIS & INTEGRACIONES */}
          {activeTab === 'apis' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>Estado de Integraciones & APIs</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Monitoreo de conexiones a servicios en la nube y llaves activas.
                </p>
              </div>

              {/* Service 1: Supabase */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-xs text-slate-900">Supabase PostgreSQL</h4>
                  </div>
                  <span className="text-[9.5px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    🟢 Conectado
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-1 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ref:</span>
                    <strong className="text-slate-800">qrwqzgzchhnirrzzfzsw</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RLS:</span>
                    <strong className="text-emerald-700">Políticas CRUD Activas</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Auth:</span>
                    <strong className="text-slate-800">JWT Sessions</strong>
                  </div>
                </div>
              </div>

              {/* Service 2: Google Drive API */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-cyan-600" />
                    <h4 className="font-bold text-xs text-slate-900">Google Drive API v3</h4>
                  </div>
                  <span className="text-[9.5px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    🟢 Drive Sync
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-1 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cuentas:</span>
                    <strong className="text-slate-800">{driveAccounts.length} Bóvedas</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Alcance:</span>
                    <strong className="text-cyan-700">drive.file + metadata</strong>
                  </div>
                </div>
              </div>

              {/* Service 3: Gemini AI */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-600" />
                    <h4 className="font-bold text-xs text-slate-900">Google Gemini AI Engine</h4>
                  </div>
                  <span className="text-[9.5px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    Flash 2.5 Activo
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-1 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Modelo:</span>
                    <strong className="text-purple-900">Gemini 2.5 Flash / Pro</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ventana:</span>
                    <strong className="text-slate-800">1M Tokens Multimodal</strong>
                  </div>
                </div>
              </div>

              {/* Service 4: Notification Webhook */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-xs text-slate-900">Webhook de Avisos</h4>
                  </div>
                  <span className="text-[9.5px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    🟢 Activo
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Avisos automáticos en tiempo real cuando un nuevo cliente se registra.
                </p>
                <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-1 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Destino:</span>
                    <strong className="text-slate-800 truncate max-w-[170px]">crial0810@gmail.com</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Evento:</span>
                    <strong className="text-indigo-700">NUEVO_CLIENTE_REGISTRADO</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ALMACENAMIENTO DRIVE MULTI-CUENTA */}
          {activeTab === 'storage' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-cyan-600" />
                  <span>Bóvedas Google Drive ({driveAccounts.length})</span>
                </h3>
                <span className="text-emerald-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                  Multi-Cuenta
                </span>
              </div>

              <div className="space-y-2.5">
                {driveAccounts.map((acc) => {
                  const usedPct = Math.round((acc.quotaUsedGB / acc.quotaTotalGB) * 100);
                  return (
                    <div
                      key={acc.id}
                      className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{acc.name}</h4>
                          <span className="text-[11px] text-slate-500 font-mono block">
                            {acc.email}
                          </span>
                        </div>
                        <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                          {acc.type === 'corporate_workspace' ? 'Shared Drive' : 'Personal'}
                        </span>
                      </div>

                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[10.5px] font-mono text-slate-600">
                          <span>{acc.quotaUsedGB} GB / {acc.quotaTotalGB} GB</span>
                          <span className="font-bold text-slate-900">{usedPct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                            style={{ width: `${usedPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-100 font-mono">
                        <span>Sync: {acc.lastSyncedAt}</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Listo</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: AUDITORÍA & LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Registro de Auditoría ({auditLogs.length})</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-500">En Vivo</span>
              </div>

              <div className="space-y-2 max-h-[65vh] overflow-y-auto custom-scrollbar">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-[11.5px]">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {log.timestamp.split(' ')[1] || log.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-mono text-[10.5px]">
                        {log.entityType}: <strong>{log.entityId}</strong>
                      </span>
                      <span>Por: <strong>{log.userName || log.userId}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

        {/* ========================================================
            MODAL / DRAWER: EDIT USER RBAC
            ======================================================== */}
        {editingUserId && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-2 animate-in fade-in">
            <div className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-4 border border-slate-200 shadow-2xl animate-in slide-in-from-bottom-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <h3 className="font-extrabold text-xs text-slate-900">Editar Permisos RBAC</h3>
                </div>
                <button
                  onClick={() => setEditingUserId(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Role Select */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Rol del Usuario</label>
                <select
                  value={editingRole}
                  onChange={(e) => setEditingRole(e.target.value as UserRole)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 outline-hidden"
                >
                  <option value="webadmin">👑 WebAdmin Global</option>
                  <option value="director">🎬 Director Creativo</option>
                  <option value="colaborador">✂️ Colaborador Técnico</option>
                  <option value="cliente">🏢 Cliente de Marca</option>
                </select>
              </div>

              {/* Brand Assignment (If Client or Staff) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Marcas Autorizadas ({editingBrands.length})
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                  {brands.map((b) => {
                    const isChecked = editingBrands.includes(b.id);
                    return (
                      <button
                        type="button"
                        key={b.id}
                        onClick={() => handleToggleBrand(b.id)}
                        className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate block">{b.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUserId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveRBAC}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            BOTTOM NAVIGATION BAR (4 TABS EXCLUSIVE FOR WEBADMIN)
            ======================================================== */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 max-w-md mx-auto shadow-lg">
          <div className="grid grid-cols-4 items-center py-2 px-2">
            
            {/* Tab 1: Users */}
            <button
              onClick={() => setActiveTab('users')}
              className={`flex flex-col items-center gap-0.5 py-1 transition-colors cursor-pointer ${
                activeTab === 'users' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px]">Usuarios</span>
            </button>

            {/* Tab 2: APIs */}
            <button
              onClick={() => setActiveTab('apis')}
              className={`flex flex-col items-center gap-0.5 py-1 transition-colors cursor-pointer ${
                activeTab === 'apis' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <KeyRound className="w-5 h-5" />
              <span className="text-[10px]">APIs</span>
            </button>

            {/* Tab 3: Storage */}
            <button
              onClick={() => setActiveTab('storage')}
              className={`flex flex-col items-center gap-0.5 py-1 transition-colors cursor-pointer ${
                activeTab === 'storage' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <HardDrive className="w-5 h-5" />
              <span className="text-[10px]">Drive Vault</span>
            </button>

            {/* Tab 4: Logs */}
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex flex-col items-center gap-0.5 py-1 transition-colors cursor-pointer ${
                activeTab === 'logs' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-[10px]">Auditoría</span>
            </button>

          </div>
        </nav>

      </div>
    </div>
  );
};
