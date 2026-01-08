/**
 * Signup Page
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { useAuth } from '@/lib/authContext'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { register: registerUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const password = watch('password', '')

  const onSubmit = async (data: SignupFormData) => {
    setError(null)
    setIsLoading(true)

    try {
      await registerUser(data.email, data.password)
      // Registration successful, auto-login will redirect to /app
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          'Registration failed. Email may already be in use.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Password strength indicators
  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your details to get started with AgentOps Hub
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
              />
              {password && (
                <div className="space-y-1 mt-2">
                  <p className="text-xs text-muted-foreground">Password requirements:</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className={hasMinLength ? 'text-green-600' : 'text-muted-foreground'}>
                      {hasMinLength ? <CheckCircle2 className="inline h-3 w-3 mr-1" /> : '○'} 8+ characters
                    </div>
                    <div className={hasUpperCase ? 'text-green-600' : 'text-muted-foreground'}>
                      {hasUpperCase ? <CheckCircle2 className="inline h-3 w-3 mr-1" /> : '○'} Uppercase
                    </div>
                    <div className={hasLowerCase ? 'text-green-600' : 'text-muted-foreground'}>
                      {hasLowerCase ? <CheckCircle2 className="inline h-3 w-3 mr-1" /> : '○'} Lowercase
                    </div>
                    <div className={hasNumber ? 'text-green-600' : 'text-muted-foreground'}>
                      {hasNumber ? <CheckCircle2 className="inline h-3 w-3 mr-1" /> : '○'} Number
                    </div>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            <Link href="/" className="text-primary hover:underline">
              Back to home
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
