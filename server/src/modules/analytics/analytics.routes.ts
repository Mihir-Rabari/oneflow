import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

router.get('/dashboard', analyticsController.getDashboardStats.bind(analyticsController));
router.get('/financial-report', analyticsController.getFinancialReport.bind(analyticsController));
router.get('/team-performance', analyticsController.getTeamPerformance.bind(analyticsController));
router.get('/project-timeline/:projectId', analyticsController.getProjectTimeline.bind(analyticsController));

export default router;
