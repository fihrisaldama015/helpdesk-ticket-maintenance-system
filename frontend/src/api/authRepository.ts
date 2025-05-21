import apiClient from './axiosConfig';
import type { AuthResponse, User } from '../types';

const authRepository = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Login failed. Please check your credentials.';
      throw { message };
    }
  },

  register: async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: string
  ): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        role,
      });
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Registration failed. Please try again.';
      throw { message };
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<User>('/auth/me');
      console.log('[AUTH REPOSITORY] getCurrentUser', response.data)
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Failed to fetch user data. Please try again.';
      throw { message };
    }
  },

  logout: (): void => {
    localStorage.removeItem('token');
  },
};

export default authRepository;