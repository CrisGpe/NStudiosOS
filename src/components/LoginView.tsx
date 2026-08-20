import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Film,
  Users,
  Sparkles,
  Search,
  ArrowRight,
  Building2,
  Lock,
} from 'lucide-react';
import { UserRole } from '../types';

export const LoginView: React.FC = () => {
  const { users, brands, login } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleTab, setSelectedRoleTab] = useState<'all' | 'team' | 'clients'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'clients';
    }
    return 'all';
  });
  const navigate = useNavigate();

  const handleLogin = (id: string) => {
    login(id);
    const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobileScreen) {
      navigate('/mobile');
    } else {
      const loggedUser = users.find((u) => u.id === id);
      if (loggedUser?.role === 'cliente') {
        navigate('/client/hub');
      } else {
        navigate('/kanban');
      }
    }
  };

  const teamUsers = users.filter((u) => u.role !== 'cliente');
  const clientUsers = users.filter((u) => u.role === 'cliente');

  const filteredTeam = teamUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClients = clientUsers.filter((u) => {
    const brand = brands.find((b) => b.id === u.assignedBrandIds?.[0]);
    return (
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (brand && brand.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'webadmin':
        return { label: 'WebAdmin Global', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'director':
        return { label: 'Director de Proyecto', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'colaborador':
        return { label: 'Colaborador Técnico', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'cliente':
        return { label: 'Cliente de Marca', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Subtle Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-4 border-b border-slate-200 bg-white/90 backdrop-blur-md relative z-10 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight">N. Studios</h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  NATARAJA AGENCY OS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Plataforma RBAC Audiovisual • Ritmo y Creación de Marcas Vivas
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Acceso 1-Tap Simulado • Demo Sandbox</span>
          </div>
        </div>
      </header>

      {/* Main Content: 1-Tap Role Selector */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10 space-y-6">
        
        {/* Welcome Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Selecciona tu Rol para Ingresar al Sistema</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Control de Acceso Basado en Roles (RBAC)
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Experimenta el sistema desde la perspectiva del equipo de producción (WebAdmin, Dirección, DP/Edición) o como uno de los 6 clientes de marca con aislamiento de datos.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedRoleTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedRoleTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Todos los Usuarios ({users.length})
            </button>
            <button
              onClick={() => setSelectedRoleTab('team')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedRoleTab === 'team'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Equipo Nataraja ({teamUsers.length})
            </button>
            <button
              onClick={() => setSelectedRoleTab('clients')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedRoleTab === 'clients'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Clientes de Marca ({clientUsers.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar usuario o marca..."
              className="input-impeccable pl-8.5"
            />
          </div>
        </div>

        {/* SECTION 1: TEAM MEMBERS */}
        {(selectedRoleTab === 'all' || selectedRoleTab === 'team') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Miembros del Equipo Interno (Agencia Nataraja)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredTeam.map((user) => {
                const badge = getRoleBadge(user.role);
                return (
                  <div
                    key={user.id}
                    onClick={() => handleLogin(user.id)}
                    className="group bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-indigo-500 rounded-2xl p-4 transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-indigo-500 transition-all shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {user.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {user.roleTitle}
                        </p>
                        <div className="mt-1">
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 group-hover:text-indigo-600">
                      <span className="font-mono text-[10px] text-slate-400 truncate">{user.email}</span>
                      <div className="flex items-center gap-1 font-semibold shrink-0">
                        <span>Entrar</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: BRAND CLIENTS */}
        {(selectedRoleTab === 'all' || selectedRoleTab === 'clients') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Clientes de Marca (Acceso Restringido por Organización)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredClients.map((user) => {
                const brand = brands.find((b) => b.id === user.assignedBrandIds?.[0]);
                const badge = getRoleBadge(user.role);

                return (
                  <div
                    key={user.id}
                    onClick={() => handleLogin(user.id)}
                    className="group bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-emerald-500 rounded-2xl p-4 transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-emerald-500 transition-all shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                          {user.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {user.roleTitle}
                        </p>

                        {/* Brand pill */}
                        {brand && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: brand.primaryColor }}
                            />
                            <span className="text-[10px] font-bold text-slate-700">
                              {brand.name} ({brand.industry})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 group-hover:text-emerald-700">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <div className="flex items-center gap-1 font-semibold shrink-0">
                        <span>Entrar como Cliente</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium text-slate-700">N. Studios OS • Nataraja Creative Workflow Engine</span>
          <span className="font-mono text-[11px] text-slate-500">
            6 Marcas / 2 Cupos Colaborador • RBAC Multi-Tenant
          </span>
        </div>
      </footer>
    </div>
  );
};
