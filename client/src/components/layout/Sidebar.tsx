import { Logo } from "@/components/Logo"
import { 
  LayoutDashboard, 
  FolderKanban, 
  Clock, 
  FileText, 
  BarChart3, 
  Users, 
  Settings,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FolderKanban, label: "Projects", href: "/projects" },
  { icon: Clock, label: "Timesheets", href: "/timesheets" },
  { icon: FileText, label: "Billing", href: "/billing" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Users, label: "Team", href: "/team" },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const currentPath = window.location.pathname

  return (
    <aside className={cn("flex flex-col h-screen bg-card border-r", className)}>
      {/* Logo */}
      <div className="p-6 border-b">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
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
