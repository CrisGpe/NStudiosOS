import { useApp } from '../context/AppContext';

export const useDeliverables = () => {
  const {
    deliverables,
    selectedDeliverable,
    setSelectedDeliverable,
    createDeliverable,
    updateDeliverable,
    moveDeliverablePhase,
    updateTechnicalGuide,
    submitChangeRequest,
    respondToChangeRequest,
    deliverableTypeFilter,
    selectedClientFilter
  } = useApp();

  const filteredDeliverables = deliverables.filter(d => {
    const dType = d.deliverableType || 'audiovisual';
    if (deliverableTypeFilter !== 'all' && dType !== deliverableTypeFilter) return false;
    if (selectedClientFilter !== 'all' && d.brandId !== selectedClientFilter) return false;
    return true;
  });

  return {
    deliverables: filteredDeliverables,
    allDeliverables: deliverables,
    selectedDeliverable,
    setSelectedDeliverable,
    createDeliverable,
    updateDeliverable,
    moveDeliverablePhase,
    updateTechnicalGuide,
    submitChangeRequest,
    respondToChangeRequest,
  };
};
