import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';

const MOCK_MODE = false;
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock campaigns data
let mockCampaigns = [
  {
    id: 1,
    name: 'Welcome Campaign',
    subject: 'Welcome to Mail Pilot!',
    templateId: 1,
    status: 'sent',
    recipientsCount: 150,
    sentCount: 150,
    openRate: 45.5,
    clickRate: 12.3,
    sentAt: '2026-01-20T10:30:00',
    createdAt: '2026-01-20T09:00:00',
  },
  {
    id: 2,
    name: 'Product Update',
    subject: 'New Features Available',
    templateId: 2,
    status: 'draft',
    recipientsCount: 0,
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    createdAt: '2026-01-24T14:00:00',
  },
];

export const campaignsAPI = {
  // Get all campaigns
  getAll: async (params = {}) => {
    if (MOCK_MODE) {
      await mockDelay();
      let filtered = [...mockCampaigns];
      
      if (params.status) {
        filtered = filtered.filter(c => c.status === params.status);
      }
      
      return {
        success: true,
        data: filtered,
        total: filtered.length,
      };
    }
    
    return apiClient.get(API_ENDPOINTS.CAMPAIGNS, { params });
  },

  // Get campaign by ID
  getById: async (id) => {
    if (MOCK_MODE) {
      await mockDelay();
      const campaign = mockCampaigns.find(c => c.id === parseInt(id));
      if (!campaign) throw { message: 'Campaign not found' };
      return { success: true, data: campaign };
    }
    
    return apiClient.get(`${API_ENDPOINTS.CAMPAIGNS}/${id}`);
  },

  // Create campaign
  create: async (campaignData) => {
    if (MOCK_MODE) {
      await mockDelay();
      const newCampaign = {
        id: Date.now(),
        ...campaignData,
        status: 'draft',
        sentCount: 0,
        openRate: 0,
        clickRate: 0,
        createdAt: new Date().toISOString(),
      };
      mockCampaigns.push(newCampaign);
      return { success: true, data: newCampaign };
    }
    
    return apiClient.post(API_ENDPOINTS.CAMPAIGNS, campaignData);
  },

  // Update campaign
  update: async (id, campaignData) => {
    if (MOCK_MODE) {
      await mockDelay();
      const index = mockCampaigns.findIndex(c => c.id === parseInt(id));
      if (index === -1) throw { message: 'Campaign not found' };
      mockCampaigns[index] = { ...mockCampaigns[index], ...campaignData };
      return { success: true, data: mockCampaigns[index] };
    }
    
    return apiClient.put(`${API_ENDPOINTS.CAMPAIGNS}/${id}`, campaignData);
  },

  // Delete campaign
  delete: async (id) => {
    if (MOCK_MODE) {
      await mockDelay();
      mockCampaigns = mockCampaigns.filter(c => c.id !== parseInt(id));
      return { success: true };
    }
    
    return apiClient.delete(`${API_ENDPOINTS.CAMPAIGNS}/${id}`);
  },

  // Send campaign
  send: async (id) => {
    if (MOCK_MODE) {
      await mockDelay(1500);
      const index = mockCampaigns.findIndex(c => c.id === parseInt(id));
      if (index === -1) throw { message: 'Campaign not found' };
      
      mockCampaigns[index].status = 'sent';
      mockCampaigns[index].sentAt = new Date().toISOString();
      mockCampaigns[index].sentCount = mockCampaigns[index].recipientsCount;
      
      return {
        success: true,
        data: {
          campaignId: id,
          sentCount: mockCampaigns[index].recipientsCount,
          creditsUsed: mockCampaigns[index].recipientsCount,
        },
      };
    }
    
    return apiClient.post(`${API_ENDPOINTS.CAMPAIGNS}/${id}/send`);
  },

  // Get campaign stats
  getStats: async () => {
    if (MOCK_MODE) {
      await mockDelay();
      const sent = mockCampaigns.filter(c => c.status === 'sent');
      const totalSent = sent.reduce((sum, c) => sum + c.sentCount, 0);
      const avgOpenRate = sent.length > 0 
        ? sent.reduce((sum, c) => sum + c.openRate, 0) / sent.length 
        : 0;
      const avgClickRate = sent.length > 0 
        ? sent.reduce((sum, c) => sum + c.clickRate, 0) / sent.length 
        : 0;
      
      return {
        success: true,
        data: {
          totalCampaigns: mockCampaigns.length,
          sentCampaigns: sent.length,
          totalRecipients: totalSent,
          avgOpenRate: avgOpenRate.toFixed(1),
          avgClickRate: avgClickRate.toFixed(1),
        },
      };
    }
    
    return apiClient.get(API_ENDPOINTS.CAMPAIGNS_STATS);
  },
};
