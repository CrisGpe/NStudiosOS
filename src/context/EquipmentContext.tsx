import React, { createContext, useContext, useState, useEffect } from 'react';
import { HardwareEquipment, EquipmentReservation, CollaboratorSchedule } from '../types';
import { EquipmentRepository } from '../repositories/equipment.repository';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export interface EquipmentContextType {
  equipment: HardwareEquipment[];
  createEquipment: (eq: Omit<HardwareEquipment, 'id'>) => HardwareEquipment;
  updateEquipment: (id: string, updates: Partial<HardwareEquipment>) => void;
  deleteEquipment: (id: string) => void;
  reservations: EquipmentReservation[];
  checkEquipmentCollision: (
    equipmentId: string,
    startDate: string,
    endDate: string,
    excludeReservationId?: string
  ) => { hasCollision: boolean; collidingWith?: EquipmentReservation };
  createEquipmentReservation: (
    reservation: Omit<EquipmentReservation, 'id' | 'createdAt' | 'status'>
  ) => { success: boolean; error?: string };
  cancelEquipmentReservation: (reservationId: string) => void;

  collaboratorSchedules: Record<string, CollaboratorSchedule>;
  updateCollaboratorSchedule: (userId: string, schedule: Partial<CollaboratorSchedule>) => void;
  checkCollaboratorAvailability: (userId: string, date?: string) => { isAvailable: boolean; reason?: string };
  refreshEquipmentFromSupabase: () => Promise<void>;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export const EquipmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [equipment, setEquipment] = useState<HardwareEquipment[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_equipment');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [reservations, setReservations] = useState<EquipmentReservation[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_reservations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [collaboratorSchedules, setCollaboratorSchedules] = useState<Record<string, CollaboratorSchedule>>(() => {
    try {
      const saved = localStorage.getItem('nataraja_schedules');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const refreshEquipmentFromSupabase = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const [dbEq, dbRes] = await Promise.all([
        EquipmentRepository.fetchEquipment(),
        EquipmentRepository.fetchReservations(),
      ]);
      setEquipment(dbEq || []);
      setReservations(dbRes || []);
    } catch (err) {
      console.warn('Could not sync equipment with Supabase:', err);
    }
  };

  useEffect(() => {
    refreshEquipmentFromSupabase();
  }, []);

  useEffect(() => {
    localStorage.setItem('nataraja_equipment', JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem('nataraja_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('nataraja_schedules', JSON.stringify(collaboratorSchedules));
  }, [collaboratorSchedules]);

  const createEquipment = (eqData: Omit<HardwareEquipment, 'id'>): HardwareEquipment => {
    const newEq: HardwareEquipment = {
      ...eqData,
      id: 'eq_' + Date.now(),
    };
    setEquipment((prev) => [...prev, newEq]);
    EquipmentRepository.createEquipment(newEq).catch((err) => console.warn('Supabase createEquipment sync error:', err));
    return newEq;
  };

  const updateEquipment = (id: string, updates: Partial<HardwareEquipment>) => {
    setEquipment((prev) => {
      const next = prev.map((eq) => (eq.id === id ? { ...eq, ...updates } : eq));
      const updated = next.find((eq) => eq.id === id);
      if (updated) {
        EquipmentRepository.updateEquipment(updated).catch((err) => console.warn('Supabase updateEquipment error:', err));
      }
      return next;
    });
  };

  const deleteEquipment = (id: string) => {
    setEquipment((prev) => prev.filter((eq) => eq.id !== id));
    EquipmentRepository.deleteEquipment(id).catch((err) => console.warn('Supabase deleteEquipment error:', err));
  };

  const checkEquipmentCollision = (
    equipmentId: string,
    startDate: string,
    endDate: string,
    excludeReservationId?: string
  ) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const activeReservations = reservations.filter(
      (r) => r.equipmentId === equipmentId && r.status === 'confirmed' && r.id !== excludeReservationId
    );

    for (const res of activeReservations) {
      const resStart = new Date(res.startDate).getTime();
      const resEnd = new Date(res.endDate).getTime();
      if (Math.max(start, resStart) <= Math.min(end, resEnd)) {
        return { hasCollision: true, collidingWith: res };
      }
    }
    return { hasCollision: false };
  };

  const createEquipmentReservation = (
    reservationData: Omit<EquipmentReservation, 'id' | 'createdAt' | 'status'>
  ) => {
    const collision = checkEquipmentCollision(
      reservationData.equipmentId,
      reservationData.startDate,
      reservationData.endDate
    );

    if (collision.hasCollision) {
      return {
        success: false,
        error: `Conflicto de reserva: Este equipo ya está asignado a "${collision.collidingWith?.deliverableTitle}" del ${collision.collidingWith?.startDate} al ${collision.collidingWith?.endDate}.`,
      };
    }

    const newRes: EquipmentReservation = {
      ...reservationData,
      id: 'res_' + Date.now(),
      status: 'confirmed',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setReservations((prev) => [...prev, newRes]);
    EquipmentRepository.createReservation(newRes).catch((err) => console.warn('Supabase createReservation sync error:', err));
    return { success: true };
  };

  const cancelEquipmentReservation = (reservationId: string) => {
    setReservations((prev) => prev.map((r) => (r.id === reservationId ? { ...r, status: 'cancelled' } : r)));
    EquipmentRepository.cancelReservation(reservationId).catch((err) => console.warn('Supabase cancelReservation error:', err));
  };

  const updateCollaboratorSchedule = (userId: string, scheduleUpdates: Partial<CollaboratorSchedule>) => {
    setCollaboratorSchedules((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {
          workDays: [1, 2, 3, 4, 5],
          startHour: '09:00',
          endHour: '19:00',
          isOnVacation: false,
          alertsEnabled: true,
        }),
        ...scheduleUpdates,
      },
    }));
  };

  const checkCollaboratorAvailability = (userId: string, targetDateStr?: string) => {
    const sched = collaboratorSchedules[userId];
    if (!sched) return { isAvailable: true };

    if (sched.isOnVacation) {
      return {
        isAvailable: false,
        reason: `En período de vacaciones (${sched.vacationNotes || 'Autorizado por Dirección'})`,
      };
    }

    const checkDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const dayOfWeek = checkDate.getDay();

    if (!sched.workDays.includes(dayOfWeek)) {
      return {
        isAvailable: false,
        reason: 'Fuera de jornada laboral programada para este día.',
      };
    }

    return { isAvailable: true };
  };

  const contextValue = React.useMemo(
    () => ({
      equipment,
      createEquipment,
      updateEquipment,
      deleteEquipment,
      reservations,
      checkEquipmentCollision,
      createEquipmentReservation,
      cancelEquipmentReservation,
      collaboratorSchedules,
      updateCollaboratorSchedule,
      checkCollaboratorAvailability,
      refreshEquipmentFromSupabase,
    }),
    [equipment, reservations, collaboratorSchedules]
  );

  return (
    <EquipmentContext.Provider value={contextValue}>
      {children}
    </EquipmentContext.Provider>
  );
};

export const useEquipmentContext = (): EquipmentContextType => {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error('useEquipmentContext must be used within an EquipmentProvider');
  }
  return context;
};
