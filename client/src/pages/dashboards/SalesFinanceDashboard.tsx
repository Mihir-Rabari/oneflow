import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  DollarSign, 
  ShoppingCart, 
  FileText,
  Receipt,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Plus
} from "lucide-react"
import { useNavigate } from "react-router-dom"

export function SalesFinanceDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCost: 0,
    profit: 0,
    salesOrders: 0,
    invoices: 0,
    purchaseOrders: 0,
    vendorBills: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // TODO: Fetch actual financial stats from API
      setStats({
        totalRevenue: 500000,
        totalCost: 325000,
        profit: 175000,
        salesOrders: 8,
        invoices: 12,
        purchaseOrders: 5,
        vendorBills: 7
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const quickActions = [
    { icon: ShoppingCart, label: "New Sales Order", path: "/sales-orders", color: "text-blue-600" },
    { icon: FileText, label: "New Invoice", path: "/invoices", color: "text-green-600" },
    { icon: Receipt, label: "New Purchase Order", path: "/purchase-orders", color: "text-purple-600" },
    { icon: Receipt, label: "New Vendor Bill", path: "/vendor-bills", color: "text-orange-600" },
  ]

  const profitMargin = ((stats.profit / stats.totalRevenue) * 100).toFixed(1)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Sales & Finance Dashboard</h1>
          <p className="text-muted-foreground">Financial overview and document management</p>
        </div>

        {/* Financial Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{(stats.totalRevenue / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From sales orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ₹{(stats.totalCost / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Purchases & expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ₹{(stats.profit / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {profitMargin}% margin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.salesOrders + stats.invoices}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active documents
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Create new financial documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Button
                  key={action.path}
                  variant="outline"
                  className="h-20 justify-start"
                  onClick={() => navigate(action.path)}
                >
                  <action.icon className={`h-6 w-6 mr-3 ${action.color}`} />
                  <span className="font-semibold">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Documents</CardTitle>
              <CardDescription>Sales orders and invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Sales Orders</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.salesOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">Customer Invoices</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.invoices}</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/sales-orders')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Sales Order
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost Documents</CardTitle>
              <CardDescription>Purchase orders and bills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium">Purchase Orders</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.purchaseOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium">Vendor Bills</span>
                  </div>
                  <span className="text-2xl font-bold">{stats.vendorBills}</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/purchase-orders')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Purchase Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales/Finance Privileges */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <AlertCircle className="h-5 w-5" />
              Sales & Finance Access
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-purple-800">
            <ul className="list-disc list-inside space-y-1">
              <li>Create and manage all Sales Orders</li>
              <li>Create and manage Customer Invoices</li>
              <li>Create and manage Purchase Orders</li>
              <li>Create and manage Vendor Bills</li>
              <li>Link documents to projects</li>
              <li>View financial reports and analytics</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
