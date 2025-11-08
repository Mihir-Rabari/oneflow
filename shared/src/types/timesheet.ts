export interface Timesheet {
  id: string;
  taskId: string;
  userId: string;
  projectId: string;
  hours: number;
  description?: string;
  isBillable: boolean;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTimesheetDTO {
  taskId: string;
  hours: number;
  description?: string;
  isBillable: boolean;
  date: Date;
}

export interface UpdateTimesheetDTO {
  hours?: number;
  description?: string;
  isBillable?: boolean;
  date?: Date;
}

export interface TimesheetStats {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  totalCost: number;
}
