import * as React from "react"
import { Star } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TestimonialCardProps {
  content: string
  author: string
  role: string
  avatar?: string
  rating?: number
  className?: string
}

const TestimonialCard = React.forwardRef<HTMLDivElement, TestimonialCardProps>(
  ({ content, author, role, avatar, rating = 5, className }, ref) => {
    return (
      <GlassCard 
        ref={ref}
        hover
        className={cn("hover:shadow-lg transition-all", className)}
      >
        <CardContent className="p-6">
          {/* Rating */}
          <div className="flex gap-1 mb-4">
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          
          {/* Content */}
          <p className="text-muted-foreground mb-6 leading-relaxed">
            &quot;{content}&quot;
          </p>
          
          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              {avatar || author.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="font-semibold">{author}</div>
              <div className="text-sm text-muted-foreground">{role}</div>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    )
  }
)
TestimonialCard.displayName = "TestimonialCard"

export { TestimonialCard }
