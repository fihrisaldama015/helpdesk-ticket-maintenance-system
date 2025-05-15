import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { UserRole } from '@/models';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

jest.mock('@/config/prisma', () => {
  return {
    __esModule: true,
    default: {
      user: {
        findUnique: jest.fn()
      }
    }
  };
});

import prisma from '@/config/prisma';

const mockRes = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authenticate middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 if no Authorization header', async () => {
    const req = { headers: {} } as Request;
    const res = mockRes();
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: '[MIDDLEWARE] Authorization token required',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 if JWT is invalid', async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const req = {
      headers: { authorization: 'Bearer invalid' },
    } as Request;
    const res = mockRes();
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: '[MIDDLEWARE] Invalid authorization token',
    });
  });

  it('returns 401 if user not found in DB', async () => {
    const mockUserPayload = {
      id: 'user-id',
      email: 'test@example.com',
      role: UserRole.L1_AGENT,
    };
    
    (jwt.verify as jest.Mock).mockReturnValue(mockUserPayload);
    
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const req = {
      headers: { authorization: 'Bearer valid' },
    } as Request;
    const res = mockRes();
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: '[MIDDLEWARE] User not found',
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockUserPayload.id }
    });
  });

  it('attaches user and calls next() if valid', async () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      role: UserRole.L1_AGENT,
    };
    
    (jwt.verify as jest.Mock).mockReturnValue(mockUser);
    
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const req = {
      headers: { authorization: 'Bearer valid' },
    } as Request & { user?: any };
    
    const res = mockRes();
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockUser.id }
    });
  });
});

describe('authorize middleware', () => {
  it('returns 401 if req.user is not set', () => {
    const req = {} as Request;
    const res = mockRes();
    const next = jest.fn();

    authorize([UserRole.L2_SUPPORT])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: '[MIDDLEWARE] Not authenticated',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 if user role is not allowed', () => {
    const req = {
      user: { role: UserRole.L1_AGENT },
    } as Request;
    const res = mockRes();
    const next = jest.fn();

    authorize([UserRole.L3_SUPPORT])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: '[MIDDLEWARE] You do not have permission to perform this action',
    });
  });

  it('calls next if role is allowed', () => {
    const req = {
      user: { role: UserRole.L2_SUPPORT },
    } as Request;
    const res = mockRes();
    const next = jest.fn();

    authorize([UserRole.L2_SUPPORT, UserRole.L3_SUPPORT])(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});