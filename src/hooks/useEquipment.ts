import { useApp } from '../context/AppContext';
import { EquipmentCategory } from '../types';

export const useEquipment = () => {
  const {
    equipment,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    reservations,
    checkEquipmentCollision,
    createEquipmentReservation,
    cancelEquipmentReservation
  } = useApp();

  const getEquipmentByCategory = (category: EquipmentCategory) => {
    return equipment.filter(eq => eq.category === category);
  };

  return {
    equipment,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    reservations,
    checkEquipmentCollision,
    createEquipmentReservation,
    cancelEquipmentReservation,
    getEquipmentByCategory
  };
};
