import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { billingApi, projectsApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface CreatePurchaseOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreatePurchaseOrderModal({ open, onOpenChange, onSuccess }: CreatePurchaseOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    projectId: '',
    vendorName: '',
    vendorEmail: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await billingApi.createPurchaseOrder({
        ...formData,
        amount: parseFloat(formData.amount),
      });

      alert('Purchase Order created successfully!');
      onSuccess();
      onOpenChange(false);
      
      setFormData({
        projectId: '',
        vendorName: '',
        vendorEmail: '',
        amount: '',
        description: '',
      });
    } catch (error: any) {
      console.error('Failed to create purchase order:', error);
      alert(error.message || 'Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>
            Create a new purchase order for a project
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectId">Project *</Label>
            <Select
              value={formData.projectId}
              onValueChange={(value) => setFormData({ ...formData, projectId: value })}
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

          <div className="space-y-2">
            <Label htmlFor="vendorName">Vendor Name *</Label>
            <Input
              id="vendorName"
              value={formData.vendorName}
              onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
              placeholder="Enter vendor name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendorEmail">Vendor Email</Label>
            <Input
              id="vendorEmail"
              type="email"
              value={formData.vendorEmail}
              onChange={(e) => setFormData({ ...formData, vendorEmail: e.target.value })}
              placeholder="vendor@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Order details..."
              rows={3}
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
              Create Purchase Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
