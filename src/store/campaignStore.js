import { create } from 'zustand';
import { campaignsAPI } from '../api/campaigns.api';

export const useCampaignStore = create((set, get) => ({
  campaigns: [],
  currentCampaign: null,
  stats: null,
  isLoading: false,
  error: null,

  // Fetch all campaigns
  fetchCampaigns: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignsAPI.getAll(params);
      set({
        campaigns: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.message || 'Failed to fetch campaigns',
        isLoading: false,
      });
    }
  },

  // Fetch campaign by ID
  fetchCampaignById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignsAPI.getById(id);
      set({
        currentCampaign: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.message || 'Failed to fetch campaign',
        isLoading: false,
      });
    }
  },

  // Create campaign
  createCampaign: async (campaignData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignsAPI.create(campaignData);
      set(state => ({
        campaigns: [response.data, ...state.campaigns],
        isLoading: false,
      }));
      return { success: true, data: response.data };
    } catch (error) {
      set({
        error: error.message || 'Failed to create campaign',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Update campaign
  updateCampaign: async (id, campaignData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignsAPI.update(id, campaignData);
      set(state => ({
        campaigns: state.campaigns.map(c => c.id === id ? response.data : c),
        currentCampaign: state.currentCampaign?.id === id ? response.data : state.currentCampaign,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({
        error: error.message || 'Failed to update campaign',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Delete campaign
  deleteCampaign: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await campaignsAPI.delete(id);
      set(state => ({
        campaigns: state.campaigns.filter(c => c.id !== id),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({
        error: error.message || 'Failed to delete campaign',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Send campaign
  sendCampaign: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await campaignsAPI.send(id);
      
      // Update campaign status
      set(state => ({
        campaigns: state.campaigns.map(c => 
          c.id === id ? { ...c, status: 'sent', sentAt: new Date().toISOString() } : c
        ),
        isLoading: false,
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        error: error.message || 'Failed to send campaign',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Fetch campaign stats
  fetchStats: async () => {
    try {
      const response = await campaignsAPI.getStats();
      set({ stats: response.data });
    } catch (error) {
      console.error('Failed to fetch campaign stats:', error);
    }
  },

  // Clear current campaign
  clearCurrentCampaign: () => set({ currentCampaign: null }),

  // Clear error
  clearError: () => set({ error: null }),
}));
