/**
 * Runs List Page
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { runs, agents } from '@/lib/apiClient'
import type { RunRead, AgentRead, RunStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Play, FileText, Sparkles, Search, Database, Globe, FileCode } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Demo run templates
const demoRuns = [
  {
    id: 'web-search',
    name: 'Web Search Demo',
    description: 'Search the web for latest information on any topic',
    icon: Globe,
    prompt: 'Search the web for the latest news about artificial intelligence breakthroughs in 2025. Summarize the top 3 findings.',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    id: 'knowledge-base',
    name: 'Knowledge Base Query',
    description: 'Query uploaded documents using RAG',
    icon: Database,
    prompt: 'Based on the documents in the knowledge base, provide a comprehensive summary of the key topics and main points discussed.',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    id: 'research-analysis',
    name: 'Research & Analysis',
    description: 'Deep research with multiple web searches',
    icon: Search,
    prompt: 'Research the following topic and provide a detailed analysis: "The impact of quantum computing on cybersecurity." Include current developments, challenges, and future implications.',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
  {
    id: 'code-generation',
    name: 'Code Generation',
    description: 'Generate code with explanations',
    icon: FileCode,
    prompt: 'Write a Python function that implements a binary search tree with insert, search, and delete operations. Include comprehensive docstrings and example usage.',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
  },
  {
    id: 'document-synthesis',
    name: 'Document Synthesis',
    description: 'Combine web search and document knowledge',
    icon: FileText,
    prompt: 'Search the web for current trends in machine learning, then cross-reference with information from my uploaded documents. Create a synthesized report highlighting agreements and differences.',
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-950/20',
  },
  {
    id: 'multi-tool',
    name: 'Multi-Tool Workflow',
    description: 'Complex task using all available tools',
    icon: Sparkles,
    prompt: 'I need a comprehensive report on "Cloud Native Architecture Best Practices". 1) Search the web for latest trends, 2) Query my knowledge base for any related documentation, 3) Synthesize findings, and 4) Create actionable recommendations.',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
  },
]

const statusColors: Record<RunStatus, string> = {
  queued: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  running: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
}

export default function RunsPage() {
  const [runsList, setRunsList] = useState<RunRead[]>([])
  const [agentsList, setAgentsList] = useState<AgentRead[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAgentId, setFilterAgentId] = useState<number | undefined>()
  const [filterStatus, setFilterStatus] = useState<RunStatus | undefined>()
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null)
  const [inputText, setInputText] = useState('')
  const [showDemoRuns, setShowDemoRuns] = useState(true)
  const router = useRouter()

  const fetchData = async () => {
    try {
      const [runsData, agentsData] = await Promise.all([
        runs.list(filterAgentId, filterStatus),
        agents.list(),
      ])
      setRunsList(runsData.runs)
      setAgentsList(agentsData.agents)
    } catch (error) {
      toast.error('Failed to load runs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterAgentId, filterStatus])

  const handleCreateRun = async () => {
    if (!selectedAgentId || !inputText) return

    setCreating(true)
    try {
      const newRun = await runs.create({
        agent_id: selectedAgentId,
        input_text: inputText,
      })
      toast.success('Run created successfully')
      setCreateOpen(false)
      setSelectedAgentId(null)
      setInputText('')
      router.push(`/app/runs/${newRun.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create run')
    } finally {
      setCreating(false)
    }
  }

  const handleDemoRun = (demo: typeof demoRuns[0]) => {
    if (agentsList.length === 0) {
      toast.error('Please create an agent first')
      return
    }
    // Auto-select first agent
    setSelectedAgentId(agentsList[0].id)
    setInputText(demo.prompt)
    setCreateOpen(true)
    toast.success(`Loaded demo: ${demo.name}`)
  }

  const getDuration = (run: RunRead) => {
    if (!run.started_at || !run.completed_at) return null
    const start = new Date(run.started_at).getTime()
    const end = new Date(run.completed_at).getTime()
    const seconds = (end - start) / 1000
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Runs</h1>
          <p className="text-muted-foreground">
            View execution history and detailed logs for all agent runs
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDemoRuns(!showDemoRuns)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {showDemoRuns ? 'Hide' : 'Show'} Demo Runs
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Play className="mr-2 h-4 w-4" />
            Create Run
          </Button>
        </div>
      </div>

      {/* Demo Runs Section */}
      {showDemoRuns && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Demo Runs</h2>
            <Badge variant="secondary">Quick Start</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Try these pre-configured runs to explore different agent capabilities and tools
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoRuns.map((demo) => {
              const Icon = demo.icon
              return (
                <Card
                  key={demo.id}
                  className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                  onClick={() => handleDemoRun(demo)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg ${demo.bgColor}`}>
                        <Icon className={`h-5 w-5 ${demo.color}`} />
                      </div>
                    </div>
                    <CardTitle className="text-base mt-2">{demo.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {demo.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {demo.prompt}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDemoRun(demo)
                      }}
                    >
                      <Play className="mr-2 h-3 w-3" />
                      Try Demo
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Select
          value={filterAgentId?.toString() || 'all'}
          onValueChange={(value) =>
            setFilterAgentId(value === 'all' ? undefined : parseInt(value))
          }
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {agentsList.map((agent) => (
              <SelectItem key={agent.id} value={agent.id.toString()}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterStatus || 'all'}
          onValueChange={(value) =>
            setFilterStatus(value === 'all' ? undefined : (value as RunStatus))
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground">
          {runsList.length} run{runsList.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Runs Table */}
      {runsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No runs yet</h3>
          <p className="text-muted-foreground text-center max-w-sm mt-2">
            Create your first run to execute an agent task
          </p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            <Play className="mr-2 h-4 w-4" />
            Create Run
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Input</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runsList.map((run) => (
                <TableRow
                  key={run.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/app/runs/${run.id}`)}
                >
                  <TableCell className="max-w-md">
                    <p className="font-medium truncate">{run.input_text}</p>
                    {run.output_text && (
                      <p className="text-sm text-muted-foreground truncate">
                        {run.output_text}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{run.agent_name || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[run.status]}>
                      {run.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{getDuration(run) || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(run.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Run Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Run</DialogTitle>
            <DialogDescription>
              Select an agent and provide input to start a new run
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Agent *</Label>
              <Select
                value={selectedAgentId?.toString()}
                onValueChange={(value) => setSelectedAgentId(parseInt(value))}
                disabled={creating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agentsList.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="input-text">Input *</Label>
              <Textarea
                id="input-text"
                placeholder="What task should the agent perform?"
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={creating}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRun}
              disabled={!selectedAgentId || !inputText || creating}
            >
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {creating ? 'Creating...' : 'Create Run'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
