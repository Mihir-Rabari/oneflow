import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, DollarSign, FileText, TrendingUp, AlertCircle, Loader2 } from "lucide-react"
import { billingApi } from "@/lib/api"


const statusColors = {
  Paid: "default",
  Pending: "secondary",
  Unpaid: "secondary",
  Overdue: "destructive",
} as const

export function BillingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await billingApi.getInvoices()
      console.log('Billing - Raw API response:', response)
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      // Backend returns: { success: true, data: { invoices: [...], pagination: {...} } }
      let invoicesData: any[] = []
      if (response.data?.data?.invoices && Array.isArray(response.data.data.invoices)) {
        invoicesData = response.data.data.invoices
      } else if (response.data?.invoices && Array.isArray(response.data.invoices)) {
        invoicesData = response.data.invoices
      } else if (Array.isArray(response.data)) {
        invoicesData = response.data
      }
      
      console.log('Billing - Parsed invoices:', invoicesData)
      console.log('Billing - Invoices count:', invoicesData.length)
      
      setInvoices(invoicesData)
    } catch (err: any) {
      console.error('Billing - Failed to load invoices:', err)
      setError(err.message || 'Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const normalizeStatus = (status?: string) => status?.toUpperCase() || ""

  const totalRevenue = invoices
    .filter(inv => normalizeStatus(inv.status) === "PAID")
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
  const totalPending = invoices
    .filter(inv => normalizeStatus(inv.status) === "PENDING")
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
  const overdueAmount = invoices
    .filter(inv => normalizeStatus(inv.status) === "OVERDUE")
    .reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <button onClick={fetchInvoices} className="mt-4 text-primary">Retry</button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Billing & Invoices</h1>
            <p className="text-muted-foreground">Manage invoices, payments, and revenue</p>
          </div>
          <Button icon={<Plus className="h-4 w-4" />}>
            New Invoice
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">From paid invoices</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <FileText className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
              <p className="text-xs text-muted-foreground">{invoices.filter(inv => normalizeStatus(inv.status) === "PENDING").length} invoices</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(overdueAmount)}</div>
              <p className="text-xs text-muted-foreground">{invoices.filter(inv => normalizeStatus(inv.status) === "OVERDUE").length} invoices</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
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
              <SelectItem value="all">All Invoices</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>A list of all your invoices and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[invoice.status as keyof typeof statusColors]}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{invoice.method}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">{invoice.description}</TableCell>
                    <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(invoice.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No invoices found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
