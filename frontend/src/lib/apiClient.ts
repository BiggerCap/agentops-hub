/**
 * API Client
 * Handles all HTTP requests to the backend API
 */

import axios, { AxiosInstance, AxiosError } from 'axios'
import type {
  // Auth
  UserCreate,
  UserRead,
  Token,
  LoginCredentials,
  // Agents
  AgentCreate,
  AgentUpdate,
  AgentRead,
  AgentList,
  // Documents
  DocumentTextUpload,
  YouTubeUpload,
  DocumentRead,
  DocumentList,
  // Runs
  RunCreate,
  RunRead,
  RunList,
  RunWithSteps,
  // Tools
  ToolList,
  // Conversations
  ConversationCreate,
  ConversationUpdate,
  ConversationRead,
  ConversationList,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => {
    // Accept 2xx and 204 No Content
    return (status >= 200 && status < 300) || status === 204
  },
})

// Request interceptor - add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Network Error usually means CORS or connection issue
    if (error.message === 'Network Error') {
      console.error('Network Error - Backend may not be running or CORS issue:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      })
    } else {
      // Log the full error for debugging
      console.error('API Error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      })
    }
    
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ==================== Authentication ====================

export const auth = {
  register: async (data: UserCreate): Promise<UserRead> => {
    const response = await apiClient.post<UserRead>('/api/v1/auth/register', data)
    return response.data
  },

  login: async (email: string, password: string): Promise<Token> => {
    // OAuth2 requires form data
    const formData = new FormData()
    formData.append('username', email)  // OAuth2 uses 'username' field
    formData.append('password', password)

    const response = await apiClient.post<Token>('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },
}

// ==================== Agents ====================

export const agents = {
  list: async (skip = 0, limit = 100): Promise<AgentList> => {
    const response = await apiClient.get<AgentList>('/api/v1/agents', {
      params: { skip, limit },
    })
    return response.data
  },

  get: async (id: number): Promise<AgentRead> => {
    const response = await apiClient.get<AgentRead>(`/api/v1/agents/${id}`)
    return response.data
  },

  create: async (data: AgentCreate): Promise<AgentRead> => {
    const response = await apiClient.post<AgentRead>('/api/v1/agents', data)
    return response.data
  },

  update: async (id: number, data: AgentUpdate): Promise<AgentRead> => {
    const response = await apiClient.put<AgentRead>(`/api/v1/agents/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/agents/${id}`)
  },
}

// ==================== Documents ====================

export const documents = {
  list: async (agent_id?: number, skip = 0, limit = 100): Promise<DocumentList> => {
    const response = await apiClient.get<DocumentList>('/api/v1/documents', {
      params: { agent_id, skip, limit },
    })
    return response.data
  },

  get: async (id: number): Promise<DocumentRead> => {
    const response = await apiClient.get<DocumentRead>(`/api/v1/documents/${id}`)
    return response.data
  },

  uploadFile: async (
    file: File,
    agent_id: number,
    onProgress?: (progress: number) => void
  ): Promise<DocumentRead> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('agent_id', agent_id.toString())

    const response = await apiClient.post<DocumentRead>(
      '/api/v1/documents/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        },
      }
    )
    return response.data
  },

  uploadText: async (data: DocumentTextUpload): Promise<DocumentRead> => {
    const response = await apiClient.post<DocumentRead>('/api/v1/documents', data)
    return response.data
  },

  uploadYouTube: async (data: YouTubeUpload): Promise<DocumentRead> => {
    const response = await apiClient.post<DocumentRead>('/api/v1/documents/youtube', data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    // Use fetch instead of axios for DELETE to avoid empty body issues
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}/api/v1/documents/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    })
    
    if (!response.ok && response.status !== 204) {
      const error = await response.json().catch(() => ({ detail: 'Delete failed' }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }
  },
}

// ==================== Runs ====================

export const runs = {
  list: async (
    agent_id?: number,
    status?: string,
    skip = 0,
    limit = 100
  ): Promise<RunList> => {
    const response = await apiClient.get<RunList>('/api/v1/runs', {
      params: { agent_id, status, skip, limit },
    })
    return response.data
  },

  get: async (id: number): Promise<RunWithSteps> => {
    const response = await apiClient.get<RunWithSteps>(`/api/v1/runs/${id}`)
    return response.data
  },

  create: async (data: RunCreate): Promise<RunRead> => {
    const response = await apiClient.post<RunRead>('/api/v1/runs', data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/runs/${id}`)
  },

  // SSE streaming
  stream: (runId: number): EventSource => {
    const token = localStorage.getItem('token')
    const url = `${API_URL}/api/v1/streaming/runs/${runId}/stream?token=${token}`
    return new EventSource(url)
  },
}

// ==================== Tools ====================

export const tools = {
  list: async (): Promise<ToolList> => {
    const response = await apiClient.get<ToolList>('/api/v1/tools')
    return response.data
  },
}

// ==================== Conversations ====================

export const conversations = {
  list: async (agent_id?: number, skip = 0, limit = 100): Promise<ConversationList> => {
    const response = await apiClient.get<ConversationList>('/api/v1/conversations', {
      params: { agent_id, skip, limit },
    })
    return response.data
  },

  get: async (id: number): Promise<ConversationRead> => {
    const response = await apiClient.get<ConversationRead>(
      `/api/v1/conversations/${id}`
    )
    return response.data
  },

  create: async (data: ConversationCreate): Promise<ConversationRead> => {
    const response = await apiClient.post<ConversationRead>(
      '/api/v1/conversations',
      data
    )
    return response.data
  },

  update: async (id: number, data: ConversationUpdate): Promise<ConversationRead> => {
    const response = await apiClient.patch<ConversationRead>(
      `/api/v1/conversations/${id}`,
      data
    )
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/conversations/${id}`)
  },
}

// ==================== Health ====================

export const health = {
  check: async (): Promise<{ status: string }> => {
    const response = await apiClient.get<{ status: string }>('/health')
    return response.data
  },
}

// Export the client for direct use if needed
export default apiClient
