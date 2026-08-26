import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Users, UserPlus, ShieldCheck, CheckCircle2, Edit3, X, Layers } from 'lucide-react';
import { ClientBrandPermission, UserProfile } from '../../types';

export const ClientOrganizationTeamManager: React.FC = () => {
  const {
    currentUser,
    users,
    brands,
    organizations,
    inviteClientTeamMember,
    updateMemberPermissions,
    refreshProfiles,
    refreshOrganizationsFromSupabase,
    addAuditLog,
    toast,
  } = useApp();

  // Find the active organization for this client (or current user's org)
  const userOrg = organizations.find((o) => o.id === currentUser.clientOrganizationId) ||
    organizations.find((o) => currentUser.assignedBrandIds?.some((bid) => (o.brandIds || []).includes(bid))) ||
    (currentUser.role === 'webadmin' || currentUser.role === 'director' ? (organizations && organizations[0]) : undefined) || {
      id: 'org_personal',
      name: 'Mi Organización',
      contactEmail: currentUser.email,
      ownerUserId: currentUser.id,
      brandIds: currentUser.assignedBrandIds || [],
      createdAt: new Date().toISOString(),
    };

  // Brands belonging to this organization (or assigned to the client)
  const orgBrands = brands.filter((b) =>
    b.clientOrganizationId === userOrg.id ||
    (userOrg.brandIds || []).includes(b.id) ||
    (currentUser.role === 'webadmin' || currentUser.role === 'director' ? true : currentUser.assignedBrandIds?.includes(b.id))
  );

  // Members belonging to this organization (or assigned to these brands)
  const orgBrandIds = orgBrands.map((b) => b.id);
  const teamMembers = users.filter((u) =>
    u.role === 'cliente' &&
    (u.clientOrganizationId === userOrg.id ||
     u.assignedBrandIds?.some((bid) => orgBrandIds.includes(bid)) ||
     u.id === currentUser.id)
  );

  // Modal State: Invite New Member
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleTitle, setInviteRoleTitle] = useState('');
  const [invitePassword, setInvitePassword] = useState(() => 'Pass_' + Math.random().toString(36).slice(-6) + '!');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  // Matrix state for new member: { [brandId]: ClientBrandPermission }
  const [permissionsMatrix, setPermissionsMatrix] = useState<Record<string, ClientBrandPermission>>(() => {
    const init: Record<string, ClientBrandPermission> = {};
    orgBrands.forEach((b) => {
      init[b.id] = {
        canAccessSandbox: true,
        canViewProduction: true,
        canApproveT3: true,
        canAccessDrive: true,
        isBrandLead: false,
      };
    });
    return init;
  });

  // Modal State: Edit Permissions Matrix for existing member
  const [editingMember, setEditingMember] = useState<UserProfile | null>(null);
  const [editMatrix, setEditMatrix] = useState<Record<string, ClientBrandPermission>>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle permission in Invite Modal
  const handleToggleInvitePerm = (brandId: string, permKey: keyof ClientBrandPermission) => {
    setPermissionsMatrix((prev) => {
      const current = prev[brandId] || {
        canAccessSandbox: false,
        canViewProduction: false,
        canApproveT3: false,
        canAccessDrive: false,
        isBrandLead: false,
      };
      return {
        ...prev,
        [brandId]: {
          ...current,
          [permKey]: !current[permKey],
        },
      };
    });
  };

  // Toggle permission in Edit Modal
  const handleToggleEditPerm = (brandId: string, permKey: keyof ClientBrandPermission) => {
    setEditMatrix((prev) => {
      const current = prev[brandId] || {
        canAccessSandbox: false,
        canViewProduction: false,
        canApproveT3: false,
        canAccessDrive: false,
        isBrandLead: false,
      };
      return {
        ...prev,
        [brandId]: {
          ...current,
          [permKey]: !current[permKey],
        },
      };
    });
  };

  // Open Edit Modal for a member
  const handleOpenEditMember = (member: UserProfile) => {
    setEditingMember(member);
    const initial: Record<string, ClientBrandPermission> = {};
    orgBrands.forEach((b) => {
      const existing = member.clientPermissionsMatrix?.[b.id];
      const isAssigned = member.assignedBrandIds?.includes(b.id);
      initial[b.id] = existing || {
        canAccessSandbox: !!isAssigned,
        canViewProduction: !!isAssigned,
        canApproveT3: !!isAssigned,
        canAccessDrive: !!isAssigned,
        isBrandLead: false,
      };
    });
    setEditMatrix(initial);
  };

  // Submit New Member
  const handleSubmitInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) {
      toast.warning('Por favor ingresa nombre y correo electrónico.', 'Campos Requeridos');
      return;
    }

    setIsSubmittingInvite(true);
    try {
      await inviteClientTeamMember({
        orgId: userOrg.id,
        email: inviteEmail.trim(),
        name: inviteName.trim(),
        roleTitle: inviteRoleTitle.trim() || 'Miembro del Equipo de Marca',
        tempPassword: invitePassword || ('Pass_' + Math.random().toString(36).slice(-6) + '!'),
        permissionsMatrix,
      });

      addAuditLog(
        'MIEMBRO_CLIENTE_INVITADO',
        `Nuevo miembro ${inviteName} (${inviteEmail}) agregado al holding ${userOrg.name}`,
        currentUser.id,
        'system',
        userOrg.id,
        currentUser.name,
        currentUser.role
      );

      await refreshProfiles();
      toast.success(`Miembro ${inviteName} registrado exitosamente con credenciales y permisos.`);
      setShowInviteModal(false);
      setInviteName('');
      setInviteEmail('');
      setInviteRoleTitle('');
    } catch (err: any) {
      toast.error('Error al registrar miembro: ' + err.message);
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  // Save Edit Permissions
  const handleSaveEditPermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setIsSavingEdit(true);
    try {
      await updateMemberPermissions(editingMember.id, editMatrix);
      addAuditLog(
        'PERMISOS_CLIENTE_ACTUALIZADOS',
        `Permisos actualizados para el miembro ${editingMember.name}`,
        currentUser.id,
        'system',
        editingMember.id,
        currentUser.name,
        currentUser.role
      );
      await refreshProfiles();
      toast.success(`Permisos de ${editingMember.name} actualizados.`);
      setEditingMember(null);
    } catch (err: any) {
      toast.error('Error al actualizar permisos: ' + err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const isHoldingAdmin = currentUser.role === 'webadmin' || currentUser.role === 'director' || currentUser.clientRole === 'holding_admin';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-white/20 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero: Organization / Holding Masthead */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                Organización / Holding Cliente
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {orgBrands.length} Unidades de Negocio
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-400" />
              <span>{userOrg.name}</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Panel central de gobernanza y asignación de permisos por marca y macro-procesos para los miembros de tu equipo.
            </p>
          </div>

          {isHoldingAdmin && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Invitar Miembro del Equipo</span>
            </button>
          )}
        </div>

        {/* Brand Badges Bar */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Marcas del Conglomerado:</span>
          </span>
          {orgBrands.map((b) => (
            <span
              key={b.id}
              className="px-3 py-1 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-xs border border-white/10"
              style={{ backgroundColor: `${b.primaryColor}33`, borderColor: b.primaryColor }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: b.primaryColor }}
              />
              <span>{b.name}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Team Members Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-indigo-600" />
              <span>Equipo de Trabajo del Cliente ({teamMembers.length} Miembros)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Controla qué marcas ve cada colaborador y qué acciones puede realizar en cada macro-fase.
            </p>
          </div>
        </div>

        {teamMembers.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">
              No hay miembros registrados en este holding aún.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map((member) => {
              const isLeadAdmin = member.clientRole === 'holding_admin' || member.id === userOrg.ownerUserId;
              const assignedCount = member.assignedBrandIds?.length || 0;

              return (
                <div
                  key={member.id}
                  className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-2xs hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`}
                        alt={member.name}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-2xs object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>{member.name}</span>
                          {isLeadAdmin && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-100 text-purple-700 border border-purple-200">
                              👑 Admin Holding
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-mono">{member.email}</p>
                        <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">{member.roleTitle}</p>
                      </div>
                    </div>

                    {isHoldingAdmin && !isLeadAdmin && (
                      <button
                        onClick={() => handleOpenEditMember(member)}
                        className="px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-semibold border border-slate-200 shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Permisos</span>
                      </button>
                    )}
                  </div>

                  {/* Brand & Permissions Matrix Summary */}
                  <div className="pt-2 border-t border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                      <span>Marcas Asignadas:</span>
                      <span className="font-bold text-slate-900">{assignedCount} / {orgBrands.length}</span>
                    </div>

                    <div className="space-y-1.5">
                      {orgBrands.map((b) => {
                        const isAssigned = member.assignedBrandIds?.includes(b.id) || isLeadAdmin;
                        if (!isAssigned) return null;

                        const matrix = isLeadAdmin
                          ? { canAccessSandbox: true, canViewProduction: true, canApproveT3: true, canAccessDrive: true }
                          : member.clientPermissionsMatrix?.[b.id] || {
                              canAccessSandbox: true,
                              canViewProduction: true,
                              canApproveT3: true,
                              canAccessDrive: true,
                            };

                        return (
                          <div
                            key={b.id}
                            className="p-2 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-[11px]"
                          >
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: b.primaryColor }}
                              />
                              <span>{b.name}</span>
                            </span>

                            <div className="flex items-center gap-1">
                              <span
                                title="Pre-producción / Ideas"
                                className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                                  matrix.canAccessSandbox ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                💡 Ideas
                              </span>
                              <span
                                title="Producción / Rodajes"
                                className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                                  matrix.canViewProduction ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                🎬 Rodaje
                              </span>
                              <span
                                title="Post-producción / Aprobación T-3"
                                className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                                  matrix.canApproveT3 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                ⏱️ T-3
                              </span>
                              <span
                                title="Drive Vault"
                                className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                                  matrix.canAccessDrive ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                📁 Drive
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL: INVITAR / CREAR NUEVO MIEMBRO CON MATRIZ DE PERMISOS
          ======================================================== */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Invitar Nuevo Miembro al Holding {userOrg.name}
                </h3>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitInvite} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Ej. Sofía Mendoza"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="sofia@holding.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Cargo / Rol Interno</label>
                  <input
                    type="text"
                    value={inviteRoleTitle}
                    onChange={(e) => setInviteRoleTitle(e.target.value)}
                    placeholder="Ej. Coordinador de Marca / Marketing"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Contraseña Temporal</label>
                  <input
                    type="text"
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Matriz Granular de Permisos por Marca */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Matriz de Permisos por Marca y Macro-Procesos</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Marca las casillas correspondientes a las fases y marcas que este miembro podrá consultar o aprobar.
                </p>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {orgBrands.map((b) => {
                    const matrix = permissionsMatrix[b.id] || {
                      canAccessSandbox: true,
                      canViewProduction: true,
                      canApproveT3: true,
                      canAccessDrive: true,
                      isBrandLead: false,
                    };

                    return (
                      <div
                        key={b.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: b.primaryColor }}
                            />
                            <span>{b.name}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer bg-white p-2 rounded-xl border border-slate-200/80 hover:border-indigo-400">
                            <input
                              type="checkbox"
                              checked={matrix.canAccessSandbox}
                              onChange={() => handleToggleInvitePerm(b.id, 'canAccessSandbox')}
                              className="rounded text-indigo-600"
                            />
                            <span>💡 Pre-Prod & Ideas</span>
                          </label>

                          <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer bg-white p-2 rounded-xl border border-slate-200/80 hover:border-indigo-400">
                            <input
                              type="checkbox"
                              checked={matrix.canViewProduction}
                              onChange={() => handleToggleInvitePerm(b.id, 'canViewProduction')}
                              className="rounded text-indigo-600"
                            />
                            <span>🎬 Producción</span>
                          </label>

                          <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer bg-white p-2 rounded-xl border border-slate-200/80 hover:border-indigo-400">
                            <input
                              type="checkbox"
                              checked={matrix.canApproveT3}
                              onChange={() => handleToggleInvitePerm(b.id, 'canApproveT3')}
                              className="rounded text-indigo-600"
                            />
                            <span>⏱️ Aprobación T-3</span>
                          </label>

                          <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer bg-white p-2 rounded-xl border border-slate-200/80 hover:border-indigo-400">
                            <input
                              type="checkbox"
                              checked={matrix.canAccessDrive}
                              onChange={() => handleToggleInvitePerm(b.id, 'canAccessDrive')}
                              className="rounded text-indigo-600"
                            />
                            <span>📁 Drive Vault</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInvite}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs disabled:opacity-50"
                >
                  {isSubmittingInvite ? 'Registrando en Supabase...' : 'Guardar y Asignar Credenciales'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDITAR MATRIZ DE PERMISOS DE MIEMBRO
          ======================================================== */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Editar Matriz de Permisos: {editingMember.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">{editingMember.email}</p>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPermissions} className="space-y-4">
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {orgBrands.map((b) => {
                  const matrix = editMatrix[b.id] || {
                    canAccessSandbox: false,
                    canViewProduction: false,
                    canApproveT3: false,
                    canAccessDrive: false,
                    isBrandLead: false,
                  };

                  return (
                    <div
                      key={b.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: b.primaryColor }}
                        />
                        <span>{b.name}</span>
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer bg-white p-2 rounded-xl border border-slate-200/80 hover:border-indigo-400">
                          <input
                            type="checkbox"
                            checked={matrix.canAccessSandbox}
                            onChange={() => handleToggleEditPerm(b.id, 'canAccessSandbox')}
                            className="rounded text-indigo-600"
                          />
                          <span>💡 Pre-Prod & Ideas</span>
                        </label>

                        <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer bg-white p-2 rounded-xl border border-slate-200/80 hover:border-indigo-400">
                          <input
                            type="checkbox"
                            checked={matrix.canViewProduction}
                            onChange={() => handleToggleEditPerm(b.id, 'canViewProduction')}
                            className="rounded text-indigo-600"
                          />
                          <span>🎬 Producción</span>
                        </label>

                        <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer bg-white p-2 rounded-xl border border-slate-200/80 hover:border-indigo-400">
                          <input
                            type="checkbox"
                            checked={matrix.canApproveT3}
                            onChange={() => handleToggleEditPerm(b.id, 'canApproveT3')}
                            className="rounded text-indigo-600"
                          />
                          <span>⏱️ Aprobación T-3</span>
                        </label>

                        <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer bg-white p-2 rounded-xl border border-slate-200/80 hover:border-indigo-400">
                          <input
                            type="checkbox"
                            checked={matrix.canAccessDrive}
                            onChange={() => handleToggleEditPerm(b.id, 'canAccessDrive')}
                            className="rounded text-indigo-600"
                          />
                          <span>📁 Drive Vault</span>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs disabled:opacity-50"
                >
                  {isSavingEdit ? 'Actualizando...' : 'Guardar Cambios de Permisos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
