import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { companyService } from '../services/company.service';
import { projectService } from '../services/project.service';

export const companyController = {
  createCompany: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, platforms, description, userRole } = req.body;
      
      if (!req.currentUser) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        });
      }
      
      // Validate input
      if (!name || !description || !userRole) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Company name, description, and user role are required',
        });
      }
      
      const company = await companyService.createCompany(req.currentUser.userId, {
        name,
        platforms: platforms || [],
        description,
        userRole,
      });
      
      res.status(StatusCodes.CREATED).json({
        success: true,
        data: company,
      });
    } catch (error) {
      next(error);
    }
  },
  
  getUserCompanies: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.currentUser) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        });
      }
      
      const companies = await companyService.getUserCompanies(req.currentUser.userId);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: companies,
      });
    } catch (error) {
      next(error);
    }
  },
  
  getCompanyDetails: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { companyId } = req.params;
      
      if (!req.currentUser) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        });
      }
      
      const company = await companyService.getCompanyById(companyId, req.currentUser.userId);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: company,
      });
    } catch (error) {
      next(error);
    }
  },
  
  createProject: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, companyId, id, platforms } = req.body;
      
      if (!req.currentUser) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        });
      }
      
      // Validate input
      if (!name || !companyId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Project name and company ID are required',
        });
      }
      
      const project = await projectService.createProject(req.currentUser.userId, {
        name,
        description,
        companyId,
        id,
        platforms
      });
      
      res.status(StatusCodes.CREATED).json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  },
  
  getCompanyProjects: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { companyId } = req.params;
      
      if (!req.currentUser) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        });
      }
      
      const projects = await projectService.getCompanyProjects(companyId, req.currentUser.userId);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: projects,
      });
    } catch (error) {
      next(error);
    }
  },
  
  inviteUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { companyId } = req.params;
      const { email, role } = req.body;
      
      if (!req.currentUser) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        });
      }
      
      // Validate input
      if (!email || !role) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Email and role are required',
        });
      }
      
      const result = await companyService.inviteUserToCompany(
        companyId,
        req.currentUser.userId,
        email,
        role
      );
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
}; 