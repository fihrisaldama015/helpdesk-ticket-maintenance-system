import { UserRole } from '@/models';
import { AuthService, INVALID_CREDENTIALS, USER_NOT_FOUND, USER_WITH_EMAIL_ALREADY_EXISTS } from '@/services/auth.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

jest.mock('@/config/prisma', () => {
  return {
    __esModule: true,
    default: {
      user: {
        findUnique: jest.fn(),
        create: jest.fn()
      }
    }
  }
});

import prisma from '@/config/prisma';

describe('AuthService', () => {
  let authService: AuthService;
  const email = 'test@example.com';
  const password = 'Password123!';
  const firstName = 'Test';
  const lastName = 'User';
  const role = UserRole.L1_AGENT;
  const hashedPassword = 'hashed_password';
  const userId = '123';
  const token = 'jwt_token';

  beforeEach(() => {
    jest.clearAllMocks();

    authService = new AuthService();
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
    (jwt.sign as jest.Mock).mockReturnValue('token123');
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

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

      (prisma.user.create as jest.Mock).mockResolvedValueOnce(createdUser);

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
        role
      });

      expect(result).toEqual({
        user: {
          id: '123',
          email,
          firstName,
          lastName,
          role,
          createdAt: createdUser.createdAt,
          updatedAt: createdUser.updatedAt
        },
        token: 'token123'
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email }
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(password, expect.any(String));

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          role
        }
      });
    });

    it('should throw an error if the user already exists', async () => {
      const existingUser = {
        id: '123',
        email,
        passwordHash: 'hashed_password',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(existingUser);

      await expect(
        authService.register({
          email,
          password,
          firstName,
          lastName,
          role
        })
      ).rejects.toThrow(USER_WITH_EMAIL_ALREADY_EXISTS);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email }
      });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const user = {
        id: userId,
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        role,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(user);

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      (jwt.sign as jest.Mock).mockReturnValueOnce(token);

      const result = await authService.login(email, password);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email }
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId, email, role },
        expect.any(String),
        { expiresIn: expect.any(String) }
      );

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
      const email = 'nonexistent@example.com';

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        authService.login(email, password)
      ).rejects.toThrow(USER_NOT_FOUND);

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw an error if the password is incorrect', async () => {
      const password = 'WrongPassword!';

      const user = {
        id: '123',
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        role,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(user);

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        authService.login(email, password)
      ).rejects.toThrow(INVALID_CREDENTIALS);
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
});