import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, Activity, Cpu } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Announcement badge with glass effect */}
          <div className="mb-8 inline-flex animate-fade-in">
            <Badge className="gap-2 px-4 py-2 text-sm glass-hover border-primary/30 bg-primary/10 dark:bg-primary/20 text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline font-medium">AI-powered agent observability platform</span>
              <span className="sm:hidden font-medium">AI Agent Platform</span>
              <ArrowRight className="h-3 w-3 text-primary" />
            </Badge>
          </div>

          {/* Main heading with gradient animation */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl animate-fade-in-up">
            Build, observe, and control{" "}
            <span className="gradient-text">
              AI agents
            </span>{" "}
            with real-time logs
          </h1>

          {/* Description */}
          <p className="mb-10 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
            Create intelligent AI agents with custom tools and knowledge bases. 
            Monitor every step with detailed execution logs and workflow observability.
          </p>

          {/* CTA buttons with glass effect */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-200">
            <Link href="https://github.com/akhundmuzzammil/agentops-hub" target="_blank">
              <Button size="lg" className="text-base min-w-[180px] group backdrop-blur-xl bg-primary/90 hover:bg-primary">
                View on GitHub
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="text-base min-w-[180px] glass-card-hover">
                See Demo
              </Button>
            </Link>
          </div>

          {/* Social proof with glass card */}
          <div className="mt-12 flex flex-col items-center gap-4 animate-fade-in-up animation-delay-300">
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Real-time Logs</span>
              </div>
            </div>
        </div>
      </div>
      </div>
    </section>  
  )
}
