import { useApp } from '../context/AppContext';
import { Campaign, CampaignKPI } from '../types';

export const useCampaigns = () => {
  const {
    campaigns,
    selectedCampaignId,
    setSelectedCampaignId,
    createCampaign,
    updateCampaign,
    deleteCampaign
  } = useApp();

  const calculateKPIs = (campaign: Campaign) => {
    // If ROAS = Revenue / AdSpend
    // CPA = AdSpend / Conversions
    // Completion = spentUSD / budgetUSD
    const completionPercentage = campaign.budgetUSD ? (campaign.spentUSD || 0) / campaign.budgetUSD * 100 : 0;
    return {
      completionPercentage: Math.min(completionPercentage, 100)
    };
  };

  return {
    campaigns,
    selectedCampaignId,
    setSelectedCampaignId,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    calculateKPIs
  };
};
