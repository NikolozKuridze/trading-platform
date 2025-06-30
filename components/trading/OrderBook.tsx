'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/api/trading'
import { cn } from '@/lib/utils'

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
  const [spread, setSpread] = useState(0)
  const [spreadPercentage, setSpreadPercentage] = useState(0)

  useEffect(() => {
    // Generate mock order book data
    const basePrice = 43250.50
    const bids: OrderBookEntry[] = []
    const asks: OrderBookEntry[] = []

    // Generate bids (buy orders)
    for (let i = 0; i < 15; i++) {
      const price = basePrice - (i + 1) * 0.50
      const amount = Math.random() * 2 + 0.1
      bids.push({
        price,
        amount,
        total: price * amount,
      })
    }

    // Generate asks (sell orders)
    for (let i = 0; i < 15; i++) {
      const price = basePrice + (i + 1) * 0.50
      const amount = Math.random() * 2 + 0.1
      asks.push({
        price,
        amount,
        total: price * amount,
      })
    }

    setOrderBook({ bids, asks })

    // Calculate spread
    if (asks.length > 0 && bids.length > 0) {
      const bestAsk = asks[0].price
      const bestBid = bids[0].price
      const spreadValue = bestAsk - bestBid
      const spreadPct = (spreadValue / bestAsk) * 100
      setSpread(spreadValue)
      setSpreadPercentage(spreadPct)
    }

    // Simulate real-time updates
    const interval = setInterval(() => {
      setOrderBook(prev => ({
        bids: prev.bids.map(bid => ({
          ...bid,
          amount: Math.max(0.1, bid.amount + (Math.random() - 0.5) * 0.1),
          total: bid.price * bid.amount,
        })),
        asks: prev.asks.map(ask => ({
          ...ask,
          amount: Math.max(0.1, ask.amount + (Math.random() - 0.5) * 0.1),
          total: ask.price * ask.amount,
        })),
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [symbol])

  const maxTotal = Math.max(
    ...orderBook.bids.map(b => b.total),
    ...orderBook.asks.map(a => a.total)
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b">
        <h3 className="font-medium">Order Book</h3>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Spread</span>
          <span>
            {formatCurrency(spread)} ({spreadPercentage.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-muted-foreground border-b">
        <div>Price (USDT)</div>
        <div className="text-right">Amount (BTC)</div>
        <div className="text-right">Total</div>
      </div>

      {/* Order Book Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Asks (Sell Orders) */}
        <div className="flex-1 overflow-auto flex flex-col-reverse">
          {orderBook.asks.map((ask, index) => (
            <OrderBookRow
              key={`ask-${index}`}
              type="ask"
              price={ask.price}
              amount={ask.amount}
              total={ask.total}
              maxTotal={maxTotal}
            />
          ))}
        </div>

        {/* Current Price */}
        <div className="px-3 py-2 bg-muted/50 border-y">
          <div className="text-center">
            <span className="text-lg font-semibold text-success">
              {formatCurrency(43250.50)}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              ≈ ${formatCurrency(43250.50)}
            </span>
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="flex-1 overflow-auto">
          {orderBook.bids.map((bid, index) => (
            <OrderBookRow
              key={`bid-${index}`}
              type="bid"
              price={bid.price}
              amount={bid.amount}
              total={bid.total}
              maxTotal={maxTotal}
            />
          ))}
        </div>
      </div>
    </div>
  )
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