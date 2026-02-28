import { create } from 'zustand';
import { usersAPI } from '../api/users.api';

export const useUserStore = create((set, get) => ({
  users: [],
  selectedUsers: [],
  isLoading: false,
  error: null,
  filters: {
    search: '',
    status: '',
  },

  // Fetch all users
  fetchUsers: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await usersAPI.getAll(params || get().filters);
      const data = response?.data ?? response ?? [];
      set({
        users: Array.isArray(data) ? data : [],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.message || 'Failed to fetch users',
        isLoading: false,
      });
    }
  },

  // Add user
  addUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await usersAPI.create(userData);
      set(state => ({
        users: [...state.users, response.data],
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({
        error: error.message || 'Failed to add user',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await usersAPI.update(id, userData);
      set(state => ({
        users: state.users.map(u => u.id === id ? response.data : u),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({
        error: error.message || 'Failed to update user',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Delete user
  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await usersAPI.delete(id);
      set(state => ({
        users: state.users.filter(u => u.id !== id),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({
        error: error.message || 'Failed to delete user',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Import users
  importUsers: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const response = await usersAPI.import(file);
      // Refresh users list after import
      await get().fetchUsers();
      return { success: true, data: response.data };
    } catch (error) {
      set({
        error: error.message || 'Failed to import users',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Set filters
  setFilters: (filters) => {
    set(state => ({
      filters: { ...state.filters, ...filters },
    }));
    get().fetchUsers();
  },

  // Select/deselect users
  toggleUserSelection: (userId) => {
    set(state => {
      const isSelected = state.selectedUsers.includes(userId);
      return {
        selectedUsers: isSelected
          ? state.selectedUsers.filter(id => id !== userId)
          : [...state.selectedUsers, userId],
      };
    });
  },

  selectAllUsers: () => {
    set(state => ({
      selectedUsers: state.users.map(u => u.id),
    }));
  },

  clearSelection: () => {
    set({ selectedUsers: [] });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
