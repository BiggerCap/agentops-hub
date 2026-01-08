/**
 * YouTube Upload Dialog
 */

'use client'

import { useState } from 'react'
import { documents } from '@/lib/apiClient'
import type { AgentRead } from '@/lib/types'
import { Button } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface YouTubeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agents: AgentRead[]
  onSuccess: () => void
}

export function YouTubeDialog({ open, onOpenChange, agents, onSuccess }: YouTubeDialogProps) {
  const [url, setUrl] = useState('')
  const [agentId, setAgentId] = useState<number | null>(null)
  const [includeTimestamps, setIncludeTimestamps] = useState(true)
  const [loading, setLoading] = useState(false)

  const isValidYouTubeUrl = (url: string) => {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^https?:\/\/youtu\.be\/[\w-]+/,
    ]
    return patterns.some((pattern) => pattern.test(url))
  }

  const handleSubmit = async () => {
    if (!url || !agentId) return

    if (!isValidYouTubeUrl(url)) {
      toast.error('Invalid YouTube URL')
      return
    }

    setLoading(true)

    try {
      await documents.uploadYouTube({
        agent_id: agentId,
        url,
        include_timestamps: includeTimestamps,
      })

      toast.success('YouTube transcript added successfully')
      setUrl('')
      setAgentId(null)
      setIncludeTimestamps(true)
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add YouTube transcript')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add YouTube Video</DialogTitle>
          <DialogDescription>
            Extract and add a YouTube video transcript to your knowledge base
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Agent Selection */}
          <div className="space-y-2">
            <Label>Select Agent *</Label>
            <Select
              value={agentId?.toString()}
              onValueChange={(value) => setAgentId(parseInt(value))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id.toString()}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* YouTube URL */}
          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube URL *</Label>
            <Input
              id="youtube-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Supports youtube.com/watch and youtu.be links
            </p>
          </div>

          {/* Include Timestamps */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="timestamps"
              checked={includeTimestamps}
              onCheckedChange={(checked) => setIncludeTimestamps(checked as boolean)}
              disabled={loading}
            />
            <Label
              htmlFor="timestamps"
              className="text-sm font-normal cursor-pointer"
            >
              Include timestamps in transcript
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!url || !agentId || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Adding...' : 'Add Transcript'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
