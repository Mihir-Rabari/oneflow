import { Logo } from "@/components/Logo"
import { Github, Linkedin, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Streamline your entire workflow from planning to billing in one unified platform.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a></li>
              <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</a></li>
              <li><a href="#roadmap" className="text-sm text-muted-foreground hover:text-foreground">Roadmap</a></li>
              <li><a href="#changelog" className="text-sm text-muted-foreground hover:text-foreground">Changelog</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-sm text-muted-foreground hover:text-foreground">About Us</a></li>
              <li><a href="#careers" className="text-sm text-muted-foreground hover:text-foreground">Careers</a></li>
              <li><a href="#blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</a></li>
              <li><a href="#contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
              <li><a href="#terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</a></li>
              <li><a href="#security" className="text-sm text-muted-foreground hover:text-foreground">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            © 2025 OneFlow. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#twitter" className="text-muted-foreground hover:text-foreground">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#github" className="text-muted-foreground hover:text-foreground">
              <Github className="h-5 w-5" />
            </a>
            <a href="#linkedin" className="text-muted-foreground hover:text-foreground">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
