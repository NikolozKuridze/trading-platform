'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Info, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTradingStore } from '@/lib/store/tradingStore'
import { tradingService } from '@/lib/api/trading'
import { copyToClipboard } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { WalletDto } from '@/api/types'

interface CryptoNetwork {
  name: string
  symbol: string
  minDeposit: number
  confirmations: number
  estimatedTime: string
  fee: number
}

const cryptoNetworks: Record<string, CryptoNetwork[]> = {
  BTC: [
    { name: 'Bitcoin Network', symbol: 'BTC', minDeposit: 0.0001, confirmations: 3, estimatedTime: '30 mins', fee: 0.00001 },
    { name: 'Lightning Network', symbol: 'BTC-LN', minDeposit: 0.00001, confirmations: 1, estimatedTime: 'Instant', fee: 0 },
  ],
  ETH: [
    { name: 'Ethereum (ERC20)', symbol: 'ETH', minDeposit: 0.01, confirmations: 12, estimatedTime: '3 mins', fee: 0.001 },
    { name: 'BNB Smart Chain (BEP20)', symbol: 'BSC', minDeposit: 0.01, confirmations: 15, estimatedTime: '5 mins', fee: 0.0005 },
  ],
  USDT: [
    { name: 'Ethereum (ERC20)', symbol: 'USDT-ERC20', minDeposit: 10, confirmations: 12, estimatedTime: '3 mins', fee: 1 },
    { name: 'Tron (TRC20)', symbol: 'USDT-TRC20', minDeposit: 10, confirmations: 20, estimatedTime: '1 min', fee: 0.1 },
    { name: 'BNB Smart Chain (BEP20)', symbol: 'USDT-BSC', minDeposit: 10, confirmations: 15, estimatedTime: '5 mins', fee: 0.5 },
  ],
}

export default function DepositPage() {
  const router = useRouter()
  const { selectedAccount } = useTradingStore()
  const [wallets, setWallets] = useState<WalletDto[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState<string>('')
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork | null>(null)
  const [depositAddress] = useState('0x742d35Cc6634C0532925a3b844Bc9e7595f87342')
  const [isLoading, setIsLoading] = useState(true)
  const [depositMethod, setDepositMethod] = useState<'crypto' | 'fiat'>('crypto')

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
      if (walletsData.length > 0) {
        setSelectedCurrency(walletsData[0].currency)
      }
    } catch (error) {
      console.error('Failed to load wallets:', error)
      toast.error('Failed to load wallet data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyAddress = async () => {
    try {
      await copyToClipboard(depositAddress)
      toast.success('Address copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy address')
    }
  }

  const availableNetworks = selectedCurrency ? cryptoNetworks[selectedCurrency] || [] : []

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/wallet')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deposit Funds</h1>
          <p className="text-muted-foreground">
            Add funds to your trading account
          </p>
        </div>
      </div>

      <Tabs value={depositMethod} onValueChange={(v) => setDepositMethod(v as 'crypto' | 'fiat')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
          <TabsTrigger value="fiat">Fiat Currency</TabsTrigger>
        </TabsList>

        <TabsContent value="crypto" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Cryptocurrency</CardTitle>
              <CardDescription>
                Choose the cryptocurrency you want to deposit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={selectedCurrency} onValueChange={(value) => {
                  setSelectedCurrency(value)
                  setSelectedNetwork(null)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.currency}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{wallet.currency}</span>
                          <span className="text-muted-foreground">
                            Balance: {wallet.totalBalance.toFixed(8)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCurrency && availableNetworks.length > 0 && (
                <div className="space-y-2">
                  <Label>Network</Label>
                  <Select value={selectedNetwork?.symbol || ''} onValueChange={(value) => {
                    const network = availableNetworks.find(n => n.symbol === value)
                    setSelectedNetwork(network || null)
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableNetworks.map((network) => (
                        <SelectItem key={network.symbol} value={network.symbol}>
                          <div className="flex items-center justify-between w-full">
                            <span>{network.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              Fee: {network.fee} {selectedCurrency}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedCurrency && selectedNetwork && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Deposit Address</CardTitle>
                  <CardDescription>
                    Send only {selectedCurrency} to this address via {selectedNetwork.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between gap-4">
                      <code className="text-sm break-all flex-1">{depositAddress}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyAddress}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
                    <div className="text-center">
                      <div className="w-48 h-48 bg-muted mx-auto mb-4 rounded-lg flex items-center justify-center">
                        <span className="text-muted-foreground">QR Code</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Scan QR code to get deposit address
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Minimum Deposit</span>
                      <span className="font-medium">
                        {selectedNetwork.minDeposit} {selectedCurrency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Network Confirmations</span>
                      <span className="font-medium">{selectedNetwork.confirmations}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Estimated Arrival Time</span>
                      <span className="font-medium">{selectedNetwork.estimatedTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Network Fee</span>
                      <span className="font-medium">
                        {selectedNetwork.fee} {selectedCurrency}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important Notes:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Send only {selectedCurrency} to this address</li>
                    <li>• Ensure you select the correct network ({selectedNetwork.name})</li>
                    <li>• Deposits below {selectedNetwork.minDeposit} {selectedCurrency} will not be credited</li>
                    <li>• Your deposit will be credited after {selectedNetwork.confirmations} network confirmations</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </>
          )}
        </TabsContent>

        <TabsContent value="fiat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fiat Deposit</CardTitle>
              <CardDescription>
                Deposit fiat currency using bank transfer or card
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Info className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Fiat currency deposits via bank transfer and credit/debit cards will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}