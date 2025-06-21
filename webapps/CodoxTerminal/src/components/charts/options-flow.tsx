'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Target, Shield, Zap, AlertCircle } from 'lucide-react'

interface OptionsFlow {
  timestamp: number
  type: 'call' | 'put'
  strike: number
  premium: number
  volume: number
  openInterest: number
  impliedVolatility: number
  delta: number
  gamma: number
  theta: number
  vega: number
  sentiment: 'bullish' | 'bearish' | 'neutral'
  size: 'whale' | 'large' | 'medium' | 'small'
  exchange: string
}

interface OptionsMetrics {
  putCallRatio: number
  maxPain: number
  impliedMove: number
  skew: number
  totalVolume: number
  totalOpenInterest: number
}

export function OptionsFlow() {
  const [flows, setFlows] = useState<OptionsFlow[]>([])
  const [metrics, setMetrics] = useState<OptionsMetrics>({
    putCallRatio: 0.8,
    maxPain: 43000,
    impliedMove: 0.085,
    skew: 0.15,
    totalVolume: 0,
    totalOpenInterest: 0
  })
  const [selectedSymbol, setSelectedSymbol] = useState('BTC')
  const [timeframe, setTimeframe] = useState<'1H' | '4H' | '1D' | '7D'>('1D')
  const [filterType, setFilterType] = useState<'all' | 'calls' | 'puts' | 'whales'>('all')

  const symbols = ['BTC', 'ETH', 'SOL']
  const exchanges = ['Deribit', 'Binance', 'OKX', 'Bybit']

  useEffect(() => {
    const generateOptionsFlow = () => {
      const now = Date.now()
          const currentPrice = selectedSymbol === 'BTC' ? 106088 :
                        selectedSymbol === 'ETH' ? 2553 : 147.78
      
      const newFlows: OptionsFlow[] = []
      
      // Generate 20 recent flows
      for (let i = 0; i < 20; i++) {
        const timestamp = now - (i * 5 * 60 * 1000) // Every 5 minutes
        const type = Math.random() > 0.5 ? 'call' : 'put'
        const strikeDistance = (Math.random() - 0.5) * 0.3 // ±30% from current price
        const strike = Math.round(currentPrice * (1 + strikeDistance))
        
        const volume = Math.floor(Math.random() * 1000 + 50)
        const premium = currentPrice * 0.02 * (Math.random() + 0.5) // 1-3% of underlying
        const impliedVolatility = 0.5 + Math.random() * 0.8 // 50-130%
        
        // Greeks calculations (simplified)
        const moneyness = Math.log(currentPrice / strike)
        const delta = type === 'call' ? 
          Math.min(0.99, Math.max(0.01, 0.5 + moneyness * 2)) :
          Math.min(-0.01, Math.max(-0.99, -0.5 + moneyness * 2))
        
        const gamma = Math.exp(-Math.pow(moneyness, 2) / 2) * 0.01
        const theta = -premium * 0.02 * Math.random()
        const vega = premium * 0.1 + Math.random() * 0.05
        
        let sentiment: OptionsFlow['sentiment'] = 'neutral'
        if (type === 'call' && strike > currentPrice) sentiment = 'bullish'
        if (type === 'put' && strike < currentPrice) sentiment = 'bearish'
        if (Math.abs(strike - currentPrice) / currentPrice < 0.05) sentiment = 'neutral'
        
        const size = volume > 500 ? 'whale' : volume > 200 ? 'large' : volume > 50 ? 'medium' : 'small'
        
        newFlows.push({
          timestamp,
          type,
          strike,
          premium,
          volume,
          openInterest: Math.floor(volume * (2 + Math.random() * 3)),
          impliedVolatility,
          delta,
          gamma,
          theta,
          vega,
          sentiment,
          size,
          exchange: exchanges[Math.floor(Math.random() * exchanges.length)]
        })
      }
      
      setFlows(newFlows.sort((a, b) => b.timestamp - a.timestamp))
      
      // Calculate metrics
      const callVolume = newFlows.filter(f => f.type === 'call').reduce((sum, f) => sum + f.volume, 0)
      const putVolume = newFlows.filter(f => f.type === 'put').reduce((sum, f) => sum + f.volume, 0)
      const putCallRatio = callVolume > 0 ? putVolume / callVolume : 0
      
      const totalVolume = newFlows.reduce((sum, f) => sum + f.volume, 0)
      const totalOpenInterest = newFlows.reduce((sum, f) => sum + f.openInterest, 0)
      const avgIV = newFlows.reduce((sum, f) => sum + f.impliedVolatility, 0) / newFlows.length
      const impliedMove = avgIV * Math.sqrt(1/365) * currentPrice // Daily implied move
      
             // Max pain calculation (simplified)
       const strikes = Array.from(new Set(newFlows.map(f => f.strike))).sort((a, b) => a - b)
      let maxPain = currentPrice
      let minPain = Infinity
      
      for (const strike of strikes) {
        const callPain = newFlows
          .filter(f => f.type === 'call' && f.strike <= strike)
          .reduce((sum, f) => sum + f.openInterest * Math.max(0, strike - f.strike), 0)
        const putPain = newFlows
          .filter(f => f.type === 'put' && f.strike >= strike)
          .reduce((sum, f) => sum + f.openInterest * Math.max(0, f.strike - strike), 0)
        
        const totalPain = callPain + putPain
        if (totalPain < minPain) {
          minPain = totalPain
          maxPain = strike
        }
      }
      
      const skew = avgIV * (Math.random() - 0.5) * 0.4 // Simplified skew
      
      setMetrics({
        putCallRatio,
        maxPain,
        impliedMove,
        skew,
        totalVolume,
        totalOpenInterest
      })
    }

    generateOptionsFlow()
    const interval = setInterval(generateOptionsFlow, 10000)
    
    return () => clearInterval(interval)
  }, [selectedSymbol, timeframe])

  const getFlowColor = (flow: OptionsFlow) => {
    if (flow.sentiment === 'bullish') return 'text-green-400 border-green-400'
    if (flow.sentiment === 'bearish') return 'text-red-400 border-red-400'
    return 'text-yellow-400 border-yellow-400'
  }

  const getSizeIcon = (size: string) => {
    switch (size) {
      case 'whale': return '🐋'
      case 'large': return '🦈'
      case 'medium': return '🐟'
      case 'small': return '🐠'
      default: return '📊'
    }
  }

  const filteredFlows = flows.filter(flow => {
    if (filterType === 'calls') return flow.type === 'call'
    if (filterType === 'puts') return flow.type === 'put'
    if (filterType === 'whales') return flow.size === 'whale'
    return true
  })

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatPrice = (price: number) => {
    if (selectedSymbol === 'BTC' && price > 1000) {
      return `$${(price / 1000).toFixed(1)}K`
    }
    return `$${price.toFixed(2)}`
  }

  return (
    <div className="terminal-window h-full">
      <div className="terminal-header">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-terminal-accent" />
            <h3 className="text-lg font-bold text-terminal-text">OPTIONS FLOW</h3>
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

            {/* Filter selector */}
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as any)}
              className="terminal-input text-sm"
            >
              <option value="all">All Flows</option>
              <option value="calls">Calls Only</option>
              <option value="puts">Puts Only</option>
              <option value="whales">Whales Only</option>
            </select>

            {/* Timeframe selector */}
            <div className="flex space-x-1">
              {(['1H', '4H', '1D', '7D'] as const).map(tf => (
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
          </div>
        </div>

        {/* Options Metrics */}
        <div className="grid grid-cols-6 gap-2 mb-4">
          <div className="bg-terminal-border p-2 rounded text-center">
            <div className="text-xs text-terminal-text opacity-70">P/C Ratio</div>
            <div className={`text-lg font-bold ${
              metrics.putCallRatio > 1.2 ? 'text-red-400' :
              metrics.putCallRatio < 0.8 ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {metrics.putCallRatio.toFixed(2)}
            </div>
          </div>
          <div className="bg-terminal-border p-2 rounded text-center">
            <div className="text-xs text-terminal-text opacity-70">Max Pain</div>
            <div className="text-lg font-bold text-purple-400">
              {formatPrice(metrics.maxPain)}
            </div>
          </div>
          <div className="bg-terminal-border p-2 rounded text-center">
            <div className="text-xs text-terminal-text opacity-70">Implied Move</div>
            <div className="text-lg font-bold text-blue-400">
              {(metrics.impliedMove * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-terminal-border p-2 rounded text-center">
            <div className="text-xs text-terminal-text opacity-70">Skew</div>
            <div className={`text-lg font-bold ${
              Math.abs(metrics.skew) > 0.2 ? 'text-red-400' : 'text-green-400'
            }`}>
              {(metrics.skew * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-terminal-border p-2 rounded text-center">
            <div className="text-xs text-terminal-text opacity-70">Volume</div>
            <div className="text-lg font-bold text-terminal-accent">
              {(metrics.totalVolume / 1000).toFixed(1)}K
            </div>
          </div>
          <div className="bg-terminal-border p-2 rounded text-center">
            <div className="text-xs text-terminal-text opacity-70">Open Interest</div>
            <div className="text-lg font-bold text-terminal-warning">
              {(metrics.totalOpenInterest / 1000).toFixed(1)}K
            </div>
          </div>
        </div>
      </div>

      <div className="terminal-content">
        <div className="space-y-2 max-h-96 overflow-auto">
          {filteredFlows.map((flow, i) => (
            <div key={i} className={`flex items-center justify-between p-3 bg-terminal-border rounded border-l-4 ${getFlowColor(flow)} hover:bg-opacity-80 transition-colors`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getSizeIcon(flow.size)}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold text-sm uppercase ${
                      flow.type === 'call' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {flow.type}
                    </span>
                    <span className="text-sm text-terminal-text opacity-70">{flow.exchange}</span>
                    <span className="text-xs text-terminal-text opacity-50">{formatTime(flow.timestamp)}</span>
                  </div>
                  <div className="text-xs text-terminal-text opacity-70">
                    Strike: {formatPrice(flow.strike)} • Vol: {flow.volume} • OI: {flow.openInterest}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-center text-xs">
                <div>
                  <div className="text-terminal-text opacity-70">Premium</div>
                  <div className="font-bold text-terminal-accent">
                    ${flow.premium.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-terminal-text opacity-70">IV</div>
                  <div className="font-bold text-purple-400">
                    {(flow.impliedVolatility * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-terminal-text opacity-70">Delta</div>
                  <div className={`font-bold ${flow.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {flow.delta.toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-terminal-text opacity-70">Gamma</div>
                  <div className="font-bold text-blue-400">
                    {flow.gamma.toFixed(4)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-sm font-bold px-2 py-1 rounded ${
                  flow.sentiment === 'bullish' ? 'bg-green-500 text-white' :
                  flow.sentiment === 'bearish' ? 'bg-red-500 text-white' :
                  'bg-yellow-500 text-black'
                }`}>
                  {flow.sentiment.toUpperCase()}
                </div>
                <div className="text-xs text-terminal-text opacity-70 mt-1">
                  θ: {flow.theta.toFixed(2)} • ν: {flow.vega.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="terminal-footer mt-4">
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div className="bg-terminal-border p-2 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-terminal-text opacity-70">Bullish Flows</span>
            </div>
            <div className="font-bold text-green-400">
              {filteredFlows.filter(f => f.sentiment === 'bullish').length}
            </div>
          </div>

          <div className="bg-terminal-border p-2 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <TrendingDown className="w-3 h-3 text-red-400" />
              <span className="text-terminal-text opacity-70">Bearish Flows</span>
            </div>
            <div className="font-bold text-red-400">
              {filteredFlows.filter(f => f.sentiment === 'bearish').length}
            </div>
          </div>

          <div className="bg-terminal-border p-2 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <Shield className="w-3 h-3 text-purple-400" />
              <span className="text-terminal-text opacity-70">Whale Activity</span>
            </div>
            <div className="font-bold text-purple-400">
              {filteredFlows.filter(f => f.size === 'whale').length}
            </div>
          </div>

          <div className="bg-terminal-border p-2 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <AlertCircle className="w-3 h-3 text-yellow-400" />
              <span className="text-terminal-text opacity-70">High IV Flows</span>
            </div>
            <div className="font-bold text-yellow-400">
              {filteredFlows.filter(f => f.impliedVolatility > 1.0).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 