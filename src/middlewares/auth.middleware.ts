import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '@/config/prisma';
import { UserRole } from '@/models';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: '[MIDDLEWARE] Authorization token required' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: UserRole;
    };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    if (!user) {
      res.status(401).json({ message: '[MIDDLEWARE] User not found' });
      return;
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
    };
    next();
  } catch (error) {
    res.status(401).json({ message: '[MIDDLEWARE] Invalid authorization token' });
    return;
  }
};

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: '[MIDDLEWARE] Not authenticated' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: '[MIDDLEWARE] You do not have permission to perform this action'
      });
      return;
    }
    next();
  };
};