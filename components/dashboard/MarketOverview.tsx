// components/dashboard/MarketOverview.tsx
'use client'

import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercentage } from '@/lib/api/trading'
import { cn } from '@/lib/utils'
import { binanceService } from '@/lib/api/binance'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export function MarketOverview() {
  const [markets, setMarkets] = useState<MarketData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTopMarkets()
    // Update every 10 seconds
    const interval = setInterval(loadTopMarkets, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadTopMarkets = async () => {
    try {
      // Get all tickers from Binance API
      const tickers = await binanceService.getAllTickers()
      
      // Filter USDT pairs and sort by volume
      const topMarkets = tickers
        .filter(ticker => ticker.symbol.endsWith('USDT'))
        .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0, 6)
        .map(ticker => {
          const baseAsset = ticker.symbol.replace('USDT', '')
          
          return {
            symbol: baseAsset,
            name: baseAsset, // Binance API doesn't provide full names
            price: parseFloat(ticker.lastPrice),
            change24h: parseFloat(ticker.priceChangePercent),
            volume24h: parseFloat(ticker.quoteVolume),
            marketCap: parseFloat(ticker.quoteVolume) * 10, // Estimation
          }
        })
      
      setMarkets(topMarkets)
    } catch (error) {
      console.error('Failed to load market overview:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(1)}B`
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(1)}M`
    } else {
      return formatCurrency(volume)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
        <CardDescription>
          Top cryptocurrencies by 24h volume
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
                  <p className="font-medium">{market.symbol}</p>
                  <p className="text-sm text-muted-foreground">{market.symbol}/USDT</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(market.price)}</p>
                  <p className="text-sm text-muted-foreground">
                    Vol: {formatVolume(market.volume24h)}
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