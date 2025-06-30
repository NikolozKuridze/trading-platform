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
import { useTradingWebSocket } from '@/lib/api/websocket'
import { toast } from 'react-hot-toast'
import { Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { tradingService } from '@/lib/api/trading'

export default function SpotTradingPage() {
  const { selectedSymbol, marketData, selectedAccount, loadOrders } = useTradingStore()
  const [isLoading, setIsLoading] = useState(false)
  const [walletBalance, setWalletBalance] = useState({
    base: { currency: 'BTC', balance: 0 },
    quote: { currency: 'USDT', balance: 0 }
  })

  // Initialize WebSocket connection
  useTradingWebSocket()

  useEffect(() => {
    loadPageData()
  }, [selectedAccount, selectedSymbol])

  const loadPageData = async () => {
    if (!selectedAccount) return

    try {
      setIsLoading(true)
      
      // Load wallet balances
      const wallets = await tradingService.getWallets(selectedAccount.id)
      const [baseCurrency, quoteCurrency] = selectedSymbol.split('/')
      
      const baseWallet = wallets.find(w => w.currency === baseCurrency)
      const quoteWallet = wallets.find(w => w.currency === quoteCurrency)
      
      setWalletBalance({
        base: {
          currency: baseCurrency,
          balance: baseWallet?.availableBalance || 0
        },
        quote: {
          currency: quoteCurrency,
          balance: quoteWallet?.availableBalance || 0
        }
      })
      
      // Load open orders
      await loadOrders()
    } catch (error) {
      console.error('Failed to load trading data:', error)
      toast.error('Failed to load trading data')
    } finally {
      setIsLoading(false)
    }
  }

  if (!selectedAccount) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
        <Wallet className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">No Trading Account</h2>
        <p className="text-muted-foreground">Please create a trading account to start trading</p>
        <Button onClick={() => window.location.href = '/dashboard'}>
          Go to Dashboard
        </Button>
      </div>
    )
  }

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
          {/* Wallet Balance */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Wallet Balance</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{walletBalance.base.currency}</span>
                <span className="font-mono">{walletBalance.base.balance.toFixed(8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{walletBalance.quote.currency}</span>
                <span className="font-mono">{walletBalance.quote.balance.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Order Book */}
          <Card className="h-[350px]">
            <OrderBook symbol={selectedSymbol} />
          </Card>

          {/* Trade Panel */}
          <Card className="h-[400px]">
            <TradePanel 
              baseBalance={walletBalance.base.balance}
              quoteBalance={walletBalance.quote.balance}
              baseCurrency={walletBalance.base.currency}
              quoteCurrency={walletBalance.quote.currency}
              onOrderPlaced={loadPageData}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}