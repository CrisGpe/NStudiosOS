import React, { createContext, useContext, useState, useEffect } from 'react';
import { Campaign } from '../types';
import { CampaignsRepository } from '../repositories/campaigns.repository';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export interface CampaignsContextType {
  campaigns: Campaign[];
  selectedCampaignId: string;
  setSelectedCampaignId: (id: string) => void;
  createCampaign: (campaign: Omit<Campaign, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => Campaign;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  refreshCampaignsFromSupabase: () => Promise<void>;
}

const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined);

export const CampaignsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_campaigns');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');

  const refreshCampaignsFromSupabase = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const dbCamp = await CampaignsRepository.fetchCampaigns();
      setCampaigns(dbCamp || []);
    } catch (err) {
      console.warn('Could not sync campaigns with Supabase:', err);
    }
  };

  useEffect(() => {
    refreshCampaignsFromSupabase();
  }, []);

  useEffect(() => {
    localStorage.setItem('nataraja_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  const createCampaign = (campaignData: Omit<Campaign, 'id' | 'code' | 'createdAt' | 'updatedAt'>): Campaign => {
    const nextNum = campaigns.length + 1;
    const code = 'CMP-' + String(nextNum).padStart(3, '0');
    const newCamp: Campaign = {
      ...campaignData,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? 'camp_' + crypto.randomUUID().slice(0, 8) : 'camp_' + Date.now(),
      code,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setCampaigns((prev) => [newCamp, ...prev]);
    CampaignsRepository.createCampaign(newCamp).catch((err) => console.warn('Supabase createCampaign error:', err));
    return newCamp;
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : c));
      const updated = next.find((c) => c.id === id);
      if (updated) {
        CampaignsRepository.updateCampaign(updated).catch((err) => console.warn('Supabase updateCampaign error:', err));
      }
      return next;
    });
  };

  const deleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    CampaignsRepository.deleteCampaign(id).catch((err) => console.warn('Supabase deleteCampaign error:', err));
  };

  const contextValue = React.useMemo(
    () => ({
      campaigns,
      selectedCampaignId,
      setSelectedCampaignId,
      createCampaign,
      updateCampaign,
      deleteCampaign,
      refreshCampaignsFromSupabase,
    }),
    [campaigns, selectedCampaignId]
  );

  return (
    <CampaignsContext.Provider value={contextValue}>
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
