import { Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { timesheetsService } from './timesheets.service';
import { AuthRequest } from '@/middlewares/auth';

export class TimesheetsController {
  getAllTimesheets = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { projectId, taskId, startDate, endDate, page, limit } = req.query as any;

    const result = await timesheetsService.getAllTimesheets(
      userId,
      userRole,
      projectId,
      taskId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      page,
      limit
    );

    res.status(200).json({ success: true, data: result });
  });

  createTimesheet = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const timesheet = await timesheetsService.createTimesheet({ ...req.body, userId });

    res.status(201).json({
      success: true,
      data: { timesheet },
      message: 'Timesheet created successfully',
    });
  });

  updateTimesheet = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { timesheetId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const timesheet = await timesheetsService.updateTimesheet(timesheetId, userId, userRole, req.body);

    res.status(200).json({ success: true, data: { timesheet }, message: 'Timesheet updated successfully' });
  });

  deleteTimesheet = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { timesheetId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await timesheetsService.deleteTimesheet(timesheetId, userId, userRole);

    res.status(200).json({ success: true, data: result });
  });

  getUserStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query as any;

    const stats = await timesheetsService.getUserStats(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    res.status(200).json({ success: true, data: { stats } });
  });
}

export const timesheetsController = new TimesheetsController();
