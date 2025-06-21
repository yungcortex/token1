'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts'
import { useQuery } from '@tanstack/react-query'
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket'

interface CandlestickData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface AdvancedCandlestickChartProps {
  symbol: string
  timeframe: string
  height?: number
}

export function AdvancedCandlestickChart({ symbol, timeframe, height = 400 }: AdvancedCandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)

  // Real-time WebSocket connection for live price updates
  const binanceSymbol = getBinanceSymbol(symbol)
  const { prices, isConnected, getPrice } = useBinanceWebSocket({
    symbols: [binanceSymbol],
    enabled: true
  })

  // Fetch real candlestick data from Binance.us
  const { data: chartData } = useQuery({
    queryKey: ['candlestick-data', symbol, timeframe],
    queryFn: () => fetchRealCandlestickData(),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for real-time updates
  })

  async function fetchRealCandlestickData(): Promise<CandlestickData[]> {
    try {
      const binanceSymbol = getBinanceSymbol(symbol)
      const interval = getBinanceInterval(timeframe)
      const limit = getDataPoints(timeframe)
      
      // Fetch real historical data from Binance.us
      const response = await fetch(
        `https://api.binance.us/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`
      )
      
      if (!response.ok) throw new Error('Binance API error')
      
      const klines = await response.json()
      
      return klines.map((kline: any[]) => ({
        time: Math.floor(kline[0] / 1000), // Convert to seconds
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5])
      }))
    } catch (error) {
      console.error('Error fetching real candlestick data:', error)
      // Fallback to generated data if API fails
      return generateFallbackData()
    }
  }

  function getBinanceSymbol(displaySymbol: string): string {
    const symbolMap: Record<string, string> = {
      'BTC/USD': 'BTCUSDT',
      'ETH/USD': 'ETHUSDT',
      'SOL/USD': 'SOLUSDT',
      'BONK/USD': 'BONKUSDT',
      'WIF/USD': 'WIFUSDT',
      'POPCAT/USD': 'POPCATUSDT'
    }
    return symbolMap[displaySymbol] || 'BTCUSDT'
  }

  function getBinanceInterval(timeframe: string): string {
    const intervalMap: Record<string, string> = {
      '1M': '1m',
      '5M': '5m',
      '15M': '15m',
      '1H': '1h',
      '4H': '4h',
      '1D': '1d',
      '1W': '1w'
    }
    return intervalMap[timeframe] || '1h'
  }

  function generateFallbackData(): CandlestickData[] {
    const data: CandlestickData[] = []
    let basePrice = getBasePrice(symbol)
    const dataPoints = getDataPoints(timeframe)
    const timeInterval = getTimeInterval(timeframe)

    for (let i = 0; i < dataPoints; i++) {
      const time = Date.now() - (dataPoints - i) * timeInterval
      const volatility = getVolatility(symbol)
      
      // Generate realistic OHLC data
      const open = basePrice
      const changePercent = (Math.random() - 0.5) * volatility
      const close = open * (1 + changePercent / 100)
      
      const highLowRange = Math.abs(close - open) * (1 + Math.random())
      const high = Math.max(open, close) + highLowRange * Math.random()
      const low = Math.min(open, close) - highLowRange * Math.random()
      
      const volume = Math.random() * 1000000 + 100000

      data.push({
        time: Math.floor(time / 1000),
        open: Number(open.toFixed(6)),
        high: Number(high.toFixed(6)),
        low: Number(low.toFixed(6)),
        close: Number(close.toFixed(6)),
        volume: Math.floor(volume)
      })

      basePrice = close * (1 + (Math.random() - 0.5) * 0.02) // 2% max change between candles
    }

    return data
  }

  function getBasePrice(symbol: string): number {
    const prices: Record<string, number> = {
      'BTC/USD': 43000,
      'ETH/USD': 2600,
      'SOL/USD': 180,
      'BONK/USD': 0.000012,
      'WIF/USD': 2.85,
      'POPCAT/USD': 1.45
    }
    return prices[symbol] || 100
  }

  function getVolatility(symbol: string): number {
    const volatilities: Record<string, number> = {
      'BTC/USD': 3,
      'ETH/USD': 4,
      'SOL/USD': 6,
      'BONK/USD': 15,
      'WIF/USD': 12,
      'POPCAT/USD': 10
    }
    return volatilities[symbol] || 5
  }

  function getDataPoints(timeframe: string): number {
    const points: Record<string, number> = {
      '1M': 60,
      '5M': 120,
      '15M': 96,
      '1H': 168,
      '4H': 180,
      '1D': 365,
      '1W': 104
    }
    return points[timeframe] || 100
  }

  function getTimeInterval(timeframe: string): number {
    const intervals: Record<string, number> = {
      '1M': 60 * 1000,
      '5M': 5 * 60 * 1000,
      '15M': 15 * 60 * 1000,
      '1H': 60 * 60 * 1000,
      '4H': 4 * 60 * 60 * 1000,
      '1D': 24 * 60 * 60 * 1000,
      '1W': 7 * 24 * 60 * 60 * 1000
    }
    return intervals[timeframe] || 60 * 1000
  }

  useEffect(() => {
    if (!chartContainerRef.current || !chartData) return

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: '#00ff00',
      },
      grid: {
        vertLines: { color: '#1a1a1a' },
        horzLines: { color: '#1a1a1a' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#00ff00',
          width: 1,
          style: 2,
        },
        horzLine: {
          color: '#00ff00',
          width: 1,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: '#1a1a1a',
        textColor: '#00ff00',
      },
      timeScale: {
        borderColor: '#1a1a1a',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
    })

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00ff41',
      downColor: '#ff0040',
      borderDownColor: '#ff0040',
      borderUpColor: '#00ff41',
      wickDownColor: '#ff0040',
      wickUpColor: '#00ff41',
    })

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    })

    // Set data
    const candlestickData = chartData.map((d: CandlestickData) => ({
      time: d.time as any,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close
    }))

    const volumeData = chartData.map((d: CandlestickData) => ({
      time: d.time as any,
      value: d.volume,
      color: d.close >= d.open ? '#00ff4120' : '#ff004020'
    }))

    candlestickSeries.setData(candlestickData)
    volumeSeries.setData(volumeData)

    chartRef.current = chart
    candlestickSeriesRef.current = candlestickSeries
    volumeSeriesRef.current = volumeSeries

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [chartData, height])

  // Real-time updates from WebSocket
  useEffect(() => {
    if (!chartData || !candlestickSeriesRef.current) return

    const livePrice = getPrice(binanceSymbol)
    if (livePrice && livePrice.price) {
      // Update the last candle with live WebSocket price
      const lastCandle = chartData[chartData.length - 1]
      const updatedCandle = {
        time: lastCandle.time as any,
        open: lastCandle.open,
        high: Math.max(lastCandle.high, livePrice.price),
        low: Math.min(lastCandle.low, livePrice.price),
        close: livePrice.price
      }

      candlestickSeriesRef.current?.update(updatedCandle)
    }
  }, [chartData, prices, binanceSymbol])

  // Fallback API updates when WebSocket is disconnected
  useEffect(() => {
    if (isConnected || !chartData || !candlestickSeriesRef.current) return

    const updateLatestCandle = async () => {
      try {
        const response = await fetch(`https://api.binance.us/api/v3/ticker/price?symbol=${binanceSymbol}`)
        
        if (response.ok) {
          const data = await response.json()
          const currentPrice = parseFloat(data.price)
          
          const lastCandle = chartData[chartData.length - 1]
          const updatedCandle = {
            time: lastCandle.time as any,
            open: lastCandle.open,
            high: Math.max(lastCandle.high, currentPrice),
            low: Math.min(lastCandle.low, currentPrice),
            close: currentPrice
          }

          candlestickSeriesRef.current?.update(updatedCandle)
        }
      } catch (error) {
        console.error('Error updating real-time candle:', error)
      }
    }

    const interval = setInterval(updateLatestCandle, 10000) // Backup every 10 seconds
    
    return () => clearInterval(interval)
  }, [chartData, isConnected, binanceSymbol])

  return (
    <div className="w-full h-full">
      <div 
        ref={chartContainerRef} 
        className="w-full"
        style={{ height: `${height}px` }}
      />
      
      {/* Chart controls overlay */}
      <div className="absolute top-2 left-2 flex space-x-2">
        <div className={`bg-terminal-border px-2 py-1 rounded text-xs ${isConnected ? 'text-terminal-success' : 'text-terminal-warning'}`}>
          <span className={isConnected ? 'text-terminal-success animate-pulse' : 'text-terminal-warning'}>●</span> 
          {isConnected ? 'LIVE' : 'API'}
        </div>
        <div className="bg-terminal-border px-2 py-1 rounded text-xs">
          {symbol} | {timeframe}
        </div>
        <div className="bg-terminal-border px-2 py-1 rounded text-xs text-terminal-muted">
          Binance.us
        </div>
      </div>

      {/* Price info overlay */}
      <div className="absolute top-2 right-2 bg-terminal-border p-2 rounded text-xs">
        <div className="text-terminal-text opacity-70">Last Price</div>
        <div className="text-lg font-bold text-terminal-text">
          ${(() => {
            const livePrice = getPrice(binanceSymbol)
            const price = livePrice?.price || chartData?.[chartData.length - 1]?.close || 0
            return price.toLocaleString(undefined, {
              minimumFractionDigits: symbol.includes('BONK') ? 8 : symbol.includes('WIF') || symbol.includes('POPCAT') ? 4 : 2
            })
          })()}
        </div>
        {(() => {
          const livePrice = getPrice(binanceSymbol)
          if (livePrice?.change24h) {
            return (
              <div className={`text-xs mt-1 ${livePrice.change24h >= 0 ? 'text-terminal-success' : 'text-red-400'}`}>
                {livePrice.change24h >= 0 ? '+' : ''}{livePrice.change24h.toFixed(2)}%
              </div>
            )
          }
          return null
        })()}
      </div>
    </div>
  )
} 