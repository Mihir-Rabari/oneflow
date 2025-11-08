import { Router } from 'express';
import { timesheetsController } from './timesheets.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all timesheets (filtered by access)
router.get('/', timesheetsController.getAllTimesheets);

// Get user's timesheet stats
router.get('/stats', timesheetsController.getUserStats);

// Create timesheet
router.post('/', timesheetsController.createTimesheet);

// Update timesheet
router.patch('/:timesheetId', timesheetsController.updateTimesheet);

// Delete timesheet
router.delete('/:timesheetId', timesheetsController.deleteTimesheet);

export default router;
