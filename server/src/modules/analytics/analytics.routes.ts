import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authenticate, authorize } from '@/middlewares/auth';
import { UserRole } from '@oneflow/shared';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

// Dashboard stats - accessible to all authenticated users (role-based filtering handled in service)
router.get('/dashboard', analyticsController.getDashboardStats.bind(analyticsController));

// Financial reports - restricted to ADMIN and PROJECT_MANAGER
router.get('/financial-report', authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER), analyticsController.getFinancialReport.bind(analyticsController));

// Team performance - restricted to ADMIN and PROJECT_MANAGER
router.get('/team-performance', authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER), analyticsController.getTeamPerformance.bind(analyticsController));

// Project timeline - accessible to all authenticated users (filtered by service)
router.get('/project-timeline/:projectId', analyticsController.getProjectTimeline.bind(analyticsController));

export default router;
