import React, { createContext, useContext, useState, useEffect } from 'react';
import { Brand, CommunicationTerritory, DigitalAsset } from '../types';
import { INITIAL_BRANDS, INITIAL_TERRITORIES, INITIAL_DIGITAL_ASSETS } from '../data/initialData';

export interface BrandsContextType {
  brands: Brand[];
  selectedBrandId: string;
  setSelectedBrandId: (id: string) => void;
  createBrand: (
    brand: Omit<Brand, 'id' | 'createdAt'>,
    initialTerritories?: Omit<CommunicationTerritory, 'id' | 'brandId'>[]
  ) => Brand;
  updateBrand: (id: string, brand: Partial<Brand>) => void;
  deleteBrand?: (id: string) => void;

  territories: CommunicationTerritory[];
  createTerritory: (territory: Omit<CommunicationTerritory, 'id'>) => { success: boolean; error?: string };
  updateTerritory: (id: string, territory: Partial<CommunicationTerritory>) => { success: boolean; error?: string };
  deleteTerritory: (id: string) => { success: boolean; error?: string };
  validateBrandTerritories: (brandId: string) => { isValid: boolean; activeCount: number; message: string };

  digitalAssets: DigitalAsset[];
  createDigitalAsset: (asset: Omit<DigitalAsset, 'id' | 'updatedAt'>) => void;
  updateDigitalAsset: (id: string, asset: Partial<DigitalAsset>) => void;
  deleteDigitalAsset: (id: string) => void;
}

const BrandsContext = createContext<BrandsContextType | undefined>(undefined);

export const BrandsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brands, setBrands] = useState<Brand[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_brands');
      return saved ? JSON.parse(saved) : INITIAL_BRANDS;
    } catch {
      return INITIAL_BRANDS;
    }
  });

  const [selectedBrandId, setSelectedBrandId] = useState<string>(() => brands[0]?.id || '');

  const [territories, setTerritories] = useState<CommunicationTerritory[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_territories');
      return saved ? JSON.parse(saved) : INITIAL_TERRITORIES;
    } catch {
      return INITIAL_TERRITORIES;
    }
  });

  const [digitalAssets, setDigitalAssets] = useState<DigitalAsset[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_digital_assets');
      return saved ? JSON.parse(saved) : INITIAL_DIGITAL_ASSETS;
    } catch {
      return INITIAL_DIGITAL_ASSETS;
    }
  });

  useEffect(() => {
    localStorage.setItem('nataraja_brands', JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem('nataraja_territories', JSON.stringify(territories));
  }, [territories]);

  useEffect(() => {
    localStorage.setItem('nataraja_digital_assets', JSON.stringify(digitalAssets));
  }, [digitalAssets]);

  const validateBrandTerritories = (brandId: string) => {
    const brandTerritories = territories.filter((t) => t.brandId === brandId && t.active);
    const isValid = brandTerritories.length >= 3;
    return {
      isValid,
      activeCount: brandTerritories.length,
      message: isValid
        ? 'Cumple con la regla de consistencia (≥3 territorios activos: ' + brandTerritories.length + ')'
        : 'Atención: Se requieren al menos 3 territorios de comunicación activos (actual: ' + brandTerritories.length + ')',
    };
  };

  const createBrand = (
    brandData: Omit<Brand, 'id' | 'createdAt'>,
    initialTerritoriesData?: Omit<CommunicationTerritory, 'id' | 'brandId'>[]
  ): Brand => {
    const newBrandId = 'brand_' + Date.now();
    const newBrand: Brand = {
      ...brandData,
      id: newBrandId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setBrands((prev) => [newBrand, ...prev]);

    if (initialTerritoriesData && initialTerritoriesData.length > 0) {
      const newTerritories: CommunicationTerritory[] = initialTerritoriesData.map((t, index) => ({
        ...t,
        id: 'terr_' + Date.now() + '_' + index,
        brandId: newBrandId,
      }));
      setTerritories((prev) => [...newTerritories, ...prev]);
    }

    return newBrand;
  };

  const updateBrand = (id: string, updates: Partial<Brand>) => {
    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBrand = (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    setTerritories((prev) => prev.filter((t) => t.brandId !== id));
  };

  const createTerritory = (territoryData: Omit<CommunicationTerritory, 'id'>) => {
    const newTerritory: CommunicationTerritory = {
      ...territoryData,
      id: 'terr_' + Date.now(),
    };
    setTerritories((prev) => [newTerritory, ...prev]);
    return { success: true };
  };

  const updateTerritory = (id: string, updates: Partial<CommunicationTerritory>) => {
    setTerritories((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    return { success: true };
  };

  const deleteTerritory = (id: string) => {
    const territory = territories.find((t) => t.id === id);
    if (territory) {
      const brandTerritories = territories.filter((t) => t.brandId === territory.brandId && t.active && t.id !== id);
      if (brandTerritories.length < 3) {
        return {
          success: false,
          error: 'No se puede eliminar: la marca debe mantener al menos 3 territorios de comunicación activos.',
        };
      }
    }
    setTerritories((prev) => prev.filter((t) => t.id !== id));
    return { success: true };
  };

  const createDigitalAsset = (assetData: Omit<DigitalAsset, 'id' | 'updatedAt'>) => {
    const newAsset: DigitalAsset = {
      ...assetData,
      id: 'asset_' + Date.now(),
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setDigitalAssets((prev) => [newAsset, ...prev]);
  };

  const updateDigitalAsset = (id: string, updates: Partial<DigitalAsset>) => {
    setDigitalAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : a))
    );
  };

  const deleteDigitalAsset = (id: string) => {
    setDigitalAssets((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <BrandsContext.Provider
      value={{
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
        digitalAssets,
        createDigitalAsset,
        updateDigitalAsset,
        deleteDigitalAsset,
      }}
    >
      {children}
    </BrandsContext.Provider>
  );
};

export const useBrandsContext = (): BrandsContextType => {
  const context = useContext(BrandsContext);
  if (!context) {
    throw new Error('useBrandsContext must be used within a BrandsProvider');
  }
  return context;
};
