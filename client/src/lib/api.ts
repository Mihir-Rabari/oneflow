// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Types
interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('accessToken')
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        error: data.message || 'An error occurred',
      }
    }

    return { data }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// Authentication API
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyOTP: (data: { email: string; otp: string }) =>
    apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resendOTP: (email: string) =>
    apiRequest('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),
}

// Projects API
export const projectsApi = {
  getAll: () => apiRequest('/projects', { method: 'GET' }),

  getById: (id: string) => apiRequest(`/projects/${id}`, { method: 'GET' }),

  create: (data: any) =>
    apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/projects/${id}`, {
      method: 'DELETE',
    }),

  addMember: (projectId: string, userId: string, role: string) =>
    apiRequest(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    }),
}

// Tasks API
export const tasksApi = {
  getByProject: (projectId: string) =>
    apiRequest(`/projects/${projectId}/tasks`, { method: 'GET' }),

  getById: (taskId: string) =>
    apiRequest(`/tasks/${taskId}`, { method: 'GET' }),

  create: (data: any) =>
    apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  addComment: (taskId: string, content: string) =>
    apiRequest(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
}

// Timesheets API
export const timesheetsApi = {
  getAll: (params?: { projectId?: string; userId?: string; startDate?: string; endDate?: string }) =>
    apiRequest(`/timesheets?${new URLSearchParams(params as any)}`, { method: 'GET' }),

  create: (data: any) =>
    apiRequest('/timesheets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/timesheets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/timesheets/${id}`, {
      method: 'DELETE',
    }),
}

// Billing API
export const billingApi = {
  getInvoices: () =>
    apiRequest('/billing/invoices', { method: 'GET' }),
}

// Sales Orders API
export const salesOrdersApi = {
  getAll: () =>
    apiRequest('/sales-orders', { method: 'GET' }),

  getById: (id: string) =>
    apiRequest(`/sales-orders/${id}`, { method: 'GET' }),

  create: (data: any) =>
    apiRequest('/sales-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/sales-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/sales-orders/${id}`, {
      method: 'DELETE',
    }),
}

// Purchase Orders API
export const purchaseOrdersApi = {
  getAll: () =>
    apiRequest('/purchase-orders', { method: 'GET' }),

  getById: (id: string) =>
    apiRequest(`/purchase-orders/${id}`, { method: 'GET' }),

  create: (data: any) =>
    apiRequest('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/purchase-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/purchase-orders/${id}`, {
      method: 'DELETE',
    }),
}

// Invoices API
export const invoicesApi = {
  getAll: () =>
    apiRequest('/invoices', { method: 'GET' }),

  getById: (id: string) =>
    apiRequest(`/invoices/${id}`, { method: 'GET' }),

  create: (data: any) =>
    apiRequest('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/invoices/${id}`, {
      method: 'DELETE',
    }),

  updateStatus: (id: string, status: string) =>
    apiRequest(`/invoices/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}

// Vendor Bills API
export const vendorBillsApi = {
  getAll: () =>
    apiRequest('/vendor-bills', { method: 'GET' }),

  getById: (id: string) =>
    apiRequest(`/vendor-bills/${id}`, { method: 'GET' }),

  create: (data: any) =>
    apiRequest('/vendor-bills', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/vendor-bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/vendor-bills/${id}`, {
      method: 'DELETE',
    }),
}

// Expenses API
export const expensesApi = {
  getAll: (params?: { projectId?: string; status?: string }) =>
    apiRequest(`/expenses?${new URLSearchParams(params as any)}`, { method: 'GET' }),

  getById: (id: string) =>
    apiRequest(`/expenses/${id}`, { method: 'GET' }),

  create: (data: any) =>
    apiRequest('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/expenses/${id}`, {
      method: 'DELETE',
    }),

  approve: (id: string) =>
    apiRequest(`/expenses/${id}/approve`, {
      method: 'POST',
    }),

  reject: (id: string) =>
    apiRequest(`/expenses/${id}/reject`, {
      method: 'POST',
    }),
}

// Products API
export const productsApi = {
  getAll: () =>
    apiRequest('/products', { method: 'GET' }),

  getById: (id: string) =>
    apiRequest(`/products/${id}`, { method: 'GET' }),

  create: (data: any) =>
    apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/products/${id}`, {
      method: 'DELETE',
    }),
}

// Analytics API
export const analyticsApi = {
  getDashboardStats: () =>
    apiRequest('/analytics/dashboard', { method: 'GET' }),

  getFinancialReport: (params?: any) =>
    apiRequest(`/analytics/financial-report?${new URLSearchParams(params)}`, { method: 'GET' }),

  getTeamPerformance: (params?: any) =>
    apiRequest(`/analytics/team-performance?${new URLSearchParams(params)}`, { method: 'GET' }),

  getProjectTimeline: (projectId: string) =>
    apiRequest(`/analytics/project-timeline/${projectId}`, { method: 'GET' }),
}

// Users/Team API
export const usersApi = {
  getAll: () => apiRequest('/users', { method: 'GET' }),

  getProfile: () => apiRequest('/users/profile', { method: 'GET' }),

  updateProfile: (data: any) =>
    apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiRequest('/users/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// Helper function to set auth token
export const setAuthToken = (token: string) => {
  localStorage.setItem('accessToken', token)
}

// Helper function to clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem('accessToken')
}

// Helper function to get auth token
export const getAuthToken = () => {
  return localStorage.getItem('accessToken')
}
