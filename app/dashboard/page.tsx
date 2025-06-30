'use client'

import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Activity, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/lib/store/authStore'
import { useTradingStore } from '@/lib/store/tradingStore'
import { tradingService } from '@/lib/api/trading'
import { formatCurrency, formatPercentage } from '@/lib/api/trading'
import { PortfolioChart } from '@/components/dashboard/PortfolioChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { MarketOverview } from '@/components/dashboard/MarketOverview'
import { QuickActions } from '@/components/dashboard/QuickActions'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { PortfolioDto } from '@/lib/api/types'

interface DashboardStats {
  totalBalance: number
  totalPnL: number
  totalPnLPercentage: number
  dayPnL: number
  dayPnLPercentage: number
  activePositions: number
  openOrders: number
  winRate: number
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { selectedAccount, accounts, setAccounts } = useTradingStore()
  const [portfolio, setPortfolio] = useState<PortfolioDto | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalBalance: 0,
    totalPnL: 0,
    totalPnLPercentage: 0,
    dayPnL: 0,
    dayPnLPercentage: 0,
    activePositions: 0,
    openOrders: 0,
    winRate: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [selectedAccount])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // Load trading accounts if not loaded
      if (accounts.length === 0) {
        const userAccounts = await tradingService.getUserAccounts()
        setAccounts(userAccounts)
      }

      // Load portfolio data
      const portfolioData = await tradingService.getPortfolio()
      setPortfolio(portfolioData)

      // Calculate stats
      setStats({
        totalBalance: portfolioData.totalUsdValue,
        totalPnL: 2543.21, // Mock data - in production, calculate from positions
        totalPnLPercentage: 5.23,
        dayPnL: 423.50,
        dayPnLPercentage: 1.82,
        activePositions: 3,
        openOrders: 5,
        winRate: 68.5,
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your trading account
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
          <Button>
            <TrendingUp className="mr-2 h-4 w-4" />
            Start Trading
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{formatPercentage(12.5)} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {stats.totalPnL >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-success" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(stats.totalPnL)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(stats.totalPnLPercentage)} all time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Change</CardTitle>
            {stats.dayPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.dayPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(stats.dayPnL)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(stats.dayPnLPercentage)} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.winRate}%</div>
            <Progress value={stats.winRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Portfolio Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>
              Your portfolio value over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PortfolioChart />
          </CardContent>
        </Card>

        {/* Portfolio Holdings */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Portfolio Holdings</CardTitle>
            <CardDescription>
              Your current asset allocation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {portfolio && portfolio.holdings.length > 0 ? (
              <div className="space-y-4">
                {portfolio.holdings.map((holding) => (
                  <div key={holding.currency} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold">{holding.currency}</span>
                      </div>
                      <div>
                        <p className="font-medium">{holding.currency}</p>
                        <p className="text-sm text-muted-foreground">
                          {holding.balance.toFixed(8)} {holding.currency}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(holding.usdValue)}</p>
                      <p className={`text-sm ${holding.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatPercentage(holding.change24h)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No holdings yet</p>
                <Button variant="link" className="mt-2">
                  Make your first deposit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <RecentTransactions />
        </div>
        <div className="col-span-3">
          <MarketOverview />
        </div>
      </div>

      {/* Trading Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{stats.activePositions}</p>
                <p className="text-sm text-muted-foreground">
                  Total margin: {formatCurrency(4532.10)}
                </p>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Open Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{stats.openOrders}</p>
                <p className="text-sm text-muted-foreground">
                  Total value: {formatCurrency(12450.00)}
                </p>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trading Volume (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{formatCurrency(45320, 'USD', 'en-US')}</p>
                <p className="text-sm text-muted-foreground">
                  Across 28 trades
                </p>
              </div>
              <Button variant="outline" size="sm">
                Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}