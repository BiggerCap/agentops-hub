import * as React from "react"
import { cn } from "@/lib/utils"

interface GradientHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  children: React.ReactNode
}

const GradientHeading = React.forwardRef<HTMLHeadingElement, GradientHeadingProps>(
  ({ level = "h2", className, children, ...props }, ref) => {
    const Tag = level
    
    return (
      <Tag
        ref={ref as any}
        className={cn("gradient-text font-bold tracking-tight", className)}
        {...props}
      >
        {children}
      </Tag>
    )
  }
)
GradientHeading.displayName = "GradientHeading"

export { GradientHeading }
