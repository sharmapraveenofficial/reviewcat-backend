import { Types } from 'mongoose';
import Project from '../models/project.model';
import Company from '../models/company.model';
import { AppError } from '../middleware/errorHandler';
import { StatusCodes } from 'http-status-codes';

interface ProjectInput {
  name: string;
  description?: string;
  companyId: string;
  id?: string;
  platforms?: string[];
}

export const projectService = {
  /**
   * Create a new project
   */
  createProject: async (userId: string | Types.ObjectId, data: ProjectInput) => {
    const { name, description, companyId, id, platforms } = data;

    // Check if company exists and user belongs to it
    const company = await Company.findById(companyId);
    
    if (!company) {
      throw new AppError('Company not found', StatusCodes.NOT_FOUND);
    }

    const userBelongsToCompany = company.users.some(
      user => user.userId.toString() === userId.toString()
    );

    if (!userBelongsToCompany) {
      throw new AppError('You do not have permission to create projects for this company', StatusCodes.FORBIDDEN);
    }

    // Create project
    const project = await Project.create({
      name,
      description: description || '',
      projectId: id,
      platforms: platforms || [],
      company: companyId,
      createdBy: userId,
    });

    // Format response
    const response = project.toObject();
    response.id = project._id;
    
    return response;
  },

  /**
   * Get company projects
   */
  getCompanyProjects: async (companyId: string | Types.ObjectId, userId: string | Types.ObjectId) => {
    // Check if company exists and user belongs to it
    const company = await Company.findById(companyId);
    
    if (!company) {
      throw new AppError('Company not found', StatusCodes.NOT_FOUND);
    }

    const userBelongsToCompany = company.users.some(
      user => user.userId.toString() === userId.toString()
    );

    if (!userBelongsToCompany) {
      throw new AppError('You do not have permission to view projects for this company', StatusCodes.FORBIDDEN);
    }

    // Get all projects for the company
    const projects = await Project.find({ company: companyId }).lean();

    return projects;
  },
}; 