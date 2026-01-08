/**
 * Dashboard Home Page
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { agents, runs, documents } from '@/lib/apiClient'
import type { RunRead, DocumentRead } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  FileText,
  Play,
  Plus,
  Upload,
  Loader2,
  Activity,
  MessageSquare,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalRuns: 0,
    totalDocuments: 0,
  })
  const [recentRuns, setRecentRuns] = useState<RunRead[]>([])
  const [recentDocs, setRecentDocs] = useState<DocumentRead[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel
      const [agentsRes, runsRes, docsRes] = await Promise.all([
        agents.list(),
        runs.list(),
        documents.list(),
      ])

      // Calculate stats
      setStats({
        totalAgents: agentsRes.agents.length,
        totalRuns: runsRes.runs.length,
        totalDocuments: docsRes.documents.length,
      })

      // Get recent runs (last 5)
      const sortedRuns = runsRes.runs.sort(
        (a: RunRead, b: RunRead) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setRecentRuns(sortedRuns.slice(0, 5))

      // Get recent documents (last 5)
      const sortedDocs = docsRes.documents.sort(
        (a: DocumentRead, b: DocumentRead) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setRecentDocs(sortedDocs.slice(0, 5))
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error(error.response?.data?.detail || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-500',
      running: 'bg-blue-500/10 text-blue-500',
      completed: 'bg-green-500/10 text-green-500',
      failed: 'bg-red-500/10 text-red-500',
      cancelled: 'bg-gray-500/10 text-gray-500',
    }
    return colors[status] || colors.pending
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to AgentOps Hub</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
            <p className="text-xs text-muted-foreground">AI agents configured</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRuns}</div>
            <p className="text-xs text-muted-foreground">Agent executions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">Knowledge base items</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get started</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Button onClick={() => router.push('/app/agents/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Agent
          </Button>
          <Button onClick={() => router.push('/app/kb')} variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
          <Button onClick={() => router.push('/app/runs')} variant="outline" className="gap-2">
            <Play className="h-4 w-4" />
            Start Run
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Runs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Runs
            </CardTitle>
            <CardDescription>Latest agent executions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRuns.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No runs yet</p>
                <Button
                  variant="link"
                  onClick={() => router.push('/app/runs')}
                  className="mt-2"
                >
                  Start your first run
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRuns.map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => router.push(`/app/runs/${run.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{run.input_text}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(run.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(run.status)}>
                      {run.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Documents
            </CardTitle>
            <CardDescription>Latest knowledge base items</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDocs.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No documents yet</p>
                <Button
                  variant="link"
                  onClick={() => router.push('/app/kb')}
                  className="mt-2"
                >
                  Upload your first document
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.filename}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Badge variant="outline" className="text-xs">
                          {doc.file_type}
                        </Badge>
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(doc.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      {(recentRuns.length > 0 || recentDocs.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                You have {stats.totalAgents} agent{stats.totalAgents !== 1 ? 's' : ''}{' '}
                configured with {stats.totalDocuments} document
                {stats.totalDocuments !== 1 ? 's' : ''} in the knowledge base.
              </p>
              <p>
                A total of {stats.totalRuns} run{stats.totalRuns !== 1 ? 's' : ''} have
                been executed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
