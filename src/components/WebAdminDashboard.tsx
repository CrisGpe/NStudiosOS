import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Users,
  Building2,
  Activity,
  HardDrive,
  CheckCircle2,
  KeyRound,
  Database,
  Cpu,
  RefreshCw,
  Search,
  Lock,
  Radio,
  Sliders,
} from 'lucide-react';
import { UserRole } from '../types';
import { supabaseService } from '../services/supabaseService';

export const WebAdminDashboard: React.FC = () => {
  const {
    users,
    brands,
    auditLogs,
    currentUser,
    driveAccounts,
  } = useApp();

  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [updatingUserRole, setUpdatingUserRole] = useState<Record<string, UserRole>>({});
  const [updatingUserBrands, setUpdatingUserBrands] = useState<Record<string, string[]>>({});
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);

  // Filtered users list
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

  const handleStartEditUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;
    setEditingUserId(userId);
    setUpdatingUserRole((prev) => ({ ...prev, [userId]: targetUser.role }));
    setUpdatingUserBrands((prev) => ({ ...prev, [userId]: targetUser.assignedBrandIds || [] }));
  };

  const handleToggleUserBrand = (userId: string, brandId: string) => {
    setUpdatingUserBrands((prev) => {
      const current = prev[userId] || [];
      const updated = current.includes(brandId)
        ? current.filter((id) => id !== brandId)
        : [...current, brandId];
      return { ...prev, [userId]: updated };
    });
  };

  const handleSaveUserRBAC = async (userId: string) => {
    setIsSavingUser(true);
    const newRole = updatingUserRole[userId];
    const newBrandIds = updatingUserBrands[userId] || [];

    try {
      await supabaseService.updateUserProfile(userId, {
        role: newRole,
        assigned_brand_ids: newBrandIds,
      });

      setSaveSuccessToast('Permisos RBAC y marcas del usuario actualizados exitosamente en Supabase.');
      setEditingUserId(null);
      setTimeout(() => setSaveSuccessToast(null), 3500);
    } catch (err: any) {
      console.error('Error al actualizar permisos de usuario:', err);
      alert('Error al guardar en Supabase: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsSavingUser(false);
    }
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
                Panel de Gobernanza del Sistema & WebAdmin Global
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Control Global RBAC
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestión de roles y permisos de usuarios, conexión de API Keys, auditoría de eventos e infraestructura de almacenamiento.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Supabase Database & Auth Conectado</span>
          </span>
        </div>
      </div>

      {saveSuccessToast && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessToast}</span>
        </div>
      )}

      {/* SECTION 1: GESTIÓN DE USUARIOS Y ROLES (RBAC) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Gestión Global de Usuarios & Asignación de Roles RBAC</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Administra privilegios de acceso al sistema y vinculación de marcas para clientes y directores.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                placeholder="Buscar usuario..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>

            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none"
            >
              <option value="all">Todos los Roles ({users.length})</option>
              <option value="webadmin">👑 WebAdmins</option>
              <option value="director">🎬 Directores</option>
              <option value="colaborador">✂️ Colaboradores</option>
              <option value="cliente">🏢 Clientes</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Usuario</th>
                <th className="py-2.5 px-3">Rol RBAC</th>
                <th className="py-2.5 px-3">Marcas Asignadas</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No se encontraron usuarios con los filtros especificados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isEditing = editingUserId === u.id;
                  const currentAssigned = isEditing
                    ? updatingUserBrands[u.id] || []
                    : u.assignedBrandIds || [];

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">
                              {u.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono block">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {isEditing ? (
                          <select
                            value={updatingUserRole[u.id] || u.role}
                            onChange={(e) =>
                              setUpdatingUserRole((prev) => ({
                                ...prev,
                                [u.id]: e.target.value as UserRole,
                              }))
                            }
                            className="px-2 py-1 rounded-lg border border-indigo-300 bg-white text-xs font-semibold text-indigo-900 focus:outline-none"
                          >
                            <option value="webadmin">👑 WebAdmin Global</option>
                            <option value="director">🎬 Director Creativo</option>
                            <option value="colaborador">✂️ Colaborador Técnico</option>
                            <option value="cliente">🏢 Cliente de Marca</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border font-mono ${
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
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {isEditing ? (
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {brands.map((b) => {
                              const isChecked = currentAssigned.includes(b.id);
                              return (
                                <button
                                  type="button"
                                  key={b.id}
                                  onClick={() => handleToggleUserBrand(u.id, b.id)}
                                  className={`px-2 py-0.5 rounded-lg text-[10.5px] font-semibold border transition-all cursor-pointer ${
                                    isChecked
                                      ? 'bg-indigo-600 text-white border-indigo-600'
                                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                  }`}
                                >
                                  {b.name}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {u.role === 'webadmin' || u.role === 'director' ? (
                              <span className="text-[10.5px] text-slate-500 font-medium">
                                Acceso Global (Todas las marcas)
                              </span>
                            ) : currentAssigned.length === 0 ? (
                              <span className="text-[10.5px] text-slate-400 italic">
                                Sin marcas vinculadas
                              </span>
                            ) : (
                              currentAssigned.map((bid) => {
                                const brd = brands.find((b) => b.id === bid);
                                return (
                                  <span
                                    key={bid}
                                    className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10.5px] font-medium"
                                  >
                                    {brd?.name || bid}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Activo</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingUserId(null)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              disabled={isSavingUser}
                              onClick={() => handleSaveUserRBAC(u.id)}
                              className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {isSavingUser ? 'Guardando...' : 'Guardar'}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartEditUser(u.id)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition-colors cursor-pointer"
                          >
                            Editar Permisos
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: CONEXIÓN DE API KEYS & INTEGRACIONES */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>Conexión de API Keys, Integraciones & Servicios Externos</span>
          </h3>
          <span className="text-slate-500 font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200">
            Ambiente: Producción
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Service 1: Supabase */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-xs text-slate-900">Supabase PostgreSQL</h4>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Conectado
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Base de datos relacional con RLS, autenticación JWT y persistencia en la nube.
            </p>
            <div className="text-[10px] font-mono text-slate-600 bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
              <div>Ref: <strong className="text-slate-900">qrwqzgzchhnirrzzfzsw</strong></div>
              <div>Auth: <strong className="text-emerald-700">JWT Activo (Anon + Service)</strong></div>
            </div>
          </div>

          {/* Service 2: Google Drive API v3 */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-600" />
                <h4 className="font-bold text-xs text-slate-900">Google Drive API v3</h4>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Drive Sync Activo
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Bóveda multimedia multi-cuenta, carpetas estructuradas y streaming directo.
            </p>
            <div className="text-[10px] font-mono text-slate-600 bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
              <div>Cuentas vinculadas: <strong className="text-slate-900">{driveAccounts.length} Bóvedas</strong></div>
              <div>Permisos: <strong className="text-cyan-700">drive.file + metadata.readonly</strong></div>
            </div>
          </div>

          {/* Service 3: Gemini AI Copilot */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-600" />
                <h4 className="font-bold text-xs text-slate-900">Google Gemini AI Engine</h4>
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Flash 2.5 Activo
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Motor de co-creación estratégica, asistencia de guiones AV y sugerencia de tags.
            </p>
            <div className="text-[10px] font-mono text-slate-600 bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
              <div>Modelo: <strong className="text-purple-900">Gemini 2.5 Flash / Pro</strong></div>
              <div>Context Window: <strong className="text-purple-700">1M Tokens</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: INFRAESTRUCTURA DE ALMACENAMIENTO MULTI-CUENTA */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-cyan-600" />
            <span>Infraestructura de Almacenamiento: Google Drive Multi-Cuenta</span>
          </h3>
          <span className="text-emerald-800 font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
            {driveAccounts.length} Cuentas Conectadas
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
                  {account.type === 'corporate_workspace'
                    ? 'Shared Drive Agencia'
                    : 'Drive Personal / Bóveda'}
                </span>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-600">
                  <span>
                    Cuota: {account.quotaUsedGB} GB / {account.quotaTotalGB} GB
                  </span>
                  <span className="font-bold text-slate-900">
                    {Math.round((account.quotaUsedGB / account.quotaTotalGB) * 100)}%
                  </span>
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

      {/* SECTION 4: REGISTRO DE AUDITORÍA & TRAZABILIDAD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Registro de Auditoría & Trazabilidad de Eventos del Sistema</span>
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
                <span>
                  Por: <strong className="text-slate-800">{log.userName || log.userId}</strong>
                </span>
                <span className="font-mono text-slate-400">{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
