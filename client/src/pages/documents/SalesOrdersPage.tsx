import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DatePicker } from "@/components/ui/date-picker"
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Plus, Search, Loader2, Home, Trash2 } from "lucide-react"
import { salesOrdersApi } from "@/lib/api"

const statusColors = {
  DRAFT: "secondary",
  SENT: "default",
  APPROVED: "default",
  CANCELLED: "destructive",
} as const

export function SalesOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [orderDate, setOrderDate] = useState<Date | undefined>(new Date())
  const [validUntil, setValidUntil] = useState<Date | undefined>()
  const [formData, setFormData] = useState({
    orderNumber: "",
    customer: "",
    project: "",
    amount: "",
    description: "",
  })
  const [orderLines, setOrderLines] = useState<any[]>([])
  const [newLine, setNewLine] = useState({ product: "", quantity: "", unitPrice: "" })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await salesOrdersApi.getAll()
      console.log('SalesOrders - Raw API response:', response)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      // Backend returns: { success: true, data: { salesOrders: [...], pagination: {...} } }
      let ordersData: any[] = []
      if (response.data?.data?.salesOrders && Array.isArray(response.data.data.salesOrders)) {
        ordersData = response.data.data.salesOrders
      } else if (response.data?.salesOrders && Array.isArray(response.data.salesOrders)) {
        ordersData = response.data.salesOrders
      } else if (Array.isArray(response.data)) {
        ordersData = response.data
      }
      
      console.log('SalesOrders - Parsed:', ordersData)
      console.log('SalesOrders - Count:', ordersData.length)
      
      setOrders(ordersData)
    } catch (err: any) {
      console.error('SalesOrders - Failed to load:', err)
      setError(err.message || 'Failed to load sales orders')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.orderNumber.trim()) {
      setFormError('Order number is required')
      return
    }

    if (!formData.customer.trim()) {
      setFormError('Customer is required')
      return
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setFormError('Amount must be greater than 0')
      return
    }

    if (validUntil && orderDate && validUntil < orderDate) {
      setFormError('Valid until date must be after order date')
      return
    }

    const payload = {
      orderNumber: formData.orderNumber,
      customerName: formData.customer,
      projectId: formData.project || undefined,
      amount: Number(formData.amount),
      description: formData.description,
      orderDate: orderDate?.toISOString(),
      validUntil: validUntil?.toISOString(),
    }

    setCreateLoading(true)
    try {
      const response = await salesOrdersApi.create(payload)
      if (response.error) {
        throw new Error(response.error)
      }
      setIsDialogOpen(false)
      resetForm()
      fetchOrders()
    } catch (err: any) {
      setFormError(err.message || 'Failed to create sales order')
    } finally {
      setCreateLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      orderNumber: "",
      customer: "",
      project: "",
      amount: "",
      description: "",
    })
    setOrderDate(new Date())
    setValidUntil(undefined)
    setFormError(null)
  }

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const addOrderLine = () => {
    if (!newLine.product || !newLine.quantity || !newLine.unitPrice) return
    setOrderLines([...orderLines, { ...newLine, id: Date.now() }])
    setNewLine({ product: "", quantity: "", unitPrice: "" })
  }

  const removeOrderLine = (id: number) => {
    setOrderLines(orderLines.filter(line => line.id !== id))
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink to="/dashboard">
                <Home className="h-4 w-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Sales Orders</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sales Orders</h1>
            <p className="text-muted-foreground">Manage customer sales orders</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button icon={<Plus className="h-4 w-4" />}>New Sales Order</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Create Sales Order</DialogTitle>
                  <DialogDescription>
                    Create a new sales order for a customer
                  </DialogDescription>
                </DialogHeader>

                {formError && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {formError}
                  </div>
                )}

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order-number">Order Number</Label>
                    <Input
                      id="order-number"
                      placeholder="SO001"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, orderNumber: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="customer">Customer</Label>
                      <Input
                        id="customer"
                        placeholder="Customer name"
                        value={formData.customer}
                        onChange={(e) => setFormData((prev) => ({ ...prev, customer: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project">Project</Label>
                      <Input
                        id="project"
                        placeholder="Select project"
                        value={formData.project}
                        onChange={(e) => setFormData((prev) => ({ ...prev, project: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Order Date</Label>
                      <DatePicker date={orderDate} onSelect={setOrderDate} />
                    </div>
                    <div className="space-y-2">
                      <Label>Valid Until</Label>
                      <DatePicker date={validUntil} onSelect={setValidUntil} placeholder="Pick date" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Order description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  {/* Order Lines Section */}
                  <div className="space-y-2">
                    <Label>Order Lines</Label>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-5 gap-2 text-sm font-medium mb-2">
                          <div>Product</div>
                          <div>Quantity</div>
                          <div>Unit</div>
                          <div>Unit Price</div>
                          <div>Amount</div>
                        </div>
                        <div className="text-sm text-muted-foreground text-center py-4">
                          <Button type="button" variant="outline" size="sm">Add a product</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => handleDialogChange(false)} disabled={createLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={createLoading}>
                    Create Order
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Orders</CardTitle>
            <CardDescription>List of all sales orders</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No sales orders found. Create your first order to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.project}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[order.status as keyof typeof statusColors]}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell className="text-right font-semibold">₹{order.amount}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
