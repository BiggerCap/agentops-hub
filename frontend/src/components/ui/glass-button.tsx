import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "outline", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        className={cn("glass-hover", className)}
        {...props}
      />
    )
  }
)
GlassButton.displayName = "GlassButton"

export { GlassButton }
