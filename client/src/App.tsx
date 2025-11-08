import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { OTPPage } from './pages/auth/OTPPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { ProjectsPage } from './pages/projects/ProjectsPage'
import { TimesheetsPage } from './pages/timesheets/TimesheetsPage'
import { BillingPage } from './pages/billing/BillingPage'
import { AnalyticsPage } from './pages/analytics/AnalyticsPage'
import { TeamPage } from './pages/team/TeamPage'
import { SettingsPage } from './pages/settings/SettingsPage'
import { ComponentsDemo } from './pages/ComponentsDemo'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OTPPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/timesheets" element={<TimesheetsPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/components" element={<ComponentsDemo />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
