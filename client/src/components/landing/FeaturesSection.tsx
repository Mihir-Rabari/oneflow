import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FolderKanban, 
  Clock, 
  FileText, 
  BarChart3, 
  Users, 
  Shield 
} from "lucide-react"

const features = [
  {
    title: "Project Management",
    description: "Plan, track, and collaborate on projects with intuitive Kanban boards and task management.",
    icon: FolderKanban,
  },
  {
    title: "Time Tracking",
    description: "Log hours, track billable time, and monitor team productivity with ease.",
    icon: Clock,
  },
  {
    title: "Invoicing & Billing",
    description: "Create professional invoices, track payments, and manage your entire billing workflow.",
    icon: FileText,
  },
  {
    title: "Analytics & Reports",
    description: "Get insights with real-time dashboards, financial reports, and performance metrics.",
    icon: BarChart3,
  },
  {
    title: "Team Collaboration",
    description: "Assign tasks, track progress, and communicate seamlessly with your team members.",
    icon: Users,
  },
  {
    title: "Security First",
    description: "Enterprise-grade security with role-based access control and encrypted data storage.",
    icon: Shield,
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="container py-24 bg-muted/50">
      <div className="mx-auto max-w-2xl text-center space-y-4 mb-16">
        <h2 className="text-3xl md:text-4xl font-bold">
          Everything You Need
        </h2>
        <p className="text-lg text-muted-foreground">
          All the tools you need to run your business efficiently, integrated in one platform.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="border-2">
            <CardHeader>
              <feature.icon className="h-10 w-10 text-primary mb-2" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
