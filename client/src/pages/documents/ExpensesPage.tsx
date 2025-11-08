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
import { Plus, Search, Upload, Loader2 } from "lucide-react"
import { expensesApi } from "@/lib/api"

const statusColors = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  REIMBURSED: "default",
} as const

export function ExpensesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [expenseDate, setExpenseDate] = useState<Date | undefined>(new Date())
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    amount: "",
    project: "",
    description: "",
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const response = await expensesApi.getAll()
      if (response.error) throw new Error(response.error)
      const expensesData = response.data?.data || response.data || []
      setExpenses(Array.isArray(expensesData) ? expensesData : [])
    } catch (err: any) {
      console.error('Failed to load expenses:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.name.trim()) {
      setFormError('Expense name is required')
      return
    }

    if (!formData.amount) {
      setFormError('Amount is required')
      return
    }

    const payload = {
      description: formData.name,
      amount: Number(formData.amount),
      category: formData.category,
      projectId: formData.project || undefined,
      expenseDate: expenseDate?.toISOString(),
      isBillable: false,
    }

    setCreateLoading(true)
    try {
      const response = await expensesApi.create(payload)
      if (response.error) throw new Error(response.error)
      setIsDialogOpen(false)
      resetForm()
      fetchExpenses()
    } catch (err: any) {
      setFormError(err.message || 'Failed to create expense')
    } finally {
      setCreateLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      amount: "",
      project: "",
      description: "",
    })
    setExpenseDate(new Date())
    setFormError(null)
  }

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.category?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || expense.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Expenses</h1>
            <p className="text-muted-foreground">Track and manage project expenses</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button icon={<Plus className="h-4 w-4" />}>New Expense</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <form onSubmit={handleCreateExpense} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Create Expense</DialogTitle>
                  <DialogDescription>
                    Record a new project expense
                  </DialogDescription>
                </DialogHeader>

                {formError && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {formError}
                  </div>
                )}

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Expense Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter expense name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expense-date">Expense Period</Label>
                    <DatePicker date={expenseDate} onSelect={setExpenseDate} />
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

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Receipt/Image</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">
                        <Button type="button" variant="link" className="h-auto p-0">
                          Upload Image
                        </Button>
                        {" "}or drag and drop
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF up to 10MB</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Expense details"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      rows={4}
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => handleDialogChange(false)} disabled={createLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={createLoading}>
                    Create Expense
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
              placeholder="Search expenses..."
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
              <SelectItem value="all">All Expenses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="REIMBURSED">Reimbursed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>List of all project expenses</CardDescription>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No expenses found. Create your first expense to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.name}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>{expense.project}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[expense.status as keyof typeof statusColors]}>
                            {expense.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{expense.date}</TableCell>
                        <TableCell className="text-right font-semibold">₹{expense.amount}</TableCell>
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
