'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Mail, Loader2, Link } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { authService } from '@/lib/api/auth'
import { toast } from 'react-hot-toast'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMessage, setErrorMessage] = useState('')

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (token && email) {
      verifyEmail()
    } else {
      setVerificationStatus('error')
      setErrorMessage('Invalid verification link')
    }
  }, [token, email])

  const verifyEmail = async () => {
    try {
      // In production, this would call the API
      // await authService.verifyEmail({ token, email })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setVerificationStatus('success')
      toast.success('Email verified successfully')
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (error) {
      setVerificationStatus('error')
      setErrorMessage('Failed to verify email. The link may have expired.')
      toast.error('Email verification failed')
    }
  }

  const resendVerificationEmail = async () => {
    if (!email) return

    try {
      // In production, this would call the API
      // await authService.resendVerificationEmail({ email })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Verification email sent successfully')
    } catch (error) {
      toast.error('Failed to send verification email')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {verificationStatus === 'verifying' && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl">Verifying your email</CardTitle>
              <CardDescription>
                Please wait while we verify your email address...
              </CardDescription>
            </CardHeader>
          </>
        )}

        {verificationStatus === 'success' && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <CardTitle className="text-2xl">Email Verified!</CardTitle>
              <CardDescription>
                Your email has been verified successfully. You can now log in to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                You will be redirected to the login page in a few seconds...
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Go to Login</Link>
              </Button>
            </CardContent>
          </>
        )}

        {verificationStatus === 'error' && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Verification Failed</CardTitle>
              <CardDescription>
                {errorMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                If you're having trouble verifying your email, you can request a new verification link.
              </p>
              <div className="space-y-2">
                {email && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={resendVerificationEmail}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </Button>
                )}
                <Button asChild className="w-full">
                  <Link href="/auth/login">Back to Login</Link>
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}