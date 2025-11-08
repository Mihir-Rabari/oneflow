import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export function HeroSection() {
  const navigate = useNavigate()
  
  return (
    <section className="container py-24 md:py-32">
      <div className="mx-auto max-w-4xl text-center space-y-8">
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
          <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
          <span className="text-muted-foreground">Plan to Bill in One Place</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Streamline Your Entire
          <span className="block text-primary mt-2">Business Workflow</span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          From project planning to invoicing, manage everything in one unified platform. 
          Save time, reduce errors, and focus on what matters.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
            size="lg" 
            iconRight={<ArrowRight className="h-5 w-5" />}
            onClick={() => navigate('/register')}
          >
            Get Started Free
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => window.location.href = '#features'}
          >
            See How It Works
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Free 14-day trial</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  )
}
