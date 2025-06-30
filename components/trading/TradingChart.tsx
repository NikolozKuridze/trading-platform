// components/trading/TradingChart.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { binanceService } from '@/lib/api/binance'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface TradingChartProps {
  symbol: string
}

const timeframes = [
  { label: '1m', value: '1', interval: '1m' },
  { label: '5m', value: '5', interval: '5m' },
  { label: '15m', value: '15', interval: '15m' },
  { label: '30m', value: '30', interval: '30m' },
  { label: '1h', value: '60', interval: '1h' },
  { label: '4h', value: '240', interval: '4h' },
  { label: '1d', value: '1D', interval: '1d' },
  { label: '1w', value: '1W', interval: '1w' },
]

export function TradingChart({ symbol }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const { theme } = useTheme()
  const [selectedTimeframe, setSelectedTimeframe] = useState('60')
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

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
      height: chartContainerRef.current.clientHeight - 50,
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

  // Load historical data
  useEffect(() => {
    loadHistoricalData()
    
    // Set up auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadHistoricalData(true)
    }, 10000)

    return () => clearInterval(interval)
  }, [symbol, selectedTimeframe])

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

  const loadHistoricalData = async (isUpdate = false) => {
    try {
      if (!isUpdate) {
        setIsLoading(true)
        setError(null)
      }

      // Convert symbol format (BTC/USDT -> BTCUSDT)
      const binanceSymbol = symbol.replace('/', '')
      
      // Get the interval for the selected timeframe
      const timeframeConfig = timeframes.find(tf => tf.value === selectedTimeframe)
      const interval = timeframeConfig?.interval || '1h'
      
      // Fetch data from Binance API
      const data = await binanceService.getHistoricalData(binanceSymbol, interval, 500)
      
      // Transform to candlestick data
      const candleData: CandlestickData[] = data.map((candle: any[]) => ({
        time: (candle[0] / 1000) as Time, // Convert milliseconds to seconds
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
      }))
      
      if (candlestickSeriesRef.current && candleData.length > 0) {
        candlestickSeriesRef.current.setData(candleData)
      }
      
      // Volume data
      const volumeData = data.map((candle: any[]) => ({
        time: (candle[0] / 1000) as Time,
        value: parseFloat(candle[5]),
        color: parseFloat(candle[4]) >= parseFloat(candle[1]) 
          ? '#10b98180' 
          : '#ef444480',
      }))
      
      if (volumeSeriesRef.current && volumeData.length > 0) {
        volumeSeriesRef.current.setData(volumeData)
      }
      
      // Fit content on first load
      if (!isUpdate && chartRef.current) {
        chartRef.current.timeScale().fitContent()
      }
      
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to load historical data:', error)
      setError('Failed to load chart data. Please try again.')
      
      // If loading fails, show sample data
      if (!isUpdate) {
        loadSampleData()
      }
    } finally {
      if (!isUpdate) {
        setIsLoading(false)
      }
    }
  }

  const loadSampleData = () => {
    const data = generateCandleData()
    
    if (candlestickSeriesRef.current) {
      candlestickSeriesRef.current.setData(data)
    }
    
    const volumeData = data.map(candle => ({
      time: candle.time,
      value: Math.random() * 1000000,
      color: candle.close >= candle.open ? '#10b98180' : '#ef444480',
    }))
    
    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.setData(volumeData)
    }
    
    chartRef.current?.timeScale().fitContent()
  }

  const handleTimeframeChange = (value: string) => {
    setSelectedTimeframe(value)
  }

  const handleRefresh = () => {
    loadHistoricalData()
  }

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
                onClick={() => handleTimeframeChange(tf.value)}
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

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Button variant="ghost" size="sm">
            Indicators
          </Button>
          <Button variant="ghost" size="sm">
            Settings
          </Button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <LoadingSpinner size="lg" />
          </div>
        )}
        
        {error && !isLoading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <Alert variant="destructive" className="w-fit">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  )
}

// Generate sample candlestick data (fallback)
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