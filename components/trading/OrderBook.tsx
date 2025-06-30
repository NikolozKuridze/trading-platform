'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/api/trading'
import { cn } from '@/lib/utils'
import { binanceService } from '@/lib/api/binance'

interface OrderBookProps {
  symbol: string
}

interface OrderBookEntry {
  price: number
  amount: number
  total: number
}

export function OrderBook({ symbol }: OrderBookProps) {
  const [orderBook, setOrderBook] = useState<{
    bids: OrderBookEntry[]
    asks: OrderBookEntry[]
  }>({
    bids: [],
    asks: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadOrderBook()
    // Set up interval for real-time updates
    const interval = setInterval(loadOrderBook, 2000)
    return () => clearInterval(interval)
  }, [symbol])

  const loadOrderBook = async () => {
    try {
      // Convert symbol format (BTC/USDT -> BTCUSDT)
      const binanceSymbol = symbol.replace('/', '')
      
      const data = await binanceService.getOrderBook(binanceSymbol, 20)
      
      // Transform API response
      const bids = data.bids.map(([price, amount]: [string, string]) => ({
        price: parseFloat(price),
        amount: parseFloat(amount),
        total: parseFloat(price) * parseFloat(amount),
      }))
      
      const asks = data.asks.map(([price, amount]: [string, string]) => ({
        price: parseFloat(price),
        amount: parseFloat(amount),
        total: parseFloat(price) * parseFloat(amount),
      }))
      
      setOrderBook({ bids, asks })
    } catch (error) {
      console.error('Failed to load order book:', error)
    } finally {
      setIsLoading(false)
    }
  }
}

interface OrderBookRowProps {
  type: 'bid' | 'ask'
  price: number
  amount: number
  total: number
  maxTotal: number
}

function OrderBookRow({ type, price, amount, total, maxTotal }: OrderBookRowProps) {
  const percentage = (total / maxTotal) * 100

  return (
    <div className="relative order-book-row">
      {/* Background fill */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 opacity-20",
          type === 'bid' ? "bg-success" : "bg-danger"
        )}
        style={{ width: `${percentage}%` }}
      />
      
      {/* Content */}
      <div className="relative grid grid-cols-3 gap-2 px-3 py-1">
        <div className={cn(
          "font-mono text-sm",
          type === 'bid' ? "text-success" : "text-danger"
        )}>
          {price.toFixed(2)}
        </div>
        <div className="text-right font-mono text-sm">
          {amount.toFixed(6)}
        </div>
        <div className="text-right font-mono text-sm text-muted-foreground">
          {(total / 1000).toFixed(2)}K
        </div>
      </div>
    </div>
  )
}