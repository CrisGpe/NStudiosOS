import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuditLog, UserRole } from '../types';
import { INITIAL_AUDIT_LOGS } from '../data/initialData';

export interface AuditContextType {
  auditLogs: AuditLog[];
  addAuditLog: (
    action: string,
    details: string,
    userId?: string,
    entityType?: 'deliverable' | 'equipment' | 'territory' | 'brand' | 'system' | 'drive',
    entityId?: string,
    userName?: string,
    userRole?: UserRole
  ) => void;
  resetSystemData: () => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_audit_logs');
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  useEffect(() => {
    localStorage.setItem('nataraja_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addAuditLog = (
    action: string,
    details: string,
    userId = 'usr_system',
    entityType: 'deliverable' | 'equipment' | 'territory' | 'brand' | 'system' | 'drive' = 'system',
    entityId = 'sys_root',
    userName = 'Sistema Nataraja',
    userRole: UserRole = 'webadmin'
  ) => {
    const newLog: AuditLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      action,
      details,
      userId,
      userName,
      userRole,
      entityType,
      entityId,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const resetSystemData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <AuditContext.Provider
      value={{
        auditLogs,
        addAuditLog,
        resetSystemData,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
};

export const useAuditContext = (): AuditContextType => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAuditContext must be used within an AuditProvider');
  }
  return context;
};
