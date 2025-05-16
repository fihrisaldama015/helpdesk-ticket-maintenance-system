import { act, renderHook } from '@testing-library/react';
import useAuthStore from '../../store/authStore';
import authRepository from '../../api/authRepository';

// Mock the authRepository
jest.mock('../../api/authRepository', () => ({
  login: jest.fn(),
  register: jest.fn(),
  getCurrentUser: jest.fn(),
  logout: jest.fn(),
}));

describe('authStore', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset the store state
    useAuthStore.getState().logout();
  });

  describe('login', () => {
    it('successfully logs in a user', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'L1' as const,
      };

      const mockResponse = {
        success: true,
        data: {
          user: mockUser,
          token: 'test-token',
        },
      };

      (authRepository.login as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const success = await result.current.login('test@example.com', 'password');
        expect(success).toBe(true);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
    });

    it('handles login failure', async () => {
      const mockError = 'Invalid credentials';
      const mockResponse = {
        success: false,
        error: mockError,
      };

      (authRepository.login as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const success = await result.current.login('test@example.com', 'wrong-password');
        expect(success).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe(mockError);
    });
  });

  describe('register', () => {
    it('successfully registers a new user', async () => {
      const mockUser = {
        id: '1',
        name: 'New User',
        email: 'new@example.com',
        role: 'L1' as const,
      };

      const mockResponse = {
        success: true,
        data: {
          user: mockUser,
          token: 'test-token',
        },
      };

      (authRepository.register as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const success = await result.current.register('New User', 'new@example.com', 'password', 'L1');
        expect(success).toBe(true);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
    });

    it('handles registration failure', async () => {
      const mockError = 'Email already exists';
      const mockResponse = {
        success: false,
        error: mockError,
      };

      (authRepository.register as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const success = await result.current.register('New User', 'existing@example.com', 'password', 'L1');
        expect(success).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe(mockError);
    });
  });

  describe('loadUser', () => {
    it('loads the current user successfully', async () => {
      const mockUser = {
        id: '1',
        name: 'Current User',
        email: 'current@example.com',
        role: 'L1' as const,
      };

      const mockResponse = {
        success: true,
        data: mockUser,
      };

      // Mock localStorage.getItem
      Storage.prototype.getItem = jest.fn(() => 'test-token');
      
      (authRepository.getCurrentUser as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const success = await result.current.loadUser();
        expect(success).toBe(true);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
    });

    it('handles missing token', async () => {
      // Mock localStorage.getItem to return null
      Storage.prototype.getItem = jest.fn(() => null);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const success = await result.current.loadUser();
        expect(success).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('logout', () => {
    it('successfully logs out the user', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(authRepository.logout).toHaveBeenCalled();
    });
  });

  describe('clearError', () => {
    it('clears the error state', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Set an error first
      await act(async () => {
        const mockResponse = {
          success: false,
          error: 'Test error',
        };
        (authRepository.login as jest.Mock).mockResolvedValue(mockResponse);
        await result.current.login('test@example.com', 'wrong-password');
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});