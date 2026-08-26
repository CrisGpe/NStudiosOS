import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { HardwareEquipment, EquipmentReservation, EquipmentCategory, EquipmentStatus } from '../types';

export const EquipmentRepository = {
  // EQUIPMENT
    async fetchEquipment(): Promise<HardwareEquipment[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('hardware_equipment').select('*');
      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        category: row.category as EquipmentCategory,
        model: row.model || row.name,
        serialNumber: row.serial_number,
        status: row.status as EquipmentStatus,
        specs: row.specs || {},
        dailyRateUSD: row.daily_rate_cents ? Math.round(Number(row.daily_rate_cents) / 100) : (Number(row.daily_rate_usd) || 0),
        image: row.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
        currentReservationId: row.current_reservation_id,
      }));
    } catch {
      return [];
    }
  },

    async createEquipment(item: HardwareEquipment): Promise<HardwareEquipment> {
    if (!isSupabaseConfigured) return item;

    try {
      const { error } = await supabase.from('hardware_equipment').insert({
        id: item.id,
        name: item.name,
        category: item.category,
        status: item.status,
        serial_number: item.serialNumber,
        daily_rate_cents: (item.dailyRateUSD || 0) * 100,
      });
      if (error) console.warn('Supabase insert equipment notice:', error.message);
    } catch (err) {
      console.warn('Supabase insert equipment catch:', err);
    }
    return item;
  },

  async updateEquipment(item: HardwareEquipment): Promise<HardwareEquipment> {
    if (!isSupabaseConfigured) return item;

    const { error } = await supabase
      .from('hardware_equipment')
      .update({
        name: item.name,
        category: item.category,
        model: item.model,
        serial_number: item.serialNumber,
        status: item.status,
        specs: item.specs,
        daily_rate_usd: item.dailyRateUSD,
        image: item.image,
        current_reservation_id: item.currentReservationId,
      })
      .eq('id', item.id);
    if (error) console.error('Error updating hardware equipment in Supabase:', error);
    return item;
  },

  async deleteEquipment(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase.from('hardware_equipment').delete().eq('id', id);
    return !error;
  },

  // RESERVATIONS
  async fetchReservations(): Promise<EquipmentReservation[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('equipment_reservations').select('*');
      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        equipmentId: row.equipment_id,
        deliverableId: row.deliverable_id,
        deliverableTitle: row.deliverable_title,
        brandName: row.brand_name,
        startDate: row.start_date,
        endDate: row.end_date,
        reservedById: row.reserved_by_id,
        reservedByName: row.reserved_by_name,
        status: row.status || 'confirmed',
        notes: row.notes,
        createdAt: row.created_at || new Date().toISOString().split('T')[0],
      }));
    } catch {
      return [];
    }
  },

  async createReservation(res: EquipmentReservation): Promise<EquipmentReservation> {
    if (!isSupabaseConfigured) return res;

    const { error } = await supabase.from('equipment_reservations').insert({
      id: res.id,
      equipment_id: res.equipmentId,
      deliverable_id: res.deliverableId,
      deliverable_title: res.deliverableTitle,
      brand_name: res.brandName,
      start_date: res.startDate,
      end_date: res.endDate,
      reserved_by_id: res.reservedById,
      reserved_by_name: res.reservedByName,
      status: res.status,
      notes: res.notes,
      created_at: res.createdAt,
    });
    if (error) console.error('Error inserting equipment reservation in Supabase:', error);
    return res;
  },

  async cancelReservation(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    const { error } = await supabase
      .from('equipment_reservations')
      .update({ status: 'cancelled' })
      .eq('id', id);
    return !error;
  },
};
