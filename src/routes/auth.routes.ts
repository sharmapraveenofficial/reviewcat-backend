import { Router } from 'express';
import passport from 'passport';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import env from '../config/env';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-tokens', authController.refreshTokens);

// Protected routes
router.get('/me', authMiddleware.authenticate, authController.getMe);
router.post('/logout', authMiddleware.authenticate, authController.logout);
router.post('/logout-all', authMiddleware.authenticate, authController.logoutAll);

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  authController.googleAuthCallback
);

export default router; 