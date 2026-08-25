import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClientIdeaSandboxItem } from '../types';
import { ClientSandboxRepository } from '../repositories/sandbox.repository';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export interface ClientSandboxContextType {
  sandboxIdeas: ClientIdeaSandboxItem[];
  createSandboxIdea: (
    idea: Omit<ClientIdeaSandboxItem, 'id' | 'createdAt' | 'updatedAt' | 'convertedDeliverableId' | 'status'> & {
      status?: 'draft' | 'converted_to_deliverable';
    }
  ) => ClientIdeaSandboxItem;
  updateSandboxIdea: (id: string, updates: Partial<ClientIdeaSandboxItem>) => void;
  deleteSandboxIdea: (id: string) => void;
  convertSandboxIdeaToDeliverable: (ideaId: string, deliverableId?: string) => any;
  generateAIBriefForSandboxIdea: (ideaId: string) => Promise<string>;
  refreshSandboxFromSupabase: () => Promise<void>;
}

const ClientSandboxContext = createContext<ClientSandboxContextType | undefined>(undefined);

export const ClientSandboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sandboxIdeas, setSandboxIdeas] = useState<ClientIdeaSandboxItem[]>(() => {
    try {
      const saved = localStorage.getItem('nataraja_sandbox_ideas');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const refreshSandboxFromSupabase = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const dbIdeas = await ClientSandboxRepository.fetchIdeas();
      setSandboxIdeas(dbIdeas || []);
    } catch (err) {
      console.warn('Could not sync sandbox with Supabase:', err);
    }
  };

  useEffect(() => {
    refreshSandboxFromSupabase();
  }, []);

  useEffect(() => {
    localStorage.setItem('nataraja_sandbox_ideas', JSON.stringify(sandboxIdeas));
  }, [sandboxIdeas]);

  const createSandboxIdea = (
    ideaData: Omit<ClientIdeaSandboxItem, 'id' | 'createdAt' | 'updatedAt' | 'convertedDeliverableId' | 'status'> & {
      status?: 'draft' | 'converted_to_deliverable';
    }
  ): ClientIdeaSandboxItem => {
    const newIdea: ClientIdeaSandboxItem = {
      ...ideaData,
      status: ideaData.status || 'draft',
      id: 'idea_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setSandboxIdeas((prev) => [newIdea, ...prev]);
    ClientSandboxRepository.createIdea(newIdea).catch((err) => console.warn('Supabase createSandboxIdea sync error:', err));
    return newIdea;
  };

  const updateSandboxIdea = (id: string, updates: Partial<ClientIdeaSandboxItem>) => {
    setSandboxIdeas((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : i));
      const updated = next.find((i) => i.id === id);
      if (updated) {
        ClientSandboxRepository.updateIdea(updated).catch((err) => console.warn('Supabase updateSandboxIdea error:', err));
      }
      return next;
    });
  };

  const deleteSandboxIdea = (id: string) => {
    setSandboxIdeas((prev) => prev.filter((i) => i.id !== id));
    ClientSandboxRepository.deleteIdea(id).catch((err) => console.warn('Supabase deleteSandboxIdea error:', err));
  };

  const convertSandboxIdeaToDeliverable = (ideaId: string, deliverableId?: string): any => {
    const targetDelId = deliverableId || 'del_' + Date.now();
    const fakeCode = 'CF-DEL-' + Math.floor(100 + Math.random() * 900);
    setSandboxIdeas((prev) => {
      const next = prev.map((i) =>
        i.id === ideaId
          ? {
              ...i,
              status: 'converted_to_deliverable' as const,
              convertedDeliverableId: targetDelId,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : i
      );
      const updated = next.find((i) => i.id === ideaId);
      if (updated) {
        ClientSandboxRepository.updateIdea(updated).catch((err) => console.warn('Supabase convertSandboxIdea error:', err));
      }
      return next;
    });
    return { id: targetDelId, code: fakeCode };
  };

  const generateAIBriefForSandboxIdea = async (ideaId: string): Promise<string> => {
    const idea = sandboxIdeas.find((i) => i.id === ideaId);
    if (!idea) return '';

    try {
      const response = await fetch('/api/gemini/ideate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: 'Marca Co-creativa',
          industry: 'Producción Audiovisual',
          brandTone: 'Innovador',
          territory: 'Sandbox',
          briefPrompt: idea.title + ': ' + (idea.description || ''),
        }),
      });
      const data = await response.json();
      const firstIdea = data.ideas?.[0];

      const briefObj = firstIdea
        ? {
            hook: firstIdea.hook || 'Hook inicial',
            narrativeAngle: firstIdea.narrativeConcept || 'Ángulo de alto impacto',
            suggestedDuration: '30s',
            recommendedPlatforms: ['Instagram Reels', 'TikTok'],
          }
        : {
            hook: 'Descubre una nueva experiencia',
            narrativeAngle: 'Enfoque cinemático moderno',
            suggestedDuration: '30s',
            recommendedPlatforms: ['Reels'],
          };

      updateSandboxIdea(ideaId, { notes: `${idea.notes || ''}\n\n[Brief IA]: ${briefObj.hook}` });
      return briefObj.hook;
    } catch {
      return 'Concepto visual cinemático';
    }
  };

  const contextValue = React.useMemo(
    () => ({
      sandboxIdeas,
      createSandboxIdea,
      updateSandboxIdea,
      deleteSandboxIdea,
      convertSandboxIdeaToDeliverable,
      generateAIBriefForSandboxIdea,
      refreshSandboxFromSupabase,
    }),
    [sandboxIdeas]
  );

  return (
    <ClientSandboxContext.Provider value={contextValue}>
      {children}
    </ClientSandboxContext.Provider>
  );
};

export const useClientSandboxContext = (): ClientSandboxContextType => {
  const context = useContext(ClientSandboxContext);
  if (!context) {
    throw new Error('useClientSandboxContext must be used within a ClientSandboxProvider');
  }
  return context;
};
