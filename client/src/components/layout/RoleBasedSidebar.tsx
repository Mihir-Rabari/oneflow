import { Logo } from "@/components/Logo";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  DollarSign,
  CheckSquare,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MenuItem {
  icon: any;
  label: string;
  href: string;
}

interface SidebarProps {
  className?: string;
}

export function RoleBasedSidebar({ className }: SidebarProps) {
  const currentPath = window.location.pathname;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Define menu items based on role
  const getMenuItems = (): MenuItem[] => {
    if (!user) return [];

    switch (user.role) {
      case "TEAM_MEMBER":
        // Team members only see their assigned projects
        return [
          { icon: FolderKanban, label: "My Projects", href: "/team/dashboard" },
        ];

      case "PROJECT_MANAGER":
        // PM can manage projects and team (tasks are inside projects)
        return [
          { icon: LayoutDashboard, label: "Dashboard", href: "/pm/dashboard" },
          { icon: FolderKanban, label: "Projects", href: "/projects" },
          { icon: Users, label: "Team Management", href: "/team" },
        ];

      case "ADMIN":
        // Admin has all PM permissions + user management + expense approval
        return [
          { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
          { icon: FolderKanban, label: "Projects", href: "/projects" },
          { icon: UserCog, label: "User Management", href: "/users" },
          { icon: DollarSign, label: "Expense Approval", href: "/admin/expenses" },
        ];

      case "SALES_FINANCE":
        // Sales & Finance only see approval tab
        return [
          { icon: CheckSquare, label: "Approvals", href: "/finance/approvals" },
        ];

      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-card border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Logo & Toggle */}
      <div className="p-4 border-b flex items-center justify-between">
        {!isCollapsed && <Logo />}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.role.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = currentPath === item.href;
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
          );
        })}
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
          onClick={handleLogout}
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
  );
}
