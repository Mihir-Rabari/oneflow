import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showText?: boolean
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.1"/>
        <path d="M 70 60 L 70 140 M 70 60 L 90 75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M 100 50 Q 130 75 130 100 Q 130 125 100 150" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M 95 145 L 100 150 L 105 145" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="70" cy="100" r="4" fill="currentColor"/>
        <circle cx="100" cy="85" r="4" fill="currentColor"/>
        <circle cx="130" cy="100" r="4" fill="currentColor"/>
        <circle cx="100" cy="115" r="4" fill="currentColor"/>
      </svg>
      {showText && (
        <span className="text-xl font-semibold">OneFlow</span>
      )}
    </div>
  )
}
