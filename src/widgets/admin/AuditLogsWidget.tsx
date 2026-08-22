import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Search, Filter, Clock } from 'lucide-react';

export const AuditLogsWidget: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');
  const [filterEntity, setFilterEntity] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase());
    const matchesEntity = filterEntity === 'all' || log.entityType === filterEntity;
    return matchesSearch && matchesEntity;
  });

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Registro de Auditoría y Seguridad</h3>
            <p className="text-xs text-slate-400">
              Trazabilidad inmutable de todas las acciones y cambios de estado en el sistema
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar logs..."
              className="pl-8 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 transition-colors"
            />
          </div>

          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            aria-label="Filtrar entidad"
            className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-slate-300 focus:outline-hidden focus:border-purple-500 transition-colors cursor-pointer"
          >
            <option value="all">Todas las entidades</option>
            <option value="deliverable">Entregables</option>
            <option value="brand">Marcas</option>
            <option value="equipment">Equipamiento</option>
            <option value="drive">Drive Vault</option>
            <option value="system">Sistema</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/20">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/5 text-slate-400 font-mono text-[11px] border-b border-white/5">
            <tr>
              <th className="py-2.5 px-4">Fecha y Hora</th>
              <th className="py-2.5 px-4">Usuario</th>
              <th className="py-2.5 px-4">Rol</th>
              <th className="py-2.5 px-4">Acción</th>
              <th className="py-2.5 px-4">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                  No se encontraron registros de auditoría coincidentes.
                </td>
              </tr>
            ) : (
              filteredLogs.slice(0, 30).map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-medium text-white whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-purple-400 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-4 text-slate-300 max-w-xs truncate" title={log.details}>
                    {log.details}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
