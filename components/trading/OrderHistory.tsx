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
import { formatCurrency } from '@/lib/api/trading'
import { formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'

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
  const { openOrders, orderHistory, cancelOrder, loadOrders } = useTradingStore()
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    // Filter orders based on type
    if (type === 'open') {
      setOrders(mockOrders.filter(o => o.status === 'open'))
    } else if (type === 'history') {
      setOrders(mockOrders.filter(o => o.status !== 'open'))
    } else {
      // For trades, show filled orders
      setOrders(mockOrders.filter(o => o.status === 'filled'))
    }
  }, [type])

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId)
      toast.success('Order cancelled successfully')
    } catch (error) {
      toast.error('Failed to cancel order')
    }
  }

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No {type === 'open' ? 'open orders' : type === 'history' ? 'order history' : 'trades'}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-sm text-muted-foreground">
            <th className="text-left p-2">Time</th>
            <th className="text-left p-2">Pair</th>
            <th className="text-left p-2">Type</th>
            <th className="text-left p-2">Side</th>
            <th className="text-right p-2">Price</th>
            <th className="text-right p-2">Amount</th>
            <th className="text-right p-2">Filled</th>
            <th className="text-right p-2">Total</th>
            <th className="text-center p-2">Status</th>
            {type === 'open' && <th className="text-center p-2">Action</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b hover:bg-muted/50">
              <td className="p-2 text-sm">{formatDate(order.timestamp, 'time')}</td>
              <td className="p-2 text-sm font-medium">{order.symbol}</td>
              <td className="p-2 text-sm capitalize">{order.type}</td>
              <td className="p-2">
                <Badge
                  variant={order.side === 'buy' ? 'success' : 'destructive'}
                  className="text-xs"
                >
                  {order.side.toUpperCase()}
                </Badge>
              </td>
              <td className="p-2 text-sm text-right font-mono">
                {formatCurrency(order.price)}
              </td>
              <td className="p-2 text-sm text-right font-mono">
                {order.amount.toFixed(6)}
              </td>
              <td className="p-2 text-sm text-right font-mono">
                {order.filled.toFixed(6)}
              </td>
              <td className="p-2 text-sm text-right font-mono">
                {formatCurrency(order.price * order.amount)}
              </td>
              <td className="p-2 text-center">
                <OrderStatusBadge status={order.status} />
              </td>
              {type === 'open' && (
                <td className="p-2 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleCancelOrder(order.id)}
                        className="text-destructive"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel Order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
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