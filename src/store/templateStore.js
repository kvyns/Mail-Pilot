import { create } from 'zustand';
import { templatesAPI } from '../api/templates.api';

export const useTemplateStore = create((set, get) => ({
  templates: [],
  currentTemplate: null,
  isLoading: false,
  error: null,

  // Fetch all templates
  fetchTemplates: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await templatesAPI.getAll(params);
      set({
        templates: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.message || 'Failed to fetch templates',
        isLoading: false,
      });
    }
  },

  // Fetch template by ID
  fetchTemplateById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await templatesAPI.getById(id);
      set({
        currentTemplate: response.data,
        isLoading: false,
      });
      return { success: true, data: response.data };
    } catch (error) {
      set({
        error: error.message || 'Failed to fetch template',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Create template
  createTemplate: async (templateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await templatesAPI.create(templateData);
      set(state => ({
        templates: [response.data, ...state.templates],
        isLoading: false,
      }));
      return { success: true, data: response.data };
    } catch (error) {
      set({
        error: error.message || 'Failed to create template',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Update template
  updateTemplate: async (id, templateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await templatesAPI.update(id, templateData);
      set(state => ({
        templates: state.templates.map(t => t.id === id ? response.data : t),
        currentTemplate: state.currentTemplate?.id === id ? response.data : state.currentTemplate,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({
        error: error.message || 'Failed to update template',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Delete template
  deleteTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await templatesAPI.delete(id);
      set(state => ({
        templates: state.templates.filter(t => t.id !== id),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({
        error: error.message || 'Failed to delete template',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Duplicate template
  duplicateTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await templatesAPI.duplicate(id);
      set(state => ({
        templates: [response.data, ...state.templates],
        isLoading: false,
      }));
      return { success: true, data: response.data };
    } catch (error) {
      set({
        error: error.message || 'Failed to duplicate template',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Set current template
  setCurrentTemplate: (template) => set({ currentTemplate: template }),

  // Clear current template
  clearCurrentTemplate: () => set({ currentTemplate: null }),

  // Clear error
  clearError: () => set({ error: null }),
}));
