/**
 * Run Timeline Component
 * Visual timeline showing step-by-step execution
 */

'use client'

import { useState } from 'react'
import type { RunStepRead, StepType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  MessageSquare,
  Wrench,
  CheckCircle2,
  XCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react'

interface RunTimelineProps {
  steps: RunStepRead[]
}

const stepIcons: Record<StepType, React.ReactNode> = {
  llm_call: <MessageSquare className="h-5 w-5" />,
  tool_call: <Wrench className="h-5 w-5" />,
  tool_result: <CheckCircle2 className="h-5 w-5" />,
  error: <XCircle className="h-5 w-5" />,
  final_answer: <Award className="h-5 w-5" />,
}

const stepColors: Record<StepType, string> = {
  llm_call: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  tool_call: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  tool_result: 'bg-green-500/10 text-green-500 border-green-500/20',
  error: 'bg-red-500/10 text-red-500 border-red-500/20',
  final_answer: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
}

const stepLabels: Record<StepType, string> = {
  llm_call: 'LLM Call',
  tool_call: 'Tool Call',
  tool_result: 'Tool Result',
  error: 'Error',
  final_answer: 'Final Answer',
}

export function RunTimeline({ steps }: RunTimelineProps) {
  const [expandedSteps, setExpandedSteps] = useState<number[]>([])

  const toggleStep = (stepId: number) => {
    setExpandedSteps((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    )
  }

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  const formatJsonData = (data: Record<string, any> | null) => {
    if (!data) return 'No data'
    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return String(data)
    }
  }

  return (
    <div className="space-y-1">
      {steps.map((step, index) => {
        const isExpanded = expandedSteps.includes(step.id)
        const isLast = index === steps.length - 1

        return (
          <div key={step.id} className="relative">
            {/* Vertical Line */}
            {!isLast && (
              <div className="absolute left-7 top-12 bottom-0 w-0.5 bg-border" />
            )}

            {/* Step Card */}
            <Collapsible open={isExpanded} onOpenChange={() => toggleStep(step.id)}>
              <div className="flex gap-4">
                {/* Timeline Marker */}
                <div className="relative flex-shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 bg-background">
                    <div className={`rounded-full p-2 ${stepColors[step.step_type]}`}>
                      {stepIcons[step.step_type]}
                    </div>
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={stepColors[step.step_type]}>
                          {stepLabels[step.step_type]}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Step {step.step_number}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                        <span>{formatTimestamp(step.started_at)}</span>
                        {step.duration_ms && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(step.duration_ms)}
                          </span>
                        )}
                      </div>

                      {/* Preview */}
                      {!isExpanded && (
                        <div className="text-sm text-muted-foreground">
                          {step.error_message ? (
                            <span className="text-destructive">{step.error_message}</span>
                          ) : step.step_type === 'tool_call' && step.input_data ? (
                            <span>
                              Tool:{' '}
                              {step.input_data.tool_name || step.input_data.name || 'Unknown'}
                            </span>
                          ) : (
                            <span className="truncate block max-w-2xl">
                              {formatJsonData(step.output_data || step.input_data).slice(0, 100)}
                              ...
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            More
                          </>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>

                  {/* Expanded Details */}
                  <CollapsibleContent>
                    <div className="mt-4 space-y-4">
                      {step.input_data && (
                        <div>
                          <p className="text-sm font-medium mb-2">Input:</p>
                          <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                            {formatJsonData(step.input_data)}
                          </pre>
                        </div>
                      )}

                      {step.output_data && (
                        <div>
                          <p className="text-sm font-medium mb-2">Output:</p>
                          <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                            {formatJsonData(step.output_data)}
                          </pre>
                        </div>
                      )}

                      {step.error_message && (
                        <div>
                          <p className="text-sm font-medium mb-2 text-destructive">Error:</p>
                          <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                            {step.error_message}
                          </p>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </div>
            </Collapsible>
          </div>
        )
      })}
    </div>
  )
}
