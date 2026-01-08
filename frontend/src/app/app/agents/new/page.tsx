/**
 * Create Agent Page
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { agents, tools } from '@/lib/apiClient'
import type { ToolRead } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Loader2, ArrowLeft, Info } from 'lucide-react'
import { toast } from 'sonner'

const agentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  model: z.string().min(1, 'Model is required'),
  system_prompt: z.string().min(1, 'System prompt is required'),
  tools: z.array(z.string()),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().min(1).max(16000),
  top_p: z.number().min(0).max(1),
})

type AgentFormData = z.infer<typeof agentSchema>

const models = [
  { value: 'gpt-4o', label: 'GPT-4o (Latest)' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
]

export default function CreateAgentPage() {
  const [availableTools, setAvailableTools] = useState<ToolRead[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingTools, setLoadingTools] = useState(true)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      tools: [],
    },
  })

  const temperature = watch('temperature')
  const maxTokens = watch('max_tokens')
  const topP = watch('top_p')
  const selectedTools = watch('tools')
  const selectedModel = watch('model')

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const data = await tools.list()
        setAvailableTools(data.tools.filter((t) => t.enabled))
      } catch (error) {
        toast.error('Failed to load tools')
      } finally {
        setLoadingTools(false)
      }
    }
    fetchTools()
  }, [])

  const onSubmit = async (data: AgentFormData) => {
    setLoading(true)
    try {
      await agents.create(data)
      toast.success('Agent created successfully')
      router.push('/app/agents')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create agent')
    } finally {
      setLoading(false)
    }
  }

  const toggleTool = (toolName: string) => {
    const current = selectedTools || []
    if (current.includes(toolName)) {
      setValue('tools', current.filter((t) => t !== toolName))
    } else {
      setValue('tools', [...current, toolName])
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Agent</h1>
            <p className="text-muted-foreground">
              Configure your AI agent with custom tools and parameters
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Name and description for your agent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Research Assistant"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Helps with research tasks and information gathering"
                  {...register('description')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Model Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Model Configuration</CardTitle>
              <CardDescription>Select the AI model and system prompt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Select
                  value={selectedModel}
                  onValueChange={(value) => setValue('model', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.model && (
                  <p className="text-sm text-destructive">{errors.model.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="system_prompt">System Prompt *</Label>
                <Textarea
                  id="system_prompt"
                  placeholder="You are a helpful research assistant. Your goal is to help users find accurate information..."
                  rows={5}
                  {...register('system_prompt')}
                />
                {errors.system_prompt && (
                  <p className="text-sm text-destructive">{errors.system_prompt.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Tools</CardTitle>
              <CardDescription>Select tools the agent can use</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTools ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {availableTools.map((tool) => (
                    <div key={tool.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={`tool-${tool.id}`}
                        checked={selectedTools?.includes(tool.name)}
                        onCheckedChange={() => toggleTool(tool.name)}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`tool-${tool.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {tool.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced Parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Parameters</CardTitle>
              <CardDescription>Fine-tune the model behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label>Temperature</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Controls randomness. Higher = more creative, Lower = more focused</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-sm font-medium">{temperature}</span>
                </div>
                <Slider
                  value={[temperature]}
                  onValueChange={(value) => setValue('temperature', value[0])}
                  min={0}
                  max={2}
                  step={0.1}
                />
              </div>

              {/* Max Tokens */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label>Max Tokens</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Maximum length of the response</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-sm font-medium">{maxTokens}</span>
                </div>
                <Slider
                  value={[maxTokens]}
                  onValueChange={(value) => setValue('max_tokens', value[0])}
                  min={100}
                  max={16000}
                  step={100}
                />
              </div>

              {/* Top P */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label>Top P</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Nucleus sampling. Lower = more focused on likely tokens</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-sm font-medium">{topP}</span>
                </div>
                <Slider
                  value={[topP]}
                  onValueChange={(value) => setValue('top_p', value[0])}
                  min={0}
                  max={1}
                  step={0.05}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Agent
            </Button>
          </div>
        </form>
      </div>
    </TooltipProvider>
  )
}
