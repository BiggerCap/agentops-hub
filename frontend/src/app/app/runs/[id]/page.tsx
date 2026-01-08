/**
 * Run Details Page with Timeline
 * THE KILLER FEATURE - Shows detailed execution logs
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { runs } from '@/lib/apiClient'
import type { RunWithSteps, RunStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RunTimeline } from '@/components/runs/run-timeline'
import { RunStream } from '@/components/runs/run-stream'
import { Loader2, ArrowLeft, RefreshCw, AlertCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

const statusColors: Record<RunStatus, string> = {
  queued: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  running: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
}

export default function RunDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const runId = parseInt(params?.id as string)

  const [run, setRun] = useState<RunWithSteps | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchRun = async (showToast = false) => {
    try {
      const data = await runs.get(runId)
      setRun(data)
      if (showToast) {
        toast.success('Run refreshed')
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Run not found')
        router.push('/app/runs')
      } else {
        toast.error('Failed to load run')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (runId) {
      fetchRun()
    }
  }, [runId])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchRun(true)
  }

  const getDuration = () => {
    if (!run?.started_at) return null
    const end = run.completed_at ? new Date(run.completed_at) : new Date()
    const start = new Date(run.started_at)
    const seconds = (end.getTime() - start.getTime()) / 1000
    if (seconds < 60) return `${seconds.toFixed(1)}s`
    return `${(seconds / 60).toFixed(1)}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!run) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Run not found</h3>
        <Button className="mt-4" onClick={() => router.push('/app/runs')}>
          Back to Runs
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Run Details</h1>
          <p className="text-muted-foreground">
            Run #{run.id} · {run.agent_name || 'Unknown Agent'}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Status</span>
            <Badge variant="outline" className={statusColors[run.status]}>
              {run.status.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{new Date(run.created_at).toLocaleString()}</p>
            </div>
            {run.started_at && (
              <div>
                <p className="text-sm text-muted-foreground">Started</p>
                <p className="font-medium">{new Date(run.started_at).toLocaleString()}</p>
              </div>
            )}
            {run.completed_at && (
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="font-medium">
                  {new Date(run.completed_at).toLocaleString()}
                </p>
              </div>
            )}
            {getDuration() && (
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {getDuration()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Input/Output */}
      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{run.input_text}</p>
        </CardContent>
      </Card>

      {run.output_text && (
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{run.output_text}</p>
          </CardContent>
        </Card>
      )}

      {run.error_message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{run.error_message}</AlertDescription>
        </Alert>
      )}

      {/* Real-time Streaming (if running) */}
      {run.status === 'running' && (
        <RunStream runId={run.id} onUpdate={fetchRun} />
      )}

      {/* Execution Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {run.steps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No execution steps yet
            </div>
          ) : (
            <RunTimeline steps={run.steps} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
