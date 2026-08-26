import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp, AppTab } from '../context/AppContext';
import { Film, Layers, Calendar, Building2, Camera, FileCode, ShieldCheck, Sparkles, ChevronLeft, ChevronRight, LogOut, Target, Search, HardDrive, Compass } from 'lucide-react';
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

  const navItems: { id: AppTab; label: string; roles: UserRole[]; badge?: number }[] = [
    {
      id: 'kanban',
      label: 'Pipeline Kanban',
      roles: ['webadmin', 'director', 'colaborador', 'cliente'],
      badge: deliverables.filter((d) => selectedBrandId === 'all' || d.brandId === selectedBrandId).length,
    },
    {
      id: 'brand_hub',
      label: currentUser.role === 'cliente' ? 'Mi Marca & Sandbox' : 'Sandbox de Marca',
      roles: ['webadmin', 'director', 'colaborador', 'cliente'],
      badge: sandboxIdeas.filter((i) => selectedBrandId === 'all' || i.brandId === selectedBrandId).length,
    },
    {
      id: 'calendar',
      label: 'Calendarios Duales',
      roles: ['webadmin', 'director', 'colaborador', 'cliente'],
    },
    {
      id: 'campaigns',
      label: 'Campañas',
      roles: ['webadmin', 'director', 'colaborador', 'cliente'],
      badge: campaigns.filter((c) => selectedBrandId === 'all' || c.brandId === selectedBrandId).length,
    },
    {
      id: 'drive',
      label: 'Drive Vault & Media',
      roles: ['webadmin', 'director', 'colaborador', 'cliente'],
      badge: driveFiles.filter((f) => selectedBrandId === 'all' || f.brandId === selectedBrandId).length,
    },
    {
      id: 'brands',
      label: 'Marcas & Territorios',
      roles: ['webadmin', 'director'],
    },
    {
      id: 'equipment',
      label: 'Hardware & Equipos',
      roles: ['webadmin', 'director', 'colaborador'],
    },
    {
      id: 'specs',
      label: 'System Specs Hub',
      roles: ['webadmin', 'director'],
    },
    {
      id: 'operations',
      label: 'Dirección & Operaciones',
      roles: ['director', 'webadmin'],
    },
    {
      id: 'admin',
      label: 'WebAdmin Dashboard',
      roles: ['webadmin'],
    },
  ];

  const allowedNavItems = navItems.filter((item) => item.roles.includes(currentUser.role));
  const invalidBrands = brands.filter((b) => !validateBrandTerritories(b.id).isValid);

  const renderNavIcon = (id: AppTab, isActive: boolean) => {
    const iconClass = `w-4 h-4 transition-colors ${
      isActive
        ? 'text-white'
        : id === 'kanban'
        ? 'text-indigo-600'
        : id === 'brand_hub'
        ? 'text-purple-600'
        : id === 'calendar'
        ? 'text-blue-600'
        : id === 'campaigns'
        ? 'text-rose-600'
        : id === 'drive'
        ? 'text-cyan-600'
        : id === 'brands'
        ? 'text-amber-600'
        : id === 'equipment'
        ? 'text-teal-600'
        : id === 'specs'
        ? 'text-emerald-600'
        : id === 'operations'
        ? 'text-indigo-600'
        : 'text-purple-600'
    }`;

    switch (id) {
      case 'kanban':
        return <Layers className={iconClass} />;
      case 'brand_hub':
        return <Sparkles className={iconClass} />;
      case 'calendar':
        return <Calendar className={iconClass} />;
      case 'campaigns':
        return <Target className={iconClass} />;
      case 'drive':
        return <HardDrive className={iconClass} />;
      case 'brands':
        return <Building2 className={iconClass} />;
      case 'equipment':
        return <Camera className={iconClass} />;
      case 'specs':
        return <FileCode className={iconClass} />;
      case 'operations':
        return <Compass className={iconClass} />;
      case 'admin':
        return <ShieldCheck className={iconClass} />;
      default:
        return <Layers className={iconClass} />;
    }
  };

  return (
    <aside
      className={`h-screen sticky top-0 bg-gradient-to-b from-white/95 via-slate-50/90 to-white/95 backdrop-blur-2xl border-r border-white/80 flex flex-col justify-between transition-all duration-200 z-40 shrink-0 select-none shadow-[10px_0_30px_-10px_rgba(0,0,0,0.06),inset_-2px_0_4px_rgba(255,255,255,0.9)] ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Top Header with Clay Icon */}
      <div className="p-3.5 border-b border-slate-200/70 flex items-center justify-between shadow-[inset_0_-1px_2px_rgba(0,0,0,0.02)]">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-[0_6px_16px_rgba(79,70,229,0.35),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.2)]">
              <Film className="w-4.5 h-4.5 text-white" />
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

        {/* Toggle Collapse Button - Clay Pill */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-400 hover:text-slate-700 shadow-[0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,1)] border border-slate-200/70 transition-all mx-auto cursor-pointer active:scale-95"
          title={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Nav Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 no-scrollbar">
        
        {/* Search input in expanded view - Inset Clay Pill */}
        {!isCollapsed && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar entregables..."
              className="w-full bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200/80 focus:border-indigo-500 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_1px_2px_rgba(255,255,255,0.9)] focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.02),0_4px_12px_rgba(99,102,241,0.15)] transition-all"
            />
          </div>
        )}

        {/* Navigation Items List */}
        <div className="space-y-1.5">
          {!isCollapsed && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1.5 mb-1 font-mono">
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
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-2xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white font-extrabold shadow-[0_8px_20px_rgba(79,70,229,0.35),inset_0_2px_4px_rgba(255,255,255,0.35),inset_0_-2px_4px_rgba(0,0,0,0.2)] border border-indigo-400/40 scale-[1.02]'
                    : 'bg-white/70 hover:bg-white text-slate-700 hover:text-slate-950 font-bold shadow-[0_3px_8px_rgba(0,0,0,0.03),inset_0_1px_2px_rgba(255,255,255,1),inset_0_-1px_2px_rgba(0,0,0,0.02)] border border-slate-200/70 hover:border-slate-300/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,1)] hover:scale-[1.01]'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={item.label}
              >
                <div
                  className={`shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-white/25 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.15)] ring-1 ring-white/30'
                      : 'bg-slate-100/80 shadow-[inset_0_1px_1px_rgba(0,0,0,0.04)]'
                  }`}
                >
                  {renderNavIcon(item.id, isActive)}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/25 text-white shadow-inner'
                            : 'bg-slate-200/80 text-slate-700 shadow-2xs'
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
            className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-[11px] text-amber-900 space-y-1 cursor-pointer hover:bg-amber-100/90 transition-all shadow-[0_4px_12px_rgba(245,158,11,0.1),inset_0_1px_2px_rgba(255,255,255,0.8)]"
          >
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <span>⚠️ Regla de Territorios</span>
            </div>
            <p className="text-[10px] leading-tight text-amber-700">
              {invalidBrands.length} marca(s) con &lt;3 territorios activos.
            </p>
          </div>
        )}

        {/* AI Assistant Quick Trigger - Clay Violet Pill */}
        <div className="pt-2 border-t border-slate-200/60">
          <button
            onClick={() => openAiModalWithContext({ action: 'ideate' })}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200/80 text-purple-900 font-bold text-xs transition-all cursor-pointer shadow-[0_4px_12px_rgba(124,58,237,0.12),inset_0_2px_3px_rgba(255,255,255,1),inset_0_-1px_2px_rgba(124,58,237,0.08)] hover:scale-[1.01] active:scale-[0.98] ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Asistente AI Copilot"
          >
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 animate-subtle-pulse" />
            {!isCollapsed && <span>Copilot Gemini AI</span>}
          </button>
        </div>

      </div>

      {/* Footer / User Profile Pill - Clay Card */}
      <div className="p-3 border-t border-slate-200/70 bg-slate-50/80">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2 bg-white rounded-2xl p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.04),inset_0_2px_3px_rgba(255,255,255,1),inset_0_-1px_2px_rgba(0,0,0,0.03)] border border-slate-200/80">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-90 transition-all cursor-pointer flex-1 p-1 rounded-xl"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0 shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 text-xs truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 capitalize truncate font-medium">
                  {currentUser.role}
                </div>
              </div>
            </button>

            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer shrink-0 active:scale-95"
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
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
            </button>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer transition-colors active:scale-95"
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
