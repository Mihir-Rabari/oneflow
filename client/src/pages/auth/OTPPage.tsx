import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/Logo"
import { Loader2, AlertCircle } from "lucide-react"
import { authApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

export function OTPPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem('verifyEmail')
    if (!storedEmail) {
      navigate('/register')
    } else {
      setEmail(storedEmail)
    }
  }, [navigate])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setLoading(true)

    try {
      const response = await authApi.verifyOTP({
        email,
        otp: otpCode,
      })

      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        if (response.data?.success) {
          // Save token using auth context and navigate to dashboard
          login(response.data.data.accessToken, response.data.data.user)
          navigate('/dashboard')
        } else {
          setError(response.error || 'Invalid OTP')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError("")
    try {
      const response = await authApi.resendOTP(email)
      if (response.error) {
        setError(response.error)
      } else {
        // Show success message (could add toast notification here)
        setError("")
        alert("OTP resent successfully!")
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div>
            <CardTitle className="text-2xl">Verify your email</CardTitle>
            <CardDescription>
              We've sent a 6-digit code to your email
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-semibold"
                  required
                />
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" loading={loading} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={handleResend} disabled={loading}>
              Resend Code
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                className="text-primary font-medium hover:underline"
              >
                Resend
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
