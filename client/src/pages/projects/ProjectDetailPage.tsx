import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DatePicker } from "@/components/ui/date-picker"
import { 
  Plus, 
  ArrowLeft, 
  Edit, 
  Users, 
  DollarSign, 
  Calendar, 
  Loader2,
  FileText,
  ShoppingCart,
  Receipt
} from "lucide-react"
import { projectsApi, tasksApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { TaskPriority } from "@oneflow/shared"

const statusColors = {
  ACTIVE: "default",
  PLANNING: "secondary",
  COMPLETED: "default",
  ON_HOLD: "destructive",
  PLANNED: "secondary",
  IN_PROGRESS: "default",
} as const

const priorityColors = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "destructive",
  URGENT: "destructive",
} as const

type TaskFormData = {
  title: string
  description: string
  priority: TaskPriority
  assignedToId: string
  estimatedHours: string
}

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState<any>(null)
  const [tasks, setTasks] = useState<any>({ new: [], inProgress: [], blocked: [], done: [] })
  const [loading, setLoading] = useState(true)
  const [tasksLoading, setTasksLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [taskFormData, setTaskFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    priority: TaskPriority.MEDIUM,
    assignedToId: "",
    estimatedHours: "",
  })

  useEffect(() => {
    if (projectId) {
      fetchProject()
      fetchTasks()
    }
  }, [projectId])

  const fetchProject = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await projectsApi.getById(projectId!)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      const projectData = response.data?.data?.project || response.data?.project || response.data
      setProject(projectData)
    } catch (err: any) {
      setError(err.message || 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async () => {
    setTasksLoading(true)
    
    try {
      const response = await tasksApi.getByProject(projectId!)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      const tasksData = response.data?.data?.kanban || response.data?.kanban || { new: [], inProgress: [], blocked: [], done: [] }
      setTasks(tasksData)
    } catch (err: any) {
      console.error('Failed to load tasks:', err)
    } finally {
      setTasksLoading(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!taskFormData.title.trim()) {
      setFormError('Task title is required')
      return
    }

    const payload: any = {
      title: taskFormData.title.trim(),
      description: taskFormData.description.trim(),
      priority: taskFormData.priority,
      projectId: projectId!,
      createdById: user?.id,
    }

    if (taskFormData.estimatedHours) payload.estimatedHours = Number(taskFormData.estimatedHours)
    if (dueDate) payload.dueDate = dueDate.toISOString()
    if (taskFormData.assignedToId) payload.assignedToId = taskFormData.assignedToId

    setCreateLoading(true)
    try {
      const response = await tasksApi.create(payload)
      if (response.error) {
        throw new Error(response.error)
      }

      setIsTaskDialogOpen(false)
      resetTaskForm()
      fetchTasks()
    } catch (err: any) {
      setFormError(err.message || 'Failed to create task')
    } finally {
      setCreateLoading(false)
    }
  }

  const resetTaskForm = () => {
    setTaskFormData({
      title: "",
      description: "",
      priority: TaskPriority.MEDIUM,
      assignedToId: "",
      estimatedHours: "",
    })
    setDueDate(undefined)
    setFormError(null)
  }

  const handleTaskDialogChange = (open: boolean) => {
    setIsTaskDialogOpen(open)
    if (!open) {
      resetTaskForm()
    }
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

  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-500">{error || 'Project not found'}</p>
          <Button onClick={() => navigate('/projects')} className="mt-4">
            Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <Badge variant={statusColors[project.status as keyof typeof statusColors] || "secondary"}>
                  {project.status?.toLowerCase()}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={<Edit className="h-4 w-4" />}>
              Edit
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(project.budget / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">Project budget</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.teamSize || 0}</div>
              <p className="text-xs text-muted-foreground">Team members</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.progress || 0}%</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deadline</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.deadline ? new Date(project.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">Due date</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="sales-orders">Sales Orders</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Tasks</h2>
              <Dialog open={isTaskDialogOpen} onOpenChange={handleTaskDialogChange}>
                <DialogTrigger asChild>
                  <Button icon={<Plus className="h-4 w-4" />}>New Task</Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCreateTask} className="space-y-4">
                    <DialogHeader>
                      <DialogTitle>Create new task</DialogTitle>
                      <DialogDescription>
                        Add a new task to this project
                      </DialogDescription>
                    </DialogHeader>

                    {formError && (
                      <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        {formError}
                      </div>
                    )}

                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="task-title">Task title</Label>
                        <Input
                          id="task-title"
                          placeholder="Enter task title"
                          value={taskFormData.title}
                          onChange={(e) => setTaskFormData((prev) => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="task-description">Description</Label>
                        <Textarea
                          id="task-description"
                          placeholder="Describe the task"
                          value={taskFormData.description}
                          onChange={(e) => setTaskFormData((prev) => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select
                            value={taskFormData.priority}
                            onValueChange={(value) =>
                              setTaskFormData((prev) => ({ ...prev, priority: value as TaskPriority }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                              <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                              <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                              <SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="estimated-hours">Estimated hours</Label>
                          <Input
                            id="estimated-hours"
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="Optional"
                            value={taskFormData.estimatedHours}
                            onChange={(e) => setTaskFormData((prev) => ({ ...prev, estimatedHours: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Due date</Label>
                        <DatePicker date={dueDate} onSelect={setDueDate} placeholder="Pick due date" />
                      </div>
                    </div>

                    <DialogFooter className="gap-2">
                      <Button type="button" variant="outline" onClick={() => handleTaskDialogChange(false)} disabled={createLoading}>
                        Cancel
                      </Button>
                      <Button type="submit" loading={createLoading}>
                        Create Task
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Kanban Board */}
            {tasksLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-4">
                {/* New Column */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">New</h3>
                    <Badge variant="secondary">{tasks.new?.length || 0}</Badge>
                  </div>
                  <div className="space-y-2">
                    {(tasks.new || []).map((task: any) => (
                      <Card 
                        key={task.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-sm font-medium line-clamp-2">{task.title}</CardTitle>
                            <Badge variant={priorityColors[task.priority as keyof typeof priorityColors]}>
                              {task.priority?.toLowerCase()}
                            </Badge>
                          </div>
                          {task.description && (
                            <CardDescription className="line-clamp-2 text-xs">
                              {task.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* In Progress Column */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">In Progress</h3>
                    <Badge variant="secondary">{tasks.inProgress?.length || 0}</Badge>
                  </div>
                  <div className="space-y-2">
                    {(tasks.inProgress || []).map((task: any) => (
                      <Card 
                        key={task.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-sm font-medium line-clamp-2">{task.title}</CardTitle>
                            <Badge variant={priorityColors[task.priority as keyof typeof priorityColors]}>
                              {task.priority?.toLowerCase()}
                            </Badge>
                          </div>
                          {task.description && (
                            <CardDescription className="line-clamp-2 text-xs">
                              {task.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Blocked Column */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">Blocked</h3>
                    <Badge variant="secondary">{tasks.blocked?.length || 0}</Badge>
                  </div>
                  <div className="space-y-2">
                    {(tasks.blocked || []).map((task: any) => (
                      <Card 
                        key={task.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-sm font-medium line-clamp-2">{task.title}</CardTitle>
                            <Badge variant={priorityColors[task.priority as keyof typeof priorityColors]}>
                              {task.priority?.toLowerCase()}
                            </Badge>
                          </div>
                          {task.description && (
                            <CardDescription className="line-clamp-2 text-xs">
                              {task.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Done Column */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">Done</h3>
                    <Badge variant="secondary">{tasks.done?.length || 0}</Badge>
                  </div>
                  <div className="space-y-2">
                    {(tasks.done || []).map((task: any) => (
                      <Card 
                        key={task.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-sm font-medium line-clamp-2">{task.title}</CardTitle>
                            <Badge variant={priorityColors[task.priority as keyof typeof priorityColors]}>
                              {task.priority?.toLowerCase()}
                            </Badge>
                          </div>
                          {task.description && (
                            <CardDescription className="line-clamp-2 text-xs">
                              {task.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Sales Orders Tab */}
          <TabsContent value="sales-orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Sales Orders</CardTitle>
                    <CardDescription>Manage sales orders for this project</CardDescription>
                  </div>
                  <Button icon={<ShoppingCart className="h-4 w-4" />}>New Sales Order</Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">No sales orders yet</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Invoices</CardTitle>
                    <CardDescription>Customer invoices for this project</CardDescription>
                  </div>
                  <Button icon={<FileText className="h-4 w-4" />}>New Invoice</Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">No invoices yet</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchase Orders Tab */}
          <TabsContent value="purchase-orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Purchase Orders</CardTitle>
                    <CardDescription>Purchase orders for this project</CardDescription>
                  </div>
                  <Button icon={<ShoppingCart className="h-4 w-4" />}>New Purchase Order</Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">No purchase orders yet</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Expenses</CardTitle>
                    <CardDescription>Project expenses and reimbursements</CardDescription>
                  </div>
                  <Button icon={<Receipt className="h-4 w-4" />}>New Expense</Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">No expenses yet</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>Configure project settings and team members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Project Details</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Project Manager</Label>
                      <p className="text-sm text-muted-foreground">{project.projectManager?.name || 'Not assigned'}</p>
                    </div>
                    <div className="grid gap-2">
                      <Label>Client</Label>
                      <p className="text-sm text-muted-foreground">{project.clientName || 'No client'}</p>
                    </div>
                    <div className="grid gap-2">
                      <Label>Type</Label>
                      <p className="text-sm text-muted-foreground">{project.type?.replace(/_/g, ' ') || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
