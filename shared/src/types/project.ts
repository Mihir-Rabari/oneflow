export enum ProjectStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ProjectType {
  FIXED_PRICE = 'FIXED_PRICE',
  TIME_AND_MATERIAL = 'TIME_AND_MATERIAL',
  RETAINER = 'RETAINER',
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  type: ProjectType;
  budget?: number;
  spent: number;
  revenue: number;
  profit: number;
  startDate: Date;
  endDate?: Date;
  deadline?: Date;
  progress: number;
  projectManagerId: string;
  clientName?: string;
  clientEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectDTO {
  name: string;
  description?: string;
  type: ProjectType;
  budget?: number;
  startDate: Date;
  endDate?: Date;
  deadline?: Date;
  projectManagerId: string;
  clientName?: string;
  clientEmail?: string;
  teamMemberIds?: string[];
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  deadline?: Date;
  progress?: number;
  clientName?: string;
  clientEmail?: string;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}
