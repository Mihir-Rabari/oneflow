import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DatePicker } from "@/components/ui/date-picker"
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Mail } from "lucide-react"

const invoices = [
  { id: "INV001", status: "Paid", method: "Credit card", description: "Website design services", amount: "$250.00" },
  { id: "INV002", status: "Pending", method: "PayPal", description: "Monthly subscription fee", amount: "$150.00" },
  { id: "INV003", status: "Unpaid", method: "Bank transfer", description: "Consulting hours", amount: "$350.00" },
  { id: "INV004", status: "Paid", method: "Credit card", description: "Software license renewal", amount: "$450.00" },
  { id: "INV005", status: "Paid", method: "PayPal", description: "Custom development work", amount: "$550.00" },
  { id: "INV006", status: "Pending", method: "Bank transfer", description: "Hosting and maintenance", amount: "$200.00" },
  { id: "INV007", status: "Unpaid", method: "Credit card", description: "Training session package", amount: "$300.00" },
]

export function ComponentsDemo() {
  const [date, setDate] = useState<Date>()
  const [fruit, setFruit] = useState<string>()
  const [name, setName] = useState("Pedro Duarte")
  const [username, setUsername] = useState("@peduarte")

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Components Demo</h1>
          <p className="text-muted-foreground">All UI components showcase</p>
        </div>

        {/* Table Component */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Table</h2>
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === "Paid" ? "default" : invoice.status === "Pending" ? "secondary" : "destructive"}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{invoice.method}</TableCell>
                    <TableCell className="text-muted-foreground">{invoice.description}</TableCell>
                    <TableCell className="text-right font-semibold">{invoice.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>Total</TableCell>
                  <TableCell className="text-right font-bold">$2,250.00</TableCell>
                </TableRow>
              </TableFooter>
              <TableCaption>A list of your recent invoices</TableCaption>
            </Table>
          </div>
        </div>

        {/* Select Component */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Select / Dropdown</h2>
          <div className="max-w-md">
            <Select value={fruit} onValueChange={setFruit}>
              <SelectTrigger>
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>FRUITS</SelectLabel>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                  <SelectItem value="blueberry">Blueberry</SelectItem>
                  <SelectItem value="grapes">Grapes</SelectItem>
                  <SelectItem value="pineapple">Pineapple</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {fruit && <p className="mt-2 text-sm text-muted-foreground">You selected: {fruit}</p>}
          </div>
        </div>

        {/* Dialog Component */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Dialog / Modal</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Edit Profile</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Date Picker Component */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Date Picker</h2>
          <div className="max-w-md">
            <DatePicker date={date} onSelect={setDate} />
            {date && <p className="mt-2 text-sm text-muted-foreground">Selected: {date.toDateString()}</p>}
          </div>
        </div>

        {/* Button Variants */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Button Variants</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button loading>Loading</Button>
            <Button icon={<Mail className="h-4 w-4" />}>With Icon</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
