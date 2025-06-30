'use client'

import { useState, useEffect } from 'react'
import { Download, Filter, Search, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useTradingStore } from '@/lib/store/tradingStore'
import { formatCurrency } from '@/lib/api/trading'
import { formatDate, downloadJSON } from '@/lib/utils'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'trade' | 'fee' | 'transfer'
  asset: string
  amount: number
  fee: number
  status: 'completed' | 'pending' | 'failed' | 'cancelled'
  timestamp: string
  txHash?: string
  description: string
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    asset: 'USDT',
    amount: 1000,
    fee: 0,
    status: 'completed',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    txHash: '0x1234...5678',
    description: 'Deposit from external wallet',
  },
  {
    id: '2',
    type: 'trade',
    asset: 'BTC',
    amount: 0.023,
    fee: 0.00001,
    status: 'completed',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    description: 'Buy BTC/USDT @ 43,250.50',
  },
  {
    id: '3',
    type: 'withdrawal',
    asset: 'USDT',
    amount: 500,
    fee: 2,
    status: 'pending',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    txHash: '0xabcd...efgh',
    description: 'Withdrawal to external wallet',
  },
  {
    id: '4',
    type: 'fee',
    asset: 'USDT',
    amount: -5.25,
    fee: 0,
    status: 'completed',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    description: 'Trading fee',
  },
]

export default function TransactionsPage() {
  const { selectedAccount } = useTradingStore()
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    type: 'all',
    asset: 'all',
    status: 'all',
    search: '',
    dateRange: '30d',
  })

  const handleExport = () => {
    const exportData = transactions.map(tx => ({
      Date: formatDate(tx.timestamp, 'long'),
      Type: tx.type,
      Asset: tx.asset,
      Amount: tx.amount,
      Fee: tx.fee,
      Status: tx.status,
      Description: tx.description,
      'Transaction Hash': tx.txHash || '-',
    }))
    
    downloadJSON(exportData, `transactions-${new Date().toISOString().split('T')[0]}.json`)
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filters.type !== 'all' && tx.type !== filters.type) return false
    if (filters.asset !== 'all' && tx.asset !== filters.asset) return false
    if (filters.status !== 'all' && tx.status !== filters.status) return false
    if (filters.search && !tx.description.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const getTransactionIcon = (type: Transaction['type']) => {
    const icons = {
      deposit: '↓',
      withdrawal: '↑',
      trade: '↔',
      fee: '💰',
      transfer: '→',
    }
    return icons[type]
  }

  const getStatusBadge = (status: Transaction['status']) => {
    const variants: Record<Transaction['status'], 'default' | 'success' | 'destructive' | 'secondary'> = {
      completed: 'success',
      pending: 'default',
      failed: 'destructive',
      cancelled: 'secondary',
    }
    
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage your transaction history
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter transactions by type, asset, status, or date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deposit">Deposits</SelectItem>
                  <SelectItem value="withdrawal">Withdrawals</SelectItem>
                  <SelectItem value="trade">Trades</SelectItem>
                  <SelectItem value="fee">Fees</SelectItem>
                  <SelectItem value="transfer">Transfers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Asset</Label>
              <Select value={filters.asset} onValueChange={(value) => setFilters({ ...filters, asset: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assets</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="BNB">BNB</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-9"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transactions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Fee</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>TX Hash</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">
                        {formatDate(tx.timestamp, 'time')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTransactionIcon(tx.type)}</span>
                          <span className="capitalize">{tx.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{tx.asset}</TableCell>
                      <TableCell className={`text-right font-mono ${tx.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {tx.amount >= 0 ? '+' : ''}{tx.amount}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {tx.fee > 0 ? `-${tx.fee}` : '-'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {tx.description}
                      </TableCell>
                      <TableCell>
                        {tx.txHash ? (
                          <Button variant="link" size="sm" className="p-0 h-auto font-mono">
                            {tx.txHash}
                          </Button>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}