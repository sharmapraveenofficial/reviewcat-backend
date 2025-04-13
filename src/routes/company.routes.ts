import { Router } from 'express';
import { companyController } from '../controllers/company.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware.authenticate);

// Company routes
router.post('/', companyController.createCompany);
router.get('/', companyController.getUserCompanies);
router.get('/:companyId', companyController.getCompanyDetails);
router.post('/:companyId/invite', companyController.inviteUser);

// Project routes
router.post('/projects', companyController.createProject);
router.get('/:companyId/projects', companyController.getCompanyProjects);

export default router; 