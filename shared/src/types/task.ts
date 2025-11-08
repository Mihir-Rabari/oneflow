export enum TaskStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assignedToId?: string;
  createdById: string;
  estimatedHours?: number;
  actualHours: number;
  dueDate?: Date;
  startDate?: Date;
  completedDate?: Date;
  order: number;
  parentTaskId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority: TaskPriority;
  projectId: string;
  assignedToId?: string;
  estimatedHours?: number;
  dueDate?: Date;
  startDate?: Date;
  parentTaskId?: string;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  estimatedHours?: number;
  dueDate?: Date;
  startDate?: Date;
  completedDate?: Date;
  order?: number;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}
