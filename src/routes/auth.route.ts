import authController from '@/controllers/auth.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import express from 'express';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;