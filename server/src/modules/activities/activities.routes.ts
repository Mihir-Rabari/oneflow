import { Router } from 'express';
import { activitiesController } from './activities.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

// All activity routes require authentication
router.use(authenticate);

// Get activity logs with filtering
router.get('/', activitiesController.getActivityLogs);

// Get recent activities for dashboard
router.get('/recent', activitiesController.getRecentActivities);

export default router;