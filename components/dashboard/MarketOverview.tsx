'use client'

import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercentage } from '@/lib/api/trading'
import { cn } from '@/lib/utils'

interface MarketData {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
}

export function MarketOverview() {
  const [markets, setMarkets] = useState<MarketData[]>([
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 43250.50,
      change24h: 2.45,
      volume24h: 28453900000,
      marketCap: 845230000000,
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 2280.30,
      change24h: -0.82,
      volume24h: 15234500000,
      marketCap: 273900000000,
    },
    {
      symbol: 'BNB',
      name: 'Binance Coin',
      price: 315.20,
      change24h: 1.23,
      volume24h: 1234500000,
      marketCap: 48560000000,
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      price: 98.45,
      change24h: 5.67,
      volume24h: 2345600000,
      marketCap: 41230000000,
    },
    {
      symbol: 'XRP',
      name: 'Ripple',
      price: 0.6234,
      change24h: -1.45,
      volume24h: 1234500000,
      marketCap: 33450000000,
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      price: 0.5823,
      change24h: 3.21,
      volume24h: 534500000,
      marketCap: 20340000000,
    },
  ])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
        <CardDescription>
          Top cryptocurrencies by market cap
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {markets.map((market) => (
            <div
              key={market.symbol}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold">{market.symbol}</span>
                </div>
                <div>
                  <p className="font-medium">{market.name}</p>
                  <p className="text-sm text-muted-foreground">{market.symbol}/USDT</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(market.price)}</p>
                  <p className="text-sm text-muted-foreground">
                    Vol: {formatCurrency(market.volume24h, 'USD', 'en-US', true)}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge
                    variant={market.change24h >= 0 ? 'success' : 'destructive'}
                    className="min-w-[80px] justify-center"
                  >
                    {market.change24h >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {formatPercentage(Math.abs(market.change24h))}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}