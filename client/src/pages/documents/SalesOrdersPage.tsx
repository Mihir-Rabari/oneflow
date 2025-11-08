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
import { salesOrdersApi, projectsApi } from "@/lib/api"
import { useLocation } from "react-router-dom"

const statusColors = {
  DRAFT: "secondary",
  SENT: "default",
  APPROVED: "default",
  CANCELLED: "destructive",
} as const

// Validation patterns
const VALIDATION_PATTERNS = {
  orderNumber: /^SO-\d{3,6}$/,
  customerName: /^[a-zA-Z\s.,'&-]{2,100}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  amount: /^\d+(\.\d{1,2})?$/,
  phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
}

const VALIDATION_MESSAGES = {
  orderNumber: 'Order number must be in format: SO-XXX (e.g., SO-001)',
  customerName: 'Customer name must be 2-100 characters (letters, spaces, and basic punctuation)',
  email: 'Please enter a valid email address',
  amount: 'Amount must be a valid number with up to 2 decimal places',
  amountPositive: 'Amount must be greater than 0',
  required: 'This field is required',
  dateInvalid: 'Valid until date must be after order date',
  descriptionMax: 'Description must not exceed 500 characters',
}

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
  const [projects, setProjects] = useState<any[]>([])
  const location = useLocation()

  useEffect(() => {
    fetchOrders()
    fetchProjects()
    
    // Auto-open modal if project parameter exists
    const params = new URLSearchParams(location.search)
    const projectId = params.get('project')
    if (projectId) {
      setFormData(prev => ({ ...prev, project: projectId }))
      setIsDialogOpen(true)
    }
  }, [location.search])

  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getAll()
      let projectsData: any[] = []
      
      if (response.data?.data?.projects && Array.isArray(response.data.data.projects)) {
        projectsData = response.data.data.projects
      } else if (response.data?.projects && Array.isArray(response.data.projects)) {
        projectsData = response.data.projects
      } else if (Array.isArray(response.data)) {
        projectsData = response.data
      }
      
      setProjects(projectsData)
    } catch (err) {
      console.error('Failed to fetch projects:', err)
    }
  }

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

  const validateForm = () => {
    // Order Number validation
    if (!formData.orderNumber.trim()) {
      setFormError(VALIDATION_MESSAGES.required + ' - Order Number')
      return false
    }
    if (!VALIDATION_PATTERNS.orderNumber.test(formData.orderNumber.trim())) {
      setFormError(VALIDATION_MESSAGES.orderNumber)
      return false
    }

    // Customer Name validation
    if (!formData.customer.trim()) {
      setFormError(VALIDATION_MESSAGES.required + ' - Customer Name')
      return false
    }
    if (!VALIDATION_PATTERNS.customerName.test(formData.customer.trim())) {
      setFormError(VALIDATION_MESSAGES.customerName)
      return false
    }

    // Project validation
    if (!formData.project) {
      setFormError(VALIDATION_MESSAGES.required + ' - Project')
      return false
    }

    // Amount validation
    if (!formData.amount || formData.amount.trim() === '') {
      setFormError(VALIDATION_MESSAGES.required + ' - Amount')
      return false
    }
    if (!VALIDATION_PATTERNS.amount.test(formData.amount)) {
      setFormError(VALIDATION_MESSAGES.amount)
      return false
    }
    if (Number(formData.amount) <= 0) {
      setFormError(VALIDATION_MESSAGES.amountPositive)
      return false
    }
    if (Number(formData.amount) > 99999999.99) {
      setFormError('Amount must not exceed ₹99,999,999.99')
      return false
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      setFormError(VALIDATION_MESSAGES.descriptionMax)
      return false
    }

    // Date validation
    if (!orderDate) {
      setFormError('Order date is required')
      return false
    }
    if (validUntil && orderDate && validUntil < orderDate) {
      setFormError(VALIDATION_MESSAGES.dateInvalid)
      return false
    }

    return true
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!validateForm()) {
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
    // Check if we should keep project ID from URL
    const params = new URLSearchParams(location.search)
    const projectId = params.get('project')
    
    setFormData({
      orderNumber: "",
      customer: "",
      project: projectId || "",
      amount: "",
      description: "",
    })
    setOrderDate(new Date())
    setValidUntil(undefined)
    setFormError(null)
    setOrderLines([])
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
                    <Label htmlFor="order-number">Order Number *</Label>
                    <Input
                      id="order-number"
                      placeholder="SO-001"
                      value={formData.orderNumber}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase()
                        setFormData((prev) => ({ ...prev, orderNumber: value }))
                      }}
                      maxLength={12}
                      pattern="^SO-\d{3,6}$"
                      title="Format: SO-XXX (e.g., SO-001)"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Format: SO-XXX (e.g., SO-001)</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="customer">Customer Name *</Label>
                      <Input
                        id="customer"
                        placeholder="Acme Corporation"
                        value={formData.customer}
                        onChange={(e) => setFormData((prev) => ({ ...prev, customer: e.target.value }))}
                        minLength={2}
                        maxLength={100}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project">Project *</Label>
                      <Select
                        value={formData.project}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, project: value }))}
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0.01"
                      max="99999999.99"
                      step="0.01"
                      placeholder="25000.00"
                      value={formData.amount}
                      onChange={(e) => {
                        const value = e.target.value
                        // Allow only valid decimal format
                        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                          setFormData((prev) => ({ ...prev, amount: value }))
                        }
                      }}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Enter amount up to ₹99,999,999.99</p>
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
                    <Label htmlFor="description">
                      Description 
                      {formData.description && (
                        <span className="text-muted-foreground ml-2">
                          ({formData.description.length}/500)
                        </span>
                      )}
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Order description (optional)"
                      value={formData.description}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) {
                          setFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                      }}
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground">Maximum 500 characters</p>
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
