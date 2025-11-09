import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RoleProtectedRoute } from './components/RoleProtectedRoute'
import { useAuth } from './contexts/AuthContext'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { OTPPage } from './pages/auth/OTPPage'
import { AdminDashboard } from './pages/dashboards/AdminDashboard'
import { ProjectManagerDashboard } from './pages/dashboards/ProjectManagerDashboard'
import TeamMemberProjectView from './pages/dashboards/TeamMemberProjectView'
import FinanceApprovalsPage from './pages/finance/FinanceApprovalsPage'
import { ProjectsPage } from './pages/projects/ProjectsPage'
import { ProjectDetailPage } from './pages/projects/ProjectDetailPage'
import { TaskDetailPage } from './pages/tasks/TaskDetailPage'
import { TeamPage } from './pages/team/TeamPage'
import { SettingsPage } from './pages/settings/SettingsPage'
import { ExpensesPage } from './pages/documents/ExpensesPage'
import { UsersPage } from './pages/users/UsersPage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'

// Dashboard redirect based on role
function DashboardRedirect() {
  const { user } = useAuth()
  
  if (!user) return <Navigate to="/login" replace />
  
  switch (user.role) {
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />
    case 'PROJECT_MANAGER':
      return <Navigate to="/pm/dashboard" replace />
    case 'TEAM_MEMBER':
      return <Navigate to="/team/dashboard" replace />
    case 'SALES_FINANCE':
      return <Navigate to="/finance/approvals" replace />
    default:
      return <Navigate to="/login" replace />
  }
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OTPPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Dashboard redirect based on role */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
          
          {/* Role-specific dashboards - Clean structure */}
          <Route path="/admin/dashboard" element={<RoleProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></RoleProtectedRoute>} />
          <Route path="/pm/dashboard" element={<RoleProtectedRoute allowedRoles={["PROJECT_MANAGER"]}><ProjectManagerDashboard /></RoleProtectedRoute>} />
          <Route path="/team/dashboard" element={<RoleProtectedRoute allowedRoles={["TEAM_MEMBER"]}><TeamMemberProjectView /></RoleProtectedRoute>} />
          <Route path="/finance/approvals" element={<RoleProtectedRoute allowedRoles={["SALES_FINANCE", "ADMIN"]}><FinanceApprovalsPage /></RoleProtectedRoute>} />
          
          {/* Admin & PM routes */}
          <Route path="/projects" element={<RoleProtectedRoute allowedRoles={["ADMIN", "PROJECT_MANAGER"]}><ProjectsPage /></RoleProtectedRoute>} />
          <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
          <Route path="/tasks" element={<RoleProtectedRoute allowedRoles={["ADMIN", "PROJECT_MANAGER"]}><TaskDetailPage /></RoleProtectedRoute>} />
          <Route path="/tasks/:taskId" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
          <Route path="/team" element={<RoleProtectedRoute allowedRoles={["ADMIN", "PROJECT_MANAGER"]}><TeamPage /></RoleProtectedRoute>} />
          
          {/* Admin only routes */}
          <Route path="/users" element={<RoleProtectedRoute allowedRoles={["ADMIN"]}><UsersPage /></RoleProtectedRoute>} />
          <Route path="/admin/expenses" element={<RoleProtectedRoute allowedRoles={["ADMIN"]}><ExpensesPage /></RoleProtectedRoute>} />
          
          {/* Common routes */}
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
