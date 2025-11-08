import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate, authorize } from '@/middlewares/auth';
import { validate } from '@/middlewares/validate';
import { UserRole } from '@oneflow/shared';
import {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  changePasswordSchema,
  getUsersQuerySchema,
  userIdParamSchema,
} from './users.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all users (Admin & PM can see all, others see team members)
router.get('/', validate(getUsersQuerySchema), usersController.getAllUsers);

// Get user by ID
router.get('/:userId', validate(userIdParamSchema), usersController.getUserById);

// Get user stats
router.get('/:userId/stats', validate(userIdParamSchema), usersController.getUserStats);

// Create user (Admin & PM only)
router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  validate(createUserSchema),
  usersController.createUser
);

// Update user (Admin & PM only)
router.patch(
  '/:userId',
  authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER),
  validate(updateUserSchema),
  usersController.updateUser
);

// Delete user (Admin only)
router.delete(
  '/:userId',
  authorize(UserRole.ADMIN),
  validate(userIdParamSchema),
  usersController.deleteUser
);

// Update own profile (Any authenticated user)
router.patch('/profile/me', validate(updateProfileSchema), usersController.updateProfile);

// Change own password (Any authenticated user)
router.post('/profile/change-password', validate(changePasswordSchema), usersController.changePassword);

export default router;
