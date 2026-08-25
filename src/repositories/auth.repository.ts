import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { UserProfile, UserRole, CollaboratorSchedule, UserPreferences } from '../types';

export const AuthRepository = {
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase no está configurado');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string, name: string, role: UserRole = 'webadmin') {
    if (!isSupabaseConfigured) throw new Error('Supabase no está configurado');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    });
    if (error) throw error;

    if (data.user) {
      const newProfile: UserProfile = {
        id: data.user.id,
        name,
        email,
        role,
        roleTitle:
          role === 'webadmin'
            ? 'Chief Technology Officer & WebAdmin Global'
            : role === 'director'
            ? 'Director Creativo & Executive Producer'
            : role === 'cliente'
            ? 'Cliente de Marca'
            : 'Colaborador Técnico / Post-Producción',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        assignedBrandIds: [],
        schedule: {
          workDays: [1, 2, 3, 4, 5],
          startHour: '09:00',
          endHour: '18:00',
          isOnVacation: false,
          alertsEnabled: true,
        },
        preferences: {
          navPosition: 'topbar',
          theme: 'light-density',
          compactCards: false,
          enableNotifications: true,
        },
      };

      await supabase.from('users_profiles').upsert({
        id: newProfile.id,
        email: newProfile.email,
        name: newProfile.name,
        role: newProfile.role,
        role_title: newProfile.roleTitle,
        avatar: newProfile.avatar,
        assigned_brand_ids: newProfile.assignedBrandIds,
        schedule: newProfile.schedule,
        preferences: newProfile.preferences,
      });

      return newProfile;
    }
    return null;
  },

  async fetchProfiles(): Promise<UserProfile[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('users_profiles').select('*');
      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        email: row.email,
        name: row.name,
        role: row.role as UserRole,
        roleTitle: row.role_title,
        avatar: row.avatar,
        assignedBrandIds: row.assigned_brand_ids || [],
        clientOrganizationId: row.client_organization_id,
        clientRole: row.client_role,
        schedule: row.schedule || {
          workDays: [1, 2, 3, 4, 5],
          startHour: '09:00',
          endHour: '18:00',
          isOnVacation: false,
          alertsEnabled: true,
        },
        preferences: row.preferences || {
          navPosition: 'topbar',
          theme: 'light-density',
          compactCards: false,
          enableNotifications: true,
        },
      }));
    } catch {
      return [];
    }
  },

  async updateUserRoleAndBrands(userId: string, role: UserRole, assignedBrandIds: string[]) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from('users_profiles')
      .update({
        role,
        assigned_brand_ids: assignedBrandIds,
      })
      .eq('id', userId);
    if (error) throw error;
  },

  async updateUserSchedule(userId: string, schedule: CollaboratorSchedule) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from('users_profiles')
      .update({ schedule })
      .eq('id', userId);
    if (error) throw error;
  },

  async updateUserPreferences(userId: string, preferences: UserPreferences) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from('users_profiles')
      .update({ preferences })
      .eq('id', userId);
    if (error) throw error;
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    if (!isSupabaseConfigured) return;
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.roleTitle !== undefined) payload.role_title = updates.roleTitle;
    if (updates.avatar !== undefined) payload.avatar = updates.avatar;
    if (updates.assignedBrandIds !== undefined) payload.assigned_brand_ids = updates.assignedBrandIds;
    if (updates.clientOrganizationId !== undefined) payload.client_organization_id = updates.clientOrganizationId;
    if (updates.clientRole !== undefined) payload.client_role = updates.clientRole;
    if (updates.clientPermissionsMatrix !== undefined) payload.client_permissions_matrix = updates.clientPermissionsMatrix;
    if (updates.schedule !== undefined) payload.schedule = updates.schedule;
    if (updates.preferences !== undefined) payload.preferences = updates.preferences;

    const { error } = await supabase
      .from('users_profiles')
      .update(payload)
      .eq('id', userId);
    if (error) console.error('Error updating user profile in Supabase:', error);
  },

  async signOut() {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  },
};
