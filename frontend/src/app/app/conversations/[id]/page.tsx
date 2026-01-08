/**
 * Conversation Details Page
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { conversations, runs } from '@/lib/apiClient'
import type { ConversationRead, RunRead } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Loader2, ArrowLeft, Plus, Play, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

export default function ConversationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const convId = parseInt(params?.id as string)

  const [conversation, setConversation] = useState<ConversationRead | null>(null)
  const [conversationRuns, setConversationRuns] = useState<RunRead[]>([])
  const [loading, setLoading] = useState(true)
  const [createRunOpen, setCreateRunOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [inputText, setInputText] = useState('')
  const [editTitleOpen, setEditTitleOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const fetchData = async () => {
    try {
      const [convData, runsData] = await Promise.all([
        conversations.get(convId),
        runs.list(undefined, undefined, 0, 100),
      ])
      setConversation(convData)
      // Filter runs that belong to this conversation
      // Note: Backend doesn't have conversation_id filter, so we check all runs
      setConversationRuns(runsData.runs.filter((r: any) => r.conversation_id === convId))
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Conversation not found')
        router.push('/app/conversations')
      } else {
        toast.error('Failed to load conversation')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (convId) {
      fetchData()
    }
  }, [convId])

  const handleCreateRun = async () => {
    if (!inputText || !conversation) return

    setCreating(true)
    try {
      const newRun = await runs.create({
        agent_id: conversation.agent_id,
        input_text: inputText,
        conversation_id: convId,
      })
      toast.success('Run created')
      setCreateRunOpen(false)
      setInputText('')
      router.push(`/app/runs/${newRun.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create run')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateTitle = async () => {
    if (!newTitle || !conversation) return

    try {
      await conversations.update(convId, { title: newTitle })
      toast.success('Title updated')
      setConversation({ ...conversation, title: newTitle })
      setEditTitleOpen(false)
    } catch (error: any) {
      toast.error('Failed to update title')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!conversation) {
    return null
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {conversation.title || `Conversation #${conversation.id}`}
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setNewTitle(conversation.title || '')
                setEditTitleOpen(true)
              }}
            >
              Edit
            </Button>
          </div>
          <p className="text-muted-foreground">{conversation.agent_name || 'Unknown Agent'}</p>
        </div>
        <Button onClick={() => setCreateRunOpen(true)}>
          <Play className="mr-2 h-4 w-4" />
          Start Run
        </Button>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversation Info
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="font-medium">{new Date(conversation.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Updated</p>
            <p className="font-medium">{new Date(conversation.updated_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Runs</p>
            <p className="font-medium">{conversation.run_count}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Agent</p>
            <p className="font-medium">{conversation.agent_name}</p>
          </div>
        </CardContent>
      </Card>

      {/* Runs History */}
      <Card>
        <CardHeader>
          <CardTitle>Run History</CardTitle>
        </CardHeader>
        <CardContent>
          {conversationRuns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No runs in this conversation yet</p>
              <Button className="mt-4" onClick={() => setCreateRunOpen(true)}>
                <Play className="mr-2 h-4 w-4" />
                Start First Run
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {conversationRuns.map((run) => (
                <div
                  key={run.id}
                  className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => router.push(`/app/runs/${run.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium truncate flex-1">{run.input_text}</p>
                    <Badge variant="outline">{run.status.toUpperCase()}</Badge>
                  </div>
                  {run.output_text && (
                    <p className="text-sm text-muted-foreground truncate">{run.output_text}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(run.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Run Dialog */}
      <Dialog open={createRunOpen} onOpenChange={setCreateRunOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Run</DialogTitle>
            <DialogDescription>
              Continue the conversation with a new input
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="input">Input *</Label>
            <Textarea
              id="input"
              placeholder="What would you like to ask?"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={creating}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateRunOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={handleCreateRun} disabled={!inputText || creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Title Dialog */}
      <Dialog open={editTitleOpen} onOpenChange={setEditTitleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Title</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTitleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTitle} disabled={!newTitle}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
