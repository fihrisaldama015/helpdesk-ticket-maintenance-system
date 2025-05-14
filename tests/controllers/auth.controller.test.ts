import { AuthController } from '@/controllers/auth.controller';
import { UserRole } from '@/models';
import { AuthService } from '@/services/auth.service';
import { Request, Response } from 'express';
import * as httpMocks from 'node-mocks-http';

// Mock the AuthService
jest.mock('@/services/auth.service');

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create a mocked instance of AuthService
    authService = new (AuthService as jest.Mock<AuthService>)() as jest.Mocked<AuthService>;
    authController = new AuthController(authService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Mock data
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.L1_AGENT
      };

      // Mock request and response
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/auth/register',
        body: userData
      });

      const res = httpMocks.createResponse();

      const createdAt = new Date();
      const updatedAt = new Date();
      authService.register.mockResolvedValueOnce({
        user: {
          id: '123',
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          createdAt,
          updatedAt
        },
        token: 'jwt_token_here'
      });
      await authController.register(req, res);

      expect(authService.register).toHaveBeenCalledWith(
        userData
      );

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
        user: expect.objectContaining({
          id: '123',
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString()
        }),
        token: 'jwt_token_here'
      }));
    });

    it('should handle registration errors', async () => {
      // Mock data
      const userData = {
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.L1_AGENT
      };

      // Mock request and response
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/auth/register',
        body: userData
      });

      const res = httpMocks.createResponse();

      const error = new Error('User with this email already exists');
      authService.register.mockRejectedValueOnce(error);
      await authController.register(req as Request, res as unknown as Response);
      expect(authService.register).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
        message: 'User with this email already exists'
      }));
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/auth/login',
        body: loginData
      });

      const res = httpMocks.createResponse();
      const createdAt = new Date();
      const updatedAt = new Date();

      authService.login.mockResolvedValueOnce({
        token: 'jwt_token_here',
        user: {
          id: '123',
          email: loginData.email,
          firstName: 'Test',
          lastName: 'User',
          role: UserRole.L1_AGENT,
          createdAt,
          updatedAt
        }
      });

      await authController.login(req, res);

      expect(authService.login).toHaveBeenCalledWith(
        loginData.email,
        loginData.password
      );

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
        token: 'jwt_token_here',
        user: expect.objectContaining({
          id: '123',
          email: loginData.email,
          firstName: 'Test',
          lastName: 'User',
          role: UserRole.L1_AGENT,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString()
        })
      }));
    });

    it('should handle invalid credentials', async () => {
      // Mock data
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword!'
      };

      // Mock request and response
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/auth/login',
        body: loginData
      });

      const res = httpMocks.createResponse();

      // Mock the service throwing an error
      const error = new Error('Invalid credentials');
      authService.login.mockRejectedValueOnce(error);

      // Call the controller method
      await authController.login(req, res);

      // Assertions
      expect(authService.login).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
        message: 'Invalid credentials'
      }));
    });
  });
});