import * as React from "react"
import { LucideIcon } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon: Icon, title, description, className }, ref) => {
    return (
      <GlassCard 
        ref={ref}
        hover
        className={cn("group relative overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all", className)}
      >
        <CardContent className="p-6">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </GlassCard>
    )
  }
)
FeatureCard.displayName = "FeatureCard"

export { FeatureCard }
