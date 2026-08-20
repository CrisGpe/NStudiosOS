import React, { createContext, useContext, useState, useEffect } from 'react';
import { Deliverable, DeliverablePhase, ChangeRequest, TechnicalGuide, DeliverableType } from '../types';
import { INITIAL_DELIVERABLES } from '../data/initialData';

export interface DeliverablesContextType {
  deliverables: Deliverable[];
  selectedDeliverable: Deliverable | null;
  setSelectedDeliverable: (d: Deliverable | null) => void;
  createDeliverable: (
    data: Partial<Deliverable> & { title: string; brandId: string; territoryId: string },
    customTechGuide?: TechnicalGuide
  ) => Deliverable;
  updateDeliverable: (id: string, updates: Partial<Deliverable>) => void;
  deleteDeliverable: (id: string) => void;
  moveDeliverablePhase: (id: string, direction: 'advance' | 'retreat' | DeliverablePhase) => void;
  updateTechnicalGuide: (deliverableId: string, guide: TechnicalGuide) => void;
  submitChangeRequest: (deliverableId: string, request: any) => void;
  respondToChangeRequest: (deliverableId: string, requestId: string, status: any, notes?: string) => void;
  createClientDeliverableProposal: (data: any) => Deliverable;
}

const DeliverablesContext = createContext<DeliverablesContextType | undefined>(undefined);

const PHASE_ORDER: DeliverablePhase[] = [
  'ideacion',
  'calendarizacion',
  'guia_tecnica',
  'produccion',
  'post_produccion',
  'aprobacion_cliente',
  'publicado',
];

export const DeliverablesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deliverables, setDeliverables] = useState<Deliverable[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_deliverables');
      return saved ? JSON.parse(saved) : INITIAL_DELIVERABLES;
    } catch {
      return INITIAL_DELIVERABLES;
    }
  });

  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);

  useEffect(() => {
    localStorage.setItem('nataraja_deliverables', JSON.stringify(deliverables));
  }, [deliverables]);

  const createDeliverable = (
    data: Partial<Deliverable> & { title: string; brandId: string; territoryId: string },
    customTechGuide?: TechnicalGuide
  ): Deliverable => {
    const nextNum = deliverables.length + 1;
    const code = 'CF-DEL-' + String(nextNum).padStart(3, '0');
    const newDel: Deliverable = {
      assigneeId: 'usr_director',
      phase: 'ideacion',
      priority: 'medium',
      format: '9:16 UHD',
      description: '',
      productionStartDate: new Date().toISOString().split('T')[0],
      productionEndDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      publishDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
      equipmentReservedIds: [],
      assetsLinked: [],
      changeRequests: [],
      clientApproved: false,
      directorApproved: false,
      ...data,
      id: data.id || 'del_' + Date.now(),
      code: data.code || code,
      createdAt: data.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      technicalGuide: data.technicalGuide || customTechGuide || {
        aspectRatios: ['9:16'],
        frameRate: '24fps',
        colorSpace: 'Rec.709',
        audioSpecs: 'Audio Stereo',
        lightingScheme: 'Esquema base',
        equipmentList: [],
        exportTargets: ['Social Reels'],
        shotlist: [],
      },
    };
    setDeliverables((prev) => [newDel, ...prev]);
    return newDel;
  };

  const updateDeliverable = (id: string, updates: Partial<Deliverable>) => {
    setDeliverables((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : d))
    );
  };

  const deleteDeliverable = (id: string) => {
    setDeliverables((prev) => prev.filter((d) => d.id !== id));
  };

  const moveDeliverablePhase = (id: string, directionOrPhase: 'advance' | 'retreat' | DeliverablePhase) => {
    setDeliverables((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        if (directionOrPhase !== 'advance' && directionOrPhase !== 'retreat') {
          return {
            ...d,
            phase: directionOrPhase,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        const currentIndex = PHASE_ORDER.indexOf(d.phase);
        if (currentIndex === -1) return d;
        const newIndex = directionOrPhase === 'advance' ? currentIndex + 1 : currentIndex - 1;
        if (newIndex < 0 || newIndex >= PHASE_ORDER.length) return d;
        return {
          ...d,
          phase: PHASE_ORDER[newIndex],
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const updateTechnicalGuide = (deliverableId: string, guide: TechnicalGuide) => {
    setDeliverables((prev) =>
      prev.map((d) => (d.id === deliverableId ? { ...d, technicalGuide: guide, updatedAt: new Date().toISOString().split('T')[0] } : d))
    );
  };

  const submitChangeRequest = (deliverableId: string, request: Omit<ChangeRequest, 'id' | 'requestedAt' | 'status'> & { reason?: string }) => {
    const newReq: ChangeRequest = {
      ...request,
      description: request.description || request.reason || '',
      id: 'req_' + Date.now(),
      requestedAt: new Date().toISOString().split('T')[0],
      status: 'submitted',
    };
    setDeliverables((prev) =>
      prev.map((d) =>
        d.id === deliverableId
          ? {
              ...d,
              changeRequests: [...(d.changeRequests || []), newReq],
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : d
      )
    );
  };

  const respondToChangeRequest = (
    deliverableId: string,
    requestId: string,
    status: 'approved' | 'rejected' | 'director_override',
    notes?: string
  ) => {
    setDeliverables((prev) =>
      prev.map((d) => {
        if (d.id !== deliverableId) return d;
        return {
          ...d,
          changeRequests: (d.changeRequests || []).map((r) =>
            r.id === requestId ? { ...r, status, directorNotes: notes || r.directorNotes } : r
          ),
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const createClientDeliverableProposal = (data: {
    title: string;
    brandId?: string;
    territoryId?: string;
    clientId?: string;
    preferredFormat?: string;
    format?: string;
    conceptSummary?: string;
    description?: string;
    conceptHook?: string;
    desiredPublishDate?: string;
    references?: string[];
    deliverableType?: DeliverableType;
  }): Deliverable => {
    const nextNum = deliverables.length + 1;
    const code = 'CF-PRO-' + String(nextNum).padStart(3, '0');
    const newProposal: Deliverable = {
      id: 'del_' + Date.now(),
      code,
      title: data.title,
      brandId: data.brandId || 'brand_lumina',
      territoryId: data.territoryId || 'terr_lumina_01',
      assigneeId: 'usr_director',
      phase: 'ideacion',
      priority: 'medium',
      productionStartDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      productionEndDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
      publishDate: data.desiredPublishDate || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      format: data.preferredFormat || data.format || '9:16 UHD',
      deliverableType: data.deliverableType || 'audiovisual',
      description: data.description || data.conceptSummary || '',
      conceptHook: data.conceptHook || data.title,
      equipmentReservedIds: [],
      assetsLinked: [],
      changeRequests: [],
      clientApproved: false,
      directorApproved: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      technicalGuide: {
        aspectRatios: ['9:16'],
        frameRate: '24fps',
        colorSpace: 'Rec.709',
        audioSpecs: 'Audio estéreo',
        lightingScheme: 'Esquema propuesto por cliente',
        equipmentList: [],
        exportTargets: ['Reels / TikTok'],
        shotlist: [],
      },
    };
    setDeliverables((prev) => [newProposal, ...prev]);
    return newProposal;
  };

  return (
    <DeliverablesContext.Provider
      value={{
        deliverables,
        selectedDeliverable,
        setSelectedDeliverable,
        createDeliverable,
        updateDeliverable,
        deleteDeliverable,
        moveDeliverablePhase,
        updateTechnicalGuide,
        submitChangeRequest,
        respondToChangeRequest,
        createClientDeliverableProposal,
      }}
    >
      {children}
    </DeliverablesContext.Provider>
  );
};

export const useDeliverablesContext = (): DeliverablesContextType => {
  const context = useContext(DeliverablesContext);
  if (!context) {
    throw new Error('useDeliverablesContext must be used within a DeliverablesProvider');
  }
  return context;
};
