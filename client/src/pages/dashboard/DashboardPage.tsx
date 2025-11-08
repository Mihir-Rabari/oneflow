import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderKanban, Clock, FileText, TrendingUp } from "lucide-react"

const stats = [
  {
    title: "Active Projects",
    value: "12",
    description: "+2 from last month",
    icon: FolderKanban,
    iconColor: "text-primary",
  },
  {
    title: "Hours Logged",
    value: "2,847",
    description: "+12% from last month",
    icon: Clock,
    iconColor: "text-blue-500",
  },
  {
    title: "Revenue",
    value: "₹4.2L",
    description: "+8% from last month",
    icon: FileText,
    iconColor: "text-green-500",
  },
  {
    title: "Profit",
    value: "₹1.8L",
    description: "+15% from last month",
    icon: TrendingUp,
    iconColor: "text-emerald-500",
  },
]

export function DashboardPage() {
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
          {stats.map((stat) => (
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
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FolderKanban className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New task created in Project Alpha</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
