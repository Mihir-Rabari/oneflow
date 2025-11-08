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
import { vendorBillsApi } from "@/lib/api"

const statusColors = {
  DRAFT: "secondary",
  SENT: "default",
  PAID: "default",
  OVERDUE: "destructive",
} as const

export function VendorBillsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [billDate, setBillDate] = useState<Date | undefined>(new Date())
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [formData, setFormData] = useState({
    billNumber: "",
    vendor: "",
    project: "",
    amount: "",
  })

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    setLoading(true)
    try {
      const response = await vendorBillsApi.getAll()
      console.log('VendorBills - Raw API response:', response)
      
      if (response.error) throw new Error(response.error)
      
      let billsData: any[] = []
      if (response.data?.data?.vendorBills && Array.isArray(response.data.data.vendorBills)) {
        billsData = response.data.data.vendorBills
      } else if (response.data?.vendorBills && Array.isArray(response.data.vendorBills)) {
        billsData = response.data.vendorBills
      } else if (Array.isArray(response.data)) {
        billsData = response.data
      }
      
      console.log('VendorBills - Parsed:', billsData.length)
      setBills(billsData)
    } catch (err: any) {
      console.error('VendorBills - Failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.billNumber.trim()) {
      setFormError('Bill number is required')
      return
    }

    const payload = {
      billNumber: formData.billNumber,
      vendorName: formData.vendor,
      projectId: formData.project || undefined,
      amount: Number(formData.amount),
      billDate: billDate?.toISOString(),
      dueDate: dueDate?.toISOString(),
    }

    setCreateLoading(true)
    try {
      const response = await vendorBillsApi.create(payload)
      if (response.error) throw new Error(response.error)
      setIsDialogOpen(false)
      resetForm()
      fetchBills()
    } catch (err: any) {
      setFormError(err.message || 'Failed to create vendor bill')
    } finally {
      setCreateLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ billNumber: "", vendor: "", project: "", amount: "" })
    setBillDate(new Date())
    setDueDate(undefined)
    setFormError(null)
  }

  const filteredBills = bills.filter((bill) => {
    const matchesSearch = bill.billNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || bill.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Vendor Bills</h1>
            <p className="text-muted-foreground">Manage vendor bills and payments</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button icon={<Plus className="h-4 w-4" />}>New Vendor Bill</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateBill} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Create Vendor Bill</DialogTitle>
                  <DialogDescription>Create a new vendor bill</DialogDescription>
                </DialogHeader>

                {formError && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {formError}
                  </div>
                )}

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bill-number">Vendor Bill</Label>
                    <Input
                      id="bill-number"
                      placeholder="VB-001"
                      value={formData.billNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, billNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendor">Vendor</Label>
                    <Input id="vendor" placeholder="Vendor name" value={formData.vendor} onChange={(e) => setFormData((prev) => ({ ...prev, vendor: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <Input id="project" placeholder="Select project" value={formData.project} onChange={(e) => setFormData((prev) => ({ ...prev, project: e.target.value }))} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Bill Date</Label>
                      <DatePicker date={billDate} onSelect={setBillDate} />
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
                  <Button type="submit" loading={createLoading}>Create Bill</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 flex-col md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search bills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bills</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Bills</CardTitle>
            <CardDescription>List of all vendor bills</CardDescription>
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
                    <TableHead>Bill #</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No bills found. Create your first vendor bill to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">{bill.billNumber}</TableCell>
                        <TableCell>{bill.vendor}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[bill.status as keyof typeof statusColors]}>{bill.status}</Badge>
                        </TableCell>
                        <TableCell>{bill.date}</TableCell>
                        <TableCell className="text-right font-semibold">₹{bill.amount}</TableCell>
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
