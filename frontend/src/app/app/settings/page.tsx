/**
 * Settings Page
 */

'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/authContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { User, Key, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user } = useAuth()
  const [apiKey, setApiKey] = useState('')

  const handleSaveApiKey = () => {
    // Note: Backend doesn't currently store per-user API keys
    // This is just UI for demonstration
    localStorage.setItem('openai_api_key', apiKey)
    toast.success('API key saved locally')
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed at this time
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how AgentOps Hub looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OpenAI API Key</CardTitle>
              <CardDescription>
                Configure your OpenAI API key for agent operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Your API key is stored locally in your browser. The backend uses a
                  configured key for all operations.
                </p>
              </div>

              <Button onClick={handleSaveApiKey} disabled={!apiKey}>
                <Save className="mr-2 h-4 w-4" />
                Save API Key
              </Button>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="text-base">Note</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Currently, the backend uses a single configured OpenAI API key for all users.
                This UI allows you to save a key locally, but it won&apos;t be used by the backend
                unless that functionality is implemented.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
