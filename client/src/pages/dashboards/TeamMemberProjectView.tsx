import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FolderKanban, CheckSquare, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RoleBasedSidebar } from '@/components/layout/RoleBasedSidebar';
import { ActivityFeed } from '@/components/ActivityFeed';
import { projectsApi, tasksApi } from '@/lib/api';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
}

export default function TeamMemberProjectView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Fetch user's assigned projects
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getAll() as any;
      console.log('Fetched projects:', response);
      
      // Handle different response structures
      let projectsData: any[] = [];
      if (response.data?.data?.projects) {
        projectsData = response.data.data.projects;
      } else if (response.data?.projects) {
        projectsData = response.data.projects;
      } else if (Array.isArray(response.data)) {
        projectsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        projectsData = response.data.data;
      }

      // Transform projects to include tasks
      const projectsWithTasks = await Promise.all(
        projectsData.map(async (project: any) => {
          try {
            const tasksResponse = await tasksApi.getByProject(project.id) as any;
            let tasks: any[] = [];
            
            if (tasksResponse.data?.tasks) {
              tasks = tasksResponse.data.tasks;
            } else if (tasksResponse.data?.data?.tasks) {
              tasks = tasksResponse.data.data.tasks;
            } else if (Array.isArray(tasksResponse.data)) {
              tasks = tasksResponse.data;
            } else if (tasksResponse.data?.data && Array.isArray(tasksResponse.data.data)) {
              tasks = tasksResponse.data.data;
            }

            return {
              ...project,
              tasks: tasks || [],
            };
          } catch (error) {
            console.error(`Failed to fetch tasks for project ${project.id}:`, error);
            return {
              ...project,
              tasks: [],
            };
          }
        })
      );

      setProjects(projectsWithTasks);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PLANNING: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      ON_HOLD: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <RoleBasedSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <RoleBasedSidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground">
              View and manage your assigned projects
            </p>
          </div>

          {/* Stats Cards */}
          {projects.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {projects.reduce((sum, p) => sum + (p.tasks?.length || 0), 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'PLANNING').length}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Projects Assigned</h3>
                <p className="text-muted-foreground text-center">
                  You haven't been assigned to any projects yet.
                  <br />
                  Contact your project manager for project assignments.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{project.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {project.description || 'No description'}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusColor(project.status) as any}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Tasks</p>
                          <p className="text-sm font-semibold">{project.tasks?.length || 0}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Due Date</p>
                          <p className="text-sm font-semibold">
                            {project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}`);
                      }}
                    >
                      View Details & Tasks
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {/* Activity Feed */}
          <ActivityFeed limit={8} showFilters={false} autoRefresh={true} refreshInterval={4000} />
        </div>
      </main>
    </div>
  );
}
