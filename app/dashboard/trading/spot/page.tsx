'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTradingStore } from '@/lib/store/tradingStore'
import { useAuthStore } from '@/lib/store/authStore'
import { TradingChart } from '@/components/trading/TradingChart'
import { OrderBook } from '@/components/trading/OrderBook'
import { TradePanel } from '@/components/trading/TradePanel'
import { OrderHistory } from '@/components/trading/OrderHistory'
import { MarketSelector } from '@/components/trading/MarketSelector'
import { MarketStats } from '@/components/trading/MarketStats'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function SpotTradingPage() {
  const { selectedSymbol, marketData } = useTradingStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading market data
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

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

      {/* Trading Interface */}
      <div className="flex-1 grid grid-cols-12 gap-4">
        {/* Left Column - Chart */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <Card className="h-[500px]">
            <TradingChart symbol={selectedSymbol} />
          </Card>
          
          {/* Orders */}
          <Card className="h-[300px]">
            <Tabs defaultValue="openOrders" className="h-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="openOrders">Open Orders</TabsTrigger>
                <TabsTrigger value="orderHistory">Order History</TabsTrigger>
                <TabsTrigger value="tradeHistory">Trade History</TabsTrigger>
              </TabsList>
              <TabsContent value="openOrders" className="h-[calc(100%-40px)] overflow-auto">
                <OrderHistory type="open" />
              </TabsContent>
              <TabsContent value="orderHistory" className="h-[calc(100%-40px)] overflow-auto">
                <OrderHistory type="history" />
              </TabsContent>
              <TabsContent value="tradeHistory" className="h-[calc(100%-40px)] overflow-auto">
                <OrderHistory type="trades" />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Column - Order Book & Trade Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Order Book */}
          <Card className="h-[400px]">
            <OrderBook symbol={selectedSymbol} />
          </Card>

          {/* Trade Panel */}
          <Card className="h-[400px]">
            <TradePanel />
          </Card>
        </div>
      </div>
    </div>
  )
}