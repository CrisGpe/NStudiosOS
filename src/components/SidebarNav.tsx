import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp, AppTab } from '../context/AppContext';
import {
  Film,
  Layers,
  Calendar,
  Building2,
  Camera,
  FileCode,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Target,
  Search,
  HardDrive,
} from 'lucide-react';
import { UserRole } from '../types';

export const SidebarNav: React.FC = () => {
  const {
    currentUser,
    brands,
    selectedBrandId,
    setSelectedBrandId,
    setActiveTab,
    openAiModalWithContext,
    setIsProfileModalOpen,
    logout,
    searchQuery,
    setSearchQuery,
    deliverables,
    campaigns,
    driveFiles,
    sandboxIdeas,
    validateBrandTerritories,
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: { id: AppTab; label: string; icon: React.ReactNode; roles: UserRole[]; badge?: number }[] = [
    {
      id: 'kanban',
      label: 'Pipeline Kanban',
      icon: <Layers className="w-4 h-4 text-indigo-600" />,
      roles: ['webadmin', 'director', 'colaborador', 'cliente'],
      badge: deliverables.filter((d) => selectedBrandId === 'all' || d.brandId === selectedBrandId).length,
    },
    {
      id: 'brand_hub',
      label: currentUser.role === 'cliente' ? 'Mi Marca & Sandbox' : 'Sandbox de Marca',
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
      roles: ['webadmin', 'director', 'colaborador', 'cliente'],
      badge: sandboxIdeas.filter((i) => selectedBrandId === 'all' || i.brandId === selectedBrandId).length,
    },
    {
      id: 'calendar',
      label: 'Calendarios Duales',
      icon: <Calendar className="w-4 h-4 text-blue-600" />,
      roles: ['webadmin', 'director', 'colaborador', 'cliente'],
    },
    {
      id: 'campaigns',
      label: 'Campañas',
      icon: <Target className="w-4 h-4 text-rose-600" />,
      roles: ['webadmin', 'director', 'colaborador', 'cliente'],
      badge: campaigns.filter((c) => selectedBrandId === 'all' || c.brandId === selectedBrandId).length,
    },
    {
      id: 'drive',
      label: 'Drive Vault & Media',
      icon: <HardDrive className="w-4 h-4 text-cyan-600" />,
      roles: ['webadmin', 'director', 'colaborador', 'cliente'],
      badge: driveFiles.filter((f) => selectedBrandId === 'all' || f.brandId === selectedBrandId).length,
    },
    {
      id: 'brands',
      label: 'Marcas & Territorios',
      icon: <Building2 className="w-4 h-4 text-amber-600" />,
      roles: ['webadmin', 'director'],
    },
    {
      id: 'equipment',
      label: 'Hardware & Equipos',
      icon: <Camera className="w-4 h-4 text-teal-600" />,
      roles: ['webadmin', 'director', 'colaborador'],
    },
    {
      id: 'specs',
      label: 'System Specs Hub',
      icon: <FileCode className="w-4 h-4 text-emerald-600" />,
      roles: ['webadmin', 'director'],
    },
    {
      id: 'admin',
      label: 'WebAdmin Dashboard',
      icon: <ShieldCheck className="w-4 h-4 text-purple-600" />,
      roles: ['webadmin'],
    },
  ];

  const allowedNavItems = navItems.filter((item) => item.roles.includes(currentUser.role));
  const invalidBrands = brands.filter((b) => !validateBrandTerritories(b.id).isValid);

  return (
    <aside
      className={`h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-200 z-40 shrink-0 select-none shadow-xs ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Top Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-600/20">
              <Film className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-slate-900 text-xs tracking-tight block truncate">
                N. Studios OS
              </span>
              <span className="text-[10px] text-slate-500 font-medium block truncate">
                Nataraja Agency
              </span>
            </div>
          </div>
        )}

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors mx-auto cursor-pointer"
          title={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Nav Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
        
        {/* Brand Selector for non-clients */}
        {!isCollapsed && currentUser.role !== 'cliente' && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block px-1">
              Marca Activa
            </label>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="all">Todas las Marcas (Global)</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.industry})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Client Brand Badge */}
        {!isCollapsed && currentUser.role === 'cliente' && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs shadow-2xs">
            <span className="text-[9px] font-bold text-emerald-700 block uppercase tracking-wider">
              Organización
            </span>
            <span className="font-bold text-emerald-950 truncate block mt-0.5">
              {brands.find((b) => b.id === selectedBrandId)?.name || 'Tu Marca'}
            </span>
          </div>
        )}

        {/* Search input in expanded view */}
        {!isCollapsed && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar entregables..."
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
            />
          </div>
        )}

        {/* Navigation Items List */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1 mb-1">
              Módulos del Sistema
            </span>
          )}

          {allowedNavItems.map((item) => {
            const isActive =
              (item.id === 'drive' && (location.pathname.includes('/drive') || location.pathname.includes('/drive-vault'))) ||
              (item.id === 'brand_hub' && location.pathname.includes('/client/hub')) ||
              (item.id === 'kanban' && (location.pathname === '/' || location.pathname === '/kanban')) ||
              (location.pathname === `/${item.id}`);

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'brand_hub') {
                    navigate('/client/hub');
                  } else if (item.id === 'drive') {
                    navigate('/drive');
                  } else {
                    navigate(`/${item.id}`);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 border border-indigo-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={item.label}
              >
                <div className={`shrink-0 ${isActive ? 'text-white' : ''}`}>{item.icon}</div>
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Territory rule alert in Sidebar */}
        {!isCollapsed && invalidBrands.length > 0 && currentUser.role !== 'cliente' && (
          <div
            onClick={() => {
              setActiveTab('brands');
              navigate('/brands');
            }}
            className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1 cursor-pointer hover:bg-amber-100 transition-all shadow-2xs"
          >
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <span>⚠️ Regla de Territorios</span>
            </div>
            <p className="text-[10px] leading-tight text-amber-700">
              {invalidBrands.length} marca(s) con &lt;3 territorios activos.
            </p>
          </div>
        )}

        {/* AI Assistant Quick Trigger */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => openAiModalWithContext({ action: 'ideate' })}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-semibold text-xs transition-all cursor-pointer shadow-2xs hover:scale-[1.01] ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Asistente AI Copilot"
          >
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 animate-subtle-pulse" />
            {!isCollapsed && <span>Copilot Gemini AI</span>}
          </button>
        </div>

      </div>

      {/* Footer / User Profile Pill */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-90 transition-all cursor-pointer flex-1 p-1 rounded-xl hover:bg-slate-100"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-800 text-xs truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 capitalize truncate">
                  {currentUser.role}
                </div>
              </div>
            </button>

            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer shrink-0"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="cursor-pointer hover:scale-105 transition-transform"
              title={`${currentUser.name} (${currentUser.role})`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
            </button>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
