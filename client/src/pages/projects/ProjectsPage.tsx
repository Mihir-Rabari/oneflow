import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DatePicker } from "@/components/ui/date-picker"
import { Plus, Search, Calendar, Users, DollarSign, Loader2 } from "lucide-react"
import { projectsApi, usersApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

const statusColors = {
  ACTIVE: "default",
  PLANNING: "secondary",
  COMPLETED: "default",
  ON_HOLD: "destructive",
} as const

const projectTypes = ["FIXED_PRICE", "TIME_AND_MATERIAL", "RETAINER"] as const

type ProjectFormData = {
  name: string
  description: string
  type: typeof projectTypes[number]
  budget: string
  projectManagerId: string
  clientName: string
  clientEmail: string
}

export function ProjectsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [projectManagers, setProjectManagers] = useState<any[]>([])
  const [managersLoading, setManagersLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [deadline, setDeadline] = useState<Date | undefined>()
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    type: projectTypes[0],
    budget: "",
    projectManagerId: "",
    clientName: "",
    clientEmail: "",
  })

  const { user } = useAuth()
  const canCreateProject = !!user // Allow all authenticated users to create projects

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (isDialogOpen && canCreateProject) {
      loadProjectManagers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDialogOpen])

  const fetchProjects = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = (await projectsApi.getAll()) as any
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      // Backend returns { success: true, data: [...projects] }
      const projectsData = response.data?.data || response.data || []
      setProjects(Array.isArray(projectsData) ? projectsData : [])
    } catch (err: any) {
      setError(err.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const loadProjectManagers = async () => {
    if (projectManagers.length > 0) return
    setManagersLoading(true)
    try {
      const response = (await usersApi.getAll()) as any
      if (response.error) {
        throw new Error(response.error)
      }
      const users = response.data?.data || response.data || []
      const managers = Array.isArray(users)
        ? users.filter((member: any) => ["ADMIN", "PROJECT_MANAGER"].includes(member.role))
        : []
      setProjectManagers(managers)
      if (managers.length > 0) {
        const defaultManager = managers.find((manager: any) => manager.id === user?.id) || managers[0]
        setFormData((prev) => ({ ...prev, projectManagerId: defaultManager?.id || "" }))
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to load project managers')
    } finally {
      setManagersLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: projectTypes[0],
      budget: "",
      projectManagerId: user && ["ADMIN", "PROJECT_MANAGER"].includes(user.role) ? user.id : "",
      clientName: "",
      clientEmail: "",
    })
    setStartDate(new Date())
    setEndDate(undefined)
    setDeadline(undefined)
    setFormError(null)
    setSuccessMessage(null)
  }

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    if (!formData.name.trim()) {
      setFormError('Project name is required')
      return
    }

    if (!startDate) {
      setFormError('Start date is required')
      return
    }

    const managerId = formData.projectManagerId || (canCreateProject ? user?.id : null)
    if (!managerId) {
      setFormError('Project manager is required')
      return
    }

    const payload: Record<string, any> = {
      name: formData.name.trim(),
      type: formData.type,
      startDate: startDate.toISOString(),
      projectManagerId: managerId,
    }

    if (formData.description.trim()) payload.description = formData.description.trim()
    if (formData.budget) payload.budget = Number(formData.budget)
    if (endDate) payload.endDate = endDate.toISOString()
    if (deadline) payload.deadline = deadline.toISOString()
    if (formData.clientName.trim()) payload.clientName = formData.clientName.trim()
    if (formData.clientEmail.trim()) payload.clientEmail = formData.clientEmail.trim()

    setCreateLoading(true)
    try {
      const response = await projectsApi.create(payload)
      if (response.error) {
        throw new Error(response.error)
      }

      setSuccessMessage('Project created successfully')
      setIsDialogOpen(false)
      resetForm()
      fetchProjects()
    } catch (err: any) {
      setFormError(err.message || 'Failed to create project')
    } finally {
      setCreateLoading(false)
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter.toUpperCase()
    return matchesSearch && matchesStatus
  })

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
          <button onClick={fetchProjects} className="mt-4 text-primary">Retry</button>
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
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground">Manage your projects and track progress</p>
          </div>
          {canCreateProject ? (
            <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button icon={<Plus className="h-4 w-4" />}>New Project</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto">
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>Create new project</DialogTitle>
                    <DialogDescription>
                      Fill out the project details and assign a project manager.
                    </DialogDescription>
                  </DialogHeader>

                  {formError && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      {formError}
                    </div>
                  )}
                  {successMessage && (
                    <div className="rounded-lg border border-primary/50 bg-primary/5 px-4 py-3 text-sm text-primary">
                      {successMessage}
                    </div>
                  )}

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-name">Project name</Label>
                      <Input
                        id="project-name"
                        placeholder="Enter project name"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project-description">Description</Label>
                      <Textarea
                        id="project-description"
                        placeholder="Describe the project"
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Project type</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, type: value as ProjectFormData["type"] }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {projectTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.replace(/_/g, ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="project-budget">Budget (₹)</Label>
                        <Input
                          id="project-budget"
                          type="number"
                          min="0"
                          placeholder="Optional"
                          value={formData.budget}
                          onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Start date</Label>
                        <DatePicker date={startDate} onSelect={setStartDate} />
                      </div>
                      <div className="space-y-2">
                        <Label>End date</Label>
                        <DatePicker date={endDate} onSelect={setEndDate} placeholder="Pick end date" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Deadline</Label>
                      <DatePicker date={deadline} onSelect={setDeadline} placeholder="Pick deadline" />
                    </div>

                    <div className="space-y-2">
                      <Label>Project manager</Label>
                      <Select
                        value={formData.projectManagerId}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, projectManagerId: value }))}
                        disabled={managersLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={managersLoading ? "Loading..." : "Select manager"} />
                        </SelectTrigger>
                        <SelectContent>
                          {projectManagers.length === 0 && !managersLoading ? (
                            <SelectItem value="no-managers" disabled>No managers available</SelectItem>
                          ) : (
                            projectManagers.map((manager) => (
                              <SelectItem key={manager.id} value={manager.id}>
                                {manager.name} ({manager.role?.toLowerCase()})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="client-name">Client name</Label>
                        <Input
                          id="client-name"
                          placeholder="Optional"
                          value={formData.clientName}
                          onChange={(e) => setFormData((prev) => ({ ...prev, clientName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="client-email">Client email</Label>
                        <Input
                          id="client-email"
                          type="email"
                          placeholder="Optional"
                          value={formData.clientEmail}
                          onChange={(e) => setFormData((prev) => ({ ...prev, clientEmail: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => handleDialogChange(false)} disabled={createLoading}>
                      Cancel
                    </Button>
                    <Button type="submit" loading={createLoading}>
                      Create Project
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Button icon={<Plus className="h-4 w-4" />} disabled title="Only admins and project managers can create projects">
              New Project
            </Button>
          )}
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
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PLANNING">Planning</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="ON_HOLD">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </div>
                  <Badge variant={statusColors[project.status as keyof typeof statusColors] || "secondary"}>
                    {project.status?.toLowerCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span className="truncate">₹{(project.budget / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{project.teamSize || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="truncate text-xs">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</span>
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
