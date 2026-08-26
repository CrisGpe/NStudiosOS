import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Layers,
  Sparkles,
  Calendar,
  Target,
  HardDrive,
  Building2,
  Camera,
  FileCode,
  ShieldCheck,
  Search,
  LogOut,
  AlertTriangle,
  Film,
  Smartphone,
  Compass,
} from 'lucide-react';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    brands,
    selectedBrandId,
    setSelectedBrandId,
    selectedOrgId,
    setSelectedOrgId,
    organizations,
    searchQuery,
    setSearchQuery,
    logout,
    openAiModalWithContext,
    setIsProfileModalOpen,
    setActiveTab,
    deliverables,
    campaigns,
    driveFiles,
    sandboxIdeas,
    validateBrandTerritories,
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  // Keyboard shortcut ⌘K / Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems: {
    id: any;
    label: string;
    icon: React.ReactNode;
    roles: UserRole[];
    badge?: number;
  }[] = [
    {
      id: 'kanban',
      label: 'Tablero Kanban',
      icon: <Layers className="w-3.5 h-3.5 text-indigo-600" />,
      roles: ['webadmin', 'director', 'colaborador', 'cliente'],
      badge: deliverables.filter((d) => selectedBrandId === 'all' || d.brandId === selectedBrandId).length,
    },
    {
      id: 'brand_hub',
      label: currentUser.role === 'cliente' ? 'Mi Marca & Sandbox' : 'Sandbox de Marca',
      icon: <Sparkles className="w-3.5 h-3.5 text-purple-600" />,
      roles: ['webadmin', 'director', 'colaborador', 'cliente'],
      badge: sandboxIdeas.filter((i) => selectedBrandId === 'all' || i.brandId === selectedBrandId).length,
    },
    {
      id: 'calendar',
      label: 'Calendarios',
      icon: <Calendar className="w-3.5 h-3.5 text-blue-600" />,
      roles: ['webadmin', 'director', 'colaborador', 'cliente'],
    },
    {
      id: 'campaigns',
      label: 'Campañas',
      icon: <Target className="w-3.5 h-3.5 text-rose-600" />,
      roles: ['webadmin', 'director', 'colaborador', 'cliente'],
      badge: campaigns.filter((c) => selectedBrandId === 'all' || c.brandId === selectedBrandId).length,
    },
    {
      id: 'drive',
      label: 'Drive Vault & Media',
      icon: <HardDrive className="w-3.5 h-3.5 text-cyan-600" />,
      roles: ['webadmin', 'director', 'colaborador', 'cliente'],
      badge: driveFiles.filter((f) => selectedBrandId === 'all' || f.brandId === selectedBrandId).length,
    },
    {
      id: 'brands',
      label: 'Marcas & Territorios',
      icon: <Building2 className="w-3.5 h-3.5 text-amber-600" />,
      roles: ['webadmin', 'director'],
    },
    {
      id: 'equipment',
      label: 'Hardware & Equipos',
      icon: <Camera className="w-3.5 h-3.5 text-teal-600" />,
      roles: ['webadmin', 'director', 'colaborador'],
    },
    {
      id: 'specs',
      label: 'System Specs & ERD',
      icon: <FileCode className="w-3.5 h-3.5 text-emerald-600" />,
      roles: ['webadmin', 'director'],
    },
    {
      id: 'operations',
      label: 'Dirección & Operaciones',
      icon: <Compass className="w-3.5 h-3.5 text-indigo-600" />,
      roles: ['director', 'webadmin'],
    },
    {
      id: 'admin',
      label: 'WebAdmin Dashboard',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />,
      roles: ['webadmin'],
    },
  ];

  const allowedNavItems = navItems.filter((item) => item.roles.includes(currentUser.role));
  const invalidBrands = brands.filter((b) => !validateBrandTerritories(b.id).isValid);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'webadmin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'director':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'colaborador':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cliente':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-colors">
      {/* Top Warning Banner if territory business rule is broken */}
      {invalidBrands.length > 0 && currentUser.role !== 'cliente' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong className="font-semibold text-amber-900">Regla de Negocio Estricta:</strong> {invalidBrands.length} marca(s) tienen menos de 3 territorios activos ({invalidBrands.map((b) => b.name).join(', ')}).
            </span>
          </div>
          <button
            onClick={() => {
              setActiveTab('brands');
              navigate('/brands');
            }}
            className="underline font-semibold text-amber-900 hover:text-amber-700 transition-colors cursor-pointer text-xs"
          >
            Gestionar Territorios
          </button>
        </div>
      )}

      <div className="max-w-[1750px] mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-14 gap-3">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveTab('kanban');
                navigate('/kanban');
              }}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <Film className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-extrabold text-slate-900 text-sm tracking-tight">
                    N. Studios
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full border border-slate-200 font-mono">
                    NATARAJA OS
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 tracking-tight font-medium mt-0.5">
                  Producción Audiovisual & RBAC
                </span>
              </div>
            </button>
          </div>

          {/* Center Search Input */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="global-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar entregables, campañas, equipos o marcas..."
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl pl-9 pr-14 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-2xs"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
                >
                  ✕
                </button>
              ) : (
                <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>

          {/* 2-Level Hierarchical Selector: Client (Holding) ➔ Brand */}
          {currentUser.role !== 'cliente' ? (
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-2xs">
              {/* Level 1: Client / Organization Dropdown */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg">
                <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <select
                  value={selectedOrgId}
                  onChange={(e) => {
                    const orgId = e.target.value;
                    setSelectedOrgId(orgId);
                    if (orgId !== 'all') {
                      const orgBrands = brands.filter((b) => b.clientOrganizationId === orgId || organizations.find((o) => o.id === orgId)?.brandIds.includes(b.id));
                      if (orgBrands.length > 0 && (!selectedBrandId || selectedBrandId === 'all' || !orgBrands.some((b) => b.id === selectedBrandId))) {
                        setSelectedBrandId(orgBrands[0].id);
                      }
                    }
                  }}
                  className="bg-transparent border-none text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer pr-1 max-w-[140px] truncate"
                  title="Filtrar por Cliente / Holding"
                >
                  <option value="all">Todos los Clientes</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level 2: Brand Dropdown (filtered by selected organization) */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-300 font-light">/</span>
                <select
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  className="bg-transparent border-none text-xs text-slate-800 font-medium focus:outline-none cursor-pointer pr-1 max-w-[150px] truncate"
                  title="Filtrar por Marca"
                >
                  <option value="all">Todas las Marcas</option>
                  {(selectedOrgId === 'all'
                    ? brands
                    : brands.filter((b) => b.clientOrganizationId === selectedOrgId || organizations.find((o) => o.id === selectedOrgId)?.brandIds.includes(b.id))
                  ).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-xl p-1 text-xs shadow-2xs">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-emerald-200 rounded-lg">
                <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="font-bold text-emerald-950 max-w-[120px] truncate">
                  {organizations.find((o) => o.id === currentUser.clientOrganizationId)?.name || 'Mi Organización'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-emerald-200 rounded-lg">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: brands.find((b) => b.id === selectedBrandId)?.primaryColor || '#10b981' }} />
                <select
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  className="bg-transparent border-none text-xs text-slate-800 font-medium focus:outline-none cursor-pointer pr-1"
                >
                  {(currentUser.assignedBrandIds && currentUser.assignedBrandIds.length > 0
                    ? brands.filter((b) => currentUser.assignedBrandIds?.includes(b.id))
                    : brands
                  ).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Right Controls: AI Copilot, User Profile & Logout */}
          <div className="flex items-center gap-2">
            
            {/* Mobile Companion Switch */}
            <button
              onClick={() => navigate('/mobile')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer shadow-2xs"
              title="Abrir Vista Móvil Flash & Captura Rápida"
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">Modo Móvil</span>
            </button>

            {/* AI Studio Copilot Button */}
            <button
              onClick={() => openAiModalWithContext({ brandId: selectedBrandId !== 'all' ? selectedBrandId : brands[0].id })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-sm shadow-purple-600/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Asistente de Producción con Gemini AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-100 animate-subtle-pulse" />
              <span className="hidden sm:inline">Copilot AI</span>
            </button>

            {/* User Profile Pill */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all text-left cursor-pointer shadow-2xs hover:scale-[1.01]"
              title="Abrir Mi Perfil y Preferencias"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
              <div className="hidden xl:block">
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold uppercase ${getRoleBadgeColor(currentUser.role)}`}>
                    {currentUser.role}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                  {currentUser.roleTitle}
                </div>
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* Horizontal Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-2 border-t border-slate-100 text-xs no-scrollbar">
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
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 border border-indigo-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
