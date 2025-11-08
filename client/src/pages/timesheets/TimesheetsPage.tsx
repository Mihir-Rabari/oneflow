import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Clock, Calendar as CalendarIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const timesheets = [
  { id: "1", project: "Website Redesign", task: "Homepage design", date: "Dec 8, 2025", hours: 6, billable: true, status: "approved" },
  { id: "2", project: "Mobile App", task: "API integration", date: "Dec 8, 2025", hours: 8, billable: true, status: "pending" },
  { id: "3", project: "CRM Integration", task: "Setup development environment", date: "Dec 7, 2025", hours: 4, billable: false, status: "approved" },
  { id: "4", project: "Website Redesign", task: "Blog page design", date: "Dec 7, 2025", hours: 5.5, billable: true, status: "approved" },
  { id: "5", project: "Mobile App", task: "User authentication", date: "Dec 6, 2025", hours: 7, billable: true, status: "rejected" },
  { id: "6", project: "Security Audit", task: "Code review", date: "Dec 6, 2025", hours: 6, billable: true, status: "pending" },
  { id: "7", project: "API Development", task: "Documentation", date: "Dec 5, 2025", hours: 3, billable: false, status: "approved" },
]

const statusColors = {
  approved: "default",
  pending: "secondary",
  rejected: "destructive",
} as const

export function TimesheetsPage() {
  const [date, setDate] = useState<Date>()
  const [project, setProject] = useState<string>()
  const [hours, setHours] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement timesheet submission
    console.log({ date, project, hours, description })
  }

  const totalHours = timesheets.reduce((sum, ts) => sum + ts.hours, 0)
  const billableHours = timesheets.filter(ts => ts.billable).reduce((sum, ts) => sum + ts.hours, 0)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Timesheets</h1>
            <p className="text-muted-foreground">Track your time and billable hours</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button icon={<Plus className="h-4 w-4" />}>
                Log Time
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Time Entry</DialogTitle>
                <DialogDescription>
                  Record your work hours for a project or task
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <DatePicker date={date} onSelect={setDate} placeholder="Select date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <Select value={project} onValueChange={setProject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website Redesign</SelectItem>
                        <SelectItem value="mobile">Mobile App Development</SelectItem>
                        <SelectItem value="crm">CRM Integration</SelectItem>
                        <SelectItem value="security">Security Audit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      step="0.5"
                      placeholder="8.0"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="What did you work on?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Log Time</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHours}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{billableHours}</div>
              <p className="text-xs text-muted-foreground">{((billableHours / totalHours) * 100).toFixed(0)}% of total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <CalendarIcon className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timesheets.filter(ts => ts.status === "pending").length}</div>
              <p className="text-xs text-muted-foreground">Entries waiting</p>
            </CardContent>
          </Card>
        </div>

        {/* Timesheets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
            <CardDescription>Your logged time entries for this week</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Billable</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timesheets.map((ts) => (
                  <TableRow key={ts.id}>
                    <TableCell className="font-medium">{ts.project}</TableCell>
                    <TableCell>{ts.task}</TableCell>
                    <TableCell className="text-muted-foreground">{ts.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ts.hours}h</Badge>
                    </TableCell>
                    <TableCell>
                      {ts.billable ? (
                        <Badge variant="default">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[ts.status as keyof typeof statusColors]}>
                        {ts.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
