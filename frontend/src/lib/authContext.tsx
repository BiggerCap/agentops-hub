/**
 * Authentication Context
 * Manages user authentication state and JWT tokens
 */

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from './apiClient'
import type { UserRead, AuthState } from './types'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  })

  const router = useRouter()

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as UserRead
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        })
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setState((prev) => ({ ...prev, isLoading: false }))
      }
    } else {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const tokenData = await auth.login(email, password)
      
      // Store token
      localStorage.setItem('token', tokenData.access_token)
      
      // Create user object (we only have email from login)
      const user: UserRead = {
        id: 0, // Will be populated on first API call
        email: email,
      }
      localStorage.setItem('user', JSON.stringify(user))

      setState({
        user,
        token: tokenData.access_token,
        isAuthenticated: true,
        isLoading: false,
      })

      router.push('/app')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const register = async (email: string, password: string) => {
    try {
      const user = await auth.register({ email, password })
      
      // Auto-login after registration
      await login(email, password)
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
    router.push('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Protected Route Wrapper Component
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
