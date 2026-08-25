import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { ClientIdeaSandboxItem } from '../types';

export const ClientSandboxRepository = {
  async fetchIdeas(): Promise<ClientIdeaSandboxItem[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('client_sandbox_ideas').select('*');
      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        brandId: row.brand_id,
        title: row.title,
        notes: row.notes || row.description || '',
        referenceUrls: row.reference_urls || row.inspiration_links || [],
        targetTerritoryId: row.target_territory_id,
        formatSuggested: row.format_suggested || row.target_format,
        captureType: row.capture_type,
        sourcePlatform: row.source_platform,
        attachmentUrl: row.attachment_url,
        audioDurationSeconds: row.audio_duration_seconds,
        status: row.status || 'draft',
        convertedDeliverableId: row.converted_deliverable_id || row.converted_to_deliverable_id,
        aiGeneratedBrief: row.ai_generated_brief,
        createdAt: row.created_at || new Date().toISOString().split('T')[0],
        updatedAt: row.updated_at || new Date().toISOString().split('T')[0],
      }));
    } catch {
      return [];
    }
  },

  async createIdea(idea: ClientIdeaSandboxItem): Promise<ClientIdeaSandboxItem> {
    if (!isSupabaseConfigured) return idea;

    const { error } = await supabase.from('client_sandbox_ideas').insert({
      id: idea.id,
      brand_id: idea.brandId,
      title: idea.title,
      notes: idea.notes,
      reference_urls: idea.referenceUrls,
      target_territory_id: idea.targetTerritoryId,
      format_suggested: idea.formatSuggested,
      capture_type: idea.captureType,
      source_platform: idea.sourcePlatform,
      attachment_url: idea.attachmentUrl,
      audio_duration_seconds: idea.audioDurationSeconds,
      status: idea.status,
      converted_deliverable_id: idea.convertedDeliverableId,
      ai_generated_brief: idea.aiGeneratedBrief,
      created_at: idea.createdAt,
      updated_at: idea.updatedAt,
    });
    if (error) console.error('Error inserting sandbox idea in Supabase:', error);
    return idea;
  },

  async updateIdea(idea: ClientIdeaSandboxItem): Promise<ClientIdeaSandboxItem> {
    if (!isSupabaseConfigured) return idea;

    const { error } = await supabase
      .from('client_sandbox_ideas')
      .update({
        brand_id: idea.brandId,
        title: idea.title,
        notes: idea.notes,
        reference_urls: idea.referenceUrls,
        target_territory_id: idea.targetTerritoryId,
        format_suggested: idea.formatSuggested,
        capture_type: idea.captureType,
        source_platform: idea.sourcePlatform,
        attachment_url: idea.attachmentUrl,
        audio_duration_seconds: idea.audioDurationSeconds,
        status: idea.status,
        converted_deliverable_id: idea.convertedDeliverableId,
        ai_generated_brief: idea.aiGeneratedBrief,
        updated_at: new Date().toISOString().split('T')[0],
      })
      .eq('id', idea.id);
    if (error) console.error('Error updating sandbox idea in Supabase:', error);
    return idea;
  },

  async deleteIdea(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase.from('client_sandbox_ideas').delete().eq('id', id);
    return !error;
  },
};
