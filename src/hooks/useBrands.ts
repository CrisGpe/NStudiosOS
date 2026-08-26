import { useApp } from '../context/AppContext';

export const useBrands = () => {
  const {
    brands,
    selectedBrandId,
    setSelectedBrandId,
    createBrand,
    updateBrand,
    deleteBrand,
    territories,
    createTerritory,
    updateTerritory,
    deleteTerritory,
    validateBrandTerritories
  } = useApp();

  const getActiveTerritories = (brandId: string) => {
    return territories.filter(t => t.brandId === brandId && t.active);
  };

  return {
    brands,
    selectedBrandId,
    setSelectedBrandId,
    createBrand,
    updateBrand,
    deleteBrand,
    territories,
    createTerritory,
    updateTerritory,
    deleteTerritory,
    validateBrandTerritories,
    getActiveTerritories,
  };
};
