import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from './errorHandler';
import { tokenService } from '../services/token.service';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      currentUser?: {
        userId: string;
      };
    }
  }
}

export const authMiddleware = {
  /**
   * Authenticate requests using JWT
   */
  authenticate: (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Authentication required', StatusCodes.UNAUTHORIZED);
      }
      
      const token = authHeader.split(' ')[1];
      
      if (!token) {
        throw new AppError('Authentication required', StatusCodes.UNAUTHORIZED);
      }
      
      const decoded = tokenService.verifyAccessToken(token);
      
      // Attach user to request
      req.currentUser = {
        userId: decoded.userId,
      };
      
      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(new AppError('Authentication failed', StatusCodes.UNAUTHORIZED));
      }
    }
  }
}; 