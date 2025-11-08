import { Router } from 'express';
import { projectsController } from './projects.controller';
import { authenticate, authorize, isAdminOrPM, isProjectMember } from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import { UserRole } from '@oneflow/shared';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdParamSchema,
  addTeamMemberSchema,
  removeTeamMemberSchema,
  getProjectsQuerySchema,
} from './projects.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all projects (filtered by access)
router.get('/', validate(getProjectsQuerySchema), projectsController.getAllProjects);

// Get project by ID
router.get(
  '/:projectId',
  validate(projectIdParamSchema),
  isProjectMember('projectId'),
  projectsController.getProjectById
);

// Get project stats
router.get(
  '/:projectId/stats',
  validate(projectIdParamSchema),
  isProjectMember('projectId'),
  projectsController.getProjectStats
);

// Create project (Admin & PM only)
router.post(
  '/',
  isAdminOrPM,
  validate(createProjectSchema),
  projectsController.createProject
);

// Update project (Admin & PM of the project)
router.patch(
  '/:projectId',
  validate(updateProjectSchema),
  projectsController.updateProject
);

// Delete project (Admin & PM of the project)
router.delete(
  '/:projectId',
  validate(projectIdParamSchema),
  projectsController.deleteProject
);

// Add team member
router.post(
  '/:projectId/team',
  validate(addTeamMemberSchema),
  projectsController.addTeamMember
);

// Remove team member
router.delete(
  '/:projectId/team/:userId',
  validate(removeTeamMemberSchema),
  projectsController.removeTeamMember
);

export default router;
