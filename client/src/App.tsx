import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RoleProtectedRoute } from './components/RoleProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { OTPPage } from './pages/auth/OTPPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { AdminDashboard } from './pages/dashboards/AdminDashboard'
import { ProjectManagerDashboard } from './pages/dashboards/ProjectManagerDashboard'
import { TeamMemberDashboard } from './pages/dashboards/TeamMemberDashboard'
import { SalesFinanceDashboard } from './pages/dashboards/SalesFinanceDashboard'
import { ProjectsPage } from './pages/projects/ProjectsPage'
import { ProjectDetailPage } from './pages/projects/ProjectDetailPage'
import { TaskDetailPage } from './pages/tasks/TaskDetailPage'
import { TimesheetsPage } from './pages/timesheets/TimesheetsPage'
import { BillingPage } from './pages/billing/BillingPage'
import { AnalyticsPage } from './pages/analytics/AnalyticsPage'
import { TeamPage } from './pages/team/TeamPage'
import { SettingsPage } from './pages/settings/SettingsPage'
import { ComponentsDemo } from './pages/ComponentsDemo'
import { SalesOrdersPage } from './pages/documents/SalesOrdersPage'
import { PurchaseOrdersPage } from './pages/documents/PurchaseOrdersPage'
import { InvoicesPage } from './pages/documents/InvoicesPage'
import { VendorBillsPage } from './pages/documents/VendorBillsPage'
import { ExpensesPage } from './pages/documents/ExpensesPage'
import { ProductsPage } from './pages/documents/ProductsPage'
import { UsersPage } from './pages/users/UsersPage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'

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
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          
          {/* Role-specific dashboards */}
          <Route path="/admin/dashboard" element={<RoleProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></RoleProtectedRoute>} />
          <Route path="/pm/dashboard" element={<RoleProtectedRoute allowedRoles={["PROJECT_MANAGER"]}><ProjectManagerDashboard /></RoleProtectedRoute>} />
          <Route path="/team/dashboard" element={<RoleProtectedRoute allowedRoles={["TEAM_MEMBER"]}><TeamMemberDashboard /></RoleProtectedRoute>} />
          <Route path="/finance/dashboard" element={<RoleProtectedRoute allowedRoles={["SALES_FINANCE"]}><SalesFinanceDashboard /></RoleProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
          <Route path="/tasks/:taskId" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
          <Route path="/timesheets" element={<ProtectedRoute><TimesheetsPage /></ProtectedRoute>} />
          <Route path="/billing" element={<RoleProtectedRoute allowedRoles={["ADMIN", "PROJECT_MANAGER"]}><BillingPage /></RoleProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
          <Route path="/users" element={<RoleProtectedRoute allowedRoles={["ADMIN"]}><UsersPage /></RoleProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          
          {/* Document routes */}
          <Route path="/sales-orders" element={<ProtectedRoute><SalesOrdersPage /></ProtectedRoute>} />
          <Route path="/purchase-orders" element={<ProtectedRoute><PurchaseOrdersPage /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
          <Route path="/vendor-bills" element={<ProtectedRoute><VendorBillsPage /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
          
          <Route path="/components" element={<ComponentsDemo />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
