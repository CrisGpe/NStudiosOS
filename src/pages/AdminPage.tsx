import React, { useState } from 'react';
import { WebAdminDashboard } from '../components/WebAdminDashboard';
import { DatabaseHealthWidget, IntegrationsWidget, AuditLogsWidget } from '../widgets/admin';
import { ShieldCheck, Database, Sliders, FileText } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users_rbac' | 'health' | 'integrations' | 'audit'>('users_rbac');

  return (
    <div className="space-y-6">
      {/* Top Bar / Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            Panel de Control Global WebAdmin
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión centralizada de roles RBAC, sincronización con Supabase y auditoría del sistema
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('users_rbac')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'users_rbac'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Usuarios & RBAC
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'health'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Base de Datos
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'integrations'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Integraciones
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Auditoría
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'users_rbac' && <WebAdminDashboard />}
      {activeTab === 'health' && <DatabaseHealthWidget />}
      {activeTab === 'integrations' && <IntegrationsWidget />}
      {activeTab === 'audit' && <AuditLogsWidget />}
    </div>
  );
};
