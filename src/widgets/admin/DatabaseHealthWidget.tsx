import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { Database, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface TableHealth {
  name: string;
  count: number;
  status: 'healthy' | 'empty' | 'error';
  errorMsg?: string;
}

export const DatabaseHealthWidget: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<TableHealth[]>([]);
  const [pingMs, setPingMs] = useState<number | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    const start = performance.now();
    const tableNames = [
      'users_profiles',
      'brands',
      'communication_territories',
      'digital_assets',
      'deliverables',
      'campaigns',
      'hardware_equipment',
      'equipment_reservations',
      'drive_accounts',
      'drive_folders',
      'drive_files',
      'client_organizations',
      'client_sandbox_ideas',
      'audit_logs',
      'system_settings',
    ];

    try {
      const results: TableHealth[] = await Promise.all(
        tableNames.map(async (name) => {
          if (!isSupabaseConfigured) {
            return { name, count: 0, status: 'empty' };
          }
          try {
            const { count, error } = await supabase
              .from(name)
              .select('*', { count: 'exact', head: true });
            if (error) {
              return { name, count: 0, status: 'error', errorMsg: error.message };
            }
            return {
              name,
              count: count || 0,
              status: (count || 0) > 0 ? 'healthy' : 'empty',
            };
          } catch (e: any) {
            return { name, count: 0, status: 'error', errorMsg: e.message };
          }
        })
      );

      const elapsed = Math.round(performance.now() - start);
      setPingMs(elapsed);
      setTables(results);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Estado de Base de Datos Supabase</h3>
            <p className="text-xs text-slate-400">
              Conexión en vivo a tablas relacionales de producción
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {pingMs !== null && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Ping: {pingMs}ms
            </span>
          )}
          <button
            onClick={checkHealth}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {tables.map((t) => (
          <div
            key={t.name}
            className="bg-black/30 rounded-xl p-3 border border-white/5 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 truncate max-w-[100px]" title={t.name}>
                {t.name}
              </span>
              {t.status === 'healthy' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : t.status === 'empty' ? (
                <span className="w-2 h-2 rounded-full bg-amber-400/80" title="Tabla vacía (0 registros)" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" title={t.errorMsg} />
              )}
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {t.count}
              <span className="text-[10px] font-sans font-normal text-slate-500 ml-1">filas</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
