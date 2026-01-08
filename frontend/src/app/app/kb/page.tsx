/**
 * Knowledge Base Page
 */

'use client'

import { useEffect, useState } from 'react'
import { documents, agents } from '@/lib/apiClient'
import type { DocumentRead, AgentRead } from '@/lib/types'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { UploadDialog } from '@/components/kb/upload-dialog'
import { YouTubeDialog } from '@/components/kb/youtube-dialog'
import { Loader2, Upload, Youtube, Trash2, Database } from 'lucide-react'
import { toast } from 'sonner'

export default function KnowledgeBasePage() {
  const [documentsList, setDocumentsList] = useState<DocumentRead[]>([])
  const [agentsList, setAgentsList] = useState<AgentRead[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAgentId, setFilterAgentId] = useState<number | undefined>()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [youtubeOpen, setYoutubeOpen] = useState(false)

  const fetchData = async () => {
    try {
      const [docsData, agentsData] = await Promise.all([
        documents.list(filterAgentId),
        agents.list(),
      ])
      setDocumentsList(docsData.documents)
      setAgentsList(agentsData.agents)
    } catch (error) {
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterAgentId])

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    try {
      await documents.delete(deleteId)
      toast.success('Document deleted successfully')
      setDocumentsList(documentsList.filter((d) => d.id !== deleteId))
      setDeleteId(null)
    } catch (error: any) {
      console.error('Delete error:', error)
      const message = error.response?.data?.detail || error.message || 'Failed to delete document'
      toast.error(message)
    } finally {
      setDeleting(false)
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A'
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
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
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Upload documents and YouTube videos for your agents
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setYoutubeOpen(true)}>
            <Youtube className="mr-2 h-4 w-4" />
            Add YouTube
          </Button>
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Select
          value={filterAgentId?.toString() || 'all'}
          onValueChange={(value) => setFilterAgentId(value === 'all' ? undefined : parseInt(value))}
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
        <span className="text-sm text-muted-foreground">
          {documentsList.length} document{documentsList.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Documents Table */}
      {documentsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <Database className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No documents yet</h3>
          <p className="text-muted-foreground text-center max-w-sm mt-2">
            Upload documents or add YouTube videos to build your knowledge base
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setYoutubeOpen(true)}>
              <Youtube className="mr-2 h-4 w-4" />
              Add YouTube
            </Button>
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentsList.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.filename}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{doc.file_type.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>{doc.agent_name || 'Unknown'}</TableCell>
                  <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteId(doc.id)
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

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        agents={agentsList}
        onSuccess={fetchData}
      />

      {/* YouTube Dialog */}
      <YouTubeDialog
        open={youtubeOpen}
        onOpenChange={setYoutubeOpen}
        agents={agentsList}
        onSuccess={fetchData}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => !deleting && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone and will remove it from the knowledge base.
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
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
