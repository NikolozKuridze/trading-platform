'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Wallet, ArrowDownRight, ArrowUpRight, Copy, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useTradingStore } from '@/lib/store/tradingStore'
import { tradingService } from '@/lib/api/trading'
import { formatCurrency } from '@/lib/api/trading'
import { copyToClipboard } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { WalletDto } from '@/api/types'

export default function WalletPage() {
  const router = useRouter()
  const { selectedAccount } = useTradingStore()
  const [wallets, setWallets] = useState<WalletDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<WalletDto | null>(null)

  useEffect(() => {
    if (selectedAccount) {
      loadWallets()
    }
  }, [selectedAccount])

  const loadWallets = async () => {
    if (!selectedAccount) return

    try {
      setIsLoading(true)
      const walletsData = await tradingService.getWallets(selectedAccount.id)
      setWallets(walletsData)
      if (walletsData.length > 0 && !selectedWallet) {
        setSelectedWallet(walletsData[0])
      }
    } catch (error) {
      console.error('Failed to load wallets:', error)
      toast.error('Failed to load wallet data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyAddress = async (address: string) => {
    try {
      await copyToClipboard(address)
      toast.success('Address copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy address')
    }
  }

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.usdEquivalent, 0)

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">
            Manage your cryptocurrency assets
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/wallet/deposit')}
          >
            <ArrowDownRight className="mr-2 h-4 w-4" />
            Deposit
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/wallet/withdraw')}
          >
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Withdraw
          </Button>
        </div>
      </div>

      {/* Total Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
          <CardDescription>
            Combined value of all your cryptocurrency holdings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {formatCurrency(totalBalance)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            ≈ {(totalBalance / 43250.50).toFixed(8)} BTC
          </p>
        </CardContent>
      </Card>

      {/* Asset Tabs */}
      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Assets</CardTitle>
              <CardDescription>
                Cryptocurrency balances in your wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedWallet(wallet)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold">{wallet.currency}</span>
                      </div>
                      <div>
                        <p className="font-medium">{wallet.currency}</p>
                        <p className="text-sm text-muted-foreground">
                          {wallet.currency} Wallet
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">
                        {wallet.totalBalance.toFixed(8)} {wallet.currency}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ≈ {formatCurrency(wallet.usdEquivalent)}
                      </p>
                      {wallet.lockedBalance > 0 && (
                        <Badge variant="outline" className="mt-1">
                          {wallet.lockedBalance.toFixed(8)} locked
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}

                {wallets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No assets in your wallet. Make a deposit to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deposit Address Card */}
          {selectedWallet && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedWallet.currency} Deposit Address</CardTitle>
                <CardDescription>
                  Send only {selectedWallet.currency} to this address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <code className="text-sm break-all">
                        {/* In production, this would be a real blockchain address */}
                        0x742d35Cc6634C0532925a3b844Bc9e7595f87342
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f87342')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
                    <div className="text-center">
                      <div className="w-48 h-48 bg-muted mx-auto mb-4 rounded-lg flex items-center justify-center">
                        {/* QR Code would go here */}
                        <span className="text-muted-foreground">QR Code</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Scan to get deposit address
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
                    <p className="text-sm text-yellow-700 dark:text-yellow-500">
                      <strong>Important:</strong> Send only {selectedWallet.currency} to this address. 
                      Sending any other cryptocurrency may result in permanent loss.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Recent deposits and withdrawals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No transaction history available
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}