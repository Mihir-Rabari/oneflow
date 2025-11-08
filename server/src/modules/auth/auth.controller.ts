import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { authService } from './auth.service';
import { AuthRequest } from '@/middlewares/auth';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, name, password } = req.body;
    const result = await authService.register(email, name, password);

    res.status(201).json({
      success: true,
      data: result,
    });
  });

  verifyOTP = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const result = await authService.verifyOTP(email, otp);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  resendOTP = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await authService.resendOTP(email);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const token = req.headers.authorization!.substring(7);

    const result = await authService.logout(userId, token);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  me = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    // Fetch user details from database
    const { prisma } = await import('@/config/database');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        phone: true,
        hourlyRate: true,
        department: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: { user },
    });
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword(email, otp, newPassword);

    res.status(200).json({
      success: true,
      data: result,
    });
  });
}

export const authController = new AuthController();
