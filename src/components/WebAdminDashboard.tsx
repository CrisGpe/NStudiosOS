import React, { useState, useEffect } from 'react';
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
  UserPlus,
  Plus,
  Edit3,
  X,
  Send,
  Check,
  Bell,
  Sparkles,
  PenLine,
  ExternalLink,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { UserRole, DriveAccount } from '../types';
import { supabaseService, brandService } from '../services/supabaseService';
import { notificationService, WebhookConfig } from '../services/notificationService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { InlineDeleteConfirm } from './ui/InlineDeleteConfirm';

export const WebAdminDashboard: React.FC = () => {
  const {
    users,
    brands,
    organizations,
    syncBrandContacts,
    refreshProfiles,
    refreshOrganizationsFromSupabase,
    auditLogs,
    addAuditLog,
    refreshAuditLogs,
    currentUser,
    driveAccounts,
    createDriveAccount,
    updateDriveAccount,
    deleteDriveAccount,
    toast,
  } = useApp();

  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [updatingUserRole, setUpdatingUserRole] = useState<Record<string, UserRole>>({});
  const [updatingUserBrands, setUpdatingUserBrands] = useState<Record<string, string[]>>({});
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);
  const [isSyncingContacts, setIsSyncingContacts] = useState(false);

  // Filter for audit logs
  const [selectedAuditFilter, setSelectedAuditFilter] = useState<string>('all');

  // ==========================================
  // MODAL 1: CREATE NEW USER (TEAM / CLIENT)
  // ==========================================
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Nataraja2026!');
  const [newUserRole, setNewUserRole] = useState<UserRole>('colaborador');
  const [newUserRoleTitle, setNewUserRoleTitle] = useState('Gestor de Comunidad (Community Manager)');
  const [newUserSpecialty, setNewUserSpecialty] = useState('Gestor de Comunidad (Community Manager)');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [newUserOrgId, setNewUserOrgId] = useState('');
  const [newUserBrandIds, setNewUserBrandIds] = useState<string[]>([]);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const PREDEFINED_SPECIALTIES = [
    'Director Creativo',
    'Gestor de Comunidad (Community Manager)',
    'Gestor de Redes Sociales (Social Media Manager)',
    'Especialista en SEM (Paid Media)',
    'Especialista en SEO',
    'Copywriter & Estratega de Contenido',
    'Content Creator & Filmmaker',
    'Editor de Video & Post-Producción',
    'Diseñador UI/UX & Gráfico',
    'Fotógrafo / Motion Designer',
    'custom',
  ];

  // ==========================================
  // MODAL 2: CONNECT GOOGLE DRIVE ACCOUNT
  // ==========================================
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [editingDriveAccount, setEditingDriveAccount] = useState<DriveAccount | null>(null);
  const [driveName, setDriveName] = useState('Bóveda Corporativa CineFlow');
  const [driveEmail, setDriveEmail] = useState('drive@cineflow.studio');
  const [driveType, setDriveType] = useState<'corporate_workspace' | 'personal_vault'>('corporate_workspace');
  const [driveQuotaGB, setDriveQuotaGB] = useState(2000);
  const [driveRootFolder, setDriveRootFolder] = useState('root_cineflow_av');
  const [isSavingDrive, setIsSavingDrive] = useState(false);

  // ==========================================
  // MODAL 3: CONFIGURE GEMINI AI API KEY
  // ==========================================
  const [showGeminiModal, setShowGeminiModal] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [isSavingGemini, setIsSavingGemini] = useState(false);
  const [showKeyVisible, setShowKeyVisible] = useState(false);

  // ==========================================
  // MODAL 4: SUPABASE CREDENTIALS VIEWER
  // ==========================================
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  // ==========================================
  // WEBHOOK STATE
  // ==========================================
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEnabled, setWebhookEnabled] = useState(true);
  const [notifyOnSignup, setNotifyOnSignup] = useState(true);
  const [adminEmail, setAdminEmail] = useState('crial0810@gmail.com');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);

  useEffect(() => {
    notificationService.getWebhookConfig().then((cfg) => {
      setWebhookUrl(cfg.url);
      setWebhookEnabled(cfg.enabled);
      setNotifyOnSignup(cfg.notifyOnClientSignup);
      setAdminEmail(cfg.adminEmail);
    });

    // Load Gemini config from system_settings or localStorage
    if (isSupabaseConfigured) {
      supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'gemini_config')
        .maybeSingle()
        .then(({ data }) => {
          if (data?.value) {
            setGeminiApiKey(data.value.api_key || '');
            setGeminiModel(data.value.model || 'gemini-2.5-flash');
          }
        });
    }
  }, []);

  const showToast = (msg: string) => {
    setSaveSuccessToast(msg);
    setTimeout(() => setSaveSuccessToast(null), 3500);
  };

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

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    if (selectedAuditFilter === 'all') return true;
    return log.action.toLowerCase().includes(selectedAuditFilter.toLowerCase());
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
        assignedBrandIds: newBrandIds,
      });

      addAuditLog(
        'PERMISOS_USUARIO_ACTUALIZADOS',
        `Permisos de ${users.find((u) => u.id === userId)?.name || userId} cambiados a ${newRole}`,
        currentUser.id,
        'system',
        userId,
        currentUser.name,
        currentUser.role
      );

      toast.success('Permisos RBAC y marcas actualizados exitosamente en Supabase.');
      setEditingUserId(null);
    } catch (err: any) {
      console.error('Error al actualizar permisos:', err);
      toast.error('Error al guardar en Supabase: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsSavingUser(false);
    }
  };

  // CREATE USER (DIRECTOR, EQUIPO, CLIENTE)
  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) {
      toast.warning('Por favor completa los campos requeridos.');
      return;
    }

    setIsCreatingUser(true);
    try {
      const finalSpecialty =
        newUserRole === 'colaborador'
          ? newUserSpecialty === 'custom'
            ? customSpecialty.trim() || 'Especialista'
            : newUserSpecialty
          : undefined;

      const finalRoleTitle =
        newUserRoleTitle.trim() ||
        (newUserRole === 'director'
          ? 'Director de Departamento / Productor Ejecutivo'
          : newUserRole === 'cliente'
          ? 'Líder de Marca / Contacto de Cliente'
          : finalSpecialty || 'Equipo de Agencia');

      if (isSupabaseConfigured) {
        await supabaseService.signUp(
          newUserEmail,
          newUserPassword,
          newUserName,
          newUserRole,
          finalRoleTitle,
          finalSpecialty,
          newUserOrgId || undefined,
          newUserBrandIds
        );
      }

      await refreshProfiles();
      if (newUserRole === 'cliente') {
        await refreshOrganizationsFromSupabase();
      }

      addAuditLog(
        'USUARIO_CREADO_POR_ADMIN',
        `WebAdmin creó al usuario ${newUserName} con rol ${newUserRole}${finalSpecialty ? ` (Especialidad: ${finalSpecialty})` : ''}`,
        currentUser.id,
        'system',
        newUserEmail,
        currentUser.name,
        currentUser.role
      );

      const roleDisplay =
        newUserRole === 'director'
          ? 'Director de Departamento'
          : newUserRole === 'colaborador'
          ? `Equipo (${finalSpecialty})`
          : 'Cliente';

      toast.success(`Usuario ${newUserName} (${roleDisplay}) registrado exitosamente.`);
      setShowCreateUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setCustomSpecialty('');
      setNewUserBrandIds([]);
    } catch (err: any) {
      console.error('Error al crear usuario:', err);
      toast.error('Error al registrar usuario: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsCreatingUser(false);
    }
  };

  // SYNC CLIENT ACCESS FROM BRANDS
  const handleSyncBrandContacts = async () => {
    setIsSyncingContacts(true);
    try {
      const res = await syncBrandContacts();
      await refreshProfiles();
      await refreshOrganizationsFromSupabase();
      addAuditLog(
        'ACCESOS_CLIENTES_SINCRONIZADOS',
        `Sincronización masiva de clientes completada (${res.syncedCount} clientes / ${res.orgsCreated} holdings creados)`,
        currentUser.id,
        'system',
        'auth_sync',
        currentUser.name,
        currentUser.role
      );
      toast.success(`¡Sincronización exitosa! ${res.syncedCount} clientes aprovisionados con contraseña Nataraja2026!`);
    } catch (err: any) {
      toast.error('Error al sincronizar clientes: ' + err.message);
    } finally {
      setIsSyncingContacts(false);
    }
  };

  // CONNECT DRIVE ACCOUNT
  
  const extractDriveFolderId = (input: string): string => {
    if (!input) return 'root';
    const trimmed = input.trim();
    if (trimmed.includes('drive.google.com/drive/folders/')) {
      const match = trimmed.match(/folders\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : trimmed;
    }
    if (trimmed.includes('id=')) {
      const match = trimmed.match(/id=([a-zA-Z0-9_-]+)/);
      return match ? match[1] : trimmed;
    }
    return trimmed;
  };

  const handleStartEditDrive = (acc: DriveAccount) => {
    setEditingDriveAccount(acc);
    setDriveName(acc.name);
    setDriveEmail(acc.email);
    setDriveType(acc.type);
    setDriveQuotaGB(acc.quotaTotalGB || 200);
    setDriveRootFolder(acc.rootFolderId || 'root');
    setShowDriveModal(true);
  };

  const handleSaveDriveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDrive(true);
    const parsedRootId = extractDriveFolderId(driveRootFolder);

    try {
      if (editingDriveAccount) {
        updateDriveAccount(editingDriveAccount.id, {
          name: driveName,
          email: driveEmail,
          type: driveType,
          quotaTotalGB: Number(driveQuotaGB) || 200,
          rootFolderId: parsedRootId,
        });
        toast.success(`Bóveda "${driveName}" actualizada correctamente.`);
      } else {
        await createDriveAccount({
          name: driveName,
          email: driveEmail,
          type: driveType,
          quotaTotalGB: Number(driveQuotaGB) || 200,
          quotaUsedGB: 0,
          rootFolderId: parsedRootId,
          isConnected: true,
          status: 'active',
        });
        toast.success(`Bóveda "${driveName}" conectada exitosamente.`);
      }
      setShowDriveModal(false);
      setEditingDriveAccount(null);
      setDriveName('');
      setDriveEmail('');
      setDriveRootFolder('root');
    } catch {
      toast.error('Error al guardar la bóveda en Supabase.');
    } finally {
      setIsSavingDrive(false);
    }
  };

  // DELETE DRIVE ACCOUNT
  const handleDeleteDriveAccount = async (id: string, name: string) => {
    try {
      await deleteDriveAccount(id);
      addAuditLog(
        'BOVEDA_DRIVE_ELIMINADA',
        `Bóveda "${name}" desconectada y eliminada del sistema`,
        currentUser.id,
        'drive',
        id,
        currentUser.name,
        currentUser.role
      );
      toast.success(`Bóveda "${name}" eliminada exitosamente.`);
    } catch (err: any) {
      toast.error('Error al eliminar bóveda: ' + err.message);
    }
  };

  // SAVE GEMINI API KEY
  const handleSaveGeminiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGemini(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.from('system_settings').upsert({
          key: 'gemini_config',
          value: {
            api_key: geminiApiKey,
            model: geminiModel,
            configured_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
          updated_by: currentUser.name,
        });
      }

      localStorage.setItem('nataraja_gemini_api_key', geminiApiKey);
      localStorage.setItem('nataraja_gemini_model', geminiModel);

      addAuditLog(
        'GEMINI_API_CONFIGURADA',
        `Modelo actualizado a ${geminiModel}`,
        currentUser.id,
        'system',
        'gemini_engine',
        currentUser.name,
        currentUser.role
      );

      toast.success('Configuración de Google Gemini AI Engine guardada exitosamente.');
      setShowGeminiModal(false);
    } catch (err: any) {
      toast.error('Error al guardar configuración de Gemini: ' + err.message);
    } finally {
      setIsSavingGemini(false);
    }
  };

  // SAVE WEBHOOK
  const handleSaveWebhook = async () => {
    setIsSavingWebhook(true);
    const res = await notificationService.saveWebhookConfig({
      url: webhookUrl,
      enabled: webhookEnabled,
      notifyOnClientSignup: notifyOnSignup,
      notifyOnT3Approval: true,
      adminEmail: adminEmail,
    });
    setIsSavingWebhook(false);
    if (res.success) {
      toast.success('Configuración de Webhook guardada exitosamente en Supabase.');
    } else {
      toast.error(res.message);
    }
  };

  // TEST WEBHOOK
  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    const res = await notificationService.testWebhook(webhookUrl);
    setIsTestingWebhook(false);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  // MANUAL REFRESH OF AUDIT LOGS
  const handleManualRefreshLogs = async () => {
    setIsRefreshingLogs(true);
    await refreshAuditLogs();
    setTimeout(() => {
      setIsRefreshingLogs(false);
      showToast('Logs de auditoría sincronizados con Supabase.');
    }, 600);
  };

  return (
    <div className="space-y-4 text-slate-800 pb-10">
      
      {/* ========================================================
          HEADER - WEBADMIN CONTROL
          ======================================================== */}
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
              Gestión de roles y permisos de usuarios, conexión de API Keys, auditoría de eventos en tiempo real e infraestructura en la nube.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSupabaseModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Supabase Conectado</span>
            <ExternalLink className="w-3 h-3 text-emerald-600 ml-0.5" />
          </button>
        </div>
      </div>

      {saveSuccessToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessToast}</span>
        </div>
      )}

      {/* ========================================================
          SECTION 1: GESTIÓN DE USUARIOS Y ROLES (RBAC)
          ======================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Gestión Global de Usuarios & Asignación de Roles RBAC</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Crea miembros del equipo (Directores, Colaboradores) o administra permisos y marcas de clientes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sync Clients from Brands Button */}
            <button
              onClick={handleSyncBrandContacts}
              disabled={isSyncingContacts}
              className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 border border-purple-200 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Genera automáticamente cuentas de cliente en Auth y sus Holdings para los contactos de las marcas registradas"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingContacts ? 'animate-spin' : ''}`} />
              <span>{isSyncingContacts ? 'Sincronizando...' : 'Sincronizar Clientes desde Marcas'}</span>
            </button>

            {/* Create User Button */}
            <button
              onClick={() => setShowCreateUserModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Nuevo Usuario / Invitar Equipo</span>
            </button>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                placeholder="Buscar usuario..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Role Filter */}
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Todos los Roles ({users.length})</option>
              <option value="webadmin">WebAdmin</option>
              <option value="director">Directores</option>
              <option value="colaborador">Colaboradores</option>
              <option value="cliente">Clientes</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <th className="py-2.5 px-3">Usuario</th>
                <th className="py-2.5 px-3">Rol RBAC</th>
                <th className="py-2.5 px-3">Marcas Asignadas</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                    No se encontraron usuarios con ese criterio.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isEditing = editingUserId === u.id;
                  const currentRole = isEditing ? updatingUserRole[u.id] || u.role : u.role;
                  const currentAssigned = isEditing
                    ? updatingUserBrands[u.id] || u.assignedBrandIds || []
                    : u.assignedBrandIds || [];

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">
                              {u.name}
                            </span>
                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                              <span className="text-slate-400 font-mono text-[10.5px]">
                                {u.email}
                              </span>
                              {u.specialty && (
                                <span className="px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 text-[9.5px] font-bold border border-indigo-200">
                                  {u.specialty}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {isEditing ? (
                          <select
                            value={currentRole}
                            onChange={(e) =>
                              setUpdatingUserRole((prev) => ({
                                ...prev,
                                [u.id]: e.target.value as UserRole,
                              }))
                            }
                            className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                          >
                            <option value="webadmin">👑 WebAdmin Global</option>
                            <option value="director">🎬 Director de Departamento</option>
                            <option value="colaborador">👥 Equipo</option>
                            <option value="cliente">🏢 Cliente</option>
                          </select>
                        ) : (
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
                            {u.role === 'colaborador' ? 'EQUIPO' : u.role}
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

      {/* ========================================================
          SECTION 2: CONEXIÓN DE API KEYS & INTEGRACIONES (EDITABLE)
          ======================================================== */}
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
          
          {/* Card 1: Supabase */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 flex flex-col justify-between">
            <div className="space-y-2">
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
                Base de datos relacional con RLS, autenticación JWT y persistencia en tiempo real.
              </p>
              <div className="text-[10px] font-mono text-slate-600 bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                <div>Ref: <strong className="text-slate-900">qrwqzgzchhnirrzzfzsw</strong></div>
                <div>Auth: <strong className="text-emerald-700">JWT Activo (Anon + Service)</strong></div>
              </div>
            </div>

            <button
              onClick={() => setShowSupabaseModal(true)}
              className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ver Parámetros Supabase</span>
            </button>
          </div>

          {/* Card 2: Google Drive API v3 */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-cyan-600" />
                  <h4 className="font-bold text-xs text-slate-900">Google Drive API v3</h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {driveAccounts.length > 0 ? 'Drive Sync Activo' : 'Sin Bóvedas'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Bóveda multimedia multi-cuenta, carpetas estructuradas y streaming directo.
              </p>
              <div className="text-[10px] font-mono text-slate-600 bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                <div>Cuentas registradas: <strong className="text-slate-900">{driveAccounts.length} Bóvedas</strong></div>
                <div>Permisos: <strong className="text-cyan-700">drive.file + metadata.readonly</strong></div>
              </div>
            </div>

            <button
              onClick={() => setShowDriveModal(true)}
              className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-cyan-50 hover:text-cyan-800 border border-slate-200 hover:border-cyan-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-600" />
              <span>+ Conectar Bóveda Drive</span>
            </button>
          </div>

          {/* Card 3: Gemini AI Copilot */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-600" />
                  <h4 className="font-bold text-xs text-slate-900">Google Gemini AI Engine</h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  {geminiModel.includes('2.5') ? 'Flash 2.5 Activo' : 'Activo'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Motor de co-creación estratégica, asistencia de guiones AV y sugerencia de tags.
              </p>
              <div className="text-[10px] font-mono text-slate-600 bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                <div>Modelo: <strong className="text-purple-900">{geminiModel}</strong></div>
                <div>API Key: <strong className="text-slate-700">{geminiApiKey ? '••••••••' + geminiApiKey.slice(-4) : 'Configurada'}</strong></div>
              </div>
            </div>

            <button
              onClick={() => setShowGeminiModal(true)}
              className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-purple-50 hover:text-purple-800 border border-slate-200 hover:border-purple-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Configurar Gemini API Key</span>
            </button>
          </div>

        </div>

        {/* Webhook Dispatcher Card */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">
                  Webhook de Notificaciones Automáticas (Nuevo Cliente Registrado)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Despacha automáticamente una alerta en tiempo real a tu Google Apps Script, Discord, Slack o Zapier cuando un cliente crea su cuenta en Supabase.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={webhookEnabled}
                  onChange={(e) => setWebhookEnabled(e.target.checked)}
                  className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Webhook Activo en Supabase</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center pt-1">
            <div className="md:col-span-8">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec o https://discord.com/api/webhooks/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden shadow-2xs font-mono"
              />
            </div>
            <div className="md:col-span-4 flex items-center gap-2">
              <button
                type="button"
                disabled={isSavingWebhook}
                onClick={handleSaveWebhook}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSavingWebhook ? 'Guardando...' : 'Guardar URL'}</span>
              </button>

              <button
                type="button"
                disabled={isTestingWebhook || !webhookUrl.trim()}
                onClick={handleTestWebhook}
                className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                title="Enviar mensaje de prueba"
              >
                <Send className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isTestingWebhook ? 'Probando...' : 'Probar'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 3: INFRAESTRUCTURA DE ALMACENAMIENTO MULTI-CUENTA
          ======================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-cyan-600" />
            <span>Infraestructura de Almacenamiento: Google Drive Multi-Cuenta</span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-emerald-800 font-mono text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              {driveAccounts.length} Cuentas Conectadas
            </span>
            <button
              onClick={() => setShowDriveModal(true)}
              className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 border border-indigo-200 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Conectar Bóveda</span>
            </button>
          </div>
        </div>

        {driveAccounts.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
            <HardDrive className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">
              Aún no tienes cuentas de Google Drive vinculadas en Supabase.
            </p>
            <button
              onClick={() => setShowDriveModal(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Conectar Primera Bóveda de Drive</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {driveAccounts.map((account) => (
              <div
                key={account.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs relative hover:z-20"
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEditDrive(account)}
                      className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="Editar Bóveda y Carpeta Raíz"
                    >
                      <PenLine className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={account.rootFolderId && account.rootFolderId !== 'root' ? `https://drive.google.com/drive/folders/${account.rootFolderId}` : 'https://drive.google.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                      title="Abrir en Google Drive"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sincronizado</span>
                    </span>
                    <InlineDeleteConfirm
                      title="¿Desconectar Bóveda?"
                      description={account.name}
                      onConfirm={() => handleDeleteDriveAccount(account.id, account.name)}
                      triggerClassName="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      triggerIcon={<Trash2 className="w-3.5 h-3.5" />}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          SECTION 4: REGISTRO DE AUDITORÍA & TRAZABILIDAD (SUPABASE)
          ======================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Registro de Auditoría & Trazabilidad de Eventos del Sistema (Supabase)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Trazabilidad inmutable de cambios de estado, aprobaciones de clientes, creación de cuentas y firmas técnicas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefreshLogs}
              disabled={isRefreshingLogs}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingLogs ? 'animate-spin' : ''}`} />
              <span>Actualizar Logs</span>
            </button>
            <span className="text-slate-500 font-mono text-xs bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
              {filteredAuditLogs.length} eventos
            </span>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
          {[
            { id: 'all', label: 'Todos los Eventos' },
            { id: 'cliente', label: 'Registros de Clientes' },
            { id: 'usuario', label: 'Creación de Usuarios' },
            { id: 'permisos', label: 'Cambios de Rol' },
            { id: 't3', label: 'Ventana T-3' },
            { id: 'guia', label: 'Guías Técnicas' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setSelectedAuditFilter(chip.id)}
              className={`px-3 py-1 rounded-xl border transition-all shrink-0 cursor-pointer ${
                selectedAuditFilter === chip.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Audit Log Stream */}
        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
          {filteredAuditLogs.length === 0 ? (
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
              No hay registros de auditoría para este filtro.
            </div>
          ) : (
            filteredAuditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs hover:border-slate-300 transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-slate-500 ml-2 font-mono text-[10.5px]">
                      {log.entityType}: <strong>{log.entityId}</strong>
                    </span>
                    {log.details && log.details !== '{}' && (
                      <span className="text-slate-600 text-[11px] block mt-0.5">
                        {log.details}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-500 text-[10.5px] shrink-0 self-end sm:self-center">
                  <span>
                    Por: <strong className="text-slate-800">{log.userName || log.userId}</strong>
                  </span>
                  <span className="font-mono text-slate-400">{log.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========================================================
          MODAL: CREAR NUEVO USUARIO (DIRECTOR, EQUIPO, CLIENTE)
          ======================================================== */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                  <UserPlus className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Invitar / Crear Usuario en Nataraja OS
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Crea credenciales para Directores de Departamento, Equipo o Clientes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateUserModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Ej. Carlos Martínez"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="carlos@nstudios.com"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contraseña Inicial *</label>
                <input
                  type="text"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Base Role Selector (3 Base Roles) */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Rol Base de Permisos *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewUserRole('director');
                      setNewUserRoleTitle('Director de Departamento / Productor Ejecutivo');
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      newUserRole === 'director'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-sm mb-0.5">🎬</span>
                    <span className="font-bold text-xs block">Director</span>
                    <span className="text-[10px] text-slate-500 block font-normal leading-tight">Dirección de depto.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewUserRole('colaborador');
                      setNewUserRoleTitle(newUserSpecialty === 'custom' ? customSpecialty || 'Especialista' : newUserSpecialty);
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      newUserRole === 'colaborador'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-sm mb-0.5">👥</span>
                    <span className="font-bold text-xs block">Equipo</span>
                    <span className="text-[10px] text-slate-500 block font-normal leading-tight">Operativo / Creativo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewUserRole('cliente');
                      setNewUserRoleTitle('Líder de Marca / Contacto de Cliente');
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      newUserRole === 'cliente'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-sm mb-0.5">🏢</span>
                    <span className="font-bold text-xs block">Cliente</span>
                    <span className="text-[10px] text-slate-500 block font-normal leading-tight">Holding / Marcas</span>
                  </button>
                </div>
              </div>

              {/* Conditional Section for EQUIPO: Specialty Tag */}
              {newUserRole === 'colaborador' && (
                <div className="p-3 bg-indigo-50/50 border border-indigo-200/70 rounded-2xl space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-indigo-950 flex items-center gap-1.5">
                      <span>🏷️ Especialidad del Miembro del Equipo</span>
                    </label>
                    <span className="text-[10px] text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full font-semibold">
                      Etiqueta Informativa
                    </span>
                  </div>

                  <select
                    value={newUserSpecialty}
                    onChange={(e) => {
                      const sp = e.target.value;
                      setNewUserSpecialty(sp);
                      if (sp !== 'custom') {
                        setNewUserRoleTitle(sp);
                      } else {
                        setNewUserRoleTitle(customSpecialty || 'Especialista');
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-slate-800 font-semibold focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Director Creativo">🎬 Director Creativo</option>
                    <option value="Gestor de Comunidad (Community Manager)">📱 Gestor de Comunidad (Community Manager)</option>
                    <option value="Gestor de Redes Sociales (Social Media Manager)">🌐 Gestor de Redes Sociales (Social Media Manager)</option>
                    <option value="Especialista en SEM (Paid Media)">📈 Especialista en SEM (Paid Media)</option>
                    <option value="Especialista en SEO">🔍 Especialista en SEO</option>
                    <option value="Copywriter & Estratega de Contenido">✍️ Copywriter & Estratega de Contenido</option>
                    <option value="Content Creator & Filmmaker">🎥 Content Creator & Filmmaker</option>
                    <option value="Editor de Video & Post-Producción">✂️ Editor de Video & Post-Producción</option>
                    <option value="Diseñador UI/UX & Gráfico">🎨 Diseñador UI/UX & Gráfico</option>
                    <option value="Fotógrafo / Motion Designer">📸 Fotógrafo / Motion Designer</option>
                    <option value="custom">✨ + Otra especialidad personalizada...</option>
                  </select>

                  {newUserSpecialty === 'custom' && (
                    <div className="pt-1 animate-in fade-in">
                      <label className="block font-semibold text-slate-700 mb-1">Nombre de la Especialidad Personalizada</label>
                      <input
                        type="text"
                        value={customSpecialty}
                        onChange={(e) => {
                          setCustomSpecialty(e.target.value);
                          setNewUserRoleTitle(e.target.value);
                        }}
                        placeholder="Ej. Storyboarder & Conceptual Artist"
                        className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-slate-900 focus:outline-hidden focus:border-indigo-500"
                        required
                      />
                    </div>
                  )}

                  <p className="text-[10.5px] text-indigo-900 leading-tight">
                    💡 <strong>Nota del Director:</strong> La especialidad es una etiqueta informativa visible en perfiles, asignaciones y tarjetas Kanban; los permisos operativos se rigen por el rol base de Equipo.
                  </p>
                </div>
              )}

              {/* Conditional Section for CLIENTE: Organization & Brands */}
              {newUserRole === 'cliente' && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-2.5 animate-in fade-in">
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">Organización / Holding del Cliente</label>
                    <select
                      value={newUserOrgId}
                      onChange={(e) => setNewUserOrgId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white text-slate-800 font-semibold focus:outline-hidden focus:border-emerald-600 cursor-pointer"
                    >
                      <option value="">Seleccionar Holding / Empresa...</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">Marcas con Acceso Asignado</label>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-white rounded-xl border border-emerald-200/80">
                      {brands.map((b) => {
                        const isSelected = newUserBrandIds.includes(b.id);
                        return (
                          <button
                            type="button"
                            key={b.id}
                            onClick={() => {
                              if (isSelected) {
                                setNewUserBrandIds(newUserBrandIds.filter((id) => id !== b.id));
                              } else {
                                setNewUserBrandIds([...newUserBrandIds, b.id]);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {b.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Title / Cargo Customization */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cargo / Título Profesional</label>
                <input
                  type="text"
                  value={newUserRoleTitle}
                  onChange={(e) => setNewUserRoleTitle(e.target.value)}
                  placeholder="Ej. Director Creativo & Lead Strategist"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer transition-all active:scale-98"
                >
                  {isCreatingUser ? 'Registrando Usuario...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONECTAR BÓVEDA DE GOOGLE DRIVE
          ======================================================== */}
      {showDriveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Conectar Bóveda de Google Drive
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Vincula un Shared Drive corporativo o cuenta de almacenamiento.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDriveModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDriveAccount} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre de la Bóveda *</label>
                <input
                  type="text"
                  value={driveName}
                  onChange={(e) => setDriveName(e.target.value)}
                  placeholder="Ej. Shared Drive Agencia CineFlow"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Correo de la Cuenta *</label>
                <input
                  type="email"
                  value={driveEmail}
                  onChange={(e) => setDriveEmail(e.target.value)}
                  placeholder="drive@cineflow.studio"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Cuenta</label>
                  <select
                    value={driveType}
                    onChange={(e) => setDriveType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    <option value="corporate_workspace">Shared Drive Agencia</option>
                    <option value="personal_vault">Personal / Bóveda</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cuota Total (GB)</label>
                  <input
                    type="number"
                    value={driveQuotaGB}
                    onChange={(e) => setDriveQuotaGB(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ID de Carpeta Raíz (Root Folder ID)</label>
                <input
                  type="text"
                  value={driveRootFolder}
                  onChange={(e) => setDriveRootFolder(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDriveModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingDrive}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isSavingDrive ? 'Guardando...' : (editingDriveAccount ? 'Guardar Cambios' : 'Conectar Bóveda')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONFIGURAR GEMINI AI API KEY & MODELO
          ======================================================== */}
      {showGeminiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Configuración de Google Gemini AI
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Establece tu API Key de Google AI Studio y el modelo preferido.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGeminiModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGeminiConfig} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Google Gemini API Key (AI Studio)
                </label>
                <div className="relative">
                  <input
                    type={showKeyVisible ? 'text' : 'password'}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full pr-10 pl-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyVisible(!showKeyVisible)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Modelo de Inteligencia Artificial</label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra Rápido & Multimodal)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Razonamiento Complejo & Guiones AV)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Ventana Extendida)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGeminiModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingGemini}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isSavingGemini ? 'Guardando en Supabase...' : 'Guardar Configuración'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: PARÁMETROS SUPABASE VIEWER
          ======================================================== */}
      {showSupabaseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 border border-slate-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Parámetros de Conexión Supabase
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Estado de la base de datos PostgreSQL y políticas RLS.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSupabaseModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">URL del Proyecto</span>
                <span className="text-slate-900 font-semibold select-all">https://qrwqzgzchhnirrzzfzsw.supabase.co</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Project Ref</span>
                <span className="text-slate-900 font-semibold select-all">qrwqzgzchhnirrzzfzsw</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Estado de Seguridad RLS</span>
                <span className="text-emerald-700 font-bold block">● Políticas CRUD Activas en todas las tablas</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSupabaseModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
