'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, AlertCircle, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTradingStore } from '@/lib/store/tradingStore'
import { tradingService } from '@/lib/api/trading'
import { formatCurrency } from '@/lib/api/trading'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { WalletDto } from '@/lib/types/api.types'

interface WithdrawNetwork {
  name: string
  symbol: string
  minWithdraw: number
  maxWithdraw: number
  fee: number
  estimatedTime: string
}

const withdrawNetworks: Record<string, WithdrawNetwork[]> = {
  BTC: [
    { name: 'Bitcoin Network', symbol: 'BTC', minWithdraw: 0.001, maxWithdraw: 10, fee: 0.0005, estimatedTime: '30-60 mins' },
    { name: 'Lightning Network', symbol: 'BTC-LN', minWithdraw: 0.00001, maxWithdraw: 1, fee: 0.00001, estimatedTime: 'Instant' },
  ],
  ETH: [
    { name: 'Ethereum (ERC20)', symbol: 'ETH', minWithdraw: 0.01, maxWithdraw: 100, fee: 0.005, estimatedTime: '5-10 mins' },
    { name: 'BNB Smart Chain (BEP20)', symbol: 'BSC', minWithdraw: 0.01, maxWithdraw: 100, fee: 0.001, estimatedTime: '3-5 mins' },
  ],
  USDT: [
    { name: 'Ethereum (ERC20)', symbol: 'USDT-ERC20', minWithdraw: 20, maxWithdraw: 100000, fee: 10, estimatedTime: '5-10 mins' },
    { name: 'Tron (TRC20)', symbol: 'USDT-TRC20', minWithdraw: 10, maxWithdraw: 100000, fee: 1, estimatedTime: '1-3 mins' },
    { name: 'BNB Smart Chain (BEP20)', symbol: 'USDT-BSC', minWithdraw: 10, maxWithdraw: 100000, fee: 2, estimatedTime: '3-5 mins' },
  ],
}

const withdrawSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Please enter a valid amount',
  }),
  address: z.string().min(26, 'Please enter a valid wallet address'),
  twoFactorCode: z.string().length(6, 'Please enter a 6-digit code').optional(),
})

type WithdrawFormData = z.infer<typeof withdrawSchema>

export default function WithdrawPage() {
  const router = useRouter()
  const { selectedAccount } = useTradingStore()
  const [wallets, setWallets] = useState<WalletDto[]>([])
  const [selectedWallet, setSelectedWallet] = useState<WalletDto | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<WithdrawNetwork | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [formData, setFormData] = useState<WithdrawFormData | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<WithdrawFormData>({
    resolver: zodResolver(withdrawSchema),
  })

  const amount = watch('amount')

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
        setSelectedWallet(walletsData[0])
      }
    } catch (error) {
      console.error('Failed to load wallets:', error)
      toast.error('Failed to load wallet data')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = (data: WithdrawFormData) => {
    if (!selectedWallet || !selectedNetwork) {
      toast.error('Please select a wallet and network')
      return
    }

    const withdrawAmount = parseFloat(data.amount)
    
    if (withdrawAmount < selectedNetwork.minWithdraw) {
      toast.error(`Minimum withdrawal is ${selectedNetwork.minWithdraw} ${selectedWallet.currency}`)
      return
    }

    if (withdrawAmount > selectedNetwork.maxWithdraw) {
      toast.error(`Maximum withdrawal is ${selectedNetwork.maxWithdraw} ${selectedWallet.currency}`)
      return
    }

    if (withdrawAmount + selectedNetwork.fee > selectedWallet.availableBalance) {
      toast.error('Insufficient balance')
      return
    }

    setFormData(data)
    setShowConfirmDialog(true)
  }

  const handleConfirmWithdraw = async () => {
    if (!formData || !selectedWallet || !selectedAccount) return

    try {
      setIsWithdrawing(true)
      
      await tradingService.withdraw({
        tradingAccountId: selectedAccount.id,
        currency: selectedWallet.currency,
        amount: parseFloat(formData.amount),
      })

      toast.success('Withdrawal request submitted successfully')
      setShowConfirmDialog(false)
      reset()
      router.push('/wallet')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Withdrawal failed')
    } finally {
      setIsWithdrawing(false)
    }
  }

  const availableNetworks = selectedWallet ? withdrawNetworks[selectedWallet.currency] || [] : []
  
  const receiveAmount = amount && selectedNetwork 
    ? Math.max(0, parseFloat(amount) - selectedNetwork.fee)
    : 0

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
          <h1 className="text-3xl font-bold tracking-tight">Withdraw Funds</h1>
          <p className="text-muted-foreground">
            Withdraw cryptocurrency to external wallet
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Details</CardTitle>
            <CardDescription>
              Enter the details for your withdrawal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Currency Selection */}
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={selectedWallet?.currency || ''}
                onValueChange={(value) => {
                  const wallet = wallets.find(w => w.currency === value)
                  setSelectedWallet(wallet || null)
                  setSelectedNetwork(null)
                  reset()
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.currency}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{wallet.currency}</span>
                        <span className="text-muted-foreground ml-4">
                          Available: {wallet.availableBalance.toFixed(8)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Network Selection */}
            {selectedWallet && availableNetworks.length > 0 && (
              <div className="space-y-2">
                <Label>Network</Label>
                <Select
                  value={selectedNetwork?.symbol || ''}
                  onValueChange={(value) => {
                    const network = availableNetworks.find(n => n.symbol === value)
                    setSelectedNetwork(network || null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableNetworks.map((network) => (
                      <SelectItem key={network.symbol} value={network.symbol}>
                        <div className="flex items-center justify-between w-full">
                          <span>{network.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            Fee: {network.fee} {selectedWallet.currency}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Withdrawal Address */}
            {selectedNetwork && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="address">Withdrawal Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter wallet address"
                    {...register('address')}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address.message}</p>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      step="any"
                      placeholder="0.00"
                      {...register('amount')}
                    />
                    <div className="absolute right-3 top-3 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedWallet.currency}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const maxAmount = Math.max(0, selectedWallet.availableBalance - selectedNetwork.fee)
                          setValue('amount', maxAmount.toString())
                        }}
                      >
                        MAX
                      </Button>
                    </div>
                  </div>
                  {errors.amount && (
                    <p className="text-sm text-destructive">{errors.amount.message}</p>
                  )}
                </div>

                {/* Fee Information */}
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Withdrawal Amount</span>
                    <span>{amount || '0'} {selectedWallet.currency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Network Fee</span>
                    <span>{selectedNetwork.fee} {selectedWallet.currency}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>You will receive</span>
                    <span>{receiveAmount.toFixed(8)} {selectedWallet.currency}</span>
                  </div>
                </div>

                {/* Limits */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p>
                        <strong>Minimum withdrawal:</strong> {selectedNetwork.minWithdraw} {selectedWallet.currency}
                      </p>
                      <p>
                        <strong>Maximum withdrawal:</strong> {selectedNetwork.maxWithdraw} {selectedWallet.currency}
                      </p>
                      <p>
                        <strong>Estimated arrival:</strong> {selectedNetwork.estimatedTime}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              </>
            )}
          </CardContent>
        </Card>

        {selectedWallet && selectedNetwork && (
          <Button type="submit" size="lg" className="w-full">
            Withdraw {selectedWallet.currency}
          </Button>
        )}
      </form>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Withdrawal</DialogTitle>
            <DialogDescription>
              Please review your withdrawal details before confirming
            </DialogDescription>
          </DialogHeader>
          
          {formData && selectedWallet && selectedNetwork && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Currency</span>
                  <span>{selectedWallet.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network</span>
                  <span>{selectedNetwork.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Address</span>
                  <span className="font-mono text-xs">{formData.address.slice(0, 10)}...{formData.address.slice(-10)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span>{formData.amount} {selectedWallet.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fee</span>
                  <span>{selectedNetwork.fee} {selectedWallet.currency}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span>{(parseFloat(formData.amount) - selectedNetwork.fee).toFixed(8)} {selectedWallet.currency}</span>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please double-check the withdrawal address. Cryptocurrency transactions cannot be reversed.
                </AlertDescription>
              </Alert>

              {/* 2FA Input */}
              <div className="space-y-2">
                <Label htmlFor="twoFactorCode">Two-Factor Authentication Code</Label>
                <Input
                  id="twoFactorCode"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  {...register('twoFactorCode')}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isWithdrawing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmWithdraw}
              loading={isWithdrawing}
            >
              Confirm Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}