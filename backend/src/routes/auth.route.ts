import authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import express from 'express';

const router = express.Router();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

export default router;