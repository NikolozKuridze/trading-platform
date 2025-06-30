'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Lock, CheckCircle, Link } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authService, validatePassword } from '@/lib/api/auth'

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    feedback: string[]
  }>({ score: 0, feedback: [] })

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const password = watch('password')

  useEffect(() => {
    if (!token || !email) {
      toast.error('Invalid password reset link')
      router.push('/auth/login')
    }
  }, [token, email, router])

  useEffect(() => {
    if (password) {
      const validation = validatePassword(password)
      const score = validation.errors.length === 0 ? 4 : 4 - validation.errors.length
      setPasswordStrength({
        score: Math.max(0, score),
        feedback: validation.errors,
      })
    } else {
      setPasswordStrength({ score: 0, feedback: [] })
    }
  }, [password])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token || !email) return

    try {
      setIsLoading(true)
      // In production, this would call the API
      // await authService.resetPassword({
      //   token,
      //   email,
      //   newPassword: data.password,
      // })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsSuccess(true)
      toast.success('Password reset successfully')
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (error) {
      toast.error('Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength.score) {
      case 0:
      case 1:
        return 'bg-destructive'
      case 2:
        return 'bg-yellow-500'
      case 3:
        return 'bg-blue-500'
      case 4:
        return 'bg-success'
      default:
        return 'bg-muted'
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-6 w-6 text-success" />
          </div>
          <CardTitle className="text-2xl">Password Reset Successful</CardTitle>
          <CardDescription>
            Your password has been reset successfully. You will be redirected to the login page shortly.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild className="w-full">
            <Link href="/auth/login">Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your new password"
              className="pl-10"
              {...register('password')}
            />
          </div>
          {password && (
            <div className="space-y-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= passwordStrength.score ? getPasswordStrengthColor() : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              {passwordStrength.feedback.length > 0 && (
                <ul className="text-xs text-muted-foreground space-y-1">
                  {passwordStrength.feedback.map((feedback, index) => (
                    <li key={index}>• {feedback}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              className="pl-10"
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" loading={isLoading}>
          Reset Password
        </Button>
      </form>
    </div>
  )
}