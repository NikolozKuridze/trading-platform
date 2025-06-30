'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    const checkAuthStatus = async () => {
      const authenticated = await checkAuth()
      if (authenticated) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }

    checkAuthStatus()
  }, [checkAuth, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}