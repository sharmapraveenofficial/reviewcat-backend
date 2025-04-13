import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { authService } from '../services/auth.service';
import { oauthService } from '../services/oauth.service';
import env from '../config/env';

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      
      // Validate request
      if (!name || !email || !password) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Please provide name, email and password',
        });
        return;
      }
      
      const result = await authService.register({ name, email, password });
      
      res.status(StatusCodes.CREATED).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      
      // Validate request
      if (!email || !password) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Please provide email and password',
        });
        return;
      }
      
      const result = await authService.login(email, password);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  refreshTokens: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }
      
      const tokens = await authService.refreshTokens(refreshToken);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: { tokens },
      });
    } catch (error) {
      next(error);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      
      if (!req.currentUser || !refreshToken) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'User ID and refresh token are required',
        });
        return;
      }
      
      await authService.logout(req.currentUser.userId, refreshToken);
      
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  logoutAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.currentUser) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }
      
      await authService.logoutAll(req.currentUser.userId);
      
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Logged out from all devices successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handle Google OAuth callback
   */
  googleAuthCallback: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get profile from Passport
      const profile = req.user as any;
      
      if (!profile) {
        return res.redirect(`${env.FRONTEND_URL}/login?error=OAuth%20failed`);
      }

      // Process Google authentication
      const tokens = await oauthService.processGoogleAuth({
        id: profile.id,
        displayName: profile.displayName,
        emails: profile.emails,
        photos: profile.photos
      });

      // Redirect to frontend with tokens (in query params or as cookie)
      // In production, you might want to use a more secure method
      return res.redirect(
        `${env.FRONTEND_URL}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}&expiresAt=${tokens.expiresAt}`
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current user profile
   */
  getMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.currentUser) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        });
      }
      
      const profileData = await authService.getMe(req.currentUser.userId);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: profileData,
      });
    } catch (error) {
      next(error);
    }
  },
}; 