import { UserRole } from '@/models';
import { AuthService } from '@/services/auth.service';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('@prisma/client');

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up mocked PrismaClient
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

    // Create instance of the service with mocked dependencies
    authService = new AuthService();

    // Replace the prisma instance with our mock
    (authService as any).prisma = mockPrisma;
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Mock data
      const email = 'test@example.com';
      const password = 'Password123!';
      const firstName = 'Test';
      const lastName = 'User';
      const role = UserRole.L1_AGENT;
      const hashedPassword = 'hashed_password';

      // Mock bcrypt hash function
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce(hashedPassword);

      // Mock prisma user.findUnique to return null (user doesn't exist)
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      // Mock prisma user.create
      const createdUser = {
        id: '123',
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        role,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (mockPrisma.user.create as jest.Mock).mockResolvedValueOnce(createdUser);

      // Call the service method
      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
        role
      });

      // Assertions
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email }
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(password, expect.any(Number));

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          role
        }
      });

      // Verify the returned user object (without password)
      expect(result).toEqual({
        id: createdUser.id,
        email: createdUser.email,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        role: createdUser.role,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw an error if the user already exists', async () => {
      // Mock data
      const email = 'existing@example.com';
      const password = 'Password123!';
      const firstName = 'Existing';
      const lastName = 'User';
      const role = UserRole.L1_AGENT;

      // Mock prisma user.findUnique to return an existing user
      const existingUser = {
        id: '123',
        email,
        passwordHash: 'hashed_password',
        firstName,
        lastName,
        role
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(existingUser);

      // Call the service method and expect it to throw
      await expect(
        authService.register({
          email,
          password,
          firstName,
          lastName,
          role
        })
      ).rejects.toThrow('User with this email already exists');

      // Verify that create wasn't called
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      // Mock data
      const email = 'test@example.com';
      const password = 'Password123!';
      const hashedPassword = 'hashed_password';
      const userId = '123';
      const token = 'jwt_token';

      // Mock user from database
      const user = {
        id: userId,
        email,
        passwordHash: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.L1_AGENT,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock prisma user.findUnique
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(user);

      // Mock bcrypt compare
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      // Mock jwt sign
      (jwt.sign as jest.Mock).mockReturnValueOnce(token);

      // Call the service method
      const result = await authService.login(email, password);

      // Assertions
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email }
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: userId, role: UserRole.L1_AGENT },
        expect.any(String),
        { expiresIn: expect.any(String) }
      );

      // Verify the returned object structure
      expect(result).toEqual({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw an error if the user does not exist', async () => {
      // Mock data
      const email = 'nonexistent@example.com';
      const password = 'Password123!';

      // Mock prisma user.findUnique to return null
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      // Call the service method and expect it to throw
      await expect(
        authService.login(email, password)
      ).rejects.toThrow('Invalid credentials');

      // Verify that bcrypt.compare wasn't called
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw an error if the password is incorrect', async () => {
      // Mock data
      const email = 'test@example.com';
      const password = 'WrongPassword!';
      const hashedPassword = 'hashed_password';

      // Mock user from database
      const user = {
        id: '123',
        email,
        passwordHash: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.L1_AGENT
      };

      // Mock prisma user.findUnique
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(user);

      // Mock bcrypt compare to return false (password doesn't match)
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      // Call the service method and expect it to throw
      await expect(
        authService.login(email, password)
      ).rejects.toThrow('Invalid credentials');

      // Verify that jwt.sign wasn't called
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
});