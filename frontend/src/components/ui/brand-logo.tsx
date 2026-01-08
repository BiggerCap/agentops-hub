import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
  size?: "sm" | "md" | "lg"
  href?: string
  showText?: boolean
  className?: string
}

const sizeClasses = {
  sm: {
    container: "h-8 w-8",
    icon: "h-4 w-4",
    text: "text-lg",
  },
  md: {
    container: "h-9 w-9",
    icon: "h-5 w-5",
    text: "text-xl",
  },
  lg: {
    container: "h-12 w-12",
    icon: "h-6 w-6",
    text: "text-2xl",
  },
}

const BrandLogo = React.forwardRef<HTMLAnchorElement, BrandLogoProps>(
  ({ size = "md", href = "/", showText = true, className }, ref) => {
    const sizes = sizeClasses[size]
    
    const content = (
      <>
        <div className={cn(
          sizes.container,
          "rounded-lg gradient-bg-diagonal flex items-center justify-center brand-shadow transition-all group-hover:scale-105 brand-shadow-hover"
        )}>
          <svg className={cn(sizes.icon, "text-white")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            <circle cx="12" cy="9" r="1.5" fill="currentColor" />
          </svg>
        </div>
        {showText && (
          <span className={cn(sizes.text, "font-bold tracking-tight gradient-text")}>
            AgentOps
          </span>
        )}
      </>
    )
    
    return (
      <Link 
        ref={ref}
        href={href} 
        className={cn("flex items-center space-x-2 group", className)}
      >
        {content}
      </Link>
    )
  }
)
BrandLogo.displayName = "BrandLogo"

export { BrandLogo }
