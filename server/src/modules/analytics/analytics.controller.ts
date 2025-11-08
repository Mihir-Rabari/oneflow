import { Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service';
import { AuthRequest } from '@/middlewares/auth';

export class AnalyticsController {
  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getDashboardStats(req.user!.id, req.user!.role);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getFinancialReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = (req as any).query;
      const report = await analyticsService.getFinancialReport(filters, req.user!.id, req.user!.role);
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  async getTeamPerformance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = (req as any).query;
      const performance = await analyticsService.getTeamPerformance(filters, req.user!.id, req.user!.role);
      res.json({ success: true, data: performance });
    } catch (error) {
      next(error);
    }
  }

  async getProjectTimeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { projectId } = (req as any).params;
      const timeline = await analyticsService.getProjectTimeline(projectId, req.user!.id, req.user!.role);
      res.json({ success: true, data: timeline });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
