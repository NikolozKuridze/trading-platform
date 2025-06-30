'use client'

import { useState, useEffect } from 'react'
import { Search, Star, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useTradingStore } from '@/lib/store/tradingStore'
import { formatCurrency, formatPercentage } from '@/lib/api/trading'
import { cn } from '@/lib/utils'
import { binanceService, Ticker } from '@/lib/api/binance'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

interface Market {
  symbol: string
  baseAsset: string
  quoteAsset: string
  price: number
  change24h: number
  volume24h: number
  isFavorite?: boolean
}

export function MarketSelector() {
  const { selectedSymbol, setSelectedSymbol } = useTradingStore()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<string[]>(['BTC/USDT', 'ETH/USDT'])
  const [markets, setMarkets] = useState<Market[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMarkets()
  }, [])

  const loadMarkets = async () => {
    try {
      setIsLoading(true)
      const tickers = await binanceService.getAllTickers()
      
      // Transform tickers to markets
      const marketData = tickers
        .filter(ticker => ticker.symbol.endsWith('USDT'))
        .map((ticker: Ticker) => {
          const baseAsset = ticker.symbol.replace('USDT', '')
          
          return {
            symbol: `${baseAsset}/USDT`,
            baseAsset,
            quoteAsset: 'USDT',
            price: parseFloat(ticker.lastPrice),
            change24h: parseFloat(ticker.priceChangePercent),
            volume24h: parseFloat(ticker.quoteVolume),
          }
        })
        .sort((a, b) => b.volume24h - a.volume24h)
      
      setMarkets(marketData)
    } catch (error) {
      console.error('Failed to load markets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentMarket = markets.find(m => m.symbol === selectedSymbol) || {
    symbol: selectedSymbol,
    baseAsset: selectedSymbol.split('/')[0],
    quoteAsset: 'USDT',
    price: 0,
    change24h: 0,
    volume24h: 0,
  }

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    )
  }

  const filteredMarkets = markets.filter(market =>
    market.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.baseAsset.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const favoriteMarkets = markets.filter(m => favorites.includes(m.symbol))

  const handleSelectMarket = (symbol: string) => {
    setSelectedSymbol(symbol)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between min-w-[200px]">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{currentMarket.symbol}</span>
            {currentMarket.price > 0 && (
              <Badge
                variant={currentMarket.change24h >= 0 ? 'success' : 'destructive'}
                className="text-xs"
              >
                {formatPercentage(currentMarket.change24h)}
              </Badge>
            )}
          </div>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search markets..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b">
            <TabsTrigger value="favorites">
              <Star className="h-4 w-4 mr-1" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="all">All Markets</TabsTrigger>
            <TabsTrigger value="spot">Spot</TabsTrigger>
          </TabsList>

          <div className="max-h-[400px] overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                <TabsContent value="favorites" className="m-0">
                  {favoriteMarkets.length > 0 ? (
                    <MarketList
                      markets={favoriteMarkets}
                      favorites={favorites}
                      onSelect={handleSelectMarket}
                      onToggleFavorite={toggleFavorite}
                    />
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No favorite markets yet</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="all" className="m-0">
                  <MarketList
                    markets={filteredMarkets}
                    favorites={favorites}
                    onSelect={handleSelectMarket}
                    onToggleFavorite={toggleFavorite}
                  />
                </TabsContent>

                <TabsContent value="spot" className="m-0">
                  <MarketList
                    markets={filteredMarkets}
                    favorites={favorites}
                    onSelect={handleSelectMarket}
                    onToggleFavorite={toggleFavorite}
                  />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}

interface MarketListProps {
  markets: Market[]
  favorites: string[]
  onSelect: (symbol: string) => void
  onToggleFavorite: (symbol: string) => void
}

function MarketList({ markets, favorites, onSelect, onToggleFavorite }: MarketListProps) {
  return (
    <div>
      <div className="grid grid-cols-5 gap-4 px-4 py-2 text-xs text-muted-foreground border-b">
        <div></div>
        <div>Pair</div>
        <div className="text-right">Price</div>
        <div className="text-right">24h Change</div>
        <div className="text-right">Volume</div>
      </div>
      {markets.map((market) => (
        <div
          key={market.symbol}
          className="grid grid-cols-5 gap-4 px-4 py-3 hover:bg-muted/50 cursor-pointer items-center"
          onClick={() => onSelect(market.symbol)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(market.symbol)
            }}
            className="text-muted-foreground hover:text-yellow-500"
          >
            <Star
              className={cn(
                'h-4 w-4',
                favorites.includes(market.symbol) && 'fill-yellow-500 text-yellow-500'
              )}
            />
          </button>
          <div>
            <span className="font-medium">{market.baseAsset}</span>
            <span className="text-muted-foreground">/{market.quoteAsset}</span>
          </div>
          <div className="text-right font-mono">
            ${market.price.toLocaleString()}
          </div>
          <div className={cn(
            'text-right font-mono',
            market.change24h >= 0 ? 'text-success' : 'text-destructive'
          )}>
            {formatPercentage(market.change24h)}
          </div>
          <div className="text-right text-muted-foreground">
            ${(market.volume24h / 1000000).toFixed(1)}M
          </div>
        </div>
      ))}
    </div>
  )
}