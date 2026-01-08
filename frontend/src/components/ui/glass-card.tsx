import * as React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.ComponentProps<"div"> {
  hover?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(hover ? "glass-hover" : "glass", className)}
        {...props}
      >
        {children}
      </Card>
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
