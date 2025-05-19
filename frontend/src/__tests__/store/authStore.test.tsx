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
    // Clear and reset all mocks
    jest.clearAllMocks();
    jest.resetAllMocks();
    
    // Reset localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn()
      }
    });

    // Reset auth store state
    const store = useAuthStore.getState();
    store.logout();
    store.clearError();
    
    // Reset auth repository mocks
    (authRepository.login as jest.Mock).mockReset();
    (authRepository.register as jest.Mock).mockReset();
    (authRepository.getCurrentUser as jest.Mock).mockReset();
    (authRepository.logout as jest.Mock).mockReset();

    // Reset mock implementations
    (authRepository.login as jest.Mock).mockImplementation(() => Promise.resolve({
      user: null,
      token: 'test-token'
    }));
    
    (authRepository.register as jest.Mock).mockImplementation(() => Promise.resolve({
      user: null,
      token: 'test-token'
    }));
    
    (authRepository.getCurrentUser as jest.Mock).mockImplementation(() => Promise.resolve(null));
    
    (authRepository.logout as jest.Mock).mockImplementation(() => {});
  });

  describe('login', () => {
    it('successfully logs in a user', async () => {
      const mockUser = {
        id: '1',
        name: 'Helpdesk Agent',
        email: 'agent@helpdesk.com',
        role: 'L1_AGENT',
      };

      const mockResponse = {
        user: mockUser,
        token: 'test-token',
      };

      (authRepository.login as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const success = await result.current.login('agent@helpdesk.com', 'agent123');
        expect(success).toBe(true);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
    });

    it('handles login failure', async () => {
      const mockError = new Error('Invalid credentials');

      (authRepository.login as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const success = await result.current.login('test@example.com', 'wrong-password');
        expect(success).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe(mockError.message);
    });
  });

  describe('register', () => {
    it('successfully registers a new user', async () => {
      const mockUser = {
        id: '1',
        name: 'New User',
        email: 'new@example.com',
        role: 'L1',
      };

      const mockResponse = {
        user: mockUser,
        token: 'test-token',
      };

      (authRepository.register as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const success = await result.current.register('New', 'User', 'new@example.com', 'password', 'L1');
        expect(success).toBe(true);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
    });

    it('handles registration failure', async () => {
      const mockError = new Error('Email already exists');

      (authRepository.register as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const success = await result.current.register('New', 'User', 'existing@example.com', 'password', 'L1');
        expect(success).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe(mockError.message);
    });
  });

  describe('loadUser', () => {
    it('loads the current user successfully', async () => {
      const mockUser = {
        id: '1',
        name: 'Current User',
        email: 'current@example.com',
        role: 'L1',
      };

      // Mock localStorage.getItem
      localStorage.getItem = jest.fn().mockReturnValue('test-token');

      (authRepository.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuthStore());

      // First get the initial state
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();

      // Load the user
      await act(async () => {
        const success = await result.current.loadUser();
        expect(success).toBe(true);
      });

      // Verify final state
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
      expect(localStorage.getItem('token')).toBe('test-token');
    });

    it('handles missing token', async () => {
      Storage.prototype.getItem = jest.fn(() => null);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const success = await result.current.loadUser();
        expect(success).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('handles loadUser failure', async () => {
      localStorage.getItem = jest.fn().mockReturnValue('test-token');

      const mockError = new Error('Failed to load user');
      (authRepository.getCurrentUser as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuthStore());

      // First check initial state
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();

      // Try to load user and expect failure
      await act(async () => {
        const success = await result.current.loadUser();
        expect(success).toBe(false);
      });

      // Verify final state
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('Failed to load user');
      expect(localStorage.getItem('token')).toBe('test-token'); // token is kept even on failure
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

      // Force an error state first by rejecting login
      await act(async () => {
        const mockError = new Error('Test error');
        (authRepository.login as jest.Mock).mockRejectedValue(mockError);
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
