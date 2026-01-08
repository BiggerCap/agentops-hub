/**
 * Conversations List Page
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { conversations, agents } from '@/lib/apiClient'
import type { ConversationRead, AgentRead } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, MessageSquare, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ConversationsPage() {
  const [conversationsList, setConversationsList] = useState<ConversationRead[]>([])
  const [agentsList, setAgentsList] = useState<AgentRead[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const fetchData = async () => {
    try {
      const [convData, agentsData] = await Promise.all([
        conversations.list(),
        agents.list(),
      ])
      setConversationsList(convData.conversations || [])
      setAgentsList(agentsData.agents || [])
    } catch (error) {
      toast.error('Failed to load conversations')
      setConversationsList([])
      setAgentsList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async () => {
    if (!selectedAgentId) return

    setCreating(true)
    try {
      const conv = await conversations.create({
        agent_id: selectedAgentId,
        title: title || undefined,
      })
      toast.success('Conversation created')
      setCreateOpen(false)
      setTitle('')
      setSelectedAgentId(null)
      router.push(`/app/conversations/${conv.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create conversation')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    try {
      await conversations.delete(deleteId)
      toast.success('Conversation deleted')
      setConversationsList(conversationsList.filter((c) => c.id !== deleteId))
      setDeleteId(null)
    } catch (error) {
      toast.error('Failed to delete conversation')
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
          <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
          <p className="text-muted-foreground">
            Multi-turn conversations with agent memory
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Conversation
        </Button>
      </div>

      {/* Conversations Table */}
      {conversationsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No conversations yet</h3>
          <p className="text-muted-foreground text-center max-w-sm mt-2">
            Create a conversation to maintain context across multiple interactions
          </p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Conversation
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Runs</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversationsList.map((conv) => (
                <TableRow
                  key={conv.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/app/conversations/${conv.id}`)}
                >
                  <TableCell className="font-medium">
                    {conv.title || `Conversation #${conv.id}`}
                  </TableCell>
                  <TableCell>{conv.agent_name || 'Unknown'}</TableCell>
                  <TableCell>{conv.run_count} runs</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(conv.updated_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteId(conv.id)
                      }}
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

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
            <DialogDescription>
              Create a conversation to maintain context across runs
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Agent *</Label>
              <Select
                value={selectedAgentId?.toString()}
                onValueChange={(value) => setSelectedAgentId(parseInt(value))}
                disabled={creating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agentsList && agentsList.length > 0 ? (
                    agentsList.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No agents available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Research Project"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={creating}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!selectedAgentId || creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will delete the conversation and all associated runs.
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
