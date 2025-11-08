import { ReactNode } from "react"
import { Sidebar } from "./Sidebar"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="w-64 hidden md:flex flex-shrink-0" />
      <main className="flex-1 overflow-y-auto bg-muted/30">
        <div className="container py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
