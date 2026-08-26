import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Deliverable, DeliverablePhase, TechnicalGuide, ChangeRequest } from '../types';

// DB CHECK constraint mappers
function mapPhaseToDB(phase: DeliverablePhase): string {
  switch (phase) {
    case 'ideacion':
      return 'ideacion_co_creativa';
    case 'guia_tecnica':
      return 'guia_tecnica_av';
    case 'produccion':
      return 'en_rodaje';
    case 'calendarizacion':
    case 'post_produccion':
    case 'aprobacion_cliente':
    case 'publicado':
      return phase;
    case 'cancelado':
    default:
      return 'post_produccion';
  }
}

function mapPhaseFromDB(dbPhase: string): DeliverablePhase {
  switch (dbPhase) {
    case 'ideacion_co_creativa':
      return 'ideacion';
    case 'guia_tecnica_av':
      return 'guia_tecnica';
    case 'en_rodaje':
      return 'produccion';
    case 'calendarizacion':
    case 'post_produccion':
    case 'aprobacion_cliente':
    case 'publicado':
    case 'cancelado':
      return dbPhase as DeliverablePhase;
    default:
      return 'ideacion';
  }
}

function mapPriorityToDB(priority: string): string {
  switch (priority) {
    case 'low':
      return 'baja';
    case 'medium':
      return 'media';
    case 'high':
      return 'alta';
    case 'urgent':
      return 'urgente';
    case 'baja':
    case 'media':
    case 'alta':
    case 'urgente':
      return priority;
    default:
      return 'media';
  }
}

function mapPriorityFromDB(dbPriority: string): 'low' | 'medium' | 'high' | 'urgent' {
  switch (dbPriority) {
    case 'baja':
      return 'low';
    case 'media':
      return 'medium';
    case 'alta':
      return 'high';
    case 'urgente':
      return 'urgent';
    case 'low':
    case 'medium':
    case 'high':
    case 'urgent':
      return dbPriority;
    default:
      return 'medium';
  }
}

export const DeliverablesRepository = {
    async fetchDeliverables(): Promise<Deliverable[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('deliverables').select('*');
      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        code: row.code || 'CF-DEL-000',
        title: row.title,
        brandId: row.brand_id,
        territoryId: row.territory_id,
        campaignId: row.campaign_id,
        assigneeId: row.assignee_id,
        phase: mapPhaseFromDB(row.phase),
        deliverableType: row.process_type === 'graphic' ? 'graphic' : 'audiovisual',
        priority: mapPriorityFromDB(row.priority),
        format: row.format || '9:16 UHD',
        conceptHook: row.concept_hook,
        description: row.brief || row.description || '',
        productionStartDate: row.shooting_date || row.production_start_date || new Date().toISOString().split('T')[0],
        productionEndDate: row.production_end_date || row.shooting_date || new Date().toISOString().split('T')[0],
        publishDate: row.publish_date || new Date().toISOString().split('T')[0],
        equipmentReservedIds: row.equipment_reserved_ids || [],
        technicalGuide: row.tech_guide || row.technical_guide || {
          aspectRatios: ['9:16'],
          frameRate: '24fps',
          colorSpace: 'Rec.709',
          audioSpecs: 'Estéreo',
          lightingScheme: 'Natural / Prácticas',
          equipmentList: [],
          exportTargets: ['Reels', 'TikTok'],
          shotlist: [],
        },
        assetsLinked: row.assets_linked || [],
        changeRequests: row.change_requests || [],
        clientApproved: row.client_approved ?? false,
        directorApproved: row.director_approved ?? false,
        driveFolderId: row.drive_folder_id,
        driveFilesCount: row.drive_files_count || 0,
        firstDeliveryDriveUrl: row.first_delivery_drive_url,
        createdAt: row.created_at || new Date().toISOString().split('T')[0],
        updatedAt: row.updated_at || new Date().toISOString().split('T')[0],
      }));
    } catch {
      return [];
    }
  },

    async createDeliverable(deliverable: Deliverable): Promise<Deliverable> {
    if (!isSupabaseConfigured) return deliverable;

    const payload = {
      id: deliverable.id,
      code: deliverable.code || 'DEL-' + Date.now().toString().slice(-4),
      brand_id: deliverable.brandId,
      campaign_id: deliverable.campaignId || null,
      territory_id: deliverable.territoryId || null,
      title: deliverable.title,
      brief: deliverable.description || (deliverable as any).scriptText || '',
      format: deliverable.format || '16:9 4K',
      phase: mapPhaseToDB(deliverable.phase),
      priority: mapPriorityToDB(deliverable.priority),
      shooting_date: deliverable.productionStartDate || null,
      publish_date: deliverable.publishDate || null,
      process_type: deliverable.deliverableType === 'graphic' ? 'graphic' : 'audiovisual',
      tech_guide: deliverable.technicalGuide || {},
      change_requests: deliverable.changeRequests || [],
    };

    try {
      const { error } = await supabase.from('deliverables').insert(payload);
      if (error) console.warn('Supabase insert deliverable notice:', error.message);
    } catch (err) {
      console.warn('Supabase insert deliverable catch:', err);
    }
    return deliverable;
  },

  async updateDeliverable(deliverable: Deliverable): Promise<Deliverable> {
    if (!isSupabaseConfigured) return deliverable;

    const { error } = await supabase
      .from('deliverables')
      .update({
        code: deliverable.code,
        title: deliverable.title,
        brand_id: deliverable.brandId,
        territory_id: deliverable.territoryId,
        campaign_id: deliverable.campaignId,
        assignee_id: deliverable.assigneeId,
        phase: mapPhaseToDB(deliverable.phase),
        deliverable_type: deliverable.deliverableType,
        priority: mapPriorityToDB(deliverable.priority),
        format: deliverable.format,
        concept_hook: deliverable.conceptHook,
        description: deliverable.description,
        production_start_date: deliverable.productionStartDate,
        production_end_date: deliverable.productionEndDate,
        publish_date: deliverable.publishDate,
        equipment_reserved_ids: deliverable.equipmentReservedIds,
        technical_guide: deliverable.technicalGuide,
        assets_linked: deliverable.assetsLinked,
        change_requests: deliverable.changeRequests,
        client_approved: deliverable.clientApproved,
        director_approved: deliverable.directorApproved,
        drive_folder_id: deliverable.driveFolderId,
        drive_files_count: deliverable.driveFilesCount,
        first_delivery_drive_url: deliverable.firstDeliveryDriveUrl,
        updated_at: new Date().toISOString().split('T')[0],
      })
      .eq('id', deliverable.id);
    if (error) console.error('Error updating deliverable in Supabase:', error);
    return deliverable;
  },

  async updatePhase(id: string, phase: DeliverablePhase, extraUpdates?: Partial<Deliverable>) {
    if (!isSupabaseConfigured) return;
    const payload: any = {
      phase: mapPhaseToDB(phase),
      updated_at: new Date().toISOString().split('T')[0],
    };
    if (extraUpdates) {
      if (extraUpdates.firstDeliveryDriveUrl !== undefined) {
        payload.first_delivery_drive_url = extraUpdates.firstDeliveryDriveUrl;
      }
      if (extraUpdates.clientApproved !== undefined) {
        payload.client_approved = extraUpdates.clientApproved;
      }
      if (extraUpdates.directorApproved !== undefined) {
        payload.director_approved = extraUpdates.directorApproved;
      }
    }
    const { error } = await supabase.from('deliverables').update(payload).eq('id', id);
    if (error) console.error('Error updating phase in Supabase:', error);
  },

  async updateTechnicalGuide(id: string, technicalGuide: TechnicalGuide) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from('deliverables')
      .update({
        technical_guide: technicalGuide,
        updated_at: new Date().toISOString().split('T')[0],
      })
      .eq('id', id);
    if (error) console.error('Error updating technical guide in Supabase:', error);
  },

  async submitChangeRequest(id: string, changeRequest: ChangeRequest) {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase.from('deliverables').select('change_requests').eq('id', id).single();
    const existing = data?.change_requests || [];
    const { error } = await supabase
      .from('deliverables')
      .update({
        change_requests: [...existing, changeRequest],
        updated_at: new Date().toISOString().split('T')[0],
      })
      .eq('id', id);
    if (error) console.error('Error submitting change request in Supabase:', error);
  },

  async deleteDeliverable(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase.from('deliverables').delete().eq('id', id);
    return !error;
  },
};
