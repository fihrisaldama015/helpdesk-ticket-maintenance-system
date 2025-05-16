import { CreateUserDto, User, UserRole } from '../models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

// Error messages
export const USER_NOT_FOUND = 'User not found';
export const INVALID_CREDENTIALS = 'Invalid credentials';
export const USER_WITH_EMAIL_ALREADY_EXISTS = 'User with this email already exists';

export class AuthService {
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'test';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
  }
  async register(userData: CreateUserDto): Promise<{ user: User; token: string }> {
    const userExists = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    if (userExists) {
      throw new Error(USER_WITH_EMAIL_ALREADY_EXISTS);
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      },
    });
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
    });
    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword as User,
      token
    };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new Error(USER_NOT_FOUND);
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error(INVALID_CREDENTIALS);
    }
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
    });
    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword as User,
      token
    };
  }

  private generateToken(user: { id: string; email: string; role: UserRole }): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      this.JWT_SECRET as jwt.Secret,
      { expiresIn: this.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );
  }
}