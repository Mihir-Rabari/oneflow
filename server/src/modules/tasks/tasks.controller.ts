import { Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { tasksService } from './tasks.service';
import { AuthRequest } from '@/middlewares/auth';

export class TasksController {
  getAllTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { projectId, status, priority, assignedToId, page, limit } = req.query as any;

    const result = await tasksService.getAllTasks(
      userId,
      userRole,
      projectId,
      status,
      priority,
      assignedToId,
      page,
      limit
    );

    res.status(200).json({ success: true, data: result });
  });

  getTaskById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { taskId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const task = await tasksService.getTaskById(taskId, userId, userRole);

    res.status(200).json({ success: true, data: { task } });
  });

  createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    const createdById = req.user!.id;
    const task = await tasksService.createTask({ ...req.body, createdById });

    res.status(201).json({ success: true, data: { task }, message: 'Task created successfully' });
  });

  updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { taskId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const task = await tasksService.updateTask(taskId, userId, userRole, req.body);

    res.status(200).json({ success: true, data: { task }, message: 'Task updated successfully' });
  });

  deleteTask = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { taskId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await tasksService.deleteTask(taskId, userId, userRole);

    res.status(200).json({ success: true, data: result });
  });

  addComment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { taskId } = req.params;
    const userId = req.user!.id;
    const { content } = req.body;

    const comment = await tasksService.addComment(taskId, userId, content);

    res.status(201).json({ success: true, data: { comment }, message: 'Comment added successfully' });
  });

  getTasksByProject = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;
    const { status } = req.query as any;

    const kanban = await tasksService.getTasksByProject(projectId, status);

    res.status(200).json({ success: true, data: { kanban } });
  });
}

export const tasksController = new TasksController();
