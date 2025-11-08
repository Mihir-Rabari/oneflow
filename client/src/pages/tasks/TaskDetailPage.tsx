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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ArrowLeft, 
  Edit, 
  Clock, 
  Loader2,
  Calendar,
  User,
  AlertCircle
} from "lucide-react"
import { tasksApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

// Task Status and Priority constants
const TaskStatus = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  BLOCKED: 'BLOCKED',
  DONE: 'DONE',
} as const

const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const

type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus]
type TaskPriorityType = typeof TaskPriority[keyof typeof TaskPriority]

const statusColors = {
  NEW: "secondary",
  IN_PROGRESS: "default",
  BLOCKED: "destructive",
  DONE: "default",
} as const

const priorityColors = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "destructive",
  URGENT: "destructive",
} as const

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [newComment, setNewComment] = useState("")

  useEffect(() => {
    if (taskId) {
      fetchTask()
    }
  }, [taskId])

  const fetchTask = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await tasksApi.getById(taskId!)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      const taskData = response.data?.data?.task || response.data?.task || response.data
      setTask(taskData)
    } catch (err: any) {
      setError(err.message || 'Failed to load task')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus: TaskStatusType) => {
    setUpdateLoading(true)
    try {
      const response = await tasksApi.update(taskId!, { status: newStatus })
      if (response.error) {
        throw new Error(response.error)
      }
      fetchTask()
    } catch (err: any) {
      console.error('Failed to update status:', err)
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const response = await tasksApi.addComment(taskId!, newComment)
      if (response.error) {
        throw new Error(response.error)
      }
      setNewComment("")
      fetchTask()
    } catch (err: any) {
      console.error('Failed to add comment:', err)
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

  if (error || !task) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-500">{error || 'Task not found'}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
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
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{task.title}</h1>
                <Badge variant={statusColors[task.status as keyof typeof statusColors] || "secondary"}>
                  {task.status?.replace(/_/g, ' ').toLowerCase()}
                </Badge>
                <Badge variant={priorityColors[task.priority as keyof typeof priorityColors] || "default"}>
                  {task.priority?.toLowerCase()}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {task.project?.name && `Project: ${task.project.name}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={task.status}
              onValueChange={(value) => handleUpdateStatus(value as TaskStatusType)}
              disabled={updateLoading}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TaskStatus.NEW}>New</SelectItem>
                <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                <SelectItem value={TaskStatus.BLOCKED}>Blocked</SelectItem>
                <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" icon={<Edit className="h-4 w-4" />} onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </div>
        </div>

        {/* Task Info Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned To</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{task.assignedTo?.name || 'Unassigned'}</div>
              <p className="text-xs text-muted-foreground">{task.assignedTo?.email || ''}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}
              </div>
              <p className="text-xs text-muted-foreground">Target completion</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Logged</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{task.actualHours || 0}h</div>
              <p className="text-xs text-muted-foreground">
                {task.estimatedHours ? `of ${task.estimatedHours}h estimated` : 'No estimate'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Created By</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{task.createdBy?.name || 'Unknown'}</div>
              <p className="text-xs text-muted-foreground">
                {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : ''}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="space-y-4">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
            <TabsTrigger value="task-info">Task Info</TabsTrigger>
          </TabsList>

          {/* Description Tab */}
          <TabsContent value="description" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {task.description || 'No description provided'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle>Comments</CardTitle>
                <CardDescription>Discussion and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {task.comments && task.comments.length > 0 ? (
                  <div className="space-y-4">
                    {task.comments.map((comment: any) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{comment.user?.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
                )}

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button type="submit" disabled={!newComment.trim()}>
                    Comment
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timesheets Tab */}
          <TabsContent value="timesheets">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Timesheets</CardTitle>
                    <CardDescription>Time logged on this task</CardDescription>
                  </div>
                  <Button size="sm">Add Time Entry</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Time Logged</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No timesheet entries yet
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Task Info Tab */}
          <TabsContent value="task-info">
            <Card>
              <CardHeader>
                <CardTitle>Task Information</CardTitle>
                <CardDescription>Detailed task metadata</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Last Changed Made By</Label>
                    <p className="text-sm text-muted-foreground">{task.createdBy?.name || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Last Change Made On</Label>
                    <p className="text-sm text-muted-foreground">
                      {task.updatedAt ? new Date(task.updatedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Total Working Hours</Label>
                    <p className="text-sm text-muted-foreground">{task.actualHours || 0} hours</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Estimated Hours</Label>
                    <p className="text-sm text-muted-foreground">{task.estimatedHours || 'Not set'} hours</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Progress</Label>
                    <p className="text-sm text-muted-foreground">{task.progress || 0}%</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <div>
                      <Badge variant={statusColors[task.status as keyof typeof statusColors]}>
                        {task.status?.replace(/_/g, ' ').toLowerCase()}
                      </Badge>
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
