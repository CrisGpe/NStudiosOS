import React, { createContext, useContext, useState, useEffect } from 'react';
import { Brand, CommunicationTerritory, DigitalAsset, ClientOrganization, ClientBrandPermission } from '../types';
import { INITIAL_BRANDS, INITIAL_TERRITORIES, INITIAL_DIGITAL_ASSETS } from '../data/initialData';
import { brandService, clientOrgService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export interface BrandsContextType {
  brands: Brand[];
  selectedBrandId: string;
  setSelectedBrandId: (id: string) => void;
  createBrand: (
    brand: Omit<Brand, 'id' | 'createdAt'>,
    initialTerritories?: Omit<CommunicationTerritory, 'id' | 'brandId'>[]
  ) => Promise<Brand>;
  updateBrand: (id: string, brand: Partial<Brand>) => void;
  deleteBrand?: (id: string) => void;

  // Organizations (Holdings)
  organizations: ClientOrganization[];
  createOrganization: (org: Partial<ClientOrganization>) => Promise<ClientOrganization>;
  syncBrandContacts: () => Promise<{ syncedCount: number; orgsCreated: number }>;
  inviteClientTeamMember: (params: {
    orgId: string;
    email: string;
    name: string;
    tempPassword?: string;
    roleTitle?: string;
    permissionsMatrix: Record<string, ClientBrandPermission>;
  }) => Promise<any>;
  updateMemberPermissions: (userId: string, matrix: Record<string, ClientBrandPermission>) => Promise<void>;
  refreshOrganizationsFromSupabase: () => Promise<void>;

  territories: CommunicationTerritory[];
  createTerritory: (territory: Omit<CommunicationTerritory, 'id'>) => { success: boolean; error?: string };
  updateTerritory: (id: string, territory: Partial<CommunicationTerritory>) => { success: boolean; error?: string };
  deleteTerritory: (id: string) => { success: boolean; error?: string };
  validateBrandTerritories: (brandId: string) => { isValid: boolean; activeCount: number; message: string };

  digitalAssets: DigitalAsset[];
  createDigitalAsset: (asset: Omit<DigitalAsset, 'id' | 'updatedAt'>) => void;
  updateDigitalAsset: (id: string, asset: Partial<DigitalAsset>) => void;
  deleteDigitalAsset: (id: string) => void;
  refreshBrandsFromSupabase: () => Promise<void>;
}

const BrandsContext = createContext<BrandsContextType | undefined>(undefined);

export const BrandsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brands, setBrands] = useState<Brand[]>(() => {
    if (isSupabaseConfigured) return [];
    try {
      const saved = localStorage.getItem('nataraja_brands');
      return saved ? JSON.parse(saved) : INITIAL_BRANDS;
    } catch {
      return INITIAL_BRANDS;
    }
  });

  const [selectedBrandId, setSelectedBrandId] = useState<string>('');

  const [territories, setTerritories] = useState<CommunicationTerritory[]>(() => {
    if (isSupabaseConfigured) return [];
    try {
      const saved = localStorage.getItem('nataraja_territories');
      return saved ? JSON.parse(saved) : INITIAL_TERRITORIES;
    } catch {
      return INITIAL_TERRITORIES;
    }
  });

  const [digitalAssets, setDigitalAssets] = useState<DigitalAsset[]>(() => {
    if (isSupabaseConfigured) return [];
    try {
      const saved = localStorage.getItem('nataraja_digital_assets');
      return saved ? JSON.parse(saved) : INITIAL_DIGITAL_ASSETS;
    } catch {
      return INITIAL_DIGITAL_ASSETS;
    }
  });

  const [organizations, setOrganizations] = useState<ClientOrganization[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_client_orgs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const refreshOrganizationsFromSupabase = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const dbOrgs = await clientOrgService.fetchOrganizations();
      if (dbOrgs && dbOrgs.length > 0) {
        setOrganizations(dbOrgs);
      }
    } catch (err) {
      console.warn('Could not sync client organizations with Supabase:', err);
    }
  };

  const refreshBrandsFromSupabase = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const [dbBrands, dbTerritories, dbOrgs, dbAssets] = await Promise.all([
        brandService.fetchBrands(),
        brandService.fetchTerritories(),
        clientOrgService.fetchOrganizations(),
        brandService.fetchDigitalAssets(),
      ]);
      setBrands(dbBrands || []);
      if (dbBrands && dbBrands.length > 0) {
        if (!selectedBrandId || !dbBrands.some((b) => b.id === selectedBrandId)) {
          setSelectedBrandId(dbBrands[0].id);
        }
      } else {
        setSelectedBrandId('');
      }
      setTerritories(dbTerritories || []);
      if (dbOrgs && dbOrgs.length > 0) {
        setOrganizations(dbOrgs);
      }
      if (dbAssets && dbAssets.length > 0) {
        setDigitalAssets(dbAssets);
      }
    } catch (err) {
      console.warn('Could not sync brands with Supabase:', err);
    }
  };

  useEffect(() => {
    refreshBrandsFromSupabase();
  }, []);

  useEffect(() => {
    localStorage.setItem('nataraja_client_orgs', JSON.stringify(organizations));
  }, [organizations]);

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

  const createBrand = async (
    brandData: Omit<Brand, 'id' | 'createdAt'>,
    initialTerritoriesData?: Omit<CommunicationTerritory, 'id' | 'brandId'>[]
  ): Promise<Brand> => {
    const newBrandId = 'brand_' + Date.now();
    const newBrand: Brand = {
      ...brandData,
      id: newBrandId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setBrands((prev) => [newBrand, ...prev]);

    try {
      await brandService.createBrand(newBrand);
    } catch (err) {
      console.warn('Supabase createBrand sync error:', err);
    }

    if (initialTerritoriesData && initialTerritoriesData.length > 0) {
      const newTerritories: CommunicationTerritory[] = initialTerritoriesData.map((t, index) => ({
        ...t,
        id: 'terr_' + Date.now() + '_' + index,
        brandId: newBrandId,
      }));
      setTerritories((prev) => [...newTerritories, ...prev]);
      for (const t of newTerritories) {
        try {
          await brandService.createTerritory(t);
        } catch (err) {
          console.warn('Supabase createTerritory sync error:', err);
        }
      }
    }

    return newBrand;
  };

  const updateBrand = (id: string, updates: Partial<Brand>) => {
    setBrands((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, ...updates } : b));
      const updated = next.find((b) => b.id === id);
      if (updated) {
        brandService.updateBrand(updated).catch((err) => console.warn('Supabase updateBrand sync error:', err));
      }
      return next;
    });
  };

  const deleteBrand = (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    setTerritories((prev) => prev.filter((t) => t.brandId !== id));
    brandService.deleteBrand(id).catch((err) => console.warn('Supabase deleteBrand sync error:', err));
  };

  const createTerritory = (territoryData: Omit<CommunicationTerritory, 'id'>) => {
    const newTerritory: CommunicationTerritory = {
      ...territoryData,
      id: 'terr_' + Date.now(),
    };
    setTerritories((prev) => [newTerritory, ...prev]);
    brandService.createTerritory(newTerritory).catch((err) => console.warn('Supabase createTerritory sync error:', err));
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
    brandService.createDigitalAsset(newAsset).catch((err) => console.warn('Supabase createDigitalAsset sync error:', err));
  };

  const updateDigitalAsset = (id: string, updates: Partial<DigitalAsset>) => {
    setDigitalAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : a))
    );
  };

  const deleteDigitalAsset = (id: string) => {
    setDigitalAssets((prev) => prev.filter((a) => a.id !== id));
    brandService.deleteDigitalAsset(id).catch((err) => console.warn('Supabase deleteDigitalAsset sync error:', err));
  };

  const createOrganization = async (orgData: Partial<ClientOrganization>): Promise<ClientOrganization> => {
    const created = await clientOrgService.createOrganization(orgData);
    setOrganizations((prev) => {
      const exists = prev.some((o) => o.id === created.id);
      return exists ? prev.map((o) => (o.id === created.id ? created : o)) : [...prev, created];
    });
    return created;
  };

  const syncBrandContacts = async (): Promise<{ syncedCount: number; orgsCreated: number }> => {
    const res = await clientOrgService.syncBrandContactsToAuth(brands);
    await refreshBrandsFromSupabase();
    return res;
  };

  const inviteClientTeamMember = async (params: {
    orgId: string;
    email: string;
    name: string;
    tempPassword?: string;
    roleTitle?: string;
    permissionsMatrix: Record<string, ClientBrandPermission>;
  }) => {
    const res = await clientOrgService.inviteClientTeamMember(params);
    return res;
  };

  const updateMemberPermissions = async (
    userId: string,
    matrix: Record<string, ClientBrandPermission>
  ) => {
    await clientOrgService.updateMemberPermissions(userId, matrix);
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
        organizations,
        createOrganization,
        syncBrandContacts,
        inviteClientTeamMember,
        updateMemberPermissions,
        refreshOrganizationsFromSupabase,
        territories,
        createTerritory,
        updateTerritory,
        deleteTerritory,
        validateBrandTerritories,
        digitalAssets,
        createDigitalAsset,
        updateDigitalAsset,
        deleteDigitalAsset,
        refreshBrandsFromSupabase,
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
