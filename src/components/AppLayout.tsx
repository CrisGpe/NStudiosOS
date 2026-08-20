import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Smartphone } from 'lucide-react';
import { Navbar } from './Navbar';
import { SidebarNav } from './SidebarNav';
import { AICopilotModal } from './AICopilotModal';
import { UserProfileModal } from './UserProfileModal';
import { CreateBrandModal } from './CreateBrandModal';
import { CreateCampaignModal } from './CreateCampaignModal';
import { CreateEquipmentModal } from './CreateEquipmentModal';
import { DeliverableDetailModal } from './DeliverableDetailModal';
import { MediaVaultViewer } from './MediaVaultViewer';
import { CreateClientDeliverableModal } from './CreateClientDeliverableModal';

export const AppLayout: React.FC = () => {
  const { navPosition, currentUser } = useApp();
  const navigate = useNavigate();
  
  const isSidebar = navPosition === 'sidebar';

  return (
    <div
      className={`min-h-screen bg-slate-50 flex text-slate-800 selection:bg-indigo-600 selection:text-white font-sans antialiased transition-colors duration-200 ${
        isSidebar ? 'flex-row' : 'flex-col'
      }`}
    >
      {/* Sidebar Navigation */}
      {isSidebar && <SidebarNav />}

      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar Navigation */}
        {!isSidebar && <Navbar />}

        {/* Dynamic Outlet Content */}
        <main className="flex-1 max-w-[1750px] w-full mx-auto px-3 sm:px-5 lg:px-6 py-4">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-3 bg-white text-center text-xs text-slate-500">
          <div className="max-w-[1750px] mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] inline-block"></span>
              <span className="font-semibold text-slate-800">N. Studios — Nataraja Agency OS</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Ritmo & Creación de Marcas Vivas</span>
            </div>
            <div className="font-mono text-[11px] text-slate-500 flex items-center gap-3">
              <span>Modo: <strong className="text-indigo-600">{currentUser.roleTitle}</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-cyan-700">Google Drive Vault API v3</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Mobile Floating Switcher Banner for screens < 768px */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-2 animate-in slide-in-from-bottom-2">
        <div className="flex items-center gap-2 min-w-0">
          <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-medium truncate">Versión de Escritorio</span>
        </div>
        <button
          onClick={() => navigate('/mobile')}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 shadow-sm cursor-pointer"
        >
          Abrir Modo Móvil
        </button>
      </div>

      {/* Global Interactive Modals */}
      <MediaVaultViewer />
      <DeliverableDetailModal />
      <AICopilotModal />
      <UserProfileModal />
      <CreateBrandModal />
      <CreateEquipmentModal />
      <CreateCampaignModal />
      <CreateClientDeliverableModal />
    </div>
  );
};
