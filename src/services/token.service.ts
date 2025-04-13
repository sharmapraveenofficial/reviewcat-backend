import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';
import jwtConfig from '../config/jwt';
import User from '../models/user.model';
import { AppError } from '../middleware/errorHandler';
import { StatusCodes } from 'http-status-codes';

interface TokenPayload {
  userId: string;
  type: 'access' | 'refresh';
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Timestamp when access token expires
}

export const tokenService = {
  /**
   * Generate access token
   */
  generateAccessToken: (userId: string | Types.ObjectId): string => {
    const secret: Secret = Buffer.from(
      jwtConfig.accessToken.secret || '', 
      'utf-8'
    );
    
    return jwt.sign(
      { userId, type: 'access' } as TokenPayload,
      secret,
      { expiresIn: jwtConfig.accessToken.expiresIn } as SignOptions
    );
  },

  /**
   * Generate refresh token
   */
  generateRefreshToken: (userId: string | Types.ObjectId): string => {
    const secret: Secret = Buffer.from(
      jwtConfig.refreshToken.secret || '', 
      'utf-8'
    );
    
    return jwt.sign(
      { userId, type: 'refresh' } as TokenPayload,
      secret,
      { expiresIn: jwtConfig.refreshToken.expiresIn } as SignOptions
    );
  },

  /**
   * Generate token response with access and refresh tokens
   */
  generateAuthTokens: async (userId: string | Types.ObjectId): Promise<TokenResponse> => {
    const accessToken = tokenService.generateAccessToken(userId);
    const refreshToken = tokenService.generateRefreshToken(userId);

    // Store refresh token in database
    await User.findByIdAndUpdate(userId, {
      $push: { refreshTokens: refreshToken },
    });

    // Calculate expiration time for frontend use
    const jwtPayload = jwt.decode(accessToken) as { exp: number };
    const expiresAt = jwtPayload.exp * 1000; // Convert to milliseconds

    return {
      accessToken,
      refreshToken,
      expiresAt,
    };
  },

  /**
   * Verify access token
   */
  verifyAccessToken: (token: string): TokenPayload => {
    try {
      const secret: Secret = Buffer.from(
        jwtConfig.accessToken.secret || '', 
        'utf-8'
      );
      const decoded = jwt.verify(token, secret) as TokenPayload;
      
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      throw new AppError('Invalid or expired token', StatusCodes.UNAUTHORIZED);
    }
  },

  /**
   * Verify refresh token
   */
  verifyRefreshToken: (token: string): TokenPayload => {
    try {
      const secret: Secret = Buffer.from(
        jwtConfig.refreshToken.secret || '', 
        'utf-8'
      );
      const decoded = jwt.verify(token, secret) as TokenPayload;
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', StatusCodes.UNAUTHORIZED);
    }
  },

  /**
   * Refresh tokens - verify refresh token and generate new tokens
   */
  refreshAuth: async (refreshToken: string): Promise<TokenResponse> => {
    try {
      // Verify refresh token
      const decoded = tokenService.verifyRefreshToken(refreshToken);
      const { userId } = decoded;

      // Check if refresh token exists in database
      const user = await User.findById(userId);
      if (!user || !user.refreshTokens.includes(refreshToken)) {
        throw new AppError('Invalid refresh token', StatusCodes.UNAUTHORIZED);
      }

      // Remove the used refresh token and generate new tokens
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: refreshToken },
      });

      // Generate new tokens
      return tokenService.generateAuthTokens(userId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to refresh authentication', StatusCodes.UNAUTHORIZED);
    }
  },

  /**
   * Remove refresh token (logout)
   */
  removeRefreshToken: async (userId: string | Types.ObjectId, refreshToken: string): Promise<void> => {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken },
    });
  },

  /**
   * Remove all refresh tokens for a user (logout from all devices)
   */
  removeAllRefreshTokens: async (userId: string | Types.ObjectId): Promise<void> => {
    await User.findByIdAndUpdate(userId, {
      $set: { refreshTokens: [] },
    });
  },
}; 