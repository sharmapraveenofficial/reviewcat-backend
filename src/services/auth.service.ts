import { StatusCodes } from 'http-status-codes';
import User from '../models/user.model';
import { AppError } from '../middleware/errorHandler';
import { tokenService, TokenResponse } from './token.service';
import Company from '../models/company.model';
import { Types } from 'mongoose';

interface AuthResponse {
    user: Record<string, any>;
    tokens: TokenResponse;
    companies?: Record<string, any>[];
}

export const authService = {
    /**
     * Login user with email and password
     */
    login: async (email: string, password: string): Promise<AuthResponse> => {
        // Find user by email and explicitly select the password field
        const user = await User.findOne({ email }).select('+password');

        // Check if user exists
        if (!user) {
            throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
        }

        // Create a new object without the password
        const { password: _, ...userResponse } = user.toObject();

        // Generate authentication tokens
        const tokens = await tokenService.generateAuthTokens(user._id);

        // Get companies the user belongs to
        const companies = await Company.find({ 'users.userId': user._id }).lean();

        return {
            user: {
                ...userResponse,
                companies: companies.length > 0 ? companies : [],
            },
            tokens,
        };
    },

    /**
     * Register new user
     */
    register: async (userData: { name: string; email: string; password: string }): Promise<AuthResponse> => {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });

        if (existingUser) {
            throw new AppError('User already exists', StatusCodes.BAD_REQUEST);
        }

        // Create new user
        const user = await User.create(userData);

        // Create a new object without the password
        const { password: _, ...userResponse } = user.toObject();

        // Generate authentication tokens
        const tokens = await tokenService.generateAuthTokens(user._id);

        // New user won't have companies yet
        return {
            user: {
                ...userResponse,
                companies: []
            },
            tokens,
        };
    },

    /**
     * Refresh authentication tokens
     */
    refreshTokens: async (refreshToken: string): Promise<TokenResponse> => {
        return tokenService.refreshAuth(refreshToken);
    },

    /**
     * Logout user
     */
    logout: async (userId: string, refreshToken: string): Promise<void> => {
        await tokenService.removeRefreshToken(userId, refreshToken);
    },

    /**
     * Logout from all devices
     */
    logoutAll: async (userId: string): Promise<void> => {
        await tokenService.removeAllRefreshTokens(userId);
    },

    /**
     * Get current user's profile
     */
    getMe: async (userId: string | Types.ObjectId): Promise<AuthResponse> => {
        // Find user by ID
        const user = await User.findById(userId);

        if (!user) {
            throw new AppError('User not found', StatusCodes.NOT_FOUND);
        }

        // Convert to object and remove password
        const { password: _, ...userResponse } = user.toObject();
        const tokens = await tokenService.generateAuthTokens(user._id);

        // Get companies the user belongs to
        const companies = await Company.find({ 'users.userId': userId }).lean();

        return {
            user: {
                ...userResponse,
                companies: companies.length > 0 ? companies : [],
            },
            tokens,
        };
    },
}; 