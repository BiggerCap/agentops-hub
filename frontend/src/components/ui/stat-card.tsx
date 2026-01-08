import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  icon: LucideIcon
  value: string
  label: string
  className?: string
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ icon: Icon, value, label, className }, ref) => {
    return (
      <div ref={ref} className={cn("text-center group", className)}>
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl glass-hover text-primary transition-all group-hover:scale-110">
          <Icon className="h-7 w-7" />
        </div>
        <div className="text-4xl font-bold mb-2">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    )
  }
)
StatCard.displayName = "StatCard"

export { StatCard }
