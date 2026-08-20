import React, { createContext, useContext, useState, useEffect } from 'react';
import { HardwareEquipment, EquipmentReservation, CollaboratorSchedule } from '../types';
import { INITIAL_EQUIPMENT, INITIAL_RESERVATIONS, INITIAL_USERS } from '../data/initialData';

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
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export const EquipmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [equipment, setEquipment] = useState<HardwareEquipment[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_equipment');
      return saved ? JSON.parse(saved) : INITIAL_EQUIPMENT;
    } catch {
      return INITIAL_EQUIPMENT;
    }
  });

  const [reservations, setReservations] = useState<EquipmentReservation[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_reservations');
      return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
    } catch {
      return INITIAL_RESERVATIONS;
    }
  });

  const [collaboratorSchedules, setCollaboratorSchedules] = useState<Record<string, CollaboratorSchedule>>(() => {
    try {
      const saved = localStorage.getItem('nataraja_schedules');
      if (saved) return JSON.parse(saved);
      const initial: Record<string, CollaboratorSchedule> = {};
      INITIAL_USERS.forEach((u) => {
        if (u.schedule) initial[u.id] = u.schedule;
      });
      return initial;
    } catch {
      return {};
    }
  });

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
    return newEq;
  };

  const updateEquipment = (id: string, updates: Partial<HardwareEquipment>) => {
    setEquipment((prev) => prev.map((eq) => (eq.id === id ? { ...eq, ...updates } : eq)));
  };

  const deleteEquipment = (id: string) => {
    setEquipment((prev) => prev.filter((eq) => eq.id !== id));
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
      (r) =>
        r.equipmentId === equipmentId &&
        r.status === 'confirmed' &&
        (!excludeReservationId || r.id !== excludeReservationId)
    );

    for (const res of activeReservations) {
      const resStart = new Date(res.startDate).getTime();
      const resEnd = new Date(res.endDate).getTime();

      if ((start >= resStart && start <= resEnd) || (end >= resStart && end <= resEnd) || (start <= resStart && end >= resEnd)) {
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
        error: 'Conflicto de reserva: El equipo ya está reservado del ' + collision.collidingWith?.startDate + ' al ' + collision.collidingWith?.endDate,
      };
    }

    const newRes: EquipmentReservation = {
      ...reservationData,
      id: 'res_' + Date.now(),
      status: 'confirmed',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setReservations((prev) => [...prev, newRes]);
    return { success: true };
  };

  const cancelEquipmentReservation = (reservationId: string) => {
    setReservations((prev) => prev.map((r) => (r.id === reservationId ? { ...r, status: 'cancelled' as const } : r)));
  };

  const updateCollaboratorSchedule = (userId: string, schedule: Partial<CollaboratorSchedule>) => {
    setCollaboratorSchedules((prev) => {
      const current = prev[userId] || {
        workDays: [1, 2, 3, 4, 5],
        startHour: '09:00',
        endHour: '18:00',
        isOnVacation: false,
        alertsEnabled: true,
      };
      return {
        ...prev,
        [userId]: { ...current, ...schedule },
      };
    });
  };

  const checkCollaboratorAvailability = (userId: string, dateStr?: string) => {
    const schedule = collaboratorSchedules[userId];
    if (!schedule) return { isAvailable: true };

    if (schedule.isOnVacation) {
      return { isAvailable: false, reason: 'En período de vacaciones' };
    }

    const date = dateStr ? new Date(dateStr) : new Date();
    const dayOfWeek = date.getDay();
    if (!schedule.workDays.includes(dayOfWeek)) {
      return { isAvailable: false, reason: 'Día no laboral según horario configurado' };
    }

    return { isAvailable: true };
  };

  return (
    <EquipmentContext.Provider
      value={{
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
      }}
    >
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
