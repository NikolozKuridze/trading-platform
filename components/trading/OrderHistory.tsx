'use client'

import { useState, useEffect } from 'react'
import { MoreHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useTradingStore } from '@/lib/store/tradingStore'
import { formatCurrency, tradingService } from '@/lib/api/trading'
import { formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { OrderDto } from '@/lib/api/types'

interface OrderHistoryProps {
  type: 'open' | 'history' | 'trades'
}

interface Order {
  id: string
  symbol: string
  type: 'limit' | 'market' | 'stop-limit'
  side: 'buy' | 'sell'
  price: number
  amount: number
  filled: number
  status: 'open' | 'filled' | 'cancelled' | 'rejected'
  timestamp: string
}

const mockOrders: Order[] = [
  {
    id: '1',
    symbol: 'BTC/USDT',
    type: 'limit',
    side: 'buy',
    price: 42500,
    amount: 0.1,
    filled: 0,
    status: 'open',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    symbol: 'BTC/USDT',
    type: 'limit',
    side: 'sell',
    price: 44000,
    amount: 0.05,
    filled: 0,
    status: 'open',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    symbol: 'BTC/USDT',
    type: 'market',
    side: 'buy',
    price: 43250,
    amount: 0.2,
    filled: 0.2,
    status: 'filled',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
]

export function OrderHistory({ type }: OrderHistoryProps) {
  const { selectedAccount } = useTradingStore()
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (selectedAccount) {
      loadOrders()
    }
  }, [type, selectedAccount])

  const loadOrders = async () => {
    if (!selectedAccount) return
    
    try {
      setIsLoading(true)
       
      const result = await tradingService.getOrders(
        selectedAccount.id,
        type === 'open' ? 'Open' : undefined
      )
      
      setOrders(result.items)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

}
function OrderStatusBadge({ status }: { status: Order['status'] }) {
  const variants: Record<Order['status'], 'default' | 'success' | 'destructive' | 'secondary'> = {
    open: 'default',
    filled: 'success',
    cancelled: 'secondary',
    rejected: 'destructive',
  }

  return (
    <Badge variant={variants[status]} className="text-xs">
      {status.toUpperCase()}
    </Badge>
  )
}