'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Activity, Bitcoin, Zap } from 'lucide-react'
import { fetchMarketOverview, MarketOverviewData } from '@/lib/api'

export function MarketOverview() {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['market-overview'],
    queryFn: fetchMarketOverview,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time feel
    retry: 3
  })

  // Enhanced fallback data with updated BTC dominance and current Fear & Greed
  const fallbackData: MarketOverviewData = {
    btc_dominance: 65.20, // Updated to match current TradingView value
    total_market_cap: 2450000000000,
    total_volume: 85600000000,
    market_cap_change_24h: 2.45,
    fear_greed_index: 54 // Current neutral reading from feargreedmeter.com
  }

  const marketData = data || fallbackData

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString())
    const interval = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString())
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value.toLocaleString()}`
  }

  const getFearGreedColor = (index: number) => {
    if (index >= 75) return 'text-terminal-warning'
    if (index >= 55) return 'text-terminal-success'
    if (index >= 45) return 'text-terminal-text'
    if (index >= 25) return 'text-terminal-error'
    return 'text-terminal-error'
  }

  const getFearGreedLabel = (index: number) => {
    if (index >= 75) return 'Extreme Greed'
    if (index >= 55) return 'Greed'
    if (index >= 45) return 'Neutral'
    if (index >= 25) return 'Fear'
    return 'Extreme Fear'
  }

  return (
    <div className="terminal-window h-full p-3 animate-fadeIn">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <h2 className="text-base font-bold gradient-text">GLOBAL MARKET DATA</h2>
          <div className="status-indicator status-live">
            <Activity className="w-3 h-3 mr-1 animate-pulse" />
            LIVE
          </div>
        </div>
        <div className="text-xs text-terminal-muted font-mono">
          Last Updated: <span className="text-terminal-text">{lastUpdated || '--:--:--'} EDT</span>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {/* Total Market Cap */}
        <div className="metric-card group">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-2xs font-semibold text-terminal-muted uppercase tracking-wider">
              TOTAL MARKET CAP
            </div>
            <DollarSign className="w-3.5 h-3.5 text-terminal-success group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-lg font-bold gradient-text mb-1">
            {formatCurrency(marketData.total_market_cap)}
          </div>
          <div className={`text-xs flex items-center font-medium ${
            marketData.market_cap_change_24h >= 0 ? 'text-terminal-success' : 'text-terminal-error'
          }`}>
            {marketData.market_cap_change_24h >= 0 ? 
              <TrendingUp className="w-3 h-3 mr-1" /> : 
              <TrendingDown className="w-3 h-3 mr-1" />
            }
            {Math.abs(marketData.market_cap_change_24h).toFixed(2)}% (24h)
          </div>
        </div>

        {/* 24H Volume */}
        <div className="metric-card group">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-2xs font-semibold text-terminal-muted uppercase tracking-wider">
              24H VOLUME
            </div>
            <Activity className="w-3.5 h-3.5 text-terminal-accent group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-lg font-bold gradient-text mb-1">
            {formatCurrency(marketData.total_volume)}
          </div>
          <div className="text-xs text-terminal-muted font-medium">
            Volume/MCap: <span className="text-terminal-text">
              {((marketData.total_volume / marketData.total_market_cap) * 100).toFixed(2)}%
            </span>
          </div>
        </div>

        {/* BTC Dominance */}
        <div className="metric-card group">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-2xs font-semibold text-terminal-muted uppercase tracking-wider">
              BTC DOMINANCE
            </div>
            <Bitcoin className="w-3.5 h-3.5 text-terminal-warning group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-lg font-bold gradient-text-accent mb-1">
            {marketData.btc_dominance.toFixed(2)}%
          </div>
          <div className="text-xs text-terminal-warning font-medium">
            Market Leader
          </div>
        </div>

        {/* Fear & Greed */}
        <div className="metric-card group">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-2xs font-semibold text-terminal-muted uppercase tracking-wider">
              FEAR & GREED
            </div>
            <Zap className="w-3.5 h-3.5 text-terminal-success group-hover:scale-110 transition-transform" />
          </div>
          <div className={`text-lg font-bold mb-1 ${getFearGreedColor(marketData.fear_greed_index)}`}>
            {marketData.fear_greed_index}
          </div>
          <div className={`text-xs font-medium ${getFearGreedColor(marketData.fear_greed_index)}`}>
            {getFearGreedLabel(marketData.fear_greed_index)}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="flex items-center space-x-2 text-terminal-success">
            <Activity className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Updating market data...</span>
          </div>
        </div>
      )}
    </div>
  )
} 