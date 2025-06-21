'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

interface LiquidationData {
  symbol: string
  price: number
  side: 'long' | 'short'
  amount: number
  timestamp: number
  leverage: number
}

interface LiquidationLevel {
  price: number
  longLiquidity: number
  shortLiquidity: number
  netLiquidity: number
}

export function LiquidationHeatmap() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USD')
  const [timeRange, setTimeRange] = useState('1H')

  const symbols = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'BONK/USD', 'WIF/USD']
  const timeRanges = ['5M', '15M', '1H', '4H', '1D']

  // Generate liquidation data
  const { data: liquidationData } = useQuery({
    queryKey: ['liquidation-data', selectedSymbol, timeRange],
    queryFn: () => generateLiquidationData(selectedSymbol),
    refetchInterval: 5000, // Update every 5 seconds
  })

  function generateLiquidationData(symbol: string): {
    recentLiquidations: LiquidationData[]
    heatmapLevels: LiquidationLevel[]
    totalLongLiq: number
    totalShortLiq: number
  } {
    const basePrice = getBasePrice(symbol)
    const recentLiquidations: LiquidationData[] = []
    const heatmapLevels: LiquidationLevel[] = []

    // Generate recent liquidations
    for (let i = 0; i < 20; i++) {
      const side = Math.random() > 0.6 ? 'long' : 'short' // More long liquidations
      const price = basePrice * (1 + (Math.random() - 0.5) * 0.1)
      const amount = Math.random() * 500000 + 10000
      const leverage = Math.floor(Math.random() * 20) + 5

      recentLiquidations.push({
        symbol,
        price,
        side,
        amount,
        timestamp: Date.now() - i * 60000,
        leverage
      })
    }

    // Generate heatmap levels
    for (let i = -10; i <= 10; i++) {
      const price = basePrice * (1 + (i * 0.02)) // ±2% price levels
      const longLiquidity = Math.random() * 2000000 + 100000
      const shortLiquidity = Math.random() * 1500000 + 50000
      
      heatmapLevels.push({
        price,
        longLiquidity,
        shortLiquidity,
        netLiquidity: longLiquidity - shortLiquidity
      })
    }

    const totalLongLiq = heatmapLevels.reduce((sum, level) => sum + level.longLiquidity, 0)
    const totalShortLiq = heatmapLevels.reduce((sum, level) => sum + level.shortLiquidity, 0)

    return {
      recentLiquidations,
      heatmapLevels: heatmapLevels.sort((a, b) => b.price - a.price),
      totalLongLiq,
      totalShortLiq
    }
  }

  function getBasePrice(symbol: string): number {
    const prices: Record<string, number> = {
      'BTC/USD': 43000,
      'ETH/USD': 2600,
      'SOL/USD': 180,
      'BONK/USD': 0.000012,
      'WIF/USD': 2.85
    }
    return prices[symbol] || 100
  }

  function formatCurrency(value: number, symbol: string): string {
    if (symbol.includes('BONK')) {
      return value.toFixed(8)
    }
    return value.toLocaleString(undefined, { minimumFractionDigits: 2 })
  }

  function formatAmount(amount: number): string {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount.toFixed(0)}`
  }

  if (!liquidationData) {
    return (
      <div className="terminal-window h-full flex items-center justify-center">
        <div className="terminal-loading">
          <div className="text-terminal-error">💥</div>
          <div className="mt-2">Loading Liquidation Data...</div>
        </div>
      </div>
    )
  }

  const maxLiquidity = Math.max(...liquidationData.heatmapLevels.map(level => Math.max(level.longLiquidity, level.shortLiquidity)))
  const currentPrice = getBasePrice(selectedSymbol)

  return (
    <div className="terminal-window h-full flex flex-col">
      <div className="terminal-header">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-bold text-terminal-text">💥 Liquidation Heatmap</h3>
            
            <select 
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="terminal-input text-sm"
            >
              {symbols.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>

            <div className="flex space-x-1">
              {timeRanges.map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`terminal-button text-xs px-2 py-1 ${
                    timeRange === range ? 'bg-terminal-error text-black' : ''
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-terminal-text opacity-70">Total Liquidations</div>
            <div className="text-lg font-bold">
              <span className="text-red-400">{formatAmount(liquidationData.totalLongLiq)}</span>
              <span className="text-terminal-text mx-2">|</span>
              <span className="text-green-400">{formatAmount(liquidationData.totalShortLiq)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="terminal-content flex-1 flex space-x-4">
        {/* Heatmap */}
        <div className="flex-1">
          <div className="mb-4">
            <h4 className="text-sm font-bold mb-2">Liquidation Levels</h4>
            <div className="space-y-1">
              {liquidationData.heatmapLevels.map((level, index) => {
                const isCurrentPrice = Math.abs(level.price - currentPrice) < currentPrice * 0.005
                const longIntensity = level.longLiquidity / maxLiquidity
                const shortIntensity = level.shortLiquidity / maxLiquidity
                
                return (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-2 rounded text-xs ${
                      isCurrentPrice ? 'bg-terminal-accent bg-opacity-20 border border-terminal-accent' : 'bg-terminal-border'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-16 text-right">
                        ${formatCurrency(level.price, selectedSymbol)}
                      </div>
                      {isCurrentPrice && (
                        <div className="text-terminal-accent text-xs">← CURRENT</div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Long liquidations bar */}
                      <div className="w-24 h-2 bg-terminal-bg rounded overflow-hidden">
                        <div 
                          className="h-full bg-red-500 transition-all duration-300"
                          style={{ width: `${longIntensity * 100}%` }}
                        />
                      </div>
                      
                      <div className="w-12 text-xs text-red-400 text-right">
                        {formatAmount(level.longLiquidity)}
                      </div>
                      
                      <div className="w-1 h-4 bg-terminal-border" />
                      
                      <div className="w-12 text-xs text-green-400">
                        {formatAmount(level.shortLiquidity)}
                      </div>
                      
                      {/* Short liquidations bar */}
                      <div className="w-24 h-2 bg-terminal-bg rounded overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-300"
                          style={{ width: `${shortIntensity * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent Liquidations */}
        <div className="w-80">
          <h4 className="text-sm font-bold mb-2">Recent Liquidations</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {liquidationData.recentLiquidations.map((liq, index) => (
              <div 
                key={index}
                className={`p-2 rounded text-xs border ${
                  liq.side === 'long' 
                    ? 'bg-red-500 bg-opacity-10 border-red-500' 
                    : 'bg-green-500 bg-opacity-10 border-green-500'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className={`font-bold ${liq.side === 'long' ? 'text-red-400' : 'text-green-400'}`}>
                    {liq.side.toUpperCase()}
                  </div>
                  <div className="text-terminal-text opacity-70">
                    {new Date(liq.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="mt-1">
                  <div>Price: ${formatCurrency(liq.price, selectedSymbol)}</div>
                  <div>Amount: {formatAmount(liq.amount)}</div>
                  <div>Leverage: {liq.leverage}x</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="terminal-footer mt-4 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Long Liquidations</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Short Liquidations</span>
            </div>
          </div>
          <div className="text-terminal-success">
            <span className="animate-pulse">●</span> Live Updates
          </div>
        </div>
      </div>
    </div>
  )
} 