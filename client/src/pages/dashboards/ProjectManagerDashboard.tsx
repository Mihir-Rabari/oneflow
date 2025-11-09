import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  DollarSign,
  Plus,
  AlertCircle,
  TrendingUp,
  Users
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { projectsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

export function ProjectManagerDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    myProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBudget: 0,
    totalRevenue: 0
  })
  const [recentProjects, setRecentProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await projectsApi.getAll()
      const projects = res.data?.data?.projects || res.data?.projects || []
      
      // Filter projects where user is the project manager
      const myProjects = projects.filter((p: any) => p.projectManagerId === user?.id)
      
      setStats({
        myProjects: myProjects.length,
        activeProjects: myProjects.filter((p: any) => p.status === 'IN_PROGRESS').length,
        completedProjects: myProjects.filter((p: any) => p.status === 'COMPLETED').length,
        totalBudget: myProjects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0),
        totalRevenue: 0 // Will be calculated from sales orders
      })

      setRecentProjects(myProjects.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { icon: Plus, label: "New Project", path: "/projects", action: "create", color: "text-blue-600" },
    { icon: FolderKanban, label: "My Projects", path: "/projects", color: "text-green-600" },
    { icon: CheckSquare, label: "My Tasks", path: "/tasks", color: "text-purple-600" },
    { icon: Users, label: "Team", path: "/team", color: "text-orange-600" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Project Manager Dashboard</h1>
          <p className="text-muted-foreground">Manage your projects from planning to billing</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total managed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Successfully delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(stats.totalBudget / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all projects
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your projects efficiently</CardDescription>
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

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your latest managed projects</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading projects...</p>
            ) : recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No projects yet</p>
                <Button className="mt-4" onClick={() => navigate('/projects')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Project
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold">{project.name}</h4>
                      <p className="text-sm text-muted-foreground">{project.clientName}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={project.progress || 0} className="w-32" />
                        <span className="text-xs text-muted-foreground">{project.progress || 0}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">₹{(project.budget / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-muted-foreground">{project.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PM Privileges */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <AlertCircle className="h-5 w-5" />
              Project Manager Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800">
            <ul className="list-disc list-inside space-y-1">
              <li>Create and manage projects</li>
              <li>Assign team members and tasks</li>
              <li>Approve timesheets and expenses</li>
              <li>Create Sales Orders, Purchase Orders, and Invoices</li>
              <li>Track project profitability</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
