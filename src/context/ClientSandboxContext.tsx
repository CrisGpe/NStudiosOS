import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClientIdeaSandboxItem } from '../types';
import { INITIAL_SANDBOX_IDEAS } from '../data/initialData';
import { sandboxService } from '../services/supabaseService';
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
      return saved ? JSON.parse(saved) : INITIAL_SANDBOX_IDEAS;
    } catch {
      return INITIAL_SANDBOX_IDEAS;
    }
  });

  const refreshSandboxFromSupabase = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const dbIdeas = await sandboxService.fetchSandboxIdeas();
      if (dbIdeas && dbIdeas.length > 0) {
        setSandboxIdeas(dbIdeas);
      }
    } catch (err) {
      console.warn('Could not sync sandbox with Supabase, using local fallback:', err);
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
    sandboxService.createSandboxIdea(newIdea).catch((err) => console.warn('Supabase createSandboxIdea sync error:', err));
    return newIdea;
  };

  const updateSandboxIdea = (id: string, updates: Partial<ClientIdeaSandboxItem>) => {
    setSandboxIdeas((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : i))
    );
  };

  const deleteSandboxIdea = (id: string) => {
    setSandboxIdeas((prev) => prev.filter((i) => i.id !== id));
    sandboxService.deleteSandboxIdea(id).catch((err) => console.warn('Supabase deleteSandboxIdea sync error:', err));
  };

  const convertSandboxIdeaToDeliverable = (ideaId: string, deliverableId?: string): any => {
    const targetDelId = deliverableId || 'del_' + Date.now();
    const fakeCode = 'CF-DEL-' + Math.floor(100 + Math.random() * 900);
    setSandboxIdeas((prev) =>
      prev.map((i) =>
        i.id === ideaId
          ? {
              ...i,
              status: 'converted_to_deliverable' as const,
              convertedDeliverableId: targetDelId,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : i
      )
    );
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
          briefPrompt: idea.title + ': ' + idea.notes,
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

      updateSandboxIdea(ideaId, { aiGeneratedBrief: briefObj });
      return briefObj.hook;
    } catch {
      const fallbackObj = {
        hook: 'Impacto visual asegurado',
        narrativeAngle: 'Enfoque cinemático',
        suggestedDuration: '30s',
        recommendedPlatforms: ['Reels', 'TikTok'],
      };
      updateSandboxIdea(ideaId, { aiGeneratedBrief: fallbackObj });
      return fallbackObj.hook;
    }
  };

  return (
    <ClientSandboxContext.Provider
      value={{
        sandboxIdeas,
        createSandboxIdea,
        updateSandboxIdea,
        deleteSandboxIdea,
        convertSandboxIdeaToDeliverable,
        generateAIBriefForSandboxIdea,
        refreshSandboxFromSupabase,
      }}
    >
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
