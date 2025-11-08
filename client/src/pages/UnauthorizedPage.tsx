import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, Home, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <ShieldAlert className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription className="text-base mt-2">
              You don't have permission to access this page
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>This page requires specific permissions that your account doesn't have.</p>
            <p className="mt-2">Contact your administrator if you believe this is a mistake.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline"
              icon={<ArrowLeft className="h-4 w-4" />}
              className="w-full"
            >
              Go Back
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              icon={<Home className="h-4 w-4" />}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
