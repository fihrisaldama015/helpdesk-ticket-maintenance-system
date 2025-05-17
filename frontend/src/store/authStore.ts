import { create } from 'zustand';
import authRepository from '../api/authRepository';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  loadUser: () => Promise<boolean>;
  clearError: () => void;
}

const useAuthStore = create<AuthState>((set, _) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authRepository.login(email, password);
      console.log('Login response', response);

      localStorage.setItem('token', response.token);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false
      });
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      set({
        isLoading: false,
        error: error.message || 'Login failed. Please try again.',
      });
      return false;
    }
  },

  register: async (firstName: string, lastName: string, email: string, password: string, role: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authRepository.register(firstName, lastName, email, password, role);

      localStorage.setItem('token', response.token);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false
      });
      return true;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Registration failed. Please try again.'
      });
      return false;
    }
  },

  logout: () => {
    authRepository.logout();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  },

  loadUser: async () => {
    console.log('[loadUser] loaded')
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('[loadUser] no token')
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      return false;
    }

    set({ isLoading: true });

    try {
      const response = await authRepository.getCurrentUser();
      console.log('[loadUser] user', response)
      set({
        user: response,
        isAuthenticated: true,
        isLoading: false
      });
      return true;
    } catch (error: any) {
      localStorage.removeItem('token');
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Failed to load user. Please login again.'
      });
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useAuthStore;