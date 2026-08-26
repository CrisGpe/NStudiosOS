import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { AuditLog, UserRole } from '../types';

export const AuditRepository = {
  async fetchAuditLogs(limit = 100): Promise<AuditLog[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        action: row.action,
        details: row.details,
        userId: row.user_id,
        userName: row.user_name || 'Usuario',
        userRole: (row.user_role as UserRole) || 'webadmin',
        entityType: row.entity_type || 'system',
        entityId: row.entity_id || 'sys',
        timestamp: row.created_at,
      }));
    } catch {
      return [];
    }
  },

  async addAuditLog(
    action: string,
    details: string,
    userId: string,
    userName?: string,
    userRole?: string,
    entityType?: string,
    entityId?: string
  ): Promise<AuditLog> {
    const log: AuditLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      action,
      details,
      userId,
      userName: userName || 'Usuario',
      userRole: (userRole as UserRole) || 'webadmin',
      entityType: (entityType as any) || 'system',
      entityId: entityId || 'system',
      timestamp: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) return log;

    try {
      const formattedDetails = details || `[${entityType || 'system'}:${entityId || 'sys'}] ${action}`;
      const { error } = await supabase.from('audit_logs').insert({
        id: log.id,
        action: log.action,
        details: formattedDetails,
        user_id: log.userId,
        user_name: log.userName,
        created_at: log.timestamp,
      });
      if (error) console.warn('Supabase audit log notice:', error.message);
    } catch (err) {
      console.warn('Supabase audit log catch:', err);
    }
    return log;
  },
};
