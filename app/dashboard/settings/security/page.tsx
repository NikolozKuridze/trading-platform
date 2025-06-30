'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Shield, Key, Smartphone, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/seperator'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/store/authStore'
import { authService, validatePassword } from '@/lib/api/auth'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type PasswordFormData = z.infer<typeof passwordSchema>

export default function SecuritySettingsPage() {
  const router = useRouter()
  const { user, loadUserSettings } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [show2FADialog, setShow2FADialog] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      await loadUserSettings()
      setIs2FAEnabled(user?.settings?.isTwoFactorEnabled || false)
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (data: PasswordFormData) => {
    try {
      setIsSubmitting(true)
      await authService.changePassword({
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      toast.success('Password changed successfully')
      setShowPasswordDialog(false)
      reset()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to change password')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEnable2FA = async () => {
    try {
      const response = await authService.setupTwoFactor()
      setQrCode(response.qrCodeUri)
      setSecret(response.manualEntryKey)
      setShow2FADialog(true)
    } catch (error) {
      toast.error('Failed to setup 2FA')
    }
  }

  const handleVerify2FA = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await authService.verifyTwoFactor({ code: verificationCode })
      
      if (response.isVerified) {
        setRecoveryCodes(response.recoveryCodes)
        setIs2FAEnabled(true)
        toast.success('Two-factor authentication enabled successfully')
      } else {
        toast.error('Invalid verification code')
      }
    } catch (error) {
      toast.error('Failed to verify 2FA code')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDisable2FA = async () => {
    const code = prompt('Enter your 2FA code to disable two-factor authentication:')
    if (!code || code.length !== 6) return

    try {
      await authService.disableTwoFactor({ code })
      setIs2FAEnabled(false)
      toast.success('Two-factor authentication disabled')
    } catch (error) {
      toast.error('Failed to disable 2FA')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard/settings')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
          <p className="text-muted-foreground">
            Manage your account security and authentication
          </p>
        </div>
      </div>

      {/* Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Password</CardTitle>
          </div>
          <CardDescription>
            Change your account password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Last changed: {user?.settings ? 'More than 30 days ago' : 'Never'}
              </p>
            </div>
            <Button onClick={() => setShowPasswordDialog(true)}>
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">Authenticator App</p>
                {is2FAEnabled && (
                  <Badge variant="success">Enabled</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Use an authenticator app to generate verification codes
              </p>
            </div>
            <Switch
              checked={is2FAEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleEnable2FA()
                } else {
                  handleDisable2FA()
                }
              }}
            />
          </div>

          {is2FAEnabled && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication is currently enabled on your account.
                You'll need to enter a verification code when signing in.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Security Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Security Sessions</CardTitle>
          </div>
          <CardDescription>
            Manage your active sessions across devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">Current Session</p>
                <p className="text-sm text-muted-foreground">
                  Chrome on Windows • {new Date().toLocaleDateString()}
                </p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          </div>

          <Button variant="destructive" className="w-full">
            Sign Out All Other Sessions
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Recent Security Activity</CardTitle>
          </div>
          <CardDescription>
            Recent security-related activities on your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Password changed</p>
                <p className="text-sm text-muted-foreground">30 days ago</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">2FA enabled</p>
                <p className="text-sm text-muted-foreground">45 days ago</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">New login from Chrome</p>
                <p className="text-sm text-muted-foreground">Today at 2:30 PM</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...register('currentPassword')}
              />
              {errors.currentPassword && (
                <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register('newPassword')}
              />
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Change Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {recoveryCodes.length === 0 ? (
              <>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <div className="w-48 h-48 bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">QR Code</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Manual Entry Key</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <code className="text-sm font-mono">{secret}</code>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShow2FADialog(false)
                      setVerificationCode('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleVerify2FA} loading={isSubmitting}>
                    Verify & Enable
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Save these recovery codes in a secure place. You can use them to access your account if you lose your authenticator device.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-2">
                  {recoveryCodes.map((code, index) => (
                    <div key={index} className="p-2 bg-muted rounded font-mono text-sm">
                      {code}
                    </div>
                  ))}
                </div>

                <DialogFooter>
                  <Button onClick={() => {
                    setShow2FADialog(false)
                    setRecoveryCodes([])
                    setVerificationCode('')
                  }}>
                    I've Saved My Codes
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}