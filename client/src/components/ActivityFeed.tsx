import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { activitiesApi, projectsApi } from "@/lib/api"
import { Activity, Filter, RefreshCw, FolderKanban, CheckCircle2, Play, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ActivityFeedProps {
  limit?: number
  showFilters?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function ActivityFeed({ 
  limit = 20, 
  showFilters = true, 
  autoRefresh = true,
  refreshInterval = 4000 
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  
  useEffect(() => {
    fetchActivities()
    if (showFilters) {
      fetchProjects()
    }
  }, [selectedProject, selectedType, limit])

  // Auto-refresh every 4 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchActivities()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, selectedProject, selectedType, limit])

  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getAll() as any
      if (response.error) return

      let projectsData: any[] = []
      if (response.data?.data?.projects) {
        projectsData = response.data.data.projects
      } else if (response.data?.projects) {
        projectsData = response.data.projects
      } else if (Array.isArray(response.data)) {
        projectsData = response.data
      }
      
      setProjects(projectsData)
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const fetchActivities = async () => {
    const isInitialLoad = activities.length === 0
    if (isInitialLoad) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }
    
    try {
      const params: any = { limit }
      if (selectedProject && selectedProject !== "all") {
        params.projectId = selectedProject
      }
      if (selectedType && selectedType !== "all") {
        params.activityType = selectedType
      }

      const response = await activitiesApi.getAll(params) as any
      console.log('Activities response:', response)

      if (response.error) {
        throw new Error(response.error)
      }

      // Parse response: { success: true, data: { activities: [...], pagination: {...} } }
      let activitiesData: any[] = []
      if (response.data?.activities && Array.isArray(response.data.activities)) {
        activitiesData = response.data.activities
      } else if (response.data?.data?.activities && Array.isArray(response.data.data.activities)) {
        activitiesData = response.data.data.activities
      } else if (Array.isArray(response.data)) {
        activitiesData = response.data
      }

      console.log('Parsed activities:', activitiesData)
      setActivities(activitiesData)
    } catch (error: any) {
      console.error('Failed to load activities:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_created':
        return <FolderKanban className="h-4 w-4 text-primary" />
      case 'task_completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'task_in_progress':
        return <Play className="h-4 w-4 text-blue-500" />
      case 'task_created':
        return <Activity className="h-4 w-4 text-orange-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Real-time feed of project and task activities</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {showFilters && (
              <>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="All Activities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="project_created">Projects Created</SelectItem>
                    <SelectItem value="task_created">Tasks Created</SelectItem>
                    <SelectItem value="task_in_progress">Tasks Started</SelectItem>
                    <SelectItem value="task_completed">Tasks Completed</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={fetchActivities}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No activities yet</p>
            <p className="text-sm">Activity will appear here as projects and tasks are created</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={`${activity.entityId}-${activity.type}-${index}`}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="mt-1">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {activity.userName ? getInitials(activity.userName) : '?'}
                    </div>
                    <span className="font-medium text-sm">{activity.userName || 'Unknown User'}</span>
                    <span className="text-sm text-muted-foreground">{activity.action}</span>
                  </div>
                  <div className="mt-1">
                    <p className="text-sm font-medium truncate">{activity.entityName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{activity.projectName}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{formatTimestamp(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
