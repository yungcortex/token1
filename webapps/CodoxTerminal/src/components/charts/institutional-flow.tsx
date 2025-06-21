'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Building2, Briefcase, ArrowUpDown, DollarSign } from 'lucide-react'

interface InstitutionalFlow {
  timestamp: number
  entity: string
  type: 'ETF' | 'Corporate' | 'Fund' | 'Exchange'
  action: 'buy' | 'sell' | 'hold'
  amount: number // in BTC
  value: number // in USD
  impact: 'high' | 'medium' | 'low'
  confidence: number // 0-100
}

interface EntityMetrics {
  entity: string
  totalHoldings: number
  weeklyFlow: number
  avgPurchasePrice: number
  unrealizedPnL: number
  marketShare: number
}

export function InstitutionalFlow() {
  const [flows, setFlows] = useState<InstitutionalFlow[]>([])
  const [entityMetrics, setEntityMetrics] = useState<EntityMetrics[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '7D' | '30D' | '90D'>('7D')
  const [filterType, setFilterType] = useState<'all' | 'ETF' | 'Corporate' | 'Fund'>('all')
  const [sortBy, setSortBy] = useState<'time' | 'impact' | 'amount'>('time')

  const entities = [
    { name: 'BlackRock IBIT', type: 'ETF', holdings: 234567 },
    { name: 'Fidelity FBTC', type: 'ETF', holdings: 156789 },
    { name: 'Grayscale GBTC', type: 'Fund', holdings: 634234 },
    { name: 'MicroStrategy', type: 'Corporate', holdings: 174530 },
    { name: 'Tesla', type: 'Corporate', holdings: 43200 },
    { name: 'Coinbase', type: 'Exchange', holdings: 987654 },
    { name: 'ARK Invest', type: 'Fund', holdings: 89456 },
    { name: 'VanEck HODL', type: 'ETF', holdings: 78234 }
  ]

  useEffect(() => {
    const generateInstitutionalData = () => {
      const now = Date.now()
      const newFlows: InstitutionalFlow[] = []
      
      // Generate recent flows
      for (let i = 0; i < 20; i++) {
        const timestamp = now - (i * 2 * 60 * 60 * 1000) // Every 2 hours
        const entity = entities[Math.floor(Math.random() * entities.length)]
        const btcPrice = 106088 + (Math.random() - 0.5) * 5000
        
        // More buying during bull markets, more selling during bear
        const marketSentiment = 0.6 // Slightly bullish
        const action = Math.random() < marketSentiment ? 'buy' : 
                      Math.random() < 0.3 ? 'sell' : 'hold'
        
        if (action === 'hold') continue
        
        const amount = action === 'buy' ? 
          Math.random() * 500 + 50 : // 50-550 BTC buys
          Math.random() * 300 + 30   // 30-330 BTC sells
        
        const value = amount * btcPrice
        
        let impact: InstitutionalFlow['impact'] = 'low'
        if (amount > 300) impact = 'high'
        else if (amount > 150) impact = 'medium'
        
        const confidence = 70 + Math.random() * 30 // 70-100% confidence
        
        newFlows.push({
          timestamp,
          entity: entity.name,
          type: entity.type as InstitutionalFlow['type'],
          action,
          amount,
          value,
          impact,
          confidence
        })
      }
      
      setFlows(newFlows.sort((a, b) => b.timestamp - a.timestamp))
      
      // Generate entity metrics
      const metrics: EntityMetrics[] = entities.map(entity => {
        const entityFlows = newFlows.filter(f => f.entity === entity.name)
        const weeklyFlow = entityFlows.reduce((sum, f) => {
          return sum + (f.action === 'buy' ? f.amount : -f.amount)
        }, 0)
        
            const totalMarketCap = 21000000 * 106088 // Total BTC value
    const entityValue = entity.holdings * 106088
        const marketShare = (entityValue / totalMarketCap) * 100
        
        const avgPurchasePrice = 35000 + Math.random() * 15000 // Random historical average
        const unrealizedPnL = ((106088 - avgPurchasePrice) / avgPurchasePrice) * 100
        
        return {
          entity: entity.name,
          totalHoldings: entity.holdings,
          weeklyFlow,
          avgPurchasePrice,
          unrealizedPnL,
          marketShare
        }
      })
      
      setEntityMetrics(metrics.sort((a, b) => b.totalHoldings - a.totalHoldings))
    }

    generateInstitutionalData()
    const interval = setInterval(generateInstitutionalData, 20000)
    
    return () => clearInterval(interval)
  }, [selectedTimeframe])

  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy': return 'text-green-400 border-green-400'
      case 'sell': return 'text-red-400 border-red-400'
      default: return 'text-yellow-400 border-yellow-400'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return '🔥'
      case 'medium': return '⚡'
      case 'low': return '💧'
      default: return '📊'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ETF': return '🏦'
      case 'Corporate': return '🏢'
      case 'Fund': return '💼'
      case 'Exchange': return '🔄'
      default: return '📈'
    }
  }

  const filteredFlows = flows
    .filter(flow => filterType === 'all' || flow.type === filterType)
    .sort((a, b) => {
      switch (sortBy) {
        case 'time': return b.timestamp - a.timestamp
        case 'impact': 
          const impactOrder = { high: 3, medium: 2, low: 1 }
          return impactOrder[b.impact] - impactOrder[a.impact]
        case 'amount': return b.amount - a.amount
        default: return b.timestamp - a.timestamp
      }
    })

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatBTC = (amount: number) => {
    return `${amount.toFixed(2)} BTC`
  }

  const formatUSD = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`
    return `$${amount.toFixed(2)}`
  }

  const totalBuyVolume = flows.filter(f => f.action === 'buy').reduce((sum, f) => sum + f.value, 0)
  const totalSellVolume = flows.filter(f => f.action === 'sell').reduce((sum, f) => sum + f.value, 0)
  const netFlow = totalBuyVolume - totalSellVolume

  return (
    <div className="terminal-window h-full">
      <div className="terminal-header">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-terminal-accent" />
            <h3 className="text-lg font-bold text-terminal-text">INSTITUTIONAL FLOW</h3>
            <div className="animate-pulse">
              <span className="text-terminal-success">●</span> LIVE
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Filter selector */}
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as any)}
              className="terminal-input text-sm"
            >
              <option value="all">All Types</option>
              <option value="ETF">ETFs</option>
              <option value="Corporate">Corporate</option>
              <option value="Fund">Funds</option>
            </select>

            {/* Sort selector */}
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="terminal-input text-sm"
            >
              <option value="time">Sort by Time</option>
              <option value="impact">Sort by Impact</option>
              <option value="amount">Sort by Amount</option>
            </select>

            {/* Timeframe selector */}
            <div className="flex space-x-1">
              {(['1D', '7D', '30D', '90D'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`terminal-button text-xs px-2 py-1 ${
                    selectedTimeframe === tf ? 'bg-terminal-success text-black' : ''
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Flow Summary */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-terminal-border p-3 rounded text-center">
            <div className="text-xs text-terminal-text opacity-70">Net Flow</div>
            <div className={`text-lg font-bold ${netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatUSD(Math.abs(netFlow))}
            </div>
            <div className="text-xs text-terminal-text opacity-60">
              {netFlow >= 0 ? 'NET BUYING' : 'NET SELLING'}
            </div>
          </div>
          <div className="bg-terminal-border p-3 rounded text-center">
            <div className="text-xs text-terminal-text opacity-70">Buy Volume</div>
            <div className="text-lg font-bold text-green-400">
              {formatUSD(totalBuyVolume)}
            </div>
          </div>
          <div className="bg-terminal-border p-3 rounded text-center">
            <div className="text-xs text-terminal-text opacity-70">Sell Volume</div>
            <div className="text-lg font-bold text-red-400">
              {formatUSD(totalSellVolume)}
            </div>
          </div>
          <div className="bg-terminal-border p-3 rounded text-center">
            <div className="text-xs text-terminal-text opacity-70">Active Entities</div>
            <div className="text-lg font-bold text-blue-400">
              {new Set(flows.map(f => f.entity)).size}
            </div>
          </div>
        </div>
      </div>

      <div className="terminal-content">
        <div className="grid grid-cols-2 gap-4 h-80">
          {/* Recent Flows */}
          <div>
            <h4 className="text-sm font-bold mb-3 flex items-center space-x-1">
              <ArrowUpDown className="w-4 h-4" />
              <span>RECENT FLOWS</span>
            </h4>
            <div className="space-y-2 max-h-64 overflow-auto">
              {filteredFlows.slice(0, 10).map((flow, i) => (
                <div key={i} className={`flex items-center justify-between p-2 bg-terminal-border rounded border-l-4 ${getActionColor(flow.action)} hover:bg-opacity-80 transition-colors`}>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTypeIcon(flow.type)}</span>
                    <span className="text-lg">{getImpactIcon(flow.impact)}</span>
                    <div>
                      <div className="font-bold text-sm">{flow.entity}</div>
                      <div className="text-xs text-terminal-text opacity-70">
                        {formatTime(flow.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-sm font-bold uppercase ${
                      flow.action === 'buy' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {flow.action}
                    </div>
                    <div className="text-xs text-terminal-text opacity-70">
                      {formatBTC(flow.amount)}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-bold text-terminal-accent">
                      {formatUSD(flow.value)}
                    </div>
                    <div className="text-xs text-terminal-text opacity-70">
                      {flow.confidence.toFixed(0)}% conf
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Entity Holdings */}
          <div>
            <h4 className="text-sm font-bold mb-3 flex items-center space-x-1">
              <Briefcase className="w-4 h-4" />
              <span>TOP HOLDERS</span>
            </h4>
            <div className="space-y-2 max-h-64 overflow-auto">
              {entityMetrics.slice(0, 8).map((entity, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-terminal-border rounded hover:bg-opacity-80 transition-colors">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTypeIcon(entities.find(e => e.name === entity.entity)?.type || 'Fund')}</span>
                    <div>
                      <div className="font-bold text-sm">{entity.entity}</div>
                      <div className="text-xs text-terminal-text opacity-70">
                        {formatBTC(entity.totalHoldings)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-sm font-bold ${
                      entity.weeklyFlow >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {entity.weeklyFlow >= 0 ? '+' : ''}{formatBTC(entity.weeklyFlow)}
                    </div>
                    <div className="text-xs text-terminal-text opacity-70">
                      7d flow
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-bold ${
                      entity.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {entity.unrealizedPnL >= 0 ? '+' : ''}{entity.unrealizedPnL.toFixed(1)}%
                    </div>
                    <div className="text-xs text-terminal-text opacity-70">
                      {entity.marketShare.toFixed(3)}% share
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="terminal-footer mt-4">
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div className="bg-terminal-border p-2 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-terminal-text opacity-70">Buying Pressure</span>
            </div>
            <div className="font-bold text-green-400">
              {filteredFlows.filter(f => f.action === 'buy').length}
            </div>
          </div>

          <div className="bg-terminal-border p-2 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <TrendingDown className="w-3 h-3 text-red-400" />
              <span className="text-terminal-text opacity-70">Selling Pressure</span>
            </div>
            <div className="font-bold text-red-400">
              {filteredFlows.filter(f => f.action === 'sell').length}
            </div>
          </div>

          <div className="bg-terminal-border p-2 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <Building2 className="w-3 h-3 text-blue-400" />
              <span className="text-terminal-text opacity-70">High Impact</span>
            </div>
            <div className="font-bold text-blue-400">
              {filteredFlows.filter(f => f.impact === 'high').length}
            </div>
          </div>

          <div className="bg-terminal-border p-2 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <DollarSign className="w-3 h-3 text-purple-400" />
              <span className="text-terminal-text opacity-70">Avg Confidence</span>
            </div>
            <div className="font-bold text-purple-400">
              {(filteredFlows.reduce((sum, f) => sum + f.confidence, 0) / filteredFlows.length).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 