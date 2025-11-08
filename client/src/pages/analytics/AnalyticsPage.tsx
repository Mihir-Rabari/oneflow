import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, DollarSign, Clock, Users, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { analyticsApi } from "@/lib/api"

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6months")
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [financialData, setFinancialData] = useState<any>(null)
  const [teamPerformanceData, setTeamPerformanceData] = useState<any>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Dashboard stats are accessible to all users
      const dashboard = await analyticsApi.getDashboardStats()
      if (!dashboard.error) {
        setDashboardData(dashboard.data?.data || dashboard.data)
      }

      // Financial and team performance data are only for admins/managers
      // Fetch them separately and ignore errors for team members
      try {
        const financial = await analyticsApi.getFinancialReport()
        if (!financial.error) {
          setFinancialData(financial.data?.data || financial.data)
        }
      } catch (err) {
        console.log('Financial data not accessible (team member)', err)
      }

      try {
        const teamPerf = await analyticsApi.getTeamPerformance()
        if (!teamPerf.error) {
          setTeamPerformanceData(teamPerf.data?.data || teamPerf.data)
        }
      } catch (err) {
        console.log('Team performance data not accessible (team member)', err)
      }
    } catch (err) {
      console.error('Failed to load analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  // Use actual API data - no fallbacks
  const revenueData = financialData?.monthlyRevenue || []
  const projectsData = dashboardData?.projectsByStatus || []
  const timeTrackingData = dashboardData?.timeByProject || []
  const teamData = teamPerformanceData?.members || []

  const stats = {
    totalRevenue: dashboardData?.totalRevenue || '0',
    revenueGrowth: dashboardData?.revenueGrowth || '0%',
    profitMargin: dashboardData?.profitMargin || '0%',
    profitGrowth: dashboardData?.profitGrowth || '0%',
    billableHours: dashboardData?.billableHours || 0,
    utilization: dashboardData?.utilization || '0%',
    activeProjects: dashboardData?.activeProjects || 0,
    totalProjects: dashboardData?.totalProjects || 0,
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Insights and performance metrics</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue}</div>
              <p className="text-xs text-muted-foreground">{stats.revenueGrowth} from last period</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.profitMargin}</div>
              <p className="text-xs text-muted-foreground">{stats.profitGrowth} from last period</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.billableHours}</div>
              <p className="text-xs text-muted-foreground">{stats.utilization} utilization</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
              <p className="text-xs text-muted-foreground">{stats.totalProjects} total projects</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Monthly comparison of revenue and expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3ECF8E" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#F87171" strokeWidth={2} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Projects Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Projects by Status</CardTitle>
              <CardDescription>Distribution of projects across different statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={projectsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Time Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Time by Project</CardTitle>
              <CardDescription>Hours logged per project this month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={timeTrackingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="project" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#3ECF8E" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Tasks completed vs in progress by team member</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="member" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#3ECF8E" name="Completed" />
                <Bar dataKey="inProgress" fill="#60A5FA" name="In Progress" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
