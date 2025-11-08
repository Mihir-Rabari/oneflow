import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, DollarSign, FileText, TrendingUp, AlertCircle } from "lucide-react"

const invoices = [
  { id: "INV001", status: "Paid", method: "Credit card", customer: "Acme Corp", description: "Website design services", amount: 250000, date: "Dec 1, 2025" },
  { id: "INV002", status: "Pending", method: "PayPal", customer: "TechStart Inc", description: "Monthly subscription fee", amount: 150000, date: "Dec 3, 2025" },
  { id: "INV003", status: "Unpaid", method: "Bank transfer", customer: "Global Solutions", description: "Consulting hours", amount: 350000, date: "Dec 5, 2025" },
  { id: "INV004", status: "Paid", method: "Credit card", customer: "Innovate Ltd", description: "Software license renewal", amount: 450000, date: "Dec 6, 2025" },
  { id: "INV005", status: "Paid", method: "PayPal", customer: "Digital Agency", description: "Custom development work", amount: 550000, date: "Dec 7, 2025" },
  { id: "INV006", status: "Pending", method: "Bank transfer", customer: "Cloud Services", description: "Hosting and maintenance", amount: 200000, date: "Dec 8, 2025" },
  { id: "INV007", status: "Overdue", method: "Credit card", customer: "StartupXYZ", description: "Training session package", amount: 300000, date: "Nov 15, 2025" },
]

const statusColors = {
  Paid: "default",
  Pending: "secondary",
  Unpaid: "secondary",
  Overdue: "destructive",
} as const

export function BillingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalRevenue = invoices.filter(inv => inv.status === "Paid").reduce((sum, inv) => sum + inv.amount, 0)
  const pendingAmount = invoices.filter(inv => inv.status === "Pending").reduce((sum, inv) => sum + inv.amount, 0)
  const overdueAmount = invoices.filter(inv => inv.status === "Overdue").reduce((sum, inv) => sum + inv.amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
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
              <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
              <p className="text-xs text-muted-foreground">{invoices.filter(inv => inv.status === "Pending").length} invoices</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(overdueAmount)}</div>
              <p className="text-xs text-muted-foreground">{invoices.filter(inv => inv.status === "Overdue").length} invoices</p>
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
