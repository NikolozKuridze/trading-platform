'use client'

import { useEffect, useRef } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, Time } from 'lightweight-charts'
import { useTheme } from 'next-themes'
import { PnLDto } from '@/lib/types/api.types'
import { formatCurrency } from '@/lib/api/trading'

interface PnLChartProps {
  data: PnLDto
}

export function PnLChart({ data }: PnLChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const barSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!chartContainerRef.current || !data.dailyBreakdown || data.dailyBreakdown.length === 0) return

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
      height: 400,
      timeScale: {
        timeVisible: true,
        borderColor: theme === 'dark' ? '#27272a' : '#e5e5e5',
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#27272a' : '#e5e5e5',
      },
    })

    chartRef.current = chart

    // Create cumulative P&L line series
    const lineSeries = chart.addLineSeries({
      color: data.totalPnL >= 0 ? '#10b981' : '#ef4444',
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    lineSeriesRef.current = lineSeries

    // Create daily P&L histogram series
    const barSeries = chart.addHistogramSeries({
      color: '#3b82f680',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
      priceScaleId: '',
    })

    barSeriesRef.current = barSeries

    // Set price scale
    chart.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.2,
        bottom: 0.1,
      },
    })

    // Prepare data
    let cumulativePnL = 0
    const lineData = data.dailyBreakdown.map(day => {
      cumulativePnL += day.pnL
      return {
        time: day.date as Time,
        value: cumulativePnL,
      }
    })

    const barData = data.dailyBreakdown.map(day => ({
      time: day.date as Time,
      value: day.pnL,
      color: day.pnL >= 0 ? '#10b98180' : '#ef444480',
    }))

    lineSeries.setData(lineData)
    barSeries.setData(barData)

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
  }, [data, theme])

  // Update chart when theme changes
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

  if (!data.dailyBreakdown || data.dailyBreakdown.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No trading data available for the selected period
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-muted-foreground">Total P&L</p>
          <p className={`text-xl font-bold ${data.totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(data.totalPnL)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Average Daily P&L</p>
          <p className="text-xl font-bold">
            {formatCurrency(data.totalPnL / data.dailyBreakdown.length)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground">Best Day</p>
          <p className="text-xl font-bold text-success">
            {formatCurrency(Math.max(...data.dailyBreakdown.map(d => d.pnL)))}
          </p>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  )
}