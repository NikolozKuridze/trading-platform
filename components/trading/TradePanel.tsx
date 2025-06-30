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

interface TradePanelProps {
  baseBalance: number;
  quoteBalance: number;
  baseCurrency: string;
  quoteCurrency: string;
  onOrderPlaced: () => void;
}

export function TradePanel({ baseBalance, quoteBalance, baseCurrency, quoteCurrency, onOrderPlaced }: TradePanelProps) {
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

  // Use real balance based on order side
  const balance = orderSide === 'buy' ? quoteBalance : baseBalance;
}