import { UserRole } from '../models';
import { AuthService, INVALID_CREDENTIALS, USER_NOT_FOUND, USER_WITH_EMAIL_ALREADY_EXISTS } from '../services/auth.service';
import { Request, Response } from 'express';

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface LoginRequest {
  email: string;
  password: string;
}

export class AuthController {
  constructor(private authService: AuthService) {}
  private INVALID_REGISTER_REQUEST_BODY = 'Invalid register request body, make sure all fields are provided. Email, password, firstName, lastName, role are required';
  private INVALID_LOGIN_REQUEST_BODY = 'Invalid login request body, make sure email and password are provided';
  private INVALID_USER_ROLE = 'Invalid user role, make sure role is provided and is one of the following: L1_AGENT, L2_SUPPORT, L3_SUPPORT, ADMIN';
  private INVALID_EMAIL_FORMAT = 'Invalid email format';

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, role } = req.body as RegisterRequest;
      if (!this.validateRegisterRequest(req.body)) {
        console.log('Invalid register request body', req.body);
        res.status(400).json({ message: this.INVALID_REGISTER_REQUEST_BODY });
        return;
      }
      if (!this.validateEmailFormat(email)) {
        res.status(400).json({ message: this.INVALID_EMAIL_FORMAT });
        return;
      }
      if (!Object.values(UserRole).includes(role)) {
        res.status(400).json({ message: this.INVALID_USER_ROLE });
        return;
      }
      const result = await this.authService.register({
        email,
        password,
        firstName,
        lastName,
        role,
      });
      res.status(201).json(result);
    } catch (error: any) {
      if (error.message === USER_WITH_EMAIL_ALREADY_EXISTS) {
        res.status(400).json({ message: error.message });
      } else {
        console.error('[CONTROLLER] Register error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginRequest;
      if (!this.validateLoginRequest(req.body)) {
        res.status(400).json({ message: this.INVALID_LOGIN_REQUEST_BODY });
        return;
      }
      if (!this.validateEmailFormat(email)) {
        res.status(400).json({ message: this.INVALID_EMAIL_FORMAT });
        return;
      }
      const result = await this.authService.login(email, password);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === INVALID_CREDENTIALS || error.message === USER_NOT_FOUND) {
        res.status(400).json({ message: error.message });
      } else {
        console.error('[CONTROLLER] Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      res.status(200).json({ user: req.user });
    } catch (error) {
      console.error('[CONTROLLER] Get current user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  private validateRegisterRequest(req: RegisterRequest): boolean {
    return typeof req.email === 'string' && req.email.length > 0 &&
           typeof req.password === 'string' && req.password.length >= 6 &&
           typeof req.firstName === 'string' && req.firstName.length > 0 &&
           typeof req.lastName === 'string' && req.lastName.length > 0
  };

  private validateEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  private validateLoginRequest(req: LoginRequest): boolean {
    return typeof req.email === 'string' && req.email.length > 0 && typeof req.password === 'string' && req.password.length > 0;
  };
}

export default new AuthController(new AuthService());