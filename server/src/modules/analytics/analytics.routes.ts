import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authenticate, authorize } from '@/middlewares/auth';
import { UserRole } from '@oneflow/shared';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

// All analytics routes are restricted to ADMIN and PROJECT_MANAGER
router.use(authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER));

router.get('/dashboard', analyticsController.getDashboardStats.bind(analyticsController));
router.get('/financial-report', analyticsController.getFinancialReport.bind(analyticsController));
router.get('/team-performance', analyticsController.getTeamPerformance.bind(analyticsController));
router.get('/project-timeline/:projectId', analyticsController.getProjectTimeline.bind(analyticsController));

export default router;
