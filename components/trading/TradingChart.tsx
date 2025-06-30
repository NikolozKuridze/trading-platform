'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TradingChartProps {
  symbol: string
}

const timeframes = [
  { label: '1m', value: '1' },
  { label: '5m', value: '5' },
  { label: '15m', value: '15' },
  { label: '30m', value: '30' },
  { label: '1h', value: '60' },
  { label: '4h', value: '240' },
  { label: '1d', value: '1D' },
  { label: '1w', value: '1W' },
]

export function TradingChart({ symbol }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const { theme } = useTheme()
  const [selectedTimeframe, setSelectedTimeframe] = useState('60')
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle')

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: theme === 'dark' ? '#a1a1aa' : '#71717a',
      },
      grid: {
        vertLines: {
          color: theme === 'dark' ? '#27272a' : '#e5e5e5',
        },
        horzLines: {
          color: theme === 'dark' ? '#27272a' : '#e5e5e5',
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight - 50, // Account for toolbar
      timeScale: {
        timeVisible: true,
        borderColor: theme === 'dark' ? '#27272a' : '#e5e5e5',
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#27272a' : '#e5e5e5',
      },
    })

    chartRef.current = chart

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    })

    candlestickSeriesRef.current = candlestickSeries

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#3b82f680',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    })

    volumeSeriesRef.current = volumeSeries
    
    // Set price scale
    chart.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.7,
        bottom: 0,
      },
    })

    // Load sample data
    const data = generateCandleData()
    candlestickSeries.setData(data)
    
    const volumeData = data.map(candle => ({
      time: candle.time,
      value: Math.random() * 1000000,
      color: candle.close >= candle.open ? '#10b98180' : '#ef444480',
    }))
    volumeSeries.setData(volumeData)

    // Fit content
    chart.timeScale().fitContent()

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
      }
    }
  }, [theme])

  // Update chart colors when theme changes
  useEffect(() => {
    if (!chartRef.current) return

    chartRef.current.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: theme === 'dark' ? '#a1a1aa' : '#71717a',
      },
      grid: {
        vertLines: {
          color: theme === 'dark' ? '#27272a' : '#e5e5e5',
        },
        horzLines: {
          color: theme === 'dark' ? '#27272a' : '#e5e5e5',
        },
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#27272a' : '#e5e5e5',
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#27272a' : '#e5e5e5',
      },
    })
  }, [theme])

  return (
    <div className="h-full flex flex-col">
      {/* Chart Toolbar */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center rounded-md border">
            {timeframes.map((tf) => (
              <Button
                key={tf.value}
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-none px-3 h-8",
                  selectedTimeframe === tf.value && "bg-muted"
                )}
                onClick={() => setSelectedTimeframe(tf.value)}
              >
                {tf.label}
              </Button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center rounded-md border ml-4">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-none px-3 h-8",
                chartType === 'candle' && "bg-muted"
              )}
              onClick={() => setChartType('candle')}
            >
              Candles
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-none px-3 h-8",
                chartType === 'line' && "bg-muted"
              )}
              onClick={() => setChartType('line')}
            >
              Line
            </Button>
          </div>
        </div>

        {/* Indicators (placeholder) */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            Indicators
          </Button>
          <Button variant="ghost" size="sm">
            Settings
          </Button>
        </div>
      </div>

      {/* Chart Container */}
      <div ref={chartContainerRef} className="flex-1" />
    </div>
  )
}

// Generate sample candlestick data
function generateCandleData(): CandlestickData[] {
  const data: CandlestickData[] = []
  const now = new Date()
  let basePrice = 43250.50

  for (let i = 299; i >= 0; i--) {
    const time = new Date(now)
    time.setMinutes(time.getMinutes() - i)
    
    const volatility = 0.002 + Math.random() * 0.003
    const trend = Math.sin(i / 50) * 0.001
    
    const open = basePrice
    const change = (Math.random() - 0.5) * 2 * volatility + trend
    const high = basePrice * (1 + Math.abs(change) + Math.random() * volatility)
    const low = basePrice * (1 - Math.abs(change) - Math.random() * volatility)
    const close = basePrice * (1 + change)
    
    data.push({
      time: (time.getTime() / 1000) as Time,
      open,
      high,
      low,
      close,
    })
    
    basePrice = close
  }

  return data
}