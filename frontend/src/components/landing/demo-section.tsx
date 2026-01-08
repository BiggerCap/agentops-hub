"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, CheckCircle2, Clock, Zap } from "lucide-react"
import Image from "next/image"

export function DemoSection() {
  return (
    <section id="demo" className="py-20 sm:py-28 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Section Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4">Live Demo</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              See{" "}
              <span className="gradient-text">
                every step
              </span>{" "}
              your agents take
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real-time execution logs show you exactly what your AI agents are doing - 
              from LLM calls to tool executions and final responses.
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="relative">
            {/* Glass card container */}
            <Card className="glass-card border-primary/20 overflow-hidden">
              <CardContent className="p-0">
                {/* Mock Dashboard UI */}
                <div className="bg-background/95 p-6">
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Customer Support Agent</h3>
                        <p className="text-sm text-muted-foreground">Run #1247</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  </div>

                  {/* Execution Timeline */}
                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center border-2 border-blue-500/30">
                          <Zap className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="w-0.5 h-full bg-border mt-2" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">LLM Call</span>
                          <span className="text-xs text-muted-foreground">0.8s</span>
                        </div>
                        <div className="text-sm text-muted-foreground bg-muted/50 rounded p-2 font-mono">
                          Analyzing user query: "What's the status of order #12345?"
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center border-2 border-purple-500/30">
                          <Activity className="h-4 w-4 text-purple-500" />
                        </div>
                        <div className="w-0.5 h-full bg-border mt-2" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">Tool: SQL Query</span>
                          <span className="text-xs text-muted-foreground">0.2s</span>
                        </div>
                        <div className="text-sm text-muted-foreground bg-muted/50 rounded p-2 font-mono">
                          SELECT * FROM orders WHERE order_id = '12345'
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center border-2 border-green-500/30">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">Final Response</span>
                          <span className="text-xs text-muted-foreground">0.5s</span>
                        </div>
                        <div className="text-sm text-muted-foreground bg-muted/50 rounded p-2">
                          Your order #12345 is currently being shipped and should arrive by Dec 5th.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="mt-6 pt-6 border-t flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Total Duration: 1.5s</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-muted-foreground">3 Steps</span>
                      <span className="text-muted-foreground">1 Tool Call</span>
                      <span className="text-green-500">Success</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
