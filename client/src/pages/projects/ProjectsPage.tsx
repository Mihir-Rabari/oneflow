import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Calendar, Users, DollarSign } from "lucide-react"

const projects = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete overhaul of company website",
    status: "active",
    progress: 65,
    budget: "₹2,50,000",
    team: 5,
    deadline: "Dec 15, 2025",
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "iOS and Android app for customer portal",
    status: "active",
    progress: 40,
    budget: "₹5,00,000",
    team: 8,
    deadline: "Jan 30, 2026",
  },
  {
    id: "3",
    name: "CRM Integration",
    description: "Integrate Salesforce with existing systems",
    status: "planning",
    progress: 10,
    budget: "₹1,50,000",
    team: 3,
    deadline: "Feb 20, 2026",
  },
  {
    id: "4",
    name: "Data Migration",
    description: "Migrate legacy data to new database",
    status: "completed",
    progress: 100,
    budget: "₹75,000",
    team: 4,
    deadline: "Nov 30, 2025",
  },
  {
    id: "5",
    name: "Security Audit",
    description: "Complete security review and penetration testing",
    status: "active",
    progress: 80,
    budget: "₹1,00,000",
    team: 2,
    deadline: "Dec 10, 2025",
  },
  {
    id: "6",
    name: "API Development",
    description: "RESTful API for third-party integrations",
    status: "on-hold",
    progress: 25,
    budget: "₹2,00,000",
    team: 4,
    deadline: "Mar 15, 2026",
  },
]

const statusColors = {
  active: "default",
  planning: "secondary",
  completed: "default",
  "on-hold": "destructive",
} as const

export function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground">Manage your projects and track progress</p>
          </div>
          <Button icon={<Plus className="h-4 w-4" />}>
            New Project
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </div>
                  <Badge variant={statusColors[project.status as keyof typeof statusColors]}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span className="truncate">{project.budget}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{project.team}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="truncate text-xs">{project.deadline}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
