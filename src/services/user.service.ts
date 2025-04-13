import { Types } from 'mongoose';
import User from '../models/user.model';
import Company from '../models/company.model';
import { AppError } from '../middleware/errorHandler';
import { StatusCodes } from 'http-status-codes';

export const userService = {
  /**
   * Get user profile with companies
   */
  getUserProfile: async (userId: string | Types.ObjectId): Promise<any> => {
    // Get user
    const user = await User.findById(userId).lean();
    
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }
    
    // Get companies that the user belongs to
    const companies = await Company.find({ 'users.userId': userId }).lean();
    
    // Return user with companies
    return {
      user: {
        ...user,
        password: undefined // Ensure password is not returned
      },
      companies,
    };
  }
}; 