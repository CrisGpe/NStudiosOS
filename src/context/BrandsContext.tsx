import React, { createContext, useContext, useState, useEffect } from 'react';
import { Brand, CommunicationTerritory, DigitalAsset, ClientOrganization, ClientBrandPermission } from '../types';
import { BrandsRepository } from '../repositories/brands.repository';
import { ClientOrganizationsRepository } from '../repositories/organizations.repository';
import { clientOrgService } from '../services/supabaseService';
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
    try {
      const saved = localStorage.getItem('nataraja_brands');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedBrandId, setSelectedBrandId] = useState<string>('');

  const [territories, setTerritories] = useState<CommunicationTerritory[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_territories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [digitalAssets, setDigitalAssets] = useState<DigitalAsset[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_digital_assets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
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
      const dbOrgs = await ClientOrganizationsRepository.fetchOrganizations();
      setOrganizations(dbOrgs || []);
    } catch (err) {
      console.warn('Could not sync client organizations with Supabase:', err);
    }
  };

  const refreshBrandsFromSupabase = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const [dbBrands, dbTerritories, dbOrgs, dbAssets] = await Promise.all([
        BrandsRepository.fetchBrands(),
        BrandsRepository.fetchTerritories(),
        ClientOrganizationsRepository.fetchOrganizations(),
        BrandsRepository.fetchDigitalAssets(),
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
      setOrganizations(dbOrgs || []);
      setDigitalAssets(dbAssets || []);
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
    const newBrandId = typeof crypto !== 'undefined' && crypto.randomUUID ? 'brand_' + crypto.randomUUID().slice(0, 8) : 'brand_' + Date.now();
    const newBrand: Brand = {
      ...brandData,
      id: newBrandId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setBrands((prev) => [newBrand, ...prev]);

    try {
      await BrandsRepository.createBrand(newBrand);
    } catch (err) {
      console.warn('Supabase createBrand sync error:', err);
    }

    if (initialTerritoriesData && initialTerritoriesData.length > 0) {
      const newTerritories: CommunicationTerritory[] = initialTerritoriesData.map((t, index) => ({
        ...t,
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? 'terr_' + crypto.randomUUID().slice(0, 8) : 'terr_' + Date.now() + '_' + index,
        brandId: newBrandId,
      }));
      setTerritories((prev) => [...newTerritories, ...prev]);
      for (const t of newTerritories) {
        try {
          await BrandsRepository.createTerritory(t);
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
        BrandsRepository.updateBrand(updated).catch((err) => console.warn('Supabase updateBrand sync error:', err));
      }
      return next;
    });
  };

  const deleteBrand = (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    setTerritories((prev) => prev.filter((t) => t.brandId !== id));
    BrandsRepository.deleteBrand(id).catch((err) => console.warn('Supabase deleteBrand sync error:', err));
  };

  const createTerritory = (territoryData: Omit<CommunicationTerritory, 'id'>) => {
    const newTerritory: CommunicationTerritory = {
      ...territoryData,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? 'terr_' + crypto.randomUUID().slice(0, 8) : 'terr_' + Date.now(),
    };
    setTerritories((prev) => [newTerritory, ...prev]);
    BrandsRepository.createTerritory(newTerritory).catch((err) => console.warn('Supabase createTerritory sync error:', err));
    return { success: true };
  };

  const updateTerritory = (id: string, updates: Partial<CommunicationTerritory>) => {
    setTerritories((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      const updated = next.find((t) => t.id === id);
      if (updated) {
        BrandsRepository.updateTerritory(updated).catch((err) => console.warn('Supabase updateTerritory sync error:', err));
      }
      return next;
    });
    return { success: true };
  };

  const deleteTerritory = (id: string) => {
    setTerritories((prev) => prev.filter((t) => t.id !== id));
    BrandsRepository.deleteTerritory(id).catch((err) => console.warn('Supabase deleteTerritory sync error:', err));
    return { success: true };
  };

  const createDigitalAsset = (assetData: Omit<DigitalAsset, 'id' | 'updatedAt'>) => {
    const newAsset: DigitalAsset = {
      ...assetData,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? 'asset_' + crypto.randomUUID().slice(0, 8) : 'asset_' + Date.now(),
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setDigitalAssets((prev) => [newAsset, ...prev]);
    BrandsRepository.createDigitalAsset(newAsset).catch((err) => console.warn('Supabase createDigitalAsset sync error:', err));
    return { success: true };
  };

  const updateDigitalAsset = (id: string, updates: Partial<DigitalAsset>) => {
    setDigitalAssets((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : a));
      const updated = next.find((a) => a.id === id);
      if (updated) {
        BrandsRepository.updateDigitalAsset(updated).catch((err) => console.warn('Supabase updateDigitalAsset sync error:', err));
      }
      return next;
    });
    return { success: true };
  };

  const deleteDigitalAsset = (id: string) => {
    setDigitalAssets((prev) => prev.filter((a) => a.id !== id));
    BrandsRepository.deleteDigitalAsset(id).catch((err) => console.warn('Supabase deleteDigitalAsset sync error:', err));
    return { success: true };
  };

  const createOrganization = async (orgData: Omit<ClientOrganization, 'id' | 'createdAt'>): Promise<ClientOrganization> => {
    const orgId = typeof crypto !== 'undefined' && crypto.randomUUID ? 'org_' + crypto.randomUUID().slice(0, 8) : 'org_' + Date.now();
    const newOrg: ClientOrganization = {
      ...orgData,
      id: orgId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setOrganizations((prev) => [newOrg, ...prev]);
    try {
      await ClientOrganizationsRepository.createOrganization(newOrg);
    } catch (err) {
      console.warn('Supabase createOrganization sync error:', err);
    }
    return newOrg;
  };

  const syncBrandContacts = async () => {
    return await clientOrgService.syncBrandContacts();
  };

  const inviteClientTeamMember = async (payload: {
    orgId: string;
    email: string;
    name: string;
    roleTitle?: string;
    tempPassword?: string;
    permissionsMatrix: Record<string, ClientBrandPermission>;
  }) => {
    return await clientOrgService.inviteClientTeamMember(payload);
  };

  const updateMemberPermissions = async (
    userId: string,
    matrix: Record<string, ClientBrandPermission>
  ) => {
    await clientOrgService.updateMemberPermissions(userId, matrix);
  };

  const contextValue = React.useMemo(
    () => ({
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
    }),
    [brands, selectedBrandId, organizations, territories, digitalAssets]
  );

  return (
    <BrandsContext.Provider value={contextValue}>
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
