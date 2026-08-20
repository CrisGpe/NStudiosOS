import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase (injected by Vite or Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qrwqzgzchhnirrzzfzsw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyd3F6Z3pjaGhuaXJyenpmenN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyNTA2ODcsImV4cCI6MjEwMjgyNjY4N30.-ney1VV5N4CULOVX7dm_ruHp9Y2iQ43jHrs6lQ_dmkc';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Singleton Supabase Client for N. Studios OS
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Helper to verify Supabase connection health
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    if (!isSupabaseConfigured) {
      return { connected: false, message: 'Supabase no está configurado en las variables de entorno' };
    }
    const { error } = await supabase.from('users_profiles').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      // If table does not exist yet or connection fails
      return { connected: false, message: `Conexión alcanzada pero tabla pendiente: ${error.message}` };
    }
    return { connected: true, message: 'Conexión exitosa a Supabase PostgreSQL' };
  } catch (err: any) {
    return { connected: false, message: err.message || 'Error de conexión a Supabase' };
  }
}
