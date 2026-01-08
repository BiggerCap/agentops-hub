/**
 * Upload Document Dialog
 */

'use client'

import { useState, useRef } from 'react'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Loader2, Upload, FileText, X } from 'lucide-react'
import { toast } from 'sonner'

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agents: AgentRead[]
  onSuccess: () => void
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
  'text/markdown',
  'image/png',
  'image/jpeg',
  'image/jpg',
]

export function UploadDialog({ open, onOpenChange, agents, onSuccess }: UploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [agentId, setAgentId] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('File type not supported')
      return
    }

    setSelectedFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('File type not supported')
      return
    }

    setSelectedFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleUpload = async () => {
    if (!selectedFile || !agentId) return

    setUploading(true)
    setProgress(0)

    try {
      await documents.uploadFile(selectedFile, agentId, (progress) => {
        setProgress(progress)
      })

      toast.success('Document uploaded successfully')
      setSelectedFile(null)
      setAgentId(null)
      setProgress(0)
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document to add to your agent&apos;s knowledge base
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Agent Selection */}
          <div className="space-y-2">
            <Label>Select Agent *</Label>
            <Select
              value={agentId?.toString()}
              onValueChange={(value) => setAgentId(parseInt(value))}
              disabled={uploading}
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

          {/* File Upload */}
          <div className="space-y-2">
            <Label>File *</Label>
            {!selectedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOCX, XLSX, CSV, TXT, MD, PNG, JPG
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.xlsx,.csv,.txt,.md,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </div>
            ) : (
              <div className="border rounded-lg p-4 flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                {!uploading && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                Uploading... {progress}%
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !agentId || uploading}
          >
            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
