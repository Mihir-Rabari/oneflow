import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  FolderKanban, 
  FileText,
  ShoppingCart,
  Receipt,
  Settings,
  AlertCircle
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { ActivityFeed } from "@/components/ActivityFeed"

export function AdminDashboard() {
  const navigate = useNavigate()

  const quickActions = [
    { icon: Users, label: "Manage Users", path: "/users", color: "text-blue-600" },
    { icon: FolderKanban, label: "All Projects", path: "/projects", color: "text-green-600" },
    { icon: Settings, label: "System Settings", path: "/settings", color: "text-purple-600" },
    { icon: FileText, label: "Invoices", path: "/invoices", color: "text-orange-600" },
    { icon: ShoppingCart, label: "Sales Orders", path: "/sales-orders", color: "text-pink-600" },
    { icon: Receipt, label: "Purchase Orders", path: "/purchase-orders", color: "text-indigo-600" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Complete system overview and management</p>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your system efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => (
                <Button
                  key={action.path}
                  variant="outline"
                  className="h-20 justify-start"
                  onClick={() => navigate(action.path)}
                >
                  <action.icon className={`h-6 w-6 mr-3 ${action.color}`} />
                  <span className="font-semibold">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <ActivityFeed limit={15} showFilters={true} autoRefresh={true} refreshInterval={4000} />

        {/* Admin Privileges Notice */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertCircle className="h-5 w-5" />
              Administrator Privileges
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-orange-800">
            <ul className="list-disc list-inside space-y-1">
              <li>Full access to all system modules</li>
              <li>User management and role assignment</li>
              <li>System configuration and settings</li>
              <li>View and manage all projects, tasks, and documents</li>
              <li>Financial overview and reporting</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
