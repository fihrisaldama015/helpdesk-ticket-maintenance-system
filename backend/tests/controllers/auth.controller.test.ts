import { AuthController } from '@/controllers/auth.controller';
import { UserRole } from '@/models';
import { AuthService } from '@/services/auth.service';
import { Request, Response } from 'express';
import * as httpMocks from 'node-mocks-http';

jest.mock('@/services/auth.service');

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new (AuthService as jest.Mock<AuthService>)() as jest.Mocked<AuthService>;
    authController = new AuthController(authService);
  });

  describe('register', () => {
    it('should return 400 if register request body is invalid', async () => {
      // Missing required fields
      const invalidUserData = {
        email: 'test@example.com',
        // Missing password, firstName, lastName, role
      };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/auth/register',
        body: invalidUserData
      });

      const res = httpMocks.createResponse();

      await authController.register(req, res);

      expect(authService.register).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Invalid register request body, make sure all fields are provided. Email, password, firstName, lastName, role are required'
      });
    });

    it('should return 400 if email format is invalid', async () => {
      const invalidEmailData = {
        email: 'invalid-email',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.L1_AGENT
      };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/auth/register',
        body: invalidEmailData
      });

      const res = httpMocks.createResponse();

      await authController.register(req, res);

      expect(authService.register).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Invalid email format'
      });
    });

    it('should return 400 if user role is invalid', async () => {
      const invalidRoleData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'INVALID_ROLE' // Not a valid UserRole
      };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/auth/register',
        body: invalidRoleData
      });

      const res = httpMocks.createResponse();

      await authController.register(req, res);

      expect(authService.register).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Invalid user role, make sure role is provided and is one of the following: L1_AGENT, L2_SUPPORT, L3_SUPPORT'
      });
    });

    it('should handle internal server error during registration', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.L1_AGENT
      };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/auth/register',
        body: userData
      });

      const res = httpMocks.createResponse();

      // Simulate a database or unexpected error
      const error = new Error('Database error');
      authService.register.mockRejectedValueOnce(error);
      
      // Spy on console.error to verify it's called
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await authController.register(req, res);

      expect(authService.register).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Internal server error'
      });
    });
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.L1_AGENT
      };

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
      const userData = {
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.L1_AGENT
      };

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
    it('should return 400 if login request body is invalid', async () => {
      // Missing required fields
      const invalidLoginData = {
        // Missing email and password
      };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/auth/login',
        body: invalidLoginData
      });

      const res = httpMocks.createResponse();

      await authController.login(req, res);

      expect(authService.login).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Invalid login request body, make sure email and password are provided'
      });
    });

    it('should return 400 if email format is invalid for login', async () => {
      const invalidEmailData = {
        email: 'invalid-email',
        password: 'Password123!'
      };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/auth/login',
        body: invalidEmailData
      });

      const res = httpMocks.createResponse();

      await authController.login(req, res);

      expect(authService.login).not.toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Invalid email format'
      });
    });

    it('should handle internal server error during login', async () => {
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

      // Simulate a database or unexpected error
      const error = new Error('Database error');
      authService.login.mockRejectedValueOnce(error);
      
      // Spy on console.error to verify it's called
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await authController.login(req, res);

      expect(authService.login).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Internal server error'
      });
    });
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
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword!'
      };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/auth/login',
        body: loginData
      });

      const res = httpMocks.createResponse();

      const error = new Error('Invalid credentials');
      authService.login.mockRejectedValueOnce(error);

      await authController.login(req, res);
      expect(authService.login).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
        message: 'Invalid credentials'
      }));
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user when authenticated', async () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.L1_AGENT
      };

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/auth/me',
        user // Simulate authenticated user in request
      });

      const res = httpMocks.createResponse();

      await authController.getCurrentUser(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(user);
    });

    it('should return 401 if user is not authenticated', async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/auth/me',
        // No user property, simulating unauthenticated request
      });

      const res = httpMocks.createResponse();

      await authController.getCurrentUser(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Not authenticated'
      });
    });

    it('should handle internal server error when getting current user', async () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.L1_AGENT
      };

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/auth/me',
        user
      });

      const res = httpMocks.createResponse();
      
      // Mock an error in the try block by making the user property throw an error when accessed
      Object.defineProperty(req, 'user', {
        get: function() {
          // First return the user, then throw an error on second access
          if (!this._userAccessed) {
            this._userAccessed = true;
            return user;
          }
          throw new Error('Unexpected error');
        }
      });

      // Spy on console.error to verify it's called
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await authController.getCurrentUser(req, res);

      expect(console.error).toHaveBeenCalled();
      
      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Internal server error'
      });
    });
  });
});