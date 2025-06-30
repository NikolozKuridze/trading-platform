'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts'
import { useTheme } from 'next-themes'
import { tradingService } from '@/lib/api/trading'
import { PnLDto } from '@/api/types'

interface PortfolioChartProps {
  accountId?: string
}

export function PortfolioChart({ accountId }: PortfolioChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null)
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const loadChartData = async () => {
      try {
        setIsLoading(true)
        
        let data: any[] = []
        
        if (accountId) {
          // Load real data from API
          const endDate = new Date()
          const startDate = new Date()
          startDate.setDate(startDate.getDate() - 30)
          
          const pnlData = await tradingService.getPnL(
            accountId,
            startDate.toISOString(),
            endDate.toISOString()
          )
          
          // Convert PnL data to chart format
          let cumulativeValue = 10000 // Starting value
          data = pnlData.dailyBreakdown.map(day => {
            cumulativeValue += day.pnL
            return {
              time: day.date,
              value: cumulativeValue
            }
          })
        }
        
        // If no data, use sample data
        if (data.length === 0) {
          data = generateSampleData()
        }

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

        const areaSeries = chart.addAreaSeries({
          lineColor: '#3b82f6',
          topColor: '#3b82f680',
          bottomColor: '#3b82f610',
          lineWidth: 2,
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        })

        seriesRef.current = areaSeries
        areaSeries.setData(data)

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
      } catch (error) {
        console.error('Failed to load portfolio chart data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadChartData()
  }, [theme, accountId])

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

  if (isLoading && accountId) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <div ref={chartContainerRef} className="w-full h-[400px]" />
}

// Generate sample data for the last 30 days
function generateSampleData(): any[] {
  const data: any[] = []
  const now = new Date()
  const baseValue = 20000

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    // Generate realistic portfolio value changes
    const randomChange = (Math.random() - 0.3) * 0.02 // Bias towards growth
    const previousValue = data.length > 0 ? data[data.length - 1].value : baseValue
    const newValue = previousValue * (1 + randomChange)

    data.push({
      time: date.toISOString().split('T')[0],
      value: parseFloat(newValue.toFixed(2)),
    })
  }

  return data
}