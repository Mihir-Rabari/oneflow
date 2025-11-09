import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, DollarSign, FileText, ShoppingCart, Receipt } from 'lucide-react';
import { billingApi } from '@/lib/api';
import { RoleBasedSidebar } from '@/components/layout/RoleBasedSidebar';
import { ActivityFeed } from '@/components/ActivityFeed';

interface ApprovalItem {
  id: string;
  type: 'sales-orders' | 'purchase-orders' | 'invoices' | 'vendor-bills';
  documentNumber: string;
  amount: number;
  customerOrVendor: string;
  projectName: string;
  createdBy: string;
  createdAt: string;
  description?: string;
}

export default function FinanceApprovalsPage() {
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [remark, setRemark] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await billingApi.getPendingApprovals();
      const data = response.data as any;

      // Transform data into unified format
      const allApprovals: ApprovalItem[] = [
        ...(data.salesOrders || []).map((item: any) => ({
          id: item.id,
          type: 'sales-orders' as const,
          documentNumber: item.orderNumber,
          amount: item.totalAmount || item.amount,
          customerOrVendor: item.customerName || 'N/A',
          projectName: item.project?.name || 'N/A',
          createdBy: item.createdBy?.name || 'Unknown',
          createdAt: item.createdAt,
          description: item.description,
        })),
        ...(data.purchaseOrders || []).map((item: any) => ({
          id: item.id,
          type: 'purchase-orders' as const,
          documentNumber: item.orderNumber,
          amount: item.totalAmount || item.amount,
          customerOrVendor: item.vendorName || 'N/A',
          projectName: item.project?.name || 'N/A',
          createdBy: item.createdBy?.name || 'Unknown',
          createdAt: item.createdAt,
          description: item.description,
        })),
        ...(data.invoices || []).map((item: any) => ({
          id: item.id,
          type: 'invoices' as const,
          documentNumber: item.invoiceNumber,
          amount: item.totalAmount || item.amount,
          customerOrVendor: item.customerName || 'N/A',
          projectName: item.project?.name || 'N/A',
          createdBy: item.createdBy?.name || 'Unknown',
          createdAt: item.createdAt,
          description: item.description,
        })),
        ...(data.vendorBills || []).map((item: any) => ({
          id: item.id,
          type: 'vendor-bills' as const,
          documentNumber: item.billNumber,
          amount: item.totalAmount || item.amount,
          customerOrVendor: item.vendorName || 'N/A',
          projectName: item.project?.name || 'N/A',
          createdBy: item.createdBy?.name || 'Unknown',
          createdAt: item.createdAt,
          description: item.description,
        })),
      ];

      setApprovals(allApprovals);
    } catch (error: any) {
      console.error('Failed to fetch approvals:', error);
      alert(error.message || 'Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item: ApprovalItem) => {
    if (!confirm(`Are you sure you want to approve ${item.documentNumber}?`)) return;

    try {
      setActionLoading(true);
      await billingApi.approveDocument(item.type, item.id);
      
      // Send approval email
      await sendApprovalEmail(item, 'approved', remark);
      
      alert('Document approved successfully! Email notification sent.');
      setRemark('');
      setSelectedItem(null);
      fetchPendingApprovals();
    } catch (error: any) {
      alert(error.message || 'Failed to approve document');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (item: ApprovalItem) => {
    if (!remark.trim()) {
      alert('Please provide a remark for rejection');
      return;
    }

    if (!confirm(`Are you sure you want to reject ${item.documentNumber}?`)) return;

    try {
      setActionLoading(true);
      await billingApi.rejectDocument(item.type, item.id, remark);
      
      // Send rejection email
      await sendApprovalEmail(item, 'rejected', remark);
      
      alert('Document rejected successfully! Email notification sent.');
      setRemark('');
      setSelectedItem(null);
      fetchPendingApprovals();
    } catch (error: any) {
      alert(error.message || 'Failed to reject document');
    } finally {
      setActionLoading(false);
    }
  };

  const sendApprovalEmail = async (item: ApprovalItem, action: 'approved' | 'rejected', remark: string) => {
    try {
      // TODO: Implement email sending via API
      // await emailApi.sendApprovalNotification({
      //   documentNumber: item.documentNumber,
      //   action,
      //   remark,
      //   createdBy: item.createdBy
      // });
      console.log('Email sent:', { item, action, remark });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'sales-orders': 'Sales Order',
      'purchase-orders': 'Purchase Order',
      'invoices': 'Invoice',
      'vendor-bills': 'Vendor Bill',
    };
    return labels[type] || type;
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'sales-orders': 'bg-blue-100 text-blue-800',
      'purchase-orders': 'bg-purple-100 text-purple-800',
      'invoices': 'bg-green-100 text-green-800',
      'vendor-bills': 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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
    <div className="flex h-screen overflow-hidden">
      <RoleBasedSidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Financial Approvals</h1>
            <p className="text-muted-foreground">
              Review and approve/reject financial documents
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending Approvals</CardDescription>
                <CardTitle className="text-3xl">{approvals.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  Awaiting review
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Amount</CardDescription>
                <CardTitle className="text-3xl">
                  {formatCurrency(approvals.reduce((sum, item) => sum + item.amount, 0))}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Combined value
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Document Types</CardDescription>
                <CardTitle className="text-3xl">
                  {new Set(approvals.map(a => a.type)).size}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileText className="w-4 h-4 mr-1" />
                  Different types
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Approvals List */}
          {approvals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground">No pending approvals at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {approvals.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getDocumentTypeColor(item.type)}>
                            {getDocumentTypeLabel(item.type)}
                          </Badge>
                          <h3 className="text-xl font-semibold">{item.documentNumber}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Customer/Vendor</p>
                            <p className="font-medium">{item.customerOrVendor}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Project</p>
                            <p className="font-medium">{item.projectName}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Created By</p>
                            <p className="font-medium flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {item.createdBy}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Date</p>
                            <p className="font-medium">{formatDate(item.createdAt)}</p>
                          </div>
                        </div>
                        {item.description && (
                          <div>
                            <p className="text-muted-foreground text-sm">Description</p>
                            <p className="text-sm">{item.description}</p>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedItem?.id === item.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Remark (optional for approval, required for rejection)
                          </label>
                          <Textarea
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Add your comments here..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(item)}
                            disabled={actionLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {actionLoading ? 'Processing...' : 'Approve'}
                          </Button>
                          <Button
                            onClick={() => handleReject(item)}
                            disabled={actionLoading || !remark.trim()}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {actionLoading ? 'Processing...' : 'Reject'}
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedItem(null);
                              setRemark('');
                            }}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setSelectedItem(item)}
                        className="w-full"
                        variant="outline"
                      >
                        Review & Take Action
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Activity Feed */}
          <ActivityFeed limit={10} showFilters={false} autoRefresh={true} refreshInterval={4000} />
        </div>
      </main>
    </div>
  );
}
