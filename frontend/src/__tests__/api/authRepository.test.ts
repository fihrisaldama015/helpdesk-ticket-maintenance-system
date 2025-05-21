import authRepository from '../../api/authRepository';
import apiClient from '../../api/axiosConfig';
import type { User } from '../../types';

// Mock the API client
jest.mock('../../api/axiosConfig', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Auth Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('login', () => {
    test('should login successfully', async () => {
      // Mock response data
      const mockResponse = {
        data: {
          user: { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'L1_AGENT' },
          token: 'test-token'
        }
      };
      
      // Setup mock
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      // Call the function
      const result = await authRepository.login('test@example.com', 'password123');
      
      // Assertions
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle login error', async () => {
      // Mock error response
      const mockError = {
        response: {
          data: {
            error: 'Invalid credentials'
          }
        }
      };
      
      // Setup mock
      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockError);
      
      // Call and expect error
      await expect(authRepository.login('test@example.com', 'wrong-password'))
        .rejects
        .toEqual({ message: 'Login failed. Please check your credentials.' });
    });

    test('should handle login error with fallback message', async () => {
      // Mock error without specific message
      const mockError = new Error('Network error');
      
      // Setup mock
      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockError);
      
      // Call and expect error with fallback message
      await expect(authRepository.login('test@example.com', 'password123'))
        .rejects
        .toEqual({ message: 'Login failed. Please check your credentials.' });
    });
  });

  describe('register', () => {
    test('should register successfully', async () => {
      // Mock response data
      const mockResponse = {
        data: {
          user: { id: '1', email: 'new@example.com', firstName: 'New', lastName: 'User', role: 'L1_AGENT' },
          token: 'new-token'
        }
      };
      
      // Setup mock
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      // Call the function
      const result = await authRepository.register('New', 'User', 'new@example.com', 'password123', 'L1_AGENT');
      
      // Assertions
      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        password: 'password123',
        role: 'L1_AGENT'
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle registration error', async () => {
      // Mock error response
      const mockError = {
        response: {
          data: {
            error: 'Email already exists'
          }
        }
      };
      
      // Setup mock
      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockError);
      
      // Call and expect error
      await expect(authRepository.register('New', 'User', 'existing@example.com', 'password123', 'L1_AGENT'))
        .rejects
        .toEqual({ message: 'Registration failed. Please try again.' });
    });
  });

  describe('getCurrentUser', () => {
    test('should get current user successfully', async () => {
      // Mock response data
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'L1_AGENT'
      };
      
      const mockResponse = {
        data: mockUser
      };
      
      // Setup mock
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      // Call the function
      const result = await authRepository.getCurrentUser();
      
      // Assertions
      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });

    test('should handle getCurrentUser error', async () => {
      // Mock error response
      const mockError = {
        response: {
          data: {
            error: 'Unauthorized'
          }
        }
      };
      
      // Setup mock
      (apiClient.get as jest.Mock).mockRejectedValueOnce(mockError);
      
      // Call and expect error
      await expect(authRepository.getCurrentUser())
        .rejects
        .toEqual({ message: 'Failed to fetch user data. Please try again.' });
    });
  });

  describe('logout', () => {
    test('should remove token from localStorage', () => {
      // Set token in localStorage
      localStorageMock.setItem('token', 'test-token');
      
      // Call logout
      authRepository.logout();
      
      // Verify token was removed
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });
});
