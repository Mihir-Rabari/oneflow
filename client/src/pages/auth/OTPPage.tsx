import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/Logo"

export function OTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join("")
    // TODO: Implement OTP verification logic
    console.log("OTP:", otpCode)
  }

  const handleResend = () => {
    // TODO: Implement resend OTP logic
    console.log("Resend OTP")
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
          <CardContent>
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
            <Button type="submit" className="w-full">
              Verify Email
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
