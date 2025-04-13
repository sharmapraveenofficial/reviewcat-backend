import { Types } from 'mongoose';
import Company from '../models/company.model';
import { AppError } from '../middleware/errorHandler';
import { StatusCodes } from 'http-status-codes';

interface CompanyInput {
  name: string;
  platforms: string[];
  description: string;
  userRole: string;
}

export const companyService = {
  /**
   * Create a new company
   */
  createCompany: async (userId: string | Types.ObjectId, data: CompanyInput) => {
    const { name, platforms, description, userRole } = data;

    // Create company with current user as admin
    const company = await Company.create({
      name,
      platforms,
      description,
      users: [
        {
          userId,
          role: userRole,
          isAdmin: true, // First user is admin by default
        },
      ],
    });

    return company;
  },

  /**
   * Get company details
   */
  getCompanyById: async (companyId: string | Types.ObjectId, userId: string | Types.ObjectId) => {
    const company = await Company.findById(companyId)
      .lean();

    if (!company) {
      throw new AppError('Company not found', StatusCodes.NOT_FOUND);
    }

    // Check if user belongs to company
    const userBelongsToCompany = company.users.some(
      user => user.userId.toString() === userId.toString()
    );

    if (!userBelongsToCompany) {
      throw new AppError('Unauthorized access to company', StatusCodes.FORBIDDEN);
    }

    return company;
  },

  /**
   * Get all companies for a user
   */
  getUserCompanies: async (userId: string | Types.ObjectId) => {
    const companies = await Company.find({ 'users.userId': userId })
      .lean();

    return companies;
  },

  /**
   * Invite user to company
   */
  inviteUserToCompany: async (
    companyId: string | Types.ObjectId,
    invitedByUserId: string | Types.ObjectId,
    email: string,
    role: string
  ) => {
    // First check if the inviter is an admin
    const company = await Company.findById(companyId);
    
    if (!company) {
      throw new AppError('Company not found', StatusCodes.NOT_FOUND);
    }

    const inviter = company.users.find(
      user => user.userId.toString() === invitedByUserId.toString()
    );

    if (!inviter || !inviter.isAdmin) {
      throw new AppError('Only company admins can invite users', StatusCodes.FORBIDDEN);
    }

    // Here you would typically:
    // 1. Check if user already exists by email
    // 2. If yes, add them to the company
    // 3. If no, send an invitation email with signup link
    
    // This is simplified for now
    await Company.findByIdAndUpdate(
      companyId,
      {
        $addToSet: {
          users: {
            userId: invitedByUserId, // This would be the new user's ID in a real implementation
            role,
            isAdmin: false,
          },
        },
      }
    );

    return { success: true, message: 'Invitation sent successfully' };
  },
}; 