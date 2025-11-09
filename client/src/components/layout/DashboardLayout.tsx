import type { ReactNode } from "react"
import { RoleBasedSidebar } from "./RoleBasedSidebar"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <RoleBasedSidebar className="hidden md:flex flex-shrink-0" />
      <main className="flex-1 overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
