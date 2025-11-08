import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderKanban, Clock, FileText, TrendingUp, Loader2 } from "lucide-react"
import { analyticsApi, projectsApi } from "@/lib/api"

export function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    activeProjects: 0,
    hoursLogged: 0,
    revenue: 0,
    profit: 0
  })
  const [recentProjects, setRecentProjects] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [projectsRes, dashboardRes] = await Promise.all([
        projectsApi.getAll(),
        analyticsApi.getDashboardStats()
      ])

      console.log('Dashboard - Projects response:', projectsRes)
      console.log('Dashboard - Analytics response:', dashboardRes)

      if (projectsRes.error) throw new Error(projectsRes.error)
      if (dashboardRes.error) throw new Error(dashboardRes.error)

      // Parse projects: { success: true, data: { projects: [...], pagination: {...} } }
      let projects: any[] = []
      if (projectsRes.data?.data?.projects) {
        projects = projectsRes.data.data.projects
      } else if (projectsRes.data?.projects) {
        projects = projectsRes.data.projects
      } else if (Array.isArray(projectsRes.data)) {
        projects = projectsRes.data
      }

      // Parse dashboard stats: { success: true, data: { overview: {...}, financials: {...}, recentProjects: [...] } }
      const dashboardStats = dashboardRes.data || {}
      const overview = dashboardStats.overview || {}
      const financials = dashboardStats.financials || {}
      const recentProjectsData = dashboardStats.recentProjects || []

      console.log('Dashboard - Parsed projects:', projects)
      console.log('Dashboard - Overview stats:', overview)
      console.log('Dashboard - Financials:', financials)

      setStats({
        activeProjects: overview.activeProjects || 0,
        hoursLogged: financials.totalHoursLogged || 0,
        revenue: financials.totalRevenue || 0,
        profit: financials.profit || 0
      })
      
      // Use recentProjects from analytics API, fallback to projects list
      setRecentProjects(recentProjectsData.length > 0 ? recentProjectsData : projects.slice(0, 4))
    } catch (err: any) {
      console.error('Dashboard error:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const statsData = [
    {
      title: "Active Projects",
      value: stats.activeProjects.toString(),
      description: "Currently in progress",
      icon: FolderKanban,
      iconColor: "text-primary",
    },
    {
      title: "Hours Logged",
      value: stats.hoursLogged.toLocaleString(),
      description: "Total tracked hours",
      icon: Clock,
      iconColor: "text-blue-500",
    },
    {
      title: "Revenue",
      value: `₹${(stats.revenue / 1000).toFixed(1)}K`,
      description: "Total earnings",
      icon: FileText,
      iconColor: "text-green-500",
    },
    {
      title: "Profit",
      value: `₹${(stats.profit / 1000).toFixed(1)}K`,
      description: "Net profit",
      icon: TrendingUp,
      iconColor: "text-emerald-500",
    },
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <button onClick={fetchDashboardData} className="mt-4 text-primary">Retry</button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest project updates and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.length > 0 ? (
                recentProjects.map((project: any) => (
                  <div key={project.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FolderKanban className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent projects</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
