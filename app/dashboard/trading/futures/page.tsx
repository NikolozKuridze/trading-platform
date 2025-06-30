'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTradingStore } from '@/lib/store/tradingStore'
import { TradingChart } from '@/components/trading/TradingChart'
import { OrderBook } from '@/components/trading/OrderBook'
import { FuturesTradePanel } from '@/components/trading/FuturesTradePanel'
import { PositionsList } from '@/components/trading/PositionsList'
import { MarketSelector } from '@/components/trading/MarketSelector'
import { MarketStats } from '@/components/trading/MarketStats'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { formatCurrency, formatPercentage } from '@/lib/api/trading'

export default function FuturesTradingPage() {
  const { selectedSymbol, positions, loadPositions } = useTradingStore()
  const [isLoading, setIsLoading] = useState(true)
  const [accountInfo, setAccountInfo] = useState({
    balance: 10000,
    availableBalance: 8500,
    unrealizedPnL: 234.50,
    marginRatio: 15.0,
    totalMargin: 1500,
  })

  useEffect(() => {
    // Load initial data
    Promise.all([
      loadPositions('Open'),
    ]).finally(() => {
      setIsLoading(false)
    })
  }, [loadPositions])

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Market Header */}
      <div className="flex items-center justify-between mb-4">
        <MarketSelector />
        <MarketStats symbol={selectedSymbol} />
      </div>

      {/* Risk Warning */}
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Risk Warning:</strong> Futures trading involves significant risk and leverage. 
          You may lose more than your initial investment. Trade responsibly.
        </AlertDescription>
      </Alert>

      {/* Trading Interface */}
      <div className="flex-1 grid grid-cols-12 gap-4">
        {/* Left Column - Chart & Positions */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <Card className="h-[500px]">
            <TradingChart symbol={selectedSymbol} />
          </Card>
          
          {/* Positions & Orders */}
          <Card className="h-[300px]">
            <Tabs defaultValue="positions" className="h-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="positions">
                  Positions ({positions.filter(p => p.status === 'Open').length})
                </TabsTrigger>
                <TabsTrigger value="orders">Open Orders</TabsTrigger>
                <TabsTrigger value="history">Position History</TabsTrigger>
              </TabsList>
              <TabsContent value="positions" className="h-[calc(100%-40px)] overflow-auto">
                <PositionsList positions={positions.filter(p => p.status === 'Open')} />
              </TabsContent>
              <TabsContent value="orders" className="h-[calc(100%-40px)] overflow-auto">
                <div className="text-center py-8 text-muted-foreground">
                  No open orders
                </div>
              </TabsContent>
              <TabsContent value="history" className="h-[calc(100%-40px)] overflow-auto">
                <PositionsList positions={positions.filter(p => p.status === 'Closed')} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Column - Account Info, Order Book & Trade Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Account Info */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Account Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Balance</span>
                <span className="font-medium">{formatCurrency(accountInfo.balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available</span>
                <span className="font-medium">{formatCurrency(accountInfo.availableBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unrealized P&L</span>
                <span className={`font-medium ${accountInfo.unrealizedPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(accountInfo.unrealizedPnL)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Margin Ratio</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{accountInfo.marginRatio.toFixed(2)}%</span>
                  {accountInfo.marginRatio > 80 && (
                    <Badge variant="destructive" className="text-xs">Risk</Badge>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Margin</span>
                <span className="font-medium">{formatCurrency(accountInfo.totalMargin)}</span>
              </div>
            </div>
          </Card>

          {/* Order Book */}
          <Card className="h-[350px]">
            <OrderBook symbol={selectedSymbol} />
          </Card>

          {/* Trade Panel */}
          <Card className="h-[400px]">
            <FuturesTradePanel />
          </Card>
        </div>
      </div>
    </div>
  )
}