import { create } from 'zustand';
import { createInfluencer, updateInfluencer, deleteInfluencer, getInfluencers } from '../lib/supabase';
import { useAuthStore } from './authStore';
import { Influencer } from '../types';

interface InfluencerState {
  influencers: Influencer[];
  addInfluencer: (name: string, templateId: string) => Promise<void>;
  updateInfluencer: (id: string, updates: Partial<Influencer>) => Promise<void>;
  deleteInfluencer: (id: string) => Promise<void>;
  fetchInfluencers: () => Promise<void>;
  getInfluencersForCurrentUser: () => Influencer[];
}

export const useInfluencerStore = create<InfluencerState>((set, get) => ({
  influencers: [],

  addInfluencer: async (name: string, templateId: string) => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) throw new Error('No user logged in');

    try {
      const newInfluencer = await createInfluencer(currentUser.id, name, templateId);
      set(state => ({
        influencers: [newInfluencer, ...state.influencers]
      }));
    } catch (error) {
      console.error('Failed to create influencer:', error);
      throw error;
    }
  },

  updateInfluencer: async (id: string, updates: Partial<Influencer>) => {
    try {
      await updateInfluencer(id, {
        name: updates.name,
        template_id: updates.templateId
      });
      set(state => ({
        influencers: state.influencers.map(inf =>
          inf.id === id ? { ...inf, ...updates } : inf
        )
      }));
    } catch (error) {
      console.error('Failed to update influencer:', error);
      throw error;
    }
  },

  deleteInfluencer: async (id: string) => {
    try {
      await deleteInfluencer(id);
      set(state => ({
        influencers: state.influencers.filter(inf => inf.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete influencer:', error);
      throw error;
    }
  },

  fetchInfluencers: async () => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;

    try {
      const influencers = await getInfluencers(currentUser.id);
      set({ influencers });
    } catch (error) {
      console.error('Failed to fetch influencers:', error);
      throw error;
    }
  },

  getInfluencersForCurrentUser: () => {
    return get().influencers;
  }
}));