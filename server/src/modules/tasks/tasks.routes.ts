import { Router } from 'express';
import { tasksController } from './tasks.controller';
import { authenticate, isProjectMember } from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  addCommentSchema,
  getTasksQuerySchema,
} from './tasks.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all tasks (filtered by access)
router.get('/', validate(getTasksQuerySchema), tasksController.getAllTasks);

// Get task by ID
router.get('/:taskId', validate(taskIdParamSchema), tasksController.getTaskById);

// Create task
router.post('/', validate(createTaskSchema), tasksController.createTask);

// Update task
router.patch('/:taskId', validate(updateTaskSchema), tasksController.updateTask);

// Delete task
router.delete('/:taskId', validate(taskIdParamSchema), tasksController.deleteTask);

// Add comment to task
router.post('/:taskId/comments', validate(addCommentSchema), tasksController.addComment);

// Get tasks by project (Kanban board)
router.get('/project/:projectId/kanban', tasksController.getTasksByProject);

export default router;
