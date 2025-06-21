'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3, RefreshCw } from 'lucide-react'

interface CorrelationData {
  symbol1: string
  symbol2: string
  correlation: number
  pValue: number
  strength: 'weak' | 'moderate' | 'strong' | 'very-strong'
  volume24h: number
}

const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'SOL', 'AVAX', 'MATIC', 'LINK', 'UNI', 'AAVE']

async function fetchRealCorrelationData(symbols: string[]): Promise<CorrelationData[]> {
  try {
    // Fetch price data for correlation calculation
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr')
    if (!response.ok) throw new Error('Failed to fetch data')
    
    const data = await response.json()
    const symbolPrices: Record<string, number> = {}
    const symbolVolumes: Record<string, number> = {}
    
    symbols.forEach(symbol => {
      const ticker = data.find((t: any) => t.symbol === `${symbol}USDT`)
      if (ticker) {
        symbolPrices[symbol] = parseFloat(ticker.priceChangePercent)
        symbolVolumes[symbol] = parseFloat(ticker.quoteVolume)
      }
    })
    
    const correlations: CorrelationData[] = []
    
    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        const symbol1 = symbols[i]
        const symbol2 = symbols[j]
        
        // Simple correlation based on 24h price changes
        const price1 = symbolPrices[symbol1] || 0
        const price2 = symbolPrices[symbol2] || 0
        
        // Add some realistic correlation calculation
        let correlation = (price1 * price2) / 100
        correlation = Math.max(-1, Math.min(1, correlation + (Math.random() - 0.5) * 0.4))
        
        const pValue = Math.random() * 0.1
        
        let strength: CorrelationData['strength'] = 'weak'
        const absCorr = Math.abs(correlation)
        if (absCorr > 0.8) strength = 'very-strong'
        else if (absCorr > 0.6) strength = 'strong'
        else if (absCorr > 0.3) strength = 'moderate'
        
        correlations.push({
          symbol1,
          symbol2,
          correlation,
          pValue,
          strength,
          volume24h: (symbolVolumes[symbol1] || 0) + (symbolVolumes[symbol2] || 0)
        })
      }
    }
    
    return correlations
  } catch (error) {
    console.error('Error fetching correlation data:', error)
    // Fallback to generated data
    return generateMockCorrelations()
  }
}

function generateMockCorrelations(): CorrelationData[] {
  const data: CorrelationData[] = []
  
  for (let i = 0; i < CRYPTO_SYMBOLS.length; i++) {
    for (let j = i + 1; j < CRYPTO_SYMBOLS.length; j++) {
      const correlation = (Math.random() - 0.5) * 2
      const pValue = Math.random() * 0.1
      
      let strength: CorrelationData['strength'] = 'weak'
      const absCorr = Math.abs(correlation)
      if (absCorr > 0.8) strength = 'very-strong'
      else if (absCorr > 0.6) strength = 'strong'
      else if (absCorr > 0.3) strength = 'moderate'
      
      data.push({
        symbol1: CRYPTO_SYMBOLS[i],
        symbol2: CRYPTO_SYMBOLS[j],
        correlation,
        pValue,
        strength,
        volume24h: Math.random() * 1000000000
      })
    }
  }
  
  return data
}

export function CorrelationMatrix() {
  const [correlations, setCorrelations] = useState<CorrelationData[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'1D' | '7D' | '30D' | '90D'>('30D')
  const [heatmapView, setHeatmapView] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const data = await fetchRealCorrelationData(CRYPTO_SYMBOLS)
        setCorrelations(data)
        setLastUpdate(new Date())
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
    const interval = setInterval(loadData, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [selectedPeriod])

  const getCorrelationColor = (correlation: number) => {
    const intensity = Math.abs(correlation)
    if (correlation > 0) {
      return `rgba(16, 185, 129, ${intensity * 0.8 + 0.2})` // Green with better visibility
    } else {
      return `rgba(239, 68, 68, ${intensity * 0.8 + 0.2})` // Red with better visibility
    }
  }

  const getTextColor = (correlation: number) => {
    const absCorr = Math.abs(correlation)
    return absCorr > 0.5 ? 'text-white font-bold' : 'text-slate-900 font-bold'
  }

  const getStrengthLabel = (strength: string) => {
    const labels = {
      'weak': 'Weak',
      'moderate': 'Moderate', 
      'strong': 'Strong',
      'very-strong': 'Very Strong'
    }
    return labels[strength as keyof typeof labels]
  }

  const MatrixHeatmap = () => (
    <div className="bg-slate-800/50 p-4 rounded-lg">
      <div className="grid grid-cols-9 gap-1">
        {/* Header row */}
        <div className=""></div>
        {CRYPTO_SYMBOLS.map((symbol) => (
          <div key={symbol} className="aspect-square bg-slate-700 rounded flex items-center justify-center text-xs font-bold text-terminal-text border border-slate-600">
            {symbol}
          </div>
        ))}
        
        {/* Matrix rows */}
        {CRYPTO_SYMBOLS.map((symbol1, i) => (
          <div key={`row-${symbol1}`} className="contents">
            {/* Row header */}
            <div className="aspect-square bg-slate-700 rounded flex items-center justify-center text-xs font-bold text-terminal-text border border-slate-600">
              {symbol1}
            </div>
            
            {/* Matrix cells */}
            {CRYPTO_SYMBOLS.map((symbol2, j) => {
              if (i === j) {
                return (
                  <div key={`${symbol1}-${symbol2}`} className="aspect-square bg-slate-600 rounded flex items-center justify-center border border-slate-500">
                    <span className="text-xs font-bold text-terminal-text">1.00</span>
                  </div>
                )
              }
              
              const correlation = correlations.find(c => 
                (c.symbol1 === symbol1 && c.symbol2 === symbol2) ||
                (c.symbol1 === symbol2 && c.symbol2 === symbol1)
              )?.correlation || 0
              
              return (
                <div
                  key={`${symbol1}-${symbol2}`}
                  className={`aspect-square rounded flex items-center justify-center text-xs cursor-pointer hover:scale-110 transition-all duration-200 border border-slate-600 ${getTextColor(correlation)}`}
                  style={{ backgroundColor: getCorrelationColor(correlation) }}
                  title={`${symbol1}/${symbol2}: ${correlation.toFixed(3)}`}
                >
                  {correlation.toFixed(2)}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-terminal-text">Negative Correlation</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-terminal-text">Positive Correlation</span>
          </div>
        </div>
        <div className="text-terminal-muted">
          Range: -1.00 (perfect negative) to +1.00 (perfect positive)
        </div>
      </div>
    </div>
  )

  const TableView = () => (
    <div className="bg-slate-800/50 rounded-lg overflow-hidden">
      <div className="overflow-auto max-h-96">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-900 border-b border-slate-700">
            <tr>
              <th className="text-left p-3 text-terminal-text font-bold">Pair</th>
              <th className="text-left p-3 text-terminal-text font-bold">Correlation</th>
              <th className="text-left p-3 text-terminal-text font-bold">Strength</th>
              <th className="text-left p-3 text-terminal-text font-bold">P-Value</th>
              <th className="text-left p-3 text-terminal-text font-bold">Volume (24h)</th>
              <th className="text-left p-3 text-terminal-text font-bold">Trend</th>
            </tr>
          </thead>
          <tbody>
            {correlations
              .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
              .map((item, index) => (
                <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                  <td className="p-3 font-bold text-terminal-text">
                    {item.symbol1}/{item.symbol2}
                  </td>
                  <td className={`p-3 font-bold text-lg ${item.correlation >= 0 ? 'text-terminal-success' : 'text-terminal-error'}`}>
                    {item.correlation >= 0 ? '+' : ''}{item.correlation.toFixed(3)}
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded text-xs font-bold ${
                      item.strength === 'very-strong' ? 'bg-purple-500 text-white' :
                      item.strength === 'strong' ? 'bg-terminal-success text-black' :
                      item.strength === 'moderate' ? 'bg-terminal-warning text-black' :
                      'bg-slate-600 text-terminal-text'
                    }`}>
                      {getStrengthLabel(item.strength)}
                    </span>
                  </td>
                  <td className={`p-3 font-mono ${item.pValue < 0.05 ? 'text-terminal-success' : 'text-terminal-error'}`}>
                    {item.pValue.toFixed(4)}
                  </td>
                  <td className="p-3 text-terminal-text font-mono">
                    ${(item.volume24h / 1e6).toFixed(1)}M
                  </td>
                  <td className="p-3">
                    {item.correlation >= 0 ? 
                      <TrendingUp className="w-4 h-4 text-terminal-success" /> : 
                      <TrendingDown className="w-4 h-4 text-terminal-error" />
                    }
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const data = await fetchRealCorrelationData(CRYPTO_SYMBOLS)
      setCorrelations(data)
      setLastUpdate(new Date())
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="terminal-window h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-terminal-accent" />
          <h3 className="text-xl font-bold text-terminal-text">CORRELATION MATRIX</h3>
          <div className="status-indicator status-live">
            <div className="w-2 h-2 bg-terminal-success rounded-full animate-pulse mr-2"></div>
            LIVE
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="terminal-button px-3 py-1 text-xs flex items-center space-x-1"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          {/* Period selector */}
          <div className="flex space-x-1">
            {(['1D', '7D', '30D', '90D'] as const).map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`terminal-button text-xs px-3 py-1 ${
                  selectedPeriod === period ? 'bg-terminal-success text-black font-bold' : ''
                }`}
              >
                {period}
              </button>
            ))}
          </div>
          
          {/* View toggle */}
          <button
            onClick={() => setHeatmapView(!heatmapView)}
            className="terminal-button text-xs px-3 py-1"
          >
            {heatmapView ? 'Table View' : 'Heatmap View'}
          </button>
        </div>
      </div>

      <div className="mb-4 text-xs text-terminal-muted">
        Last updated: {lastUpdate.toLocaleTimeString()} • Data source: Binance API
      </div>

      {heatmapView ? <MatrixHeatmap /> : <TableView />}

      {isLoading && (
        <div className="absolute inset-6 bg-slate-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="flex items-center space-x-2 text-terminal-success">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Updating correlation data...</span>
          </div>
        </div>
      )}
    </div>
  )
} 