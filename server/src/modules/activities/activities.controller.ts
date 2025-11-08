import { Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { activitiesService } from './activities.service';
import { AuthRequest } from '@/middlewares/auth';

export class ActivitiesController {
  getActivityLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { page, limit, projectId, activityType } = req.query as any;

    const result = await activitiesService.getActivityLogs(
      userId,
      userRole,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      projectId,
      activityType
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  getRecentActivities = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { limit } = req.query as any;

    const activities = await activitiesService.getRecentActivities(
      userId,
      userRole,
      limit ? parseInt(limit) : 10
    );

    res.status(200).json({
      success: true,
      data: { activities },
    });
  });
}

export const activitiesController = new ActivitiesController();
