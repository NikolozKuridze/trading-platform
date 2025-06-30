'use client'

import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/api/trading'
import { formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'buy' | 'sell'
  asset: string
  amount: number
  price: number
  total: number
  status: 'completed' | 'pending' | 'failed'
  timestamp: string
}

export function RecentTransactions() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'buy',
      asset: 'BTC',
      amount: 0.0234,
      price: 43250.50,
      total: 1012.05,
      status: 'completed',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      type: 'sell',
      asset: 'ETH',
      amount: 2.5,
      price: 2280.30,
      total: 5700.75,
      status: 'completed',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '3',
      type: 'deposit',
      asset: 'USDT',
      amount: 1000,
      price: 1,
      total: 1000,
      status: 'completed',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '4',
      type: 'buy',
      asset: 'SOL',
      amount: 10,
      price: 98.45,
      total: 984.50,
      status: 'pending',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: '5',
      type: 'withdrawal',
      asset: 'USDT',
      amount: 500,
      price: 1,
      total: 500,
      status: 'failed',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
    },
  ])

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'buy':
        return <ArrowDownRight className="h-4 w-4 text-success" />
      case 'sell':
        return <ArrowUpRight className="h-4 w-4 text-danger" />
      case 'deposit':
        return <ArrowDownRight className="h-4 w-4 text-primary" />
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-primary" />
    }
  }

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-danger" />
    }
  }

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest trading and wallet activities
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/transactions')}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium capitalize">{transaction.type}</p>
                    <span className="text-muted-foreground">•</span>
                    <p className="text-sm text-muted-foreground">
                      {transaction.amount} {transaction.asset}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(transaction.timestamp, 'time')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(transaction.total)}</p>
                  {transaction.type === 'buy' || transaction.type === 'sell' ? (
                    <p className="text-sm text-muted-foreground">
                      @ {formatCurrency(transaction.price)}
                    </p>
                  ) : null}
                </div>
                {getStatusBadge(transaction.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}