import React, { createContext, useContext, useState, useEffect } from 'react';
import { Campaign } from '../types';
import { INITIAL_CAMPAIGNS } from '../data/initialData';

export interface CampaignsContextType {
  campaigns: Campaign[];
  selectedCampaignId: string;
  setSelectedCampaignId: (id: string) => void;
  createCampaign: (campaign: Omit<Campaign, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => Campaign;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
}

const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined);

export const CampaignsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_campaigns');
      return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  });

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');

  useEffect(() => {
    localStorage.setItem('nataraja_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  const createCampaign = (campaignData: Omit<Campaign, 'id' | 'code' | 'createdAt' | 'updatedAt'>): Campaign => {
    const nextNum = campaigns.length + 1;
    const code = 'CMP-' + String(nextNum).padStart(3, '0');
    const newCamp: Campaign = {
      ...campaignData,
      id: 'camp_' + Date.now(),
      code,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setCampaigns((prev) => [newCamp, ...prev]);
    return newCamp;
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : c))
    );
  };

  const deleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <CampaignsContext.Provider
      value={{
        campaigns,
        selectedCampaignId,
        setSelectedCampaignId,
        createCampaign,
        updateCampaign,
        deleteCampaign,
      }}
    >
      {children}
    </CampaignsContext.Provider>
  );
};

export const useCampaignsContext = (): CampaignsContextType => {
  const context = useContext(CampaignsContext);
  if (!context) {
    throw new Error('useCampaignsContext must be used within a CampaignsProvider');
  }
  return context;
};
