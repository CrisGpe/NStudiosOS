import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Campaign, CampaignType, CampaignStatus } from '../types';

export const CampaignsRepository = {
    async fetchCampaigns(): Promise<Campaign[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('campaigns').select('*');
      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        code: row.code || 'CMP-000',
        brandId: row.brand_id,
        name: row.name,
        description: row.description || '',
        objective: row.objective || '',
        campaignType: (row.type as CampaignType) || (row.campaign_type as CampaignType) || 'performance_paid_ads',
        startDate: row.start_date || new Date().toISOString().split('T')[0],
        endDate: row.end_date || new Date().toISOString().split('T')[0],
        budgetUSD: row.budget_cents ? Math.round(Number(row.budget_cents) / 100) : (Number(row.budget_usd || row.total_budget_usd) || 0),
        spentUSD: row.spent_cents ? Math.round(Number(row.spent_cents) / 100) : (Number(row.spent_usd) || 0),
        productionBudgetUSD: Number(row.production_budget_usd) || 0,
        adSpendUSD: Number(row.ad_spend_usd) || 0,
        targetROAS: Number(row.target_roas) || 0,
        targetCPAUSD: Number(row.target_cpa_usd) || 0,
        adChannels: row.ad_channels || row.selected_channels || [],
        status: (row.status as CampaignStatus) || 'planning',
        deliverableIds: row.deliverable_ids || [],
        kpis: row.kpis || [],
        driveFolderId: row.drive_folder_id,
        createdAt: row.created_at || new Date().toISOString().split('T')[0],
        updatedAt: row.updated_at || new Date().toISOString().split('T')[0],
      }));
    } catch {
      return [];
    }
  },

    async createCampaign(campaign: Campaign): Promise<Campaign> {
    if (!isSupabaseConfigured) return campaign;

    try {
      const { error } = await supabase.from('campaigns').insert({
        id: campaign.id,
        brand_id: campaign.brandId,
        name: campaign.name,
        type: campaign.campaignType || 'branding',
        status: campaign.status || 'planning',
        start_date: campaign.startDate,
        end_date: campaign.endDate,
        budget_cents: (campaign.budgetUSD || 0) * 100,
        spent_cents: (campaign.spentUSD || 0) * 100,
        kpis: campaign.kpis || [],
      });
      if (error) console.warn('Supabase insert campaign notice:', error.message);
    } catch (err) {
      console.warn('Supabase insert campaign catch:', err);
    }
    return campaign;
  },

  async updateCampaign(campaign: Campaign): Promise<Campaign> {
    if (!isSupabaseConfigured) return campaign;

    const { error } = await supabase
      .from('campaigns')
      .update({
        code: campaign.code,
        brand_id: campaign.brandId,
        name: campaign.name,
        description: campaign.description,
        objective: campaign.objective,
        campaign_type: campaign.campaignType,
        start_date: campaign.startDate,
        end_date: campaign.endDate,
        budget_usd: campaign.budgetUSD,
        spent_usd: campaign.spentUSD,
        production_budget_usd: campaign.productionBudgetUSD,
        ad_spend_usd: campaign.adSpendUSD,
        target_roas: campaign.targetROAS,
        target_cpa_usd: campaign.targetCPAUSD,
        ad_channels: campaign.adChannels,
        status: campaign.status,
        deliverable_ids: campaign.deliverableIds,
        kpis: campaign.kpis,
        drive_folder_id: campaign.driveFolderId,
        updated_at: new Date().toISOString().split('T')[0],
      })
      .eq('id', campaign.id);
    if (error) console.error('Error updating campaign in Supabase:', error);
    return campaign;
  },

  async deleteCampaign(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    return !error;
  },
};
