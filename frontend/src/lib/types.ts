/**
 * TypeScript Type Definitions
 * Generated from OpenAPI spec: backend/docs/openapi.json
 */

// ==================== Authentication ====================

export interface UserCreate {
  email: string
  password: string
}

export interface UserRead {
  id: number
  email: string
}

export interface Token {
  access_token: string
  token_type: string
}

export interface LoginCredentials {
  username: string  // Actually email, but OAuth2 calls it username
  password: string
}

// ==================== Agents ====================

export interface AgentCreate {
  name: string
  model: string
  system_prompt: string
  tools: string[]
  description?: string
  temperature?: number
  max_tokens?: number
  top_p?: number
}

export interface AgentUpdate {
  name?: string
  model?: string
  system_prompt?: string
  tools?: string[]
  description?: string
  temperature?: number
  max_tokens?: number
  top_p?: number
}

export interface AgentRead {
  id: number
  user_id: number
  name: string
  model: string
  system_prompt: string
  tools: string[]
  description: string | null
  temperature: number
  max_tokens: number
  top_p: number
  created_at: string
  updated_at: string
}

export interface AgentList {
  agents: AgentRead[]
}

// ==================== Documents ====================

export interface DocumentTextUpload {
  agent_id: number
  content: string
  filename: string
}

export interface YouTubeUpload {
  agent_id: number
  url: string
  include_timestamps?: boolean
}

export interface DocumentRead {
  id: number
  user_id: number
  agent_id: number
  filename: string
  file_type: string
  file_size: number | null
  file_path: string | null
  agent_name: string | null
  created_at: string
}

export interface DocumentList {
  documents: DocumentRead[]
}

// ==================== Runs ====================

export type RunStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface RunCreate {
  agent_id: number
  input_text: string
  conversation_id?: number
}

export interface RunRead {
  id: number
  user_id: number
  agent_id: number
  input_text: string
  output_text: string | null
  status: RunStatus
  error_message: string | null
  created_at: string
  started_at: string | null
  completed_at: string | null
  agent_name: string | null
}

export interface RunList {
  runs: RunRead[]
}

// ==================== Run Steps ====================

export type StepType = 'llm_call' | 'tool_call' | 'tool_result' | 'error' | 'final_answer'

export interface RunStepRead {
  id: number
  run_id: number
  step_type: StepType
  step_number: number
  input_data: Record<string, any> | null
  output_data: Record<string, any> | null
  error_message: string | null
  started_at: string
  completed_at: string | null
  duration_ms: number | null
}

export interface RunWithSteps {
  id: number
  user_id: number
  agent_id: number
  input_text: string
  output_text: string | null
  status: RunStatus
  error_message: string | null
  created_at: string
  started_at: string | null
  completed_at: string | null
  agent_name: string | null
  steps: RunStepRead[]
}

// ==================== Tools ====================

export interface ToolRead {
  id: number
  name: string
  description: string
  enabled: boolean
  config_schema: Record<string, any> | null
}

export interface ToolList {
  tools: ToolRead[]
}

// ==================== Conversations ====================

export interface ConversationCreate {
  agent_id: number
  title?: string
}

export interface ConversationUpdate {
  title?: string
}

export interface ConversationRead {
  id: number
  user_id: number
  agent_id: number
  title: string | null
  created_at: string
  updated_at: string
  agent_name: string | null
  run_count: number
}

export interface ConversationList {
  conversations: ConversationRead[]
}

// ==================== API Responses ====================

export interface ApiError {
  detail: string
}

export interface ValidationError {
  loc: (string | number)[]
  msg: string
  type: string
}

export interface HTTPValidationError {
  detail: ValidationError[]
}

// ==================== Form Types ====================

export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
}

export interface AgentFormData {
  name: string
  description?: string
  model: string
  system_prompt: string
  tools: string[]
  temperature: number
  max_tokens: number
  top_p: number
}

export interface DocumentUploadFormData {
  agent_id: number
  file: File
}

export interface YouTubeFormData {
  agent_id: number
  url: string
  include_timestamps: boolean
}

export interface RunFormData {
  agent_id: number
  input_text: string
  conversation_id?: number
}

export interface ConversationFormData {
  agent_id: number
  title?: string
}

// ==================== UI State Types ====================

export interface AuthState {
  user: UserRead | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface FilterState {
  agent_id?: number
  status?: RunStatus
  search?: string
}

// ==================== SSE Event Types ====================

export interface RunUpdateEvent {
  type: 'status' | 'step' | 'complete' | 'error'
  data: {
    run_id: number
    status?: RunStatus
    step?: RunStepRead
    output_text?: string
    error_message?: string
  }
}
