import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { timesheetsApi, projectsApi, tasksApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface CreateTimesheetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  projectId?: string;
}

export function CreateTimesheetModal({ open, onOpenChange, onSuccess, projectId }: CreateTimesheetModalProps) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    projectId: projectId || '',
    taskId: '',
    hours: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  useEffect(() => {
    if (open) {
      if (!projectId) {
        fetchProjects();
      } else {
        setFormData(prev => ({ ...prev, projectId }));
        fetchTasks(projectId);
      }
    }
  }, [open, projectId]);

  useEffect(() => {
    if (formData.projectId) {
      fetchTasks(formData.projectId);
    }
  }, [formData.projectId]);

  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getAll() as any;
      let projectsData: any[] = [];
      if (response.data?.data?.projects) {
        projectsData = response.data.data.projects;
      } else if (response.data?.projects) {
        projectsData = response.data.projects;
      } else if (Array.isArray(response.data)) {
        projectsData = response.data;
      }
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchTasks = async (projectId: string) => {
    try {
      const response = await tasksApi.getByProject(projectId) as any;
      let tasksData: any[] = [];
      if (response.data?.tasks) {
        tasksData = response.data.tasks;
      } else if (Array.isArray(response.data)) {
        tasksData = response.data;
      }
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await timesheetsApi.create({
        ...formData,
        hours: parseFloat(formData.hours),
      });

      alert('Timesheet entry created successfully!');
      onSuccess();
      onOpenChange(false);
      
      setFormData({
        projectId: projectId || '',
        taskId: '',
        hours: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
    } catch (error: any) {
      console.error('Failed to create timesheet:', error);
      alert(error.message || 'Failed to create timesheet entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Time</DialogTitle>
          <DialogDescription>
            Record your work hours for a project and task
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!projectId && (
            <div className="space-y-2">
              <Label htmlFor="projectId">Project *</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => setFormData({ ...formData, projectId: value, taskId: '' })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="taskId">Task (Optional)</Label>
            <Select
              value={formData.taskId}
              onValueChange={(value) => setFormData({ ...formData, taskId: value })}
              disabled={!formData.projectId}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.projectId ? "Select task" : "Select project first"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No specific task</SelectItem>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours *</Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                min="0.25"
                max="24"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                placeholder="8.0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What did you work on?"
              rows={3}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log Time
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
