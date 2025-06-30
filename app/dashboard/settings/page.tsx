'use client'

import { useRouter } from 'next/navigation'
import { User, Shield, Bell, Palette, Globe, Key, Smartphone } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/seperator'

const settingsCategories = [
  {
    title: 'Account',
    items: [
      {
        icon: User,
        title: 'Profile',
        description: 'Manage your personal information',
        href: '/settings/profile',
      },
      {
        icon: Key,
        title: 'Security',
        description: 'Password, 2FA, and security settings',
        href: '/settings/security',
      },
    ],
  },
  {
    title: 'Preferences',
    items: [
      {
        icon: Bell,
        title: 'Notifications',
        description: 'Email and push notification preferences',
        href: '/settings/notifications',
      },
      {
        icon: Palette,
        title: 'Appearance',
        description: 'Theme and display settings',
        href: '/settings/appearance',
      },
      {
        icon: Globe,
        title: 'Language & Region',
        description: 'Language, timezone, and currency',
        href: '/settings/language',
      },
    ],
  },
  {
    title: 'Trading',
    items: [
      {
        icon: Shield,
        title: 'API Management',
        description: 'Create and manage API keys',
        href: '/settings/api',
      },
      {
        icon: Smartphone,
        title: 'Trading Preferences',
        description: 'Default trading settings and limits',
        href: '/settings/trading',
      },
    ],
  },
]

export default function SettingsPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {settingsCategories.map((category) => (
          <div key={category.title} className="space-y-4">
            <h2 className="text-lg font-semibold">{category.title}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {category.items.map((item) => (
                <Card
                  key={item.href}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => router.push(item.href)}
                >
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {item.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-8" />

      {/* Danger Zone */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base">Delete Account</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}