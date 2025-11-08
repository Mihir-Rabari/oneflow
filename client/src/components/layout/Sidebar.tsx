import { Logo } from "@/components/Logo"
import { useState } from "react"
import { 
  LayoutDashboard, 
  FolderKanban, 
  Clock, 
  FileText, 
  BarChart3, 
  Users, 
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Receipt,
  Package,
  DollarSign
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: [] }, // All roles
  { icon: FolderKanban, label: "Projects", href: "/projects", roles: [] }, // All roles
  { icon: Clock, label: "Timesheets", href: "/timesheets", roles: [] }, // All roles
  { icon: FileText, label: "Billing", href: "/billing", roles: ["ADMIN", "PROJECT_MANAGER"] },
  { icon: BarChart3, label: "Analytics", href: "/analytics", roles: ["ADMIN", "PROJECT_MANAGER"] },
  { icon: Users, label: "Team", href: "/team", roles: ["ADMIN", "PROJECT_MANAGER"] },
  { icon: Users, label: "User Management", href: "/users", roles: ["ADMIN"] }, // Admin only
]

const documentMenuItems = [
  { icon: ShoppingCart, label: "Sales Orders", href: "/sales-orders" },
  { icon: FileText, label: "Invoices", href: "/invoices" },
  { icon: ShoppingCart, label: "Purchase Orders", href: "/purchase-orders" },
  { icon: Receipt, label: "Vendor Bills", href: "/vendor-bills" },
  { icon: DollarSign, label: "Expenses", href: "/expenses" },
  { icon: Package, label: "Products", href: "/products" },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const currentPath = window.location.pathname
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false)
  const { user } = useAuth()

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter((item) => {
    // If no roles specified (empty array), show to everyone
    if (item.roles.length === 0) return true
    // Otherwise, check if user's role is in the allowed roles
    return user && item.roles.includes(user.role)
  })

  return (
    <aside className={cn("flex flex-col h-screen bg-card border-r", className)}>
      {/* Logo */}
      <div className="p-6 border-b">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleMenuItems.map((item) => {
          const isActive = currentPath === item.href
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </a>
          )
        })}

        {/* Documents Dropdown */}
        <div>
          <button
            onClick={() => setIsDocumentsOpen(!isDocumentsOpen)}
            className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              Documents
            </div>
            {isDocumentsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {isDocumentsOpen && (
            <div className="mt-1 ml-4 space-y-1">
              {documentMenuItems.map((item) => {
                const isActive = currentPath === item.href
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t space-y-1">
        <a
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Settings className="h-5 w-5" />
          Settings
        </a>
        <button
          onClick={() => console.log("Logout")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}
