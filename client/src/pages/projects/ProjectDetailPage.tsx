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
  User,
  DollarSign, 
  Calendar,
  Clock, 
  Loader2,
  FileText,
  ShoppingCart,
  Receipt,
  LayoutGrid,
  GanttChartSquare,
  Trash2
} from "lucide-react"
import { projectsApi, tasksApi, usersApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

// Task Priority constants
const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const

type TaskPriorityType = typeof TaskPriority[keyof typeof TaskPriority]

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
  priority: TaskPriorityType
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [taskFormData, setTaskFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    priority: TaskPriority.MEDIUM,
    assignedToId: "",
    estimatedHours: "",
  })
  const [editFormData, setEditFormData] = useState<any>({
    name: "",
    description: "",
    status: "",
    clientName: "",
    budget: "",
  })
  const [taskView, setTaskView] = useState<'kanban' | 'gantt'>('kanban')
  const [editingTask, setEditingTask] = useState<any>(null)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [draggedTask, setDraggedTask] = useState<any>(null)

  useEffect(() => {
    if (projectId) {
      fetchProject()
      fetchTasks()
      fetchTeamMembers()
    }
  }, [projectId])

  const fetchTeamMembers = async () => {
    try {
      const response = await usersApi.getAll()
      if (response.error) return
      
      let usersData: any[] = []
      if (response.data?.data?.users && Array.isArray(response.data.data.users)) {
        usersData = response.data.data.users
      } else if (response.data?.users && Array.isArray(response.data.users)) {
        usersData = response.data.users
      } else if (Array.isArray(response.data)) {
        usersData = response.data
      }
      
      setTeamMembers(usersData)
    } catch (err) {
      console.error('Failed to fetch team members:', err)
    }
  }

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
    if (taskFormData.assignedToId && taskFormData.assignedToId !== 'unassigned') {
      payload.assignedToId = taskFormData.assignedToId
    }

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

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdateLoading(true)
    try {
      const response = await projectsApi.update(projectId!, { status: newStatus })
      if (response.error) {
        throw new Error(response.error)
      }
      fetchProject()
    } catch (err: any) {
      console.error('Failed to update status:', err)
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setUpdateLoading(true)

    try {
      const payload: any = {}
      if (editFormData.name) payload.name = editFormData.name
      if (editFormData.description) payload.description = editFormData.description
      if (editFormData.status) payload.status = editFormData.status
      if (editFormData.clientName) payload.clientName = editFormData.clientName
      if (editFormData.budget) payload.budget = Number(editFormData.budget)

      const response = await projectsApi.update(projectId!, payload)
      if (response.error) {
        throw new Error(response.error)
      }

      setIsEditDialogOpen(false)
      fetchProject()
    } catch (err: any) {
      setFormError(err.message || 'Failed to update project')
    } finally {
      setUpdateLoading(false)
    }
  }

  const openEditDialog = () => {
    setEditFormData({
      name: project.name || "",
      description: project.description || "",
      status: project.status || "",
      clientName: project.clientName || "",
      budget: project.budget?.toString() || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await tasksApi.delete(taskId)
      if (response.error) {
        throw new Error(response.error)
      }
      fetchTasks()
    } catch (err: any) {
      console.error('Failed to delete task:', err)
    }
  }

  const handleEditTask = (task: any) => {
    setEditingTask(task)
    setTaskFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      assignedToId: task.assignedToId || "",
      estimatedHours: task.estimatedHours?.toString() || "",
    })
    setDueDate(task.dueDate ? new Date(task.dueDate) : undefined)
    setIsEditTaskOpen(true)
  }

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask) return

    setFormError(null)
    setUpdateLoading(true)

    try {
      const payload: any = {
        title: taskFormData.title.trim(),
        description: taskFormData.description.trim(),
        priority: taskFormData.priority,
      }

      if (taskFormData.estimatedHours) payload.estimatedHours = Number(taskFormData.estimatedHours)
      if (dueDate) payload.dueDate = dueDate.toISOString()
      if (taskFormData.assignedToId && taskFormData.assignedToId !== 'unassigned') {
        payload.assignedToId = taskFormData.assignedToId
      }

      const response = await tasksApi.update(editingTask.id, payload)
      if (response.error) {
        throw new Error(response.error)
      }

      setIsEditTaskOpen(false)
      setEditingTask(null)
      resetTaskForm()
      fetchTasks()
    } catch (err: any) {
      setFormError(err.message || 'Failed to update task')
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await tasksApi.update(taskId, { status: newStatus })
      if (response.error) {
        throw new Error(response.error)
      }
      fetchTasks()
    } catch (err: any) {
      console.error('Failed to update task status:', err)
    }
  }

  const handleDragStart = (e: React.DragEvent, task: any) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    
    if (!draggedTask) return
    
    // Map UI status to backend status
    const statusMap: { [key: string]: string } = {
      'new': 'NEW',
      'inProgress': 'IN_PROGRESS',
      'blocked': 'BLOCKED',
      'done': 'DONE'
    }
    
    const backendStatus = statusMap[newStatus]
    if (!backendStatus) return
    
    try {
      const response = await tasksApi.update(draggedTask.id, { status: backendStatus })
      if (response.error) {
        throw new Error(response.error)
      }
      
      // Optimistically update UI
      fetchTasks()
      setDraggedTask(null)
    } catch (err: any) {
      console.error('Failed to move task:', err)
      setDraggedTask(null)
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
            <Select
              value={project.status}
              onValueChange={handleUpdateStatus}
              disabled={updateLoading}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLANNED">Planned</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={openEditDialog}>
              <Edit className="h-4 w-4 mr-2" />
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

        {/* Edit Project Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <form onSubmit={handleEditProject} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>Update project information</DialogDescription>
              </DialogHeader>

              {formError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Project Name</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editFormData.status}
                      onValueChange={(value) => setEditFormData((prev: any) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLANNED">Planned</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="ON_HOLD">On Hold</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-budget">Budget</Label>
                    <Input
                      id="edit-budget"
                      type="number"
                      value={editFormData.budget}
                      onChange={(e) => setEditFormData((prev: any) => ({ ...prev, budget: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-client">Client Name</Label>
                  <Input
                    id="edit-client"
                    value={editFormData.clientName}
                    onChange={(e) => setEditFormData((prev: any) => ({ ...prev, clientName: e.target.value }))}
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={updateLoading}>
                  Cancel
                </Button>
                <Button type="submit" loading={updateLoading}>
                  Update Project
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">Tasks</h2>
                <div className="flex items-center gap-2 border rounded-lg p-1">
                  <Button
                    variant={taskView === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTaskView('kanban')}
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Kanban
                  </Button>
                  <Button
                    variant={taskView === 'gantt' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTaskView('gantt')}
                  >
                    <GanttChartSquare className="h-4 w-4 mr-2" />
                    Gantt
                  </Button>
                </div>
              </div>
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
                              setTaskFormData((prev) => ({ ...prev, priority: value as TaskPriorityType }))
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
                        <Label>Assign to</Label>
                        <Select
                          value={taskFormData.assignedToId}
                          onValueChange={(value) => setTaskFormData((prev) => ({ ...prev, assignedToId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select team member (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name} - {member.role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

            {/* Edit Task Dialog */}
            <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
              <DialogContent>
                <form onSubmit={handleUpdateTask} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>Update task details</DialogDescription>
                  </DialogHeader>

                  {formError && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      {formError}
                    </div>
                  )}

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-task-title">Task title</Label>
                      <Input
                        id="edit-task-title"
                        value={taskFormData.title}
                        onChange={(e) => setTaskFormData((prev) => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-task-description">Description</Label>
                      <Textarea
                        id="edit-task-description"
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
                          onValueChange={(value) => setTaskFormData((prev) => ({ ...prev, priority: value as TaskPriorityType }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                        <Label htmlFor="edit-estimated-hours">Estimated hours</Label>
                        <Input
                          id="edit-estimated-hours"
                          type="number"
                          min="0"
                          step="0.5"
                          value={taskFormData.estimatedHours}
                          onChange={(e) => setTaskFormData((prev) => ({ ...prev, estimatedHours: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Assign to</Label>
                      <Select
                        value={taskFormData.assignedToId}
                        onValueChange={(value) => setTaskFormData((prev) => ({ ...prev, assignedToId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team member (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} - {member.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Due date</Label>
                      <DatePicker date={dueDate} onSelect={setDueDate} placeholder="Pick due date" />
                    </div>
                  </div>

                  <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditTaskOpen(false)} disabled={updateLoading}>
                      Cancel
                    </Button>
                    <Button type="submit" loading={updateLoading}>
                      Update Task
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Kanban Board */}
            {tasksLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : taskView === 'kanban' ? (
              <div className="grid gap-4 md:grid-cols-4">
                {/* New Column */}
                <div 
                  className="space-y-3 p-3 rounded-lg bg-muted/30 min-h-[200px]"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'new')}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">New</h3>
                    <Badge variant="secondary">{tasks.new?.length || 0}</Badge>
                  </div>
                  <div className="space-y-2">
                    {(tasks.new || []).map((task: any) => (
                      <Card 
                        key={task.id} 
                        className="group relative hover:shadow-md transition-shadow cursor-move"
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
                              <CardTitle className="text-sm font-medium line-clamp-2">{task.title}</CardTitle>
                              <Badge variant={priorityColors[task.priority as keyof typeof priorityColors]} className="mt-2">
                                {task.priority?.toLowerCase()}
                              </Badge>
                              {task.description && (
                                <CardDescription className="line-clamp-2 text-xs mt-2">
                                  {task.description}
                                </CardDescription>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditTask(task)
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteTask(task.id)
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* In Progress Column */}
                <div 
                  className="space-y-3 p-3 rounded-lg bg-muted/30 min-h-[200px]"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'inProgress')}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">In Progress</h3>
                    <Badge variant="secondary">{tasks.inProgress?.length || 0}</Badge>
                  </div>
                  <div className="space-y-2">
                    {(tasks.inProgress || []).map((task: any) => (
                      <Card 
                        key={task.id} 
                        className="group relative hover:shadow-md transition-shadow cursor-move"
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
                              <CardTitle className="text-sm font-medium line-clamp-2">{task.title}</CardTitle>
                              <Badge variant={priorityColors[task.priority as keyof typeof priorityColors]} className="mt-2">
                                {task.priority?.toLowerCase()}
                              </Badge>
                              {task.description && (
                                <CardDescription className="line-clamp-2 text-xs mt-2">
                                  {task.description}
                                </CardDescription>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditTask(task)
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteTask(task.id)
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Blocked Column */}
                <div 
                  className="space-y-3 p-3 rounded-lg bg-muted/30 min-h-[200px]"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'blocked')}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">Blocked</h3>
                    <Badge variant="secondary">{tasks.blocked?.length || 0}</Badge>
                  </div>
                  <div className="space-y-2">
                    {(tasks.blocked || []).map((task: any) => (
                      <Card 
                        key={task.id} 
                        className="group relative hover:shadow-md transition-shadow cursor-move"
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
                              <CardTitle className="text-sm font-medium line-clamp-2">{task.title}</CardTitle>
                              <Badge variant={priorityColors[task.priority as keyof typeof priorityColors]} className="mt-2">
                                {task.priority?.toLowerCase()}
                              </Badge>
                              {task.description && (
                                <CardDescription className="line-clamp-2 text-xs mt-2">
                                  {task.description}
                                </CardDescription>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditTask(task)
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteTask(task.id)
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Done Column */}
                <div 
                  className="space-y-3 p-3 rounded-lg bg-muted/30 min-h-[200px]"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'done')}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">Done</h3>
                    <Badge variant="secondary">{tasks.done?.length || 0}</Badge>
                  </div>
                  <div className="space-y-2">
                    {(tasks.done || []).map((task: any) => (
                      <Card 
                        key={task.id} 
                        className="group relative hover:shadow-md transition-shadow cursor-move"
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
                              <CardTitle className="text-sm font-medium line-clamp-2">{task.title}</CardTitle>
                              <Badge variant={priorityColors[task.priority as keyof typeof priorityColors]} className="mt-2">
                                {task.priority?.toLowerCase()}
                              </Badge>
                              {task.description && (
                                <CardDescription className="line-clamp-2 text-xs mt-2">
                                  {task.description}
                                </CardDescription>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditTask(task)
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteTask(task.id)
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Gantt Chart</CardTitle>
                  <CardDescription>Timeline visualization of task schedules</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {/* Timeline Header */}
                    <div className="flex items-center gap-2 border-b pb-2">
                      <div className="w-56 font-semibold text-sm">Task</div>
                      <div className="flex-1 flex justify-between text-xs text-muted-foreground px-4">
                        <span>-15d</span>
                        <span>-7d</span>
                        <span>Today</span>
                        <span>+7d</span>
                        <span>+15d</span>
                      </div>
                    </div>

                    {/* Task Rows */}
                    {Object.entries(tasks).flatMap(([status, taskList]: [string, any]) => 
                      (taskList || []).map((task: any) => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        
                        // Use startDate if available, otherwise use createdAt
                        const taskStart = task.startDate 
                          ? new Date(task.startDate) 
                          : (task.createdAt ? new Date(task.createdAt) : today)
                        taskStart.setHours(0, 0, 0, 0)
                        
                        // Use dueDate if available, otherwise estimate from hours
                        let taskEnd: Date
                        if (task.dueDate) {
                          taskEnd = new Date(task.dueDate)
                        } else if (task.estimatedHours) {
                          // Estimate: 8 hours = 1 day, so duration = estimatedHours / 8
                          const estimatedDays = Math.ceil(task.estimatedHours / 8)
                          taskEnd = new Date(taskStart)
                          taskEnd.setDate(taskEnd.getDate() + estimatedDays)
                        } else {
                          // Default to 3 days if no information
                          taskEnd = new Date(taskStart)
                          taskEnd.setDate(taskEnd.getDate() + 3)
                        }
                        taskEnd.setHours(0, 0, 0, 0)
                        
                        // Calculate days from today
                        const startDaysFromToday = Math.ceil((taskStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                        const endDaysFromToday = Math.ceil((taskEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                        const duration = endDaysFromToday - startDaysFromToday
                        
                        // Position as percentage of 30 days view (can show past tasks)
                        const leftPercent = Math.max(0, Math.min(100, ((startDaysFromToday + 15) / 30) * 100))
                        const widthPercent = Math.max(3, Math.min(100 - leftPercent, (duration / 30) * 100))
                        
                        // Status color
                        const statusColors: { [key: string]: string } = {
                          'new': 'bg-blue-500',
                          'inProgress': 'bg-green-500',
                          'blocked': 'bg-red-500',
                          'done': 'bg-gray-400'
                        }
                        
                        return (
                          <div key={task.id} className="flex items-center gap-2 py-2 hover:bg-accent/50 rounded group">
                            {/* Task Info */}
                            <div className="w-56 flex items-center gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate" title={task.title}>
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Badge variant={priorityColors[task.priority as keyof typeof priorityColors]} className="text-xs h-4 px-1.5">
                                    {task.priority?.toLowerCase()}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Timeline Bar */}
                            <div className="flex-1 relative h-8 bg-muted/30 rounded">
                              {/* Grid lines */}
                              <div className="absolute inset-0 flex">
                                {[0, 25, 50, 75, 100].map((pos) => (
                                  <div key={pos} className="absolute h-full border-l border-border/30" style={{ left: `${pos}%` }} />
                                ))}
                              </div>
                              
                              {/* Task Bar */}
                              <div 
                                className={`absolute h-6 top-1 rounded flex items-center px-2 text-white text-xs font-medium ${statusColors[status]} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                                style={{ 
                                  left: `${leftPercent}%`, 
                                  width: `${widthPercent}%`,
                                  minWidth: '60px'
                                }}
                                onClick={() => navigate(`/tasks/${task.id}`)}
                                title={`${task.title}\nStart: ${taskStart.toLocaleDateString()}\nDue: ${taskEnd.toLocaleDateString()}\nStatus: ${status}`}
                              >
                                <span className="truncate">{task.estimatedHours ? `${task.estimatedHours}h` : ''}</span>
                              </div>

                              {/* Due date indicator - show at end of bar */}
                              {task.dueDate && (
                                <div 
                                  className="absolute top-0 h-8 w-0.5 bg-destructive/80"
                                  style={{ left: `${Math.min(100, leftPercent + widthPercent)}%` }}
                                  title={`Due: ${taskEnd.toLocaleDateString()}`}
                                />
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleEditTask(task)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    )}
                    
                    {Object.values(tasks).every((taskList: any) => !taskList || taskList.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-8">No tasks to display</p>
                    )}

                    {/* Legend */}
                    <div className="flex items-center gap-4 pt-4 border-t text-xs">
                      <span className="font-semibold">Status:</span>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span>New</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>In Progress</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span>Blocked</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-400 rounded"></div>
                        <span>Done</span>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <div className="w-0.5 h-4 bg-destructive"></div>
                        <span>Due Date</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                  <CardDescription>Complete information about this project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label className="text-muted-foreground">Project Name</Label>
                      <p className="text-sm font-medium">{project.name}</p>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-muted-foreground">Status</Label>
                      <p className="text-sm font-medium capitalize">{project.status?.replace(/_/g, ' ').toLowerCase()}</p>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-muted-foreground">Project Manager</Label>
                      <p className="text-sm font-medium">{project.projectManager?.name || 'Not assigned'}</p>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-muted-foreground">Client Name</Label>
                      <p className="text-sm font-medium">{project.clientName || 'No client'}</p>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-muted-foreground">Client Email</Label>
                      <p className="text-sm font-medium">{project.clientEmail || 'N/A'}</p>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-muted-foreground">Project Type</Label>
                      <p className="text-sm font-medium capitalize">{project.type?.replace(/_/g, ' ').toLowerCase() || 'N/A'}</p>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-muted-foreground">Budget</Label>
                      <p className="text-sm font-medium">₹{project.budget?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-muted-foreground">Start Date</Label>
                      <p className="text-sm font-medium">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-muted-foreground">Deadline</Label>
                      <p className="text-sm font-medium">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-muted-foreground">Created At</Label>
                      <p className="text-sm font-medium">{new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="text-sm font-medium">{project.description || 'No description'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>People working on this project</CardDescription>
                </CardHeader>
                <CardContent>
                  {project.members && project.members.length > 0 ? (
                    <div className="space-y-3">
                      {project.members.map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{member.user?.name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                            </div>
                          </div>
                          <Badge variant="secondary">{member.role || 'Member'}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No team members yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
