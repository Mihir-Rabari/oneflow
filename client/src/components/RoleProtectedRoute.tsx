import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface RoleProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
}

export function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if user's role is in the allowed roles
  if (user && !allowedRoles.includes(user.role)) {
    // Redirect to dashboard if user doesn't have permission
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
