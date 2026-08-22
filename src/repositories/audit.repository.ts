import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { AuditLog, UserRole } from '../types';

export const AuditRepository = {
  async fetchAuditLogs(): Promise<AuditLog[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        action: row.action,
        details: row.details,
        userId: row.user_id,
        userName: row.user_name || 'Sistema',
        userRole: (row.user_role as UserRole) || 'webadmin',
        entityType: (row.entity_type as any) || 'system',
        entityId: row.entity_id,
        timestamp: row.created_at || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },

  async addAuditLog(
    action: string,
    details: string,
    userId: string,
    entityType?: 'deliverable' | 'equipment' | 'territory' | 'brand' | 'system' | 'drive',
    entityId?: string,
    userName?: string,
    userRole?: UserRole
  ): Promise<AuditLog> {
    const log: AuditLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      action,
      details,
      userId,
      userName: userName || 'Usuario',
      userRole: userRole || 'webadmin',
      entityType: entityType || 'system',
      entityId: entityId || 'sys',
      timestamp: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) return log;

    const { error } = await supabase.from('audit_logs').insert({
      id: log.id,
      action: log.action,
      details: log.details,
      user_id: log.userId,
      user_name: log.userName,
      user_role: log.userRole,
      entity_type: log.entityType,
      entity_id: log.entityId,
      created_at: log.timestamp,
    });
    if (error) console.error('Error inserting audit log in Supabase:', error);
    return log;
  },
};
