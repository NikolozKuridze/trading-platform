'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTradingStore } from '@/lib/store/tradingStore'
import { formatCurrency } from '@/lib/api/trading'
import { toast } from 'react-hot-toast'

const orderSchema = z.object({
  orderType: z.enum(['market', 'limit', 'stop-limit']),
  price: z.string().optional(),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Please enter a valid amount',
  }),
  total: z.string().optional(),
})

type OrderFormData = z.infer<typeof orderSchema>

export function TradePanel() {
  const { selectedAccount, placeMarketOrder, placeLimitOrder, isPlacingOrder } = useTradingStore()
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy')
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop-limit'>('limit')
  const [percentage, setPercentage] = useState(0)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      orderType: 'limit',
    },
  })

  const amount = watch('amount')
  const price = watch('price')

  // Calculate total
  const total = amount && price ? (parseFloat(amount) * parseFloat(price)).toFixed(2) : '0.00'

  // Mock balance
  const balance = orderSide === 'buy' ? 10000 : 0.5 // USDT for buy, BTC for sell

  const handlePercentageChange = (value: number[]) => {
    setPercentage(value[0])
    if (orderSide === 'buy' && price) {
      const usdtAmount = balance * (value[0] / 100)
      const btcAmount = usdtAmount / parseFloat(price)
      setValue('amount', btcAmount.toFixed(8))
    } else if (orderSide === 'sell') {
      const btcAmount = balance * (value[0] / 100)
      setValue('amount', btcAmount.toFixed(8))
    }
  }

  const onSubmit = async (data: OrderFormData) => {
    if (!selectedAccount) {
      toast.error('Please select a trading account')
      return
    }

    try {
      const quantity = parseFloat(data.amount)
      
      if (orderType === 'market') {
        await placeMarketOrder(orderSide, quantity)
        toast.success(`Market ${orderSide} order placed successfully`)
      } else if (orderType === 'limit' && data.price) {
        await placeLimitOrder(orderSide, quantity, parseFloat(data.price))
        toast.success(`Limit ${orderSide} order placed successfully`)
      }
      
      reset()
      setPercentage(0)
    } catch (error) {
      toast.error(`Failed to place ${orderSide} order`)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs value={orderSide} onValueChange={(v) => setOrderSide(v as 'buy' | 'sell')} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buy" className="data-[state=active]:text-success">
            Buy
          </TabsTrigger>
          <TabsTrigger value="sell" className="data-[state=active]:text-danger">
            Sell
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Order Type */}
            <div className="space-y-2">
              <Label>Order Type</Label>
              <Select
                value={orderType}
                onValueChange={(value) => {
                  setOrderType(value as 'market' | 'limit' | 'stop-limit')
                  setValue('orderType', value as 'market' | 'limit' | 'stop-limit')
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
                  <SelectItem value="stop-limit">Stop Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Input (for limit orders) */}
            {orderType !== 'market' && (
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('price')}
                    defaultValue="43250.50"
                  />
                  <span className="absolute right-3 top-3 text-sm text-muted-foreground">
                    USDT
                  </span>
                </div>
              </div>
            )}

            {/* Amount Input */}
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
                <span className="absolute right-3 top-3 text-sm text-muted-foreground">
                  BTC
                </span>
              </div>
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            {/* Percentage Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Amount</Label>
                <span className="text-sm text-muted-foreground">{percentage}%</span>
              </div>
              <Slider
                value={[percentage]}
                onValueChange={handlePercentageChange}
                max={100}
                step={25}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <button type="button" onClick={() => handlePercentageChange([25])}>25%</button>
                <button type="button" onClick={() => handlePercentageChange([50])}>50%</button>
                <button type="button" onClick={() => handlePercentageChange([75])}>75%</button>
                <button type="button" onClick={() => handlePercentageChange([100])}>100%</button>
              </div>
            </div>

            {/* Total */}
            <div className="space-y-2">
              <Label>Total</Label>
              <div className="relative">
                <Input
                  type="text"
                  value={total}
                  readOnly
                  className="bg-muted"
                />
                <span className="absolute right-3 top-3 text-sm text-muted-foreground">
                  USDT
                </span>
              </div>
            </div>

            {/* Balance */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Available</span>
              <span>
                {formatCurrency(balance)} {orderSide === 'buy' ? 'USDT' : 'BTC'}
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              variant={orderSide === 'buy' ? 'buy' : 'sell'}
              loading={isPlacingOrder}
            >
              {orderSide === 'buy' ? 'Buy' : 'Sell'} BTC
            </Button>
          </form>
        </div>
      </Tabs>
    </div>
  )
}