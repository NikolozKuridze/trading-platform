'use client'

import { useRouter } from 'next/navigation'
import { ArrowUpRight, ArrowDownRight, Send, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      label: 'Deposit',
      icon: Plus,
      onClick: () => router.push('/wallet/deposit'),
      variant: 'default' as const,
    },
    {
      label: 'Withdraw',
      icon: Send,
      onClick: () => router.push('/wallet/withdraw'),
      variant: 'outline' as const,
    },
    {
      label: 'Buy Crypto',
      icon: ArrowDownRight,
      onClick: () => router.push('/trading/spot'),
      variant: 'buy' as const,
    },
    {
      label: 'Sell Crypto',
      icon: ArrowUpRight,
      onClick: () => router.push('/trading/spot'),
      variant: 'sell' as const,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          size="lg"
          className="w-full"
          onClick={action.onClick}
        >
          <action.icon className="mr-2 h-4 w-4" />
          {action.label}
        </Button>
      ))}
    </div>
  )
}