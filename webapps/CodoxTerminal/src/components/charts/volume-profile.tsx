'use client'

import { useState, useEffect, useMemo } from 'react'
import { BarChart3, Volume2, TrendingUp, Target } from 'lucide-react'

interface VolumeLevel {
  price: number
  volume: number
  type: 'resistance' | 'support' | 'neutral'
  strength: number // 0-100
}

interface POCData {
  price: number
  volume: number
  percentage: number
}

export function VolumeProfile() {
  const [volumeLevels, setVolumeLevels] = useState<VolumeLevel[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USD')
  const [timeframe, setTimeframe] = useState<'1H' | '4H' | '1D' | '1W'>('1D')
  const [priceRange, setPriceRange] = useState({ min: 40000, max: 50000 })
  const [showPOC, setShowPOC] = useState(true)
  const [showValueArea, setShowValueArea] = useState(true)

  const symbols = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'AVAX/USD']

  // Generate mock volume profile data
  useEffect(() => {
    const generateVolumeProfile = () => {
          const currentPrice = selectedSymbol === 'BTC/USD' ? 106088 :
                        selectedSymbol === 'ETH/USD' ? 2553 :
                                                     selectedSymbol === 'SOL/USD' ? 147.78 : 35

      const range = currentPrice * 0.3 // 30% range
      const min = currentPrice - range/2
      const max = currentPrice + range/2
      setPriceRange({ min, max })

      const levels: VolumeLevel[] = []
      const priceStep = (max - min) / 50

      for (let i = 0; i < 50; i++) {
        const price = min + (i * priceStep)
        
        // Create volume distribution with peaks and valleys
        let volume = Math.random() * 1000000
        
        // Higher volume near current price
        const distanceFromCurrent = Math.abs(price - currentPrice) / currentPrice
        volume *= Math.exp(-distanceFromCurrent * 8)
        
        // Add some random peaks for support/resistance
        if (Math.random() > 0.85) {
          volume *= 2 + Math.random() * 3
        }

        // Determine type based on position relative to current price
        let type: VolumeLevel['type'] = 'neutral'
        if (price > currentPrice && volume > 500000) type = 'resistance'
        if (price < currentPrice && volume > 500000) type = 'support'

        const strength = Math.min(100, (volume / 20000))

        levels.push({
          price,
          volume,
          type,
          strength
        })
      }

      setVolumeLevels(levels.sort((a, b) => b.price - a.price))
    }

    generateVolumeProfile()
    const interval = setInterval(generateVolumeProfile, 8000)
    
    return () => clearInterval(interval)
  }, [selectedSymbol, timeframe])

  const poc = useMemo(() => {
    if (volumeLevels.length === 0) return null
    const maxVolumeLevel = volumeLevels.reduce((max, level) => 
      level.volume > max.volume ? level : max
    )
    const totalVolume = volumeLevels.reduce((sum, level) => sum + level.volume, 0)
    return {
      price: maxVolumeLevel.price,
      volume: maxVolumeLevel.volume,
      percentage: (maxVolumeLevel.volume / totalVolume) * 100
    }
  }, [volumeLevels])

  const valueArea = useMemo(() => {
    if (volumeLevels.length === 0) return null
    
    const sortedByVolume = [...volumeLevels].sort((a, b) => b.volume - a.volume)
    const totalVolume = volumeLevels.reduce((sum, level) => sum + level.volume, 0)
    const targetVolume = totalVolume * 0.7 // 70% value area
    
    let accumulatedVolume = 0
    const valueAreaLevels = []
    
    for (const level of sortedByVolume) {
      if (accumulatedVolume >= targetVolume) break
      valueAreaLevels.push(level)
      accumulatedVolume += level.volume
    }
    
    const prices = valueAreaLevels.map(l => l.price).sort((a, b) => a - b)
    return {
      high: prices[prices.length - 1],
      low: prices[0],
      levels: valueAreaLevels
    }
  }, [volumeLevels])

  const maxVolume = Math.max(...volumeLevels.map(l => l.volume))

  const formatPrice = (price: number) => {
    if (selectedSymbol.includes('BTC') || selectedSymbol.includes('ETH')) {
      return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    }
    return '$' + price.toFixed(2)
  }

  const getVolumeColor = (level: VolumeLevel) => {
    switch (level.type) {
      case 'resistance': return 'bg-red-500'
      case 'support': return 'bg-green-500' 
      default: return 'bg-terminal-accent'
    }
  }

  return (
    <div className="terminal-window h-full">
      <div className="terminal-header">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-terminal-accent" />
            <h3 className="text-lg font-bold text-terminal-text">VOLUME PROFILE</h3>
            <div className="animate-pulse">
              <span className="text-terminal-success">●</span> LIVE
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Symbol selector */}
            <select 
              value={selectedSymbol} 
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="terminal-input text-sm"
            >
              {symbols.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>

            {/* Timeframe selector */}
            <div className="flex space-x-1">
              {(['1H', '4H', '1D', '1W'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`terminal-button text-xs px-2 py-1 ${
                    timeframe === tf ? 'bg-terminal-success text-black' : ''
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Toggle options */}
            <div className="flex space-x-1">
              <button
                onClick={() => setShowPOC(!showPOC)}
                className={`terminal-button text-xs px-2 py-1 ${showPOC ? 'bg-purple-500 text-white' : ''}`}
              >
                POC
              </button>
              <button
                onClick={() => setShowValueArea(!showValueArea)}
                className={`terminal-button text-xs px-2 py-1 ${showValueArea ? 'bg-blue-500 text-white' : ''}`}
              >
                VA
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="terminal-content">
        <div className="flex h-96">
          {/* Price levels */}
          <div className="w-24 flex flex-col justify-between text-xs pr-2">
            {volumeLevels.slice(0, 10).map((level, i) => (
              <div key={i} className="text-right text-terminal-text opacity-70">
                {formatPrice(level.price)}
              </div>
            ))}
          </div>

          {/* Volume bars */}
          <div className="flex-1 relative">
            <div className="h-full flex flex-col justify-between">
              {volumeLevels.map((level, i) => (
                <div key={i} className="flex items-center h-2 relative group">
                  <div
                    className={`h-full transition-all duration-300 ${getVolumeColor(level)} opacity-80 hover:opacity-100`}
                    style={{ 
                      width: `${(level.volume / maxVolume) * 100}%`,
                      minWidth: level.volume > 0 ? '1px' : '0'
                    }}
                  />
                  
                  {/* Tooltip */}
                  <div className="absolute left-full ml-2 hidden group-hover:block bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-xs z-10">
                    <div>Price: {formatPrice(level.price)}</div>
                    <div>Volume: {(level.volume / 1000).toFixed(0)}K</div>
                    <div>Type: {level.type}</div>
                    <div>Strength: {level.strength.toFixed(0)}%</div>
                  </div>
                </div>
              ))}
            </div>

            {/* POC Line */}
            {showPOC && poc && (
              <div className="absolute left-0 right-0 border-t-2 border-purple-500 z-10" 
                   style={{ top: `${(1 - (poc.price - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%` }}>
                <div className="absolute right-0 bg-purple-500 text-white px-2 py-1 text-xs rounded-r">
                  POC: {formatPrice(poc.price)} ({poc.percentage.toFixed(1)}%)
                </div>
              </div>
            )}

            {/* Value Area */}
            {showValueArea && valueArea && (
              <>
                <div className="absolute left-0 right-0 border-t border-blue-400 opacity-50"
                     style={{ top: `${(1 - (valueArea.high - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%` }} />
                <div className="absolute left-0 right-0 border-t border-blue-400 opacity-50"
                     style={{ top: `${(1 - (valueArea.low - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%` }} />
                <div className="absolute right-0 bg-blue-400 text-white px-1 py-0.5 text-xs rounded-r"
                     style={{ top: `${(1 - (valueArea.high - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%` }}>
                  VAH
                </div>
                <div className="absolute right-0 bg-blue-400 text-white px-1 py-0.5 text-xs rounded-r"
                     style={{ top: `${(1 - (valueArea.low - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%` }}>
                  VAL
                </div>
              </>
            )}
          </div>

          {/* Volume numbers */}
          <div className="w-20 flex flex-col justify-between text-xs pl-2">
            {volumeLevels.slice(0, 10).map((level, i) => (
              <div key={i} className="text-terminal-text opacity-70">
                {(level.volume / 1000).toFixed(0)}K
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="terminal-footer mt-4">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="bg-terminal-border p-2 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <Target className="w-3 h-3 text-purple-500" />
              <span className="text-terminal-text opacity-70">Point of Control</span>
            </div>
            <div className="font-bold text-purple-400">
              {poc ? formatPrice(poc.price) : 'N/A'}
            </div>
            <div className="text-xs text-terminal-text opacity-60">
              {poc ? `${poc.percentage.toFixed(1)}% of volume` : ''}
            </div>
          </div>

          <div className="bg-terminal-border p-2 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <BarChart3 className="w-3 h-3 text-blue-400" />
              <span className="text-terminal-text opacity-70">Value Area</span>
            </div>
            <div className="font-bold text-blue-400">
              {valueArea ? `${formatPrice(valueArea.low)} - ${formatPrice(valueArea.high)}` : 'N/A'}
            </div>
            <div className="text-xs text-terminal-text opacity-60">
              70% volume range
            </div>
          </div>

          <div className="bg-terminal-border p-2 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <TrendingUp className="w-3 h-3 text-terminal-success" />
              <span className="text-terminal-text opacity-70">Key Levels</span>
            </div>
            <div className="font-bold text-terminal-success">
              S: {volumeLevels.filter(l => l.type === 'support').length}
            </div>
            <div className="font-bold text-terminal-error">
              R: {volumeLevels.filter(l => l.type === 'resistance').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 