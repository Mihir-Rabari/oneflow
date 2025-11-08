import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DatePicker } from "@/components/ui/date-picker"
import { Plus, Search, Loader2 } from "lucide-react"
import { invoicesApi } from "@/lib/api"

const statusColors = {
  DRAFT: "secondary",
  SENT: "default",
  PAID: "default",
  OVERDUE: "destructive",
} as const

export function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date())
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    customer: "",
    project: "",
    amount: "",
  })

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const response = await invoicesApi.getAll()
      console.log('Invoices - Raw API response:', response)
      
      if (response.error) throw new Error(response.error)
      
      // Backend returns: { success: true, data: { invoices: [...], pagination: {...} } }
      let invoicesData: any[] = []
      if (response.data?.data?.invoices && Array.isArray(response.data.data.invoices)) {
        invoicesData = response.data.data.invoices
      } else if (response.data?.invoices && Array.isArray(response.data.invoices)) {
        invoicesData = response.data.invoices
      } else if (Array.isArray(response.data)) {
        invoicesData = response.data
      }
      
      console.log('Invoices - Parsed:', invoicesData)
      console.log('Invoices - Count:', invoicesData.length)
      
      setInvoices(invoicesData)
    } catch (err: any) {
      console.error('Invoices - Failed to load:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.invoiceNumber.trim()) {
      setFormError('Invoice number is required')
      return
    }

    const payload = {
      invoiceNumber: formData.invoiceNumber,
      customerName: formData.customer,
      projectId: formData.project || undefined,
      amount: Number(formData.amount),
      invoiceDate: invoiceDate?.toISOString(),
      dueDate: dueDate?.toISOString(),
    }

    setCreateLoading(true)
    try {
      const response = await invoicesApi.create(payload)
      if (response.error) throw new Error(response.error)
      setIsDialogOpen(false)
      resetForm()
      fetchInvoices()
    } catch (err: any) {
      setFormError(err.message || 'Failed to create invoice')
    } finally {
      setCreateLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ invoiceNumber: "", customer: "", project: "", amount: "" })
    setInvoiceDate(new Date())
    setDueDate(undefined)
    setFormError(null)
  }

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customer Invoices</h1>
            <p className="text-muted-foreground">Manage customer invoices and payments</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button icon={<Plus className="h-4 w-4" />}>New Invoice</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Create Invoice</DialogTitle>
                  <DialogDescription>Create a new customer invoice</DialogDescription>
                </DialogHeader>

                {formError && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {formError}
                  </div>
                )}

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice-number">Customer Invoice</Label>
                    <Input
                      id="invoice-number"
                      placeholder="INV-001"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Input id="customer" placeholder="Customer name" value={formData.customer} onChange={(e) => setFormData((prev) => ({ ...prev, customer: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <Input id="project" placeholder="Select project" value={formData.project} onChange={(e) => setFormData((prev) => ({ ...prev, project: e.target.value }))} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Invoice Date</Label>
                      <DatePicker date={invoiceDate} onSelect={setInvoiceDate} />
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <DatePicker date={dueDate} onSelect={setDueDate} placeholder="Pick date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Invoice Lines</Label>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground text-center py-4">
                          <Button type="button" variant="outline" size="sm">Add a product</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={createLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={createLoading}>Create Invoice</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 flex-col md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search invoices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Invoices</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer Invoices</CardTitle>
            <CardDescription>List of all customer invoices</CardDescription>
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
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No invoices found. Create your first invoice to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                        <TableCell>{inv.customer}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[inv.status as keyof typeof statusColors]}>{inv.status}</Badge>
                        </TableCell>
                        <TableCell>{inv.date}</TableCell>
                        <TableCell className="text-right font-semibold">₹{inv.amount}</TableCell>
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
