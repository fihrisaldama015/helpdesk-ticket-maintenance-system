import type { AuthResponse, User, UserRole } from '../../types';

// Mock user data
const mockUser: User = {
  id: '1',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  role: "L1_AGENT",
};

// Mock auth response
const mockAuthResponse: AuthResponse = {
  token: 'mock-jwt-token',
  user: mockUser,
};

// Mock auth repository
const authRepository = {
  login: jest.fn().mockImplementation(async (email: string, password: string) => {
    if (email === 'test@example.com' && password === 'password') {
      return Promise.resolve(mockAuthResponse);
    }
    throw { message: 'Invalid credentials' };
  }),

  register: jest.fn().mockImplementation(async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: UserRole
  ) => {
    if (email && password) {
      const newUser: User = {
        ...mockUser,
        firstName,
        lastName,
        email,
        role,
      };
      return Promise.resolve({
        ...mockAuthResponse,
        user: newUser,
      });
    }
    throw { message: 'Registration failed' };
  }),

  getCurrentUser: jest.fn().mockResolvedValue(mockUser),

  logout: jest.fn().mockImplementation(() => {
    // Clear any stored tokens or user data
    localStorage.removeItem('token');
  }),
};

export default authRepository;
