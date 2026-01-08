/**
 * Agents List Page
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { agents } from '@/lib/apiClient'
import type { AgentRead } from '@/lib/types'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Loader2, Trash2, Bot } from 'lucide-react'
import { toast } from 'sonner'

export default function AgentsPage() {
  const [agentsList, setAgentsList] = useState<AgentRead[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const fetchAgents = async () => {
    try {
      const data = await agents.list()
      setAgentsList(data.agents)
    } catch (error: any) {
      toast.error('Failed to load agents')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    
    setDeleting(true)
    try {
      await agents.delete(deleteId)
      toast.success('Agent deleted successfully')
      setAgentsList(agentsList.filter((a) => a.id !== deleteId))
      setDeleteId(null)
    } catch (error: any) {
      toast.error('Failed to delete agent')
      console.error(error)
    } finally {
      setDeleting(false)
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">
            Create and manage your AI agents with custom tools and prompts
          </p>
        </div>
        <Button onClick={() => router.push('/app/agents/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Agent
        </Button>
      </div>

      {/* Agents Table */}
      {agentsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <Bot className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No agents yet</h3>
          <p className="text-muted-foreground text-center max-w-sm mt-2">
            Create your first AI agent to get started with automated tasks
          </p>
          <Button className="mt-4" onClick={() => router.push('/app/agents/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Tools</TableHead>
                <TableHead>Temperature</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentsList.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{agent.name}</div>
                      {agent.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-md">
                          {agent.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{agent.model}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {agent.tools.map((tool) => (
                        <Badge key={tool} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{agent.temperature}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(agent.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(agent.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this agent? This action cannot be undone.
              All associated documents and runs will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
