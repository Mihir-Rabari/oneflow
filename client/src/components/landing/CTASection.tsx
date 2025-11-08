import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  const navigate = useNavigate()
  
  return (
    <section className="container py-24">
      <div className="mx-auto max-w-4xl bg-primary text-primary-foreground rounded-2xl p-12 md:p-16 text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold">
          Ready to Transform Your Workflow?
        </h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          Join thousands of teams who have streamlined their operations with OneFlow. 
          Start your free trial today—no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
            size="lg" 
            variant="secondary"
            iconRight={<ArrowRight className="h-5 w-5" />}
            onClick={() => navigate('/register')}
          >
            Start Your Free Trial
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => navigate('/login')}
          >
            Schedule a Demo
          </Button>
        </div>
      </div>
    </section>
  )
}
