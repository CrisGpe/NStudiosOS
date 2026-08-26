import React, { useState } from 'react';
import { WebAdminDashboard } from '../components/WebAdminDashboard';
import { DatabaseHealthWidget, IntegrationsWidget, AuditLogsWidget } from '../widgets/admin';
import { ShieldCheck, Database, Sliders, FileText } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users_rbac' | 'health' | 'integrations' | 'audit'>('users_rbac');

  return (
    <div className="space-y-6">
      {/* Top Bar / Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            Panel de Control Global WebAdmin
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestión centralizada de roles RBAC, sincronización con Supabase y auditoría del sistema
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setActiveTab('users_rbac')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'users_rbac'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            Usuarios & RBAC
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'health'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            Base de Datos
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'integrations'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            Integraciones & AI
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
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
