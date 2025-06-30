'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, TrendingDown, DollarSign, BarChart3, Clock, Target } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useTradingStore } from '@/lib/store/tradingStore'
import { tradingService } from '@/lib/api/trading'
import { formatCurrency, formatPercentage } from '@/lib/api/trading'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { PnLChart } from '@/components/analytics/PnLChart'
import { TradingHoursChart } from '@/components/analytics/TradingHoursChart'
import { SymbolPerformance } from '@/components/analytics/SymbolPerformance'
import { TradingMetrics } from '@/components/analytics/TradingMetrics'
import { PnLDto, TradingHoursAnalysisDto } from '@/lib/types/api.types'

export default function AnalyticsPage() {
  const { selectedAccount } = useTradingStore()
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('30d')
  const [pnlData, setPnlData] = useState<PnLDto | null>(null)
  const [tradingHoursData, setTradingHoursData] = useState<TradingHoursAnalysisDto | null>(null)

  useEffect(() => {
    if (selectedAccount) {
      loadAnalytics()
    }
  }, [selectedAccount, timeframe])

  const loadAnalytics = async () => {
    if (!selectedAccount) return

    try {
      setIsLoading(true)
      
      // Calculate date range based on timeframe
      const endDate = new Date()
      const startDate = new Date()
      
      switch (timeframe) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(startDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(startDate.getDate() - 90)
          break
        case 'ytd':
          startDate.setMonth(0, 1)
          break
        case 'all':
          startDate.setFullYear(startDate.getFullYear() - 10)
          break
      }

      const [pnl, tradingHours] = await Promise.all([
        tradingService.getPnL(
          selectedAccount.id,
          startDate.toISOString(),
          endDate.toISOString()
        ),
        tradingService.getTradingHoursAnalysis(selectedAccount.id, 30),
      ])

      setPnlData(pnl)
      setTradingHoursData(tradingHours)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const metrics = pnlData ? {
    totalPnL: pnlData.totalPnL,
    winRate: pnlData.winRate,
    profitFactor: pnlData.profitFactor,
    totalTrades: pnlData.totalTrades,
    avgWin: pnlData.averageWin,
    avgLoss: pnlData.averageLoss,
  } : {
    totalPnL: 0,
    winRate: 0,
    profitFactor: 0,
    totalTrades: 0,
    avgWin: 0,
    avgLoss: 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your trading performance and insights
          </p>
        </div>
        
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="ytd">Year to date</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {metrics.totalPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(metrics.totalPnL)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalPnL >= 0 ? 'Profit' : 'Loss'} for selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics.winRate)}</div>
            <Progress value={metrics.winRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.profitFactor.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.profitFactor > 1 ? 'Profitable' : 'Unprofitable'} trading
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTrades}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.winRate > 0 ? `${pnlData?.winningTrades} wins, ${pnlData?.losingTrades} losses` : 'No trades'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="pnl" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pnl">P&L Analysis</TabsTrigger>
          <TabsTrigger value="trading-hours">Trading Hours</TabsTrigger>
          <TabsTrigger value="symbols">Symbol Performance</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="pnl" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Over Time</CardTitle>
              <CardDescription>
                Track your cumulative P&L performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pnlData && <PnLChart data={pnlData} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading-hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Hours Analysis</CardTitle>
              <CardDescription>
                Discover your most profitable trading hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tradingHoursData && <TradingHoursChart data={tradingHoursData} />}
            </CardContent>
          </Card>

          {tradingHoursData && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Best Trading Hour</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">
                        {tradingHoursData.bestHour}:00
                      </span>
                    </div>
                    <Badge variant="success">
                      +{formatCurrency(tradingHoursData.bestHourPnL)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Worst Trading Hour</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">
                        {tradingHoursData.worstHour}:00
                      </span>
                    </div>
                    <Badge variant="destructive">
                      {formatCurrency(tradingHoursData.worstHourPnL)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="symbols" className="space-y-4">
          <SymbolPerformance />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <TradingMetrics pnlData={pnlData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}