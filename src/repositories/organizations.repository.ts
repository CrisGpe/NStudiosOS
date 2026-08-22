import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { ClientOrganization, ClientBrandPermission } from '../types';

export const ClientOrganizationsRepository = {
  async fetchOrganizations(): Promise<ClientOrganization[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('client_organizations').select('*');
      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        legalName: row.legal_name,
        contactEmail: row.contact_email,
        ownerUserId: row.owner_user_id,
        brandIds: row.brand_ids || [],
        createdAt: row.created_at || new Date().toISOString().split('T')[0],
      }));
    } catch {
      return [];
    }
  },

  async createOrganization(org: ClientOrganization): Promise<ClientOrganization> {
    if (!isSupabaseConfigured) return org;

    const { error } = await supabase.from('client_organizations').insert({
      id: org.id,
      name: org.name,
      legal_name: org.legalName,
      contact_email: org.contactEmail,
      owner_user_id: org.ownerUserId,
      brand_ids: org.brandIds,
      created_at: org.createdAt,
    });
    if (error) console.error('Error inserting client organization in Supabase:', error);
    return org;
  },

  async fetchTeamMembers(orgId?: string) {
    if (!isSupabaseConfigured) return [];
    try {
      let query = supabase.from('client_team_members').select('*');
      if (orgId) {
        query = query.eq('organization_id', orgId);
      }
      const { data, error } = await query;
      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  },

  async updateMemberPermissions(memberId: string, permissionsMatrix: Record<string, ClientBrandPermission>) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from('client_team_members')
      .update({ permissions_matrix: permissionsMatrix })
      .eq('id', memberId);
    if (error) console.error('Error updating member permissions in Supabase:', error);
  },
};
