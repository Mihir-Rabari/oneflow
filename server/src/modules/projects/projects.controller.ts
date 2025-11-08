import { Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { projectsService } from './projects.service';
import { AuthRequest } from '@/middlewares/auth';

export class ProjectsController {
  getAllProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { page, limit, status, search } = req.query as any;

    const result = await projectsService.getAllProjects(
      userId,
      userRole,
      page,
      limit,
      status,
      search
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  getProjectById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const project = await projectsService.getProjectById(projectId, userId, userRole);

    res.status(200).json({
      success: true,
      data: { project },
    });
  });

  createProject = asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = await projectsService.createProject(req.body);

    res.status(201).json({
      success: true,
      data: { project },
      message: 'Project created successfully',
    });
  });

  updateProject = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const project = await projectsService.updateProject(projectId, userId, userRole, req.body);

    res.status(200).json({
      success: true,
      data: { project },
      message: 'Project updated successfully',
    });
  });

  deleteProject = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await projectsService.deleteProject(projectId, userId, userRole);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  addTeamMember = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;
    const { userId: memberId } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await projectsService.addTeamMember(projectId, userId, memberId, userRole);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  removeTeamMember = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId, userId: memberId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await projectsService.removeTeamMember(projectId, userId, memberId, userRole);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  getProjectStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;
    const stats = await projectsService.getProjectStats(projectId);

    res.status(200).json({
      success: true,
      data: { stats },
    });
  });
}

export const projectsController = new ProjectsController();
