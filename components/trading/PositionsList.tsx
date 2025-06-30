'use client'

import { useState } from 'react'
import { MoreHorizontal, TrendingUp, TrendingDown, Edit2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTradingStore } from '@/lib/store/tradingStore'
import { formatCurrency, formatPercentage, calculatePnLPercentage } from '@/lib/api/trading'
import { PositionDto } from '@/api/types'
import { toast } from 'react-hot-toast'

interface PositionsListProps {
  positions: PositionDto[]
}

export function PositionsList({ positions }: PositionsListProps) {
  const { closePosition, updateStopLoss, updateTakeProfit } = useTradingStore()
  const [selectedPosition, setSelectedPosition] = useState<PositionDto | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editType, setEditType] = useState<'stopLoss' | 'takeProfit'>('stopLoss')
  const [editValue, setEditValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleClosePosition = async (positionId: string) => {
    if (!confirm('Are you sure you want to close this position?')) return

    try {
      setIsProcessing(true)
      await closePosition(positionId)
      toast.success('Position closed successfully')
    } catch (error) {
      toast.error('Failed to close position')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditOrder = (position: PositionDto, type: 'stopLoss' | 'takeProfit') => {
    setSelectedPosition(position)
    setEditType(type)
    setEditValue(position[type]?.toString() || '')
    setShowEditDialog(true)
  }

  const handleUpdateOrder = async () => {
    if (!selectedPosition || !editValue) return

    try {
      setIsProcessing(true)
      const price = parseFloat(editValue)
      
      if (editType === 'stopLoss') {
        await updateStopLoss(selectedPosition.id, price)
      } else {
        await updateTakeProfit(selectedPosition.id, price)
      }
      
      toast.success(`${editType === 'stopLoss' ? 'Stop loss' : 'Take profit'} updated successfully`)
      setShowEditDialog(false)
    } catch (error) {
      toast.error(`Failed to update ${editType === 'stopLoss' ? 'stop loss' : 'take profit'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const getMarginRatio = (position: PositionDto) => {
    const marginRatio = Math.abs(position.unrealizedPnL / position.margin) * 100
    return Math.min(marginRatio, 100)
  }

  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No open positions</p>
        <p className="text-sm mt-1">Open a position to start trading</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-sm text-muted-foreground">
              <th className="text-left p-2">Symbol</th>
              <th className="text-left p-2">Side</th>
              <th className="text-right p-2">Size</th>
              <th className="text-right p-2">Entry Price</th>
              <th className="text-right p-2">Mark Price</th>
              <th className="text-right p-2">Margin</th>
              <th className="text-right p-2">PnL (ROE %)</th>
              <th className="text-center p-2">SL/TP</th>
              <th className="text-center p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => {
              const pnlPercentage = calculatePnLPercentage(
                position.entryPrice,
                position.currentPrice,
                position.side === 'Long' ? 'long' : 'short',
                position.leverage
              )
              const marginRatio = getMarginRatio(position)
              const isProfit = position.unrealizedPnL >= 0

              return (
                <tr key={position.id} className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{position.symbol}</span>
                      <Badge variant="outline" className="text-xs">
                        {position.leverage}x
                      </Badge>
                    </div>
                  </td>
                  <td className="p-2">
                    <Badge
                      variant={position.side === 'Long' ? 'success' : 'destructive'}
                      className="text-xs"
                    >
                      {position.side === 'Long' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {position.side}
                    </Badge>
                  </td>
                  <td className="p-2 text-right font-mono text-sm">
                    {position.quantity.toFixed(6)}
                  </td>
                  <td className="p-2 text-right font-mono text-sm">
                    {formatCurrency(position.entryPrice)}
                  </td>
                  <td className="p-2 text-right font-mono text-sm">
                    {formatCurrency(position.currentPrice)}
                  </td>
                  <td className="p-2 text-right">
                    <div className="space-y-1">
                      <p className="font-mono text-sm">{formatCurrency(position.margin)}</p>
                      <Progress
                        value={marginRatio}
                        className="h-1"
                        indicatorClassName={marginRatio > 80 ? 'bg-destructive' : ''}
                      />
                    </div>
                  </td>
                  <td className="p-2 text-right">
                    <div className={`space-y-1 ${isProfit ? 'text-success' : 'text-destructive'}`}>
                      <p className="font-mono text-sm font-medium">
                        {formatCurrency(position.unrealizedPnL)}
                      </p>
                      <p className="text-xs">
                        ({formatPercentage(pnlPercentage)})
                      </p>
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant={position.stopLoss ? 'outline' : 'ghost'}
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleEditOrder(position, 'stopLoss')}
                      >
                        SL {position.stopLoss && `@${position.stopLoss}`}
                      </Button>
                      <Button
                        variant={position.takeProfit ? 'outline' : 'ghost'}
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleEditOrder(position, 'takeProfit')}
                      >
                        TP {position.takeProfit && `@${position.takeProfit}`}
                      </Button>
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditOrder(position, 'stopLoss')}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Stop Loss
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditOrder(position, 'takeProfit')}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Take Profit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleClosePosition(position.id)}
                          className="text-destructive"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Close Position
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit {editType === 'stopLoss' ? 'Stop Loss' : 'Take Profit'}
            </DialogTitle>
            <DialogDescription>
              Set a new {editType === 'stopLoss' ? 'stop loss' : 'take profit'} price for your position
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Enter price"
              />
            </div>
            
            {selectedPosition && (
              <div className="rounded-lg border p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Price</span>
                  <span>{formatCurrency(selectedPosition.currentPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry Price</span>
                  <span>{formatCurrency(selectedPosition.entryPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Liquidation Price</span>
                  <span className="text-destructive">
                    {formatCurrency(selectedPosition.liquidationPrice)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateOrder} loading={isProcessing}>
              Update {editType === 'stopLoss' ? 'Stop Loss' : 'Take Profit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}