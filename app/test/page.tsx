'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import LandingPage from '@/components/landing/LandingPage' 

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, checkAuth } = useAuthStore()

  useEffect(() => {
    const checkAuthStatus = async () => {
      const authenticated = await checkAuth() 
      if (authenticated) {
        router.push('/dashboard')
      }
    }

    checkAuthStatus()
  }, [checkAuth, router])

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return <LandingPage />
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    </div>
  )
}