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
import { Plus, Search, Loader2 } from "lucide-react"
import { purchaseOrdersApi } from "@/lib/api"

const statusColors = {
  DRAFT: "secondary",
  SENT: "default",
  APPROVED: "default",
  CANCELLED: "destructive",
} as const

export function PurchaseOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [orderDate, setOrderDate] = useState<Date | undefined>(new Date())
  const [expectedDelivery, setExpectedDelivery] = useState<Date | undefined>()
  const [formData, setFormData] = useState({
    orderNumber: "",
    vendor: "",
    project: "",
    amount: "",
    description: "",
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await purchaseOrdersApi.getAll()
      if (response.error) throw new Error(response.error)
      const ordersData = response.data?.data || response.data || []
      setOrders(Array.isArray(ordersData) ? ordersData : [])
    } catch (err: any) {
      console.error('Failed to load orders:', err)
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

    if (!formData.vendor.trim()) {
      setFormError('Vendor is required')
      return
    }

    const payload = {
      orderNumber: formData.orderNumber,
      vendorName: formData.vendor,
      projectId: formData.project || undefined,
      amount: Number(formData.amount),
      description: formData.description,
      orderDate: orderDate?.toISOString(),
      expectedDelivery: expectedDelivery?.toISOString(),
    }

    setCreateLoading(true)
    try {
      const response = await purchaseOrdersApi.create(payload)
      if (response.error) throw new Error(response.error)
      setIsDialogOpen(false)
      resetForm()
      fetchOrders()
    } catch (err: any) {
      setFormError(err.message || 'Failed to create order')
    } finally {
      setCreateLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      orderNumber: "",
      vendor: "",
      project: "",
      amount: "",
      description: "",
    })
    setOrderDate(new Date())
    setExpectedDelivery(undefined)
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
                         order.vendor?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Purchase Orders</h1>
            <p className="text-muted-foreground">Manage vendor purchase orders</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button icon={<Plus className="h-4 w-4" />}>New Purchase Order</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Create Purchase Order</DialogTitle>
                  <DialogDescription>
                    Create a new purchase order for a vendor
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
                      placeholder="PO001"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, orderNumber: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="vendor">Vendor</Label>
                      <Input
                        id="vendor"
                        placeholder="Vendor name"
                        value={formData.vendor}
                        onChange={(e) => setFormData((prev) => ({ ...prev, vendor: e.target.value }))}
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
                      <Label>Expected Delivery</Label>
                      <DatePicker date={expectedDelivery} onSelect={setExpectedDelivery} placeholder="Pick date" />
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

        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
            <CardDescription>List of all purchase orders</CardDescription>
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
                    <TableHead>Vendor</TableHead>
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
                        No purchase orders found. Create your first order to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.vendor}</TableCell>
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
