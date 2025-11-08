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
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Receipt,
  Package,
  DollarSign,
  UserCog
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: [] }, // All roles
  { icon: FolderKanban, label: "Projects", href: "/projects", roles: [] }, // All roles
  { icon: Clock, label: "Timesheets", href: "/timesheets", roles: [] }, // All roles
  { icon: FileText, label: "Billing", href: "/billing", roles: ["ADMIN", "PROJECT_MANAGER"] },
  { icon: BarChart3, label: "Analytics", href: "/analytics", roles: [] }, // All roles (data filtered by backend)
  { icon: Users, label: "Team", href: "/team", roles: [] }, // All roles (data filtered by backend)
  { icon: UserCog, label: "User Management", href: "/users", roles: ["ADMIN"] }, // Admin only
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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user } = useAuth()

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter((item) => {
    // If no roles specified (empty array), show to everyone
    if (item.roles.length === 0) return true
    // Otherwise, check if user's role is in the allowed roles
    return user && item.roles.includes(user.role)
  })

  return (
    <aside className={cn(
      "flex flex-col h-screen bg-card border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Logo & Toggle */}
      <div className="p-4 border-b flex items-center justify-between">
        {!isCollapsed && <Logo />}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
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
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && item.label}
            </a>
          )
        })}

        {/* Documents Dropdown */}
        <div>
          {!isCollapsed && (
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
          )}
          
          {!isCollapsed && isDocumentsOpen && (
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
          
          {isCollapsed && documentMenuItems.map((item) => {
            const isActive = currentPath === item.href
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                title={item.label}
              >
                <item.icon className="h-4 w-4" />
              </a>
            )
          })}
        </div>
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t space-y-1">
        <a
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && "Settings"}
        </a>
        <button
          onClick={() => console.log("Logout")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
            isCollapsed && "justify-center"
          )}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && "Logout"}
        </button>
      </div>
    </aside>
  )
}
