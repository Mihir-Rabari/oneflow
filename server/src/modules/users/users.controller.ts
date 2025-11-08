import { Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { usersService } from './users.service';
import { AuthRequest } from '@/middlewares/auth';

export class UsersController {
  getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, role, status, search } = req.query as any;
    const result = await usersService.getAllUsers(page, limit, role, status, search);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const user = await usersService.getUserById(userId);

    res.status(200).json({
      success: true,
      data: { user },
    });
  });

  createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, name, role, phone, hourlyRate, department } = req.body;
    const user = await usersService.createUser(email, name, role, phone, hourlyRate, department);

    res.status(201).json({
      success: true,
      data: { user },
      message: 'User created successfully. Credentials sent via email.',
    });
  });

  updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const user = await usersService.updateUser(userId, req.body);

    res.status(200).json({
      success: true,
      data: { user },
      message: 'User updated successfully',
    });
  });

  updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const user = await usersService.updateProfile(userId, req.body);

    res.status(200).json({
      success: true,
      data: { user },
      message: 'Profile updated successfully',
    });
  });

  changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;
    const result = await usersService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const requestingUserId = req.user!.id;
    const result = await usersService.deleteUser(userId, requestingUserId);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  getUserStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const stats = await usersService.getUserStats(userId);

    res.status(200).json({
      success: true,
      data: { stats },
    });
  });
}

export const usersController = new UsersController();
