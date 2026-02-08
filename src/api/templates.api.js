import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';

const MOCK_MODE = false;
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock templates data
let mockTemplates = [
  {
    id: 1,
    name: 'Welcome Email',
    subject: 'Welcome to {{company}}!',
    schema: {
      blocks: [
        { id: '1', type: 'text', content: '<h1>Welcome!</h1>' },
        { id: '2', type: 'text', content: '<p>Thank you for joining us.</p>' },
        { id: '3', type: 'image', content: 'https://via.placeholder.com/600x300', alt: 'Welcome banner' },
        { id: '4', type: 'text', content: '<p>Best regards,<br/>The Team</p>' },
      ],
    },
    thumbnail: 'https://via.placeholder.com/300x200',
    createdAt: '2026-01-15T10:00:00',
    updatedAt: '2026-01-15T10:00:00',
  },
  {
    id: 2,
    name: 'Newsletter Template',
    subject: 'Monthly Newsletter - {{month}}',
    schema: {
      blocks: [
        { id: '1', type: 'text', content: '<h2>This Month\'s Updates</h2>' },
        { id: '2', type: 'text', content: '<p>Here are the latest updates from our team.</p>' },
      ],
    },
    thumbnail: 'https://via.placeholder.com/300x200',
    createdAt: '2026-01-18T14:30:00',
    updatedAt: '2026-01-18T14:30:00',
  },
];

export const templatesAPI = {
  // Get all templates
  getAll: async (params = {}) => {
    if (MOCK_MODE) {
      await mockDelay();
      return {
        success: true,
        data: mockTemplates,
        total: mockTemplates.length,
      };
    }
    
    return apiClient.get(API_ENDPOINTS.TEMPLATES, { params });
  },

  // Get template by ID
  getById: async (id) => {
    if (MOCK_MODE) {
      await mockDelay();
      const template = mockTemplates.find(t => t.id === parseInt(id));
      if (!template) throw { message: 'Template not found' };
      return { success: true, data: template };
    }
    
    return apiClient.get(`${API_ENDPOINTS.TEMPLATES}/${id}`);
  },

  // Create template
  create: async (templateData) => {
    if (MOCK_MODE) {
      await mockDelay();
      const newTemplate = {
        id: Date.now(),
        ...templateData,
        thumbnail: 'https://via.placeholder.com/300x200',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockTemplates.push(newTemplate);
      return { success: true, data: newTemplate };
    }
    
    return apiClient.post(API_ENDPOINTS.TEMPLATES, templateData);
  },

  // Update template
  update: async (id, templateData) => {
    if (MOCK_MODE) {
      await mockDelay();
      const index = mockTemplates.findIndex(t => t.id === parseInt(id));
      if (index === -1) throw { message: 'Template not found' };
      mockTemplates[index] = {
        ...mockTemplates[index],
        ...templateData,
        updatedAt: new Date().toISOString(),
      };
      return { success: true, data: mockTemplates[index] };
    }
    
    return apiClient.put(`${API_ENDPOINTS.TEMPLATES}/${id}`, templateData);
  },

  // Delete template
  delete: async (id) => {
    if (MOCK_MODE) {
      await mockDelay();
      mockTemplates = mockTemplates.filter(t => t.id !== parseInt(id));
      return { success: true };
    }
    
    return apiClient.delete(`${API_ENDPOINTS.TEMPLATES}/${id}`);
  },

  // Duplicate template
  duplicate: async (id) => {
    if (MOCK_MODE) {
      await mockDelay();
      const template = mockTemplates.find(t => t.id === parseInt(id));
      if (!template) throw { message: 'Template not found' };
      
      const duplicated = {
        ...template,
        id: Date.now(),
        name: `${template.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockTemplates.push(duplicated);
      return { success: true, data: duplicated };
    }
    
    return apiClient.post(`${API_ENDPOINTS.TEMPLATES}/${id}/duplicate`);
  },
};
