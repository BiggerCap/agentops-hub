"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Database, Bot, Cpu, FileText } from "lucide-react"

export function ArchitectureSection() {
  return (
    <section id="architecture" className="py-20 sm:py-28 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4">Architecture</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              How{" "}
              <span className="gradient-text">
                AgentOps
              </span>{" "}
              works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A modern architecture built for observability, scalability, and developer experience.
            </p>
          </div>

          {/* Architecture Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {/* Step 1: Frontend */}
            <Card className="glass-card border-primary/20 relative">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <Cpu className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Next.js Frontend</h3>
                <p className="text-sm text-muted-foreground">
                  Dashboard UI for creating agents, uploading docs, and viewing logs
                </p>
              </CardContent>
              {/* Arrow for desktop */}
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </Card>

            {/* Step 2: API */}
            <Card className="glass-card border-primary/20 relative">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-2">FastAPI Backend</h3>
                <p className="text-sm text-muted-foreground">
                  RESTful API handling auth, agents, runs, and logging
                </p>
              </CardContent>
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </Card>

            {/* Step 3: AI Engine */}
            <Card className="glass-card border-primary/20 relative">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <Bot className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">LlamaIndex Engine</h3>
                <p className="text-sm text-muted-foreground">
                  Agent orchestration with OpenAI, tools, and vector retrieval
                </p>
              </CardContent>
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </Card>

            {/* Step 4: Databases */}
            <Card className="glass-card border-primary/20">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-semibold mb-2">Data Layer</h3>
                <p className="text-sm text-muted-foreground">
                  PostgreSQL for app data, Qdrant for vector embeddings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Key Architecture Points */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h4 className="font-semibold mb-2">Create Agent</h4>
              <p className="text-sm text-muted-foreground">
                Configure system prompt, attach tools, and connect knowledge base
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h4 className="font-semibold mb-2">Execute Run</h4>
              <p className="text-sm text-muted-foreground">
                Agent processes input, calls tools, and generates response
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h4 className="font-semibold mb-2">Monitor Logs</h4>
              <p className="text-sm text-muted-foreground">
                View detailed execution timeline with every step tracked
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
