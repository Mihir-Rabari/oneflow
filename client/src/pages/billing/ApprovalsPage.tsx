import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, DollarSign, FileText, ShoppingCart, Receipt } from 'lucide-react';
import { billingApi } from '@/lib/api';

interface ApprovalItem {
  id: string;
  orderNumber?: string;
  invoiceNumber?: string;
  billNumber?: string;
  amount: number;
  totalAmount?: number;
  customerName?: string;
  vendorName?: string;
  status: string;
  createdAt: string;
  project: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

interface PendingApprovals {
  salesOrders: ApprovalItem[];
  purchaseOrders: ApprovalItem[];
  invoices: ApprovalItem[];
  vendorBills: ApprovalItem[];
  summary: {
    totalPending: number;
    salesOrdersCount: number;
    purchaseOrdersCount: number;
    invoicesCount: number;
    vendorBillsCount: number;
  };
}

interface ApprovalStats {
  pending: {
    total: number;
    salesOrders: number;
    purchaseOrders: number;
    invoices: number;
    vendorBills: number;
  };
  thisMonth: {
    approved: number;
    rejected: number;
  };
}

export default function ApprovalsPage() {
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState<PendingApprovals | null>(null);
  const [stats, setStats] = useState<ApprovalStats | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApprovals();
    fetchStats();
  }, []);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await billingApi.getPendingApprovals();
      setApprovals(response.data as PendingApprovals);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch approvals');
      console.error('Failed to fetch approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await billingApi.getApprovalStats();
      setStats(response.data as ApprovalStats);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleApprove = async (type: string, id: string) => {
    try {
      await billingApi.approveDocument(type, id);
      alert('Approved successfully');
      fetchApprovals();
      fetchStats();
    } catch (error: any) {
      alert(error.message || 'Failed to approve');
    }
  };

  const handleReject = async (type: string, id: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    try {
      await billingApi.rejectDocument(type, id, reason || undefined);
      alert('Rejected successfully');
      fetchApprovals();
      fetchStats();
    } catch (error: any) {
      alert(error.message || 'Failed to reject');
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

  const renderApprovalCard = (item: ApprovalItem, type: string, icon: React.ReactNode) => (
    <Card key={item.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <CardTitle className="text-lg">
                {item.orderNumber || item.invoiceNumber || item.billNumber}
              </CardTitle>
              <CardDescription className="text-sm">
                {item.customerName || item.vendorName}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Project</p>
              <p className="font-medium">{item.project.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-semibold text-lg">
                {formatCurrency(item.totalAmount || item.amount)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Created By</p>
              <p className="font-medium">{item.createdBy.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">{formatDate(item.createdAt)}</p>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => handleApprove(type, item.id)}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={() => handleReject(type, item.id)}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Approval Queue</h1>
          <p className="text-muted-foreground">Review and approve financial documents</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Pending</CardDescription>
              <CardTitle className="text-3xl">{stats.pending.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                Awaiting approval
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Approved This Month</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.thisMonth.approved}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 mr-1" />
                Completed
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Rejected This Month</CardDescription>
              <CardTitle className="text-3xl text-red-600">{stats.thisMonth.rejected}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <XCircle className="w-4 h-4 mr-1" />
                Declined
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Approval Rate</CardDescription>
              <CardTitle className="text-3xl">
                {stats.thisMonth.approved + stats.thisMonth.rejected > 0
                  ? Math.round(
                      (stats.thisMonth.approved /
                        (stats.thisMonth.approved + stats.thisMonth.rejected)) *
                        100
                    )
                  : 0}
                %
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4 mr-1" />
                Success rate
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Approval Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            All ({approvals?.summary.totalPending || 0})
          </TabsTrigger>
          <TabsTrigger value="sales-orders">
            Sales Orders ({approvals?.summary.salesOrdersCount || 0})
          </TabsTrigger>
          <TabsTrigger value="purchase-orders">
            Purchase Orders ({approvals?.summary.purchaseOrdersCount || 0})
          </TabsTrigger>
          <TabsTrigger value="invoices">
            Invoices ({approvals?.summary.invoicesCount || 0})
          </TabsTrigger>
          <TabsTrigger value="vendor-bills">
            Vendor Bills ({approvals?.summary.vendorBillsCount || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {approvals && approvals.summary.totalPending === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground">No pending approvals at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvals?.salesOrders.map((item) =>
                renderApprovalCard(item, 'sales-orders', <ShoppingCart className="w-5 h-5 text-blue-600" />)
              )}
              {approvals?.purchaseOrders.map((item) =>
                renderApprovalCard(item, 'purchase-orders', <FileText className="w-5 h-5 text-purple-600" />)
              )}
              {approvals?.invoices.map((item) =>
                renderApprovalCard(item, 'invoices', <Receipt className="w-5 h-5 text-green-600" />)
              )}
              {approvals?.vendorBills.map((item) =>
                renderApprovalCard(item, 'vendor-bills', <DollarSign className="w-5 h-5 text-orange-600" />)
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sales-orders" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvals?.salesOrders.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending sales orders</p>
                </CardContent>
              </Card>
            ) : (
              approvals?.salesOrders.map((item) =>
                renderApprovalCard(item, 'sales-orders', <ShoppingCart className="w-5 h-5 text-blue-600" />)
              )
            )}
          </div>
        </TabsContent>

        <TabsContent value="purchase-orders" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvals?.purchaseOrders.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending purchase orders</p>
                </CardContent>
              </Card>
            ) : (
              approvals?.purchaseOrders.map((item) =>
                renderApprovalCard(item, 'purchase-orders', <FileText className="w-5 h-5 text-purple-600" />)
              )
            )}
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvals?.invoices.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Receipt className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending invoices</p>
                </CardContent>
              </Card>
            ) : (
              approvals?.invoices.map((item) =>
                renderApprovalCard(item, 'invoices', <Receipt className="w-5 h-5 text-green-600" />)
              )
            )}
          </div>
        </TabsContent>

        <TabsContent value="vendor-bills" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvals?.vendorBills.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <DollarSign className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending vendor bills</p>
                </CardContent>
              </Card>
            ) : (
              approvals?.vendorBills.map((item) =>
                renderApprovalCard(item, 'vendor-bills', <DollarSign className="w-5 h-5 text-orange-600" />)
              )
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
