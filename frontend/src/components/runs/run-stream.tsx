/**
 * Run Stream Component
 * Real-time SSE streaming for live run updates
 */

'use client'

import { useEffect, useState, useRef } from 'react'
import { runs } from '@/lib/apiClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Radio, WifiOff } from 'lucide-react'

interface RunStreamProps {
  runId: number
  onUpdate: () => void
}

export function RunStream({ runId, onUpdate }: RunStreamProps) {
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // Create SSE connection
    const eventSource = runs.stream(runId)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setConnected(true)
      console.log('SSE connection established')
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('SSE event received:', data)
        setLastUpdate(new Date().toLocaleTimeString())

        // Refresh run data on any update
        onUpdate()
      } catch (error) {
        console.error('Failed to parse SSE event:', error)
      }
    }

    eventSource.onerror = () => {
      // SSE connection closed (normal for completed runs)
      // Only show as disconnected, don't log error
      setConnected(false)
      eventSource.close()
    }

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        setConnected(false)
      }
    }
  }, [runId, onUpdate])

  return (
    <Card className="border-blue-500/20 bg-blue-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {connected ? (
            <>
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
              </div>
              <span>Live Updates</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-muted-foreground" />
              <span>Connecting to live updates...</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">
              {connected ? 'Streaming' : 'Disconnected'}
            </span>
          </div>
          {lastUpdate && (
            <Badge variant="outline" className="bg-background">
              Last update: {lastUpdate}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
