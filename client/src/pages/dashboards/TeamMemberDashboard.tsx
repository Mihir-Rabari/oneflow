import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckSquare, 
  Clock, 
  Receipt,
  AlertCircle,
  Calendar,
  Plus
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export function TeamMemberDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    myTasks: 0,
    completedTasks: 0,
    hoursLogged: 0,
    pendingExpenses: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // TODO: Fetch actual stats from API
      setStats({
        myTasks: 5,
        completedTasks: 12,
        hoursLogged: 35,
        pendingExpenses: 2
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const taskStatuses = [
    { status: 'NEW', count: 2, color: 'bg-blue-500' },
    { status: 'IN_PROGRESS', count: 2, color: 'bg-yellow-500' },
    { status: 'BLOCKED', count: 1, color: 'bg-red-500' },
  ]

  const quickActions = [
    { icon: CheckSquare, label: "My Tasks", path: "/tasks", color: "text-blue-600" },
    { icon: Clock, label: "Log Hours", path: "/timesheets", color: "text-green-600" },
    { icon: Receipt, label: "Submit Expense", path: "/expenses", color: "text-purple-600" },
    { icon: Calendar, label: "My Schedule", path: "/schedule", color: "text-orange-600" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Assigned to me
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hoursLogged}h</div>
              <p className="text-xs text-muted-foreground mt-1">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Expenses</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingExpenses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        {/* Task Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>My Tasks Breakdown</CardTitle>
            <CardDescription>Current task status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {taskStatuses.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium">{item.status.replace('_', ' ')}</span>
                  </div>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/tasks')}
              >
                View All Tasks
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Member Info */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <AlertCircle className="h-5 w-5" />
              Team Member Access
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-green-800">
            <ul className="list-disc list-inside space-y-1">
              <li>View and update assigned tasks</li>
              <li>Log work hours (timesheets)</li>
              <li>Submit expenses for approval</li>
              <li>View project details</li>
              <li>Add task comments and attachments</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
