'use client'

import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useTradingStore } from '@/lib/store/tradingStore'
import { formatCurrency, formatPercentage } from '@/lib/api/trading'
import { cn } from '@/lib/utils'

interface MarketStatsProps {
  symbol: string
}

export function MarketStats({ symbol }: MarketStatsProps) {
  const { marketData } = useTradingStore()
  
  // Mock data - in production, this would come from the marketData store
  const stats = {
    price: 43250.50,
    change24h: 2.45,
    changeAmount: 1035.23,
    high24h: 44500.00,
    low24h: 42100.00,
    volume24h: 2845390000,
  }

  const isPositive = stats.change24h >= 0

  return (
    <div className="flex items-center gap-6">
      <div>
        <p className="text-sm text-muted-foreground">Last Price</p>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-2xl font-bold",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {formatCurrency(stats.price)}
          </span>
          <div className={cn(
            "flex items-center text-sm",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            <span>{formatPercentage(Math.abs(stats.change24h))}</span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">24h Change</p>
        <p className={cn(
          "font-medium",
          isPositive ? "text-success" : "text-destructive"
        )}>
          {isPositive ? '+' : '-'}{formatCurrency(Math.abs(stats.changeAmount))}
        </p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">24h High</p>
        <p className="font-medium">{formatCurrency(stats.high24h)}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">24h Low</p>
        <p className="font-medium">{formatCurrency(stats.low24h)}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">24h Volume</p>
        <p className="font-medium">
          {formatCurrency(stats.volume24h, 'USD', 'en-US', true)}
        </p>
      </div>
    </div>
  )
}