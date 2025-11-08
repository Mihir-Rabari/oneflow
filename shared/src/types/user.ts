export enum UserRole {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  TEAM_MEMBER = 'TEAM_MEMBER',
  SALES_FINANCE = 'SALES_FINANCE',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  hourlyRate?: number;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  name: string;
  role: UserRole;
  password?: string;
  phone?: string;
  hourlyRate?: number;
  department?: string;
}

export interface UpdateUserDTO {
  name?: string;
  phone?: string;
  hourlyRate?: number;
  department?: string;
  status?: UserStatus;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  name: string;
  password: string;
}

export interface VerifyOTPDTO {
  email: string;
  otp: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
