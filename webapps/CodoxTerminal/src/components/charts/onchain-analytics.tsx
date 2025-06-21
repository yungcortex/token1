'use client'

import { useState, useEffect } from 'react'
import { Activity, Users, Zap, DollarSign, TrendingUp, Database, RefreshCw, AlertTriangle } from 'lucide-react'

interface OnChainMetric {
  timestamp: number
  activeAddresses: number
  transactionCount: number
  transactionVolume: number
  averageTransactionSize: number
  gasUsed: number
  gasPrice: number
  newAddresses: number
  whaleTransactions: number
  exchangeInflow: number
  exchangeOutflow: number
  stakingRatio: number
}

interface NetworkHealth {
  hashrate: number
  difficulty: number
  blockTime: number
  mempool: number
  feeRate: number
  congestion: 'low' | 'medium' | 'high'
}

interface CurrentMetrics {
  activeAddresses: number
  transactionCount: number
  txVolume: number
  avgTxSize: number
  newAddresses: number
  whaleTransactions: number
  exchangeInflow: number
  exchangeOutflow: number
  networkGrowth: number
  stakingRatio: number
  gasUtilization: number
}

async function fetchOnChainData(chain: string): Promise<{
  metrics: OnChainMetric[]
  networkHealth: NetworkHealth
  currentMetrics: CurrentMetrics
}> {
  try {
    // Simulate real API call - would integrate with APIs like Glassnode, Nansen, Dune Analytics
    await new Promise(resolve => setTimeout(resolve, 150))
    
    const now = Date.now()
    const metrics: OnChainMetric[] = []
    
    // Generate realistic on-chain data for the last 24 hours
    for (let i = 23; i >= 0; i--) {
      const timestamp = now - (i * 60 * 60 * 1000)
      
      // Base values depend on chain
      let baseActiveAddresses = 800000
      let baseTxCount = 350000
      let baseTxVolume = 15000000000
      let baseGasPrice = 15
      
      if (chain === 'Ethereum') {
        baseActiveAddresses = 600000
        baseTxCount = 1200000
        baseTxVolume = 8000000000
        baseGasPrice = 25
      } else if (chain === 'Solana') {
        baseActiveAddresses = 250000
        baseTxCount = 2500000
        baseTxVolume = 1500000000
        baseGasPrice = 0.001
      }
      
      // Add realistic time-based and market variations
      const hourOfDay = new Date(timestamp).getHours()
      const dailyMultiplier = 0.7 + 0.6 * Math.sin((hourOfDay - 8) * Math.PI / 12) // Peak at 2 PM UTC
      const marketVolatility = 0.85 + Math.random() * 0.3
      const trendFactor = 1 + (Math.sin(i / 24 * Math.PI) * 0.1) // Weekly trend
      
      const totalMultiplier = dailyMultiplier * marketVolatility * trendFactor
      
      const activeAddresses = Math.floor(baseActiveAddresses * totalMultiplier)
      const transactionCount = Math.floor(baseTxCount * totalMultiplier)
      const transactionVolume = baseTxVolume * totalMultiplier
      const averageTransactionSize = transactionVolume / transactionCount
      
      const gasUsed = Math.floor(transactionCount * (200000 + Math.random() * 100000))
      const gasPrice = baseGasPrice * (0.7 + Math.random() * 0.6)
      
      const newAddresses = Math.floor(activeAddresses * (0.03 + Math.random() * 0.04))
      const whaleTransactions = Math.floor(transactionCount * (0.0008 + Math.random() * 0.0012))
      
      const exchangeInflow = transactionVolume * (0.08 + Math.random() * 0.06)
      const exchangeOutflow = transactionVolume * (0.06 + Math.random() * 0.08)
      const stakingRatio = 0.55 + Math.random() * 0.25
      
      metrics.push({
        timestamp,
        activeAddresses,
        transactionCount,
        transactionVolume,
        averageTransactionSize,
        gasUsed,
        gasPrice,
        newAddresses,
        whaleTransactions,
        exchangeInflow,
        exchangeOutflow,
        stakingRatio
      })
    }
    
    // Calculate network health
    const latestMetric = metrics[metrics.length - 1]
    const avgGasPrice = latestMetric.gasPrice
    let congestion: NetworkHealth['congestion'] = 'low'
    if (avgGasPrice > 20) congestion = 'medium'
    if (avgGasPrice > 35) congestion = 'high'
    
    const networkHealth: NetworkHealth = {
      hashrate: 450000000 * (0.95 + Math.random() * 0.1),
      difficulty: 67000000000000 * (0.98 + Math.random() * 0.04),
      blockTime: 10 + Math.random() * 2,
      mempool: Math.floor(15000 + Math.random() * 20000),
      feeRate: avgGasPrice,
      congestion
    }
    
    // Calculate current metrics with growth rates
    const previousMetric = metrics[metrics.length - 2]
    const currentMetrics: CurrentMetrics = {
      activeAddresses: latestMetric.activeAddresses,
      transactionCount: latestMetric.transactionCount,
      txVolume: latestMetric.transactionVolume,
      avgTxSize: latestMetric.averageTransactionSize,
      newAddresses: latestMetric.newAddresses,
      whaleTransactions: latestMetric.whaleTransactions,
      exchangeInflow: latestMetric.exchangeInflow,
      exchangeOutflow: latestMetric.exchangeOutflow,
      networkGrowth: previousMetric ? 
        ((latestMetric.activeAddresses - previousMetric.activeAddresses) / previousMetric.activeAddresses) * 100 : 0,
      stakingRatio: latestMetric.stakingRatio * 100,
      gasUtilization: Math.min(100, (latestMetric.gasUsed / 30000000) * 100) // Assuming 30M gas limit
    }
    
    return { metrics, networkHealth, currentMetrics }
    
  } catch (error) {
    console.error('Error fetching on-chain data:', error)
    // Fallback data
    return {
      metrics: [],
      networkHealth: {
        hashrate: 450000000,
        difficulty: 67000000000000,
        blockTime: 10.2,
        mempool: 25000,
        feeRate: 15,
        congestion: 'medium'
      },
      currentMetrics: {
        activeAddresses: 698640,
        transactionCount: 305660,
        txVolume: 13100000000,
        avgTxSize: 42860,
        newAddresses: 43220,
        whaleTransactions: 496,
        exchangeInflow: 1100000000,
        exchangeOutflow: 1300000000,
        networkGrowth: 6.19,
        stakingRatio: 68.8,
        gasUtilization: 135
      }
    }
  }
}

export function OnChainAnalytics() {
  const [metrics, setMetrics] = useState<OnChainMetric[]>([])
  const [networkHealth, setNetworkHealth] = useState<NetworkHealth>({
    hashrate: 450000000,
    difficulty: 67000000000000,
    blockTime: 10.2,
    mempool: 25000,
    feeRate: 15,
    congestion: 'medium'
  })
  const [currentMetrics, setCurrentMetrics] = useState<CurrentMetrics>({
    activeAddresses: 0,
    transactionCount: 0,
    txVolume: 0,
    avgTxSize: 0,
    newAddresses: 0,
    whaleTransactions: 0,
    exchangeInflow: 0,
    exchangeOutflow: 0,
    networkGrowth: 0,
    stakingRatio: 0,
    gasUtilization: 0
  })
  const [selectedChain, setSelectedChain] = useState('Bitcoin')
  const [timeframe, setTimeframe] = useState<'1H' | '1D' | '7D' | '30D'>('1D')
  const [selectedMetric, setSelectedMetric] = useState<'addresses' | 'volume' | 'fees' | 'whale'>('addresses')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const chains = ['Bitcoin', 'Ethereum', 'Solana', 'Polygon']
  const metricOptions = [
    { key: 'addresses', name: 'Active Addresses', icon: Users },
    { key: 'volume', name: 'Transaction Volume', icon: DollarSign },
    { key: 'fees', name: 'Network Fees', icon: Zap },
    { key: 'whale', name: 'Whale Activity', icon: TrendingUp }
  ]

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const data = await fetchOnChainData(selectedChain)
        setMetrics(data.metrics)
        setNetworkHealth(data.networkHealth)
        setCurrentMetrics(data.currentMetrics)
        setLastUpdate(new Date())
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
    const interval = setInterval(loadData, 45000) // Update every 45 seconds
    
    return () => clearInterval(interval)
  }, [selectedChain, timeframe])

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toFixed(2)
  }

  const formatHashrate = (hashrate: number) => {
    return `${(hashrate / 1e6).toFixed(0)} EH/s`
  }

  const getMetricValue = (metric: OnChainMetric) => {
    switch (selectedMetric) {
      case 'addresses': return metric.activeAddresses
      case 'volume': return metric.transactionVolume
      case 'fees': return metric.gasPrice
      case 'whale': return metric.whaleTransactions
      default: return metric.activeAddresses
    }
  }

  const getCongestionColor = (congestion: string) => {
    switch (congestion) {
      case 'low': return 'text-green-400 bg-green-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'high': return 'text-red-400 bg-red-500/20'
      default: return 'text-terminal-text bg-slate-600/20'
    }
  }

  const getChainIcon = (chain: string) => {
    switch (chain) {
      case 'Bitcoin': return '₿'
      case 'Ethereum': return 'Ξ'
      case 'Solana': return '◎'
      case 'Polygon': return '⬟'
      default: return '⚡'
    }
  }

  const getMetricChange = (current: number, previous: number) => {
    if (!previous) return 0
    return ((current - previous) / previous) * 100
  }

  const previousMetric = metrics[metrics.length - 2]
  const latestMetric = metrics[metrics.length - 1]

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const data = await fetchOnChainData(selectedChain)
      setMetrics(data.metrics)
      setNetworkHealth(data.networkHealth)
      setCurrentMetrics(data.currentMetrics)
      setLastUpdate(new Date())
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="terminal-window h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Database className="w-6 h-6 text-terminal-accent" />
          <h3 className="text-xl font-bold text-terminal-text">ON-CHAIN ANALYTICS</h3>
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
          
          {/* Chain selector */}
          <select 
            value={selectedChain} 
            onChange={(e) => setSelectedChain(e.target.value)}
            className="terminal-input text-sm px-3 py-1"
          >
            {chains.map(chain => (
              <option key={chain} value={chain}>
                {getChainIcon(chain)} {chain}
              </option>
            ))}
          </select>

          {/* Metric selector */}
          <select 
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="terminal-input text-sm px-3 py-1"
          >
            {metricOptions.map(option => (
              <option key={option.key} value={option.key}>{option.name}</option>
            ))}
          </select>

          {/* Timeframe selector */}
          <div className="flex space-x-1">
            {(['1H', '1D', '7D', '30D'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`terminal-button text-xs px-3 py-1 ${
                  timeframe === tf ? 'bg-terminal-success text-black font-bold' : ''
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 text-xs text-terminal-muted">
        Last updated: {lastUpdate.toLocaleTimeString()} • {selectedChain} network data
      </div>

      {/* Network Health Status */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-terminal-warning" />
          <h4 className="text-sm font-bold text-terminal-text">NETWORK HEALTH</h4>
          <div className={`px-3 py-1 rounded text-xs font-bold ${getCongestionColor(networkHealth.congestion)}`}>
            {networkHealth.congestion.toUpperCase()}
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          <div className="metric-card text-center">
            <div className="text-sm font-bold text-terminal-text mb-1">Hashrate</div>
            <div className="text-lg text-terminal-success">{formatHashrate(networkHealth.hashrate)}</div>
          </div>
          <div className="metric-card text-center">
            <div className="text-sm font-bold text-terminal-text mb-1">Block Time</div>
            <div className="text-lg text-terminal-text">{networkHealth.blockTime.toFixed(1)}s</div>
          </div>
          <div className="metric-card text-center">
            <div className="text-sm font-bold text-terminal-text mb-1">Mempool</div>
            <div className="text-lg text-terminal-warning">{formatNumber(networkHealth.mempool)}</div>
          </div>
          <div className="metric-card text-center">
            <div className="text-sm font-bold text-terminal-text mb-1">Fee Rate</div>
            <div className="text-lg text-terminal-accent">{networkHealth.feeRate.toFixed(0)} sat/vB</div>
          </div>
        </div>
      </div>

      {/* Current Metrics Grid */}
      <div className="grid grid-cols-6 gap-3 mb-6">
        <div className="metric-card text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <Users className="w-4 h-4 text-terminal-accent" />
            <span className="text-xs text-terminal-muted">Active Addresses</span>
          </div>
          <div className="text-lg font-bold text-terminal-text">{formatNumber(currentMetrics.activeAddresses)}</div>
          <div className={`text-xs font-bold ${currentMetrics.networkGrowth > 0 ? 'text-terminal-success' : 'text-terminal-error'}`}>
            {currentMetrics.networkGrowth > 0 ? '+' : ''}{currentMetrics.networkGrowth.toFixed(2)}%
          </div>
        </div>
        
        <div className="metric-card text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <Activity className="w-4 h-4 text-terminal-success" />
            <span className="text-xs text-terminal-muted">Transaction Count</span>
          </div>
          <div className="text-lg font-bold text-terminal-text">{formatNumber(currentMetrics.transactionCount)}</div>
          <div className="text-xs text-terminal-muted">24h</div>
        </div>
        
        <div className="metric-card text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <DollarSign className="w-4 h-4 text-terminal-warning" />
            <span className="text-xs text-terminal-muted">TX Volume</span>
          </div>
          <div className="text-lg font-bold text-terminal-text">${formatNumber(currentMetrics.txVolume)}</div>
          <div className="text-xs text-terminal-muted">24h</div>
        </div>
        
        <div className="metric-card text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <TrendingUp className="w-4 h-4 text-terminal-accent" />
            <span className="text-xs text-terminal-muted">Avg TX Size</span>
          </div>
          <div className="text-lg font-bold text-terminal-text">${formatNumber(currentMetrics.avgTxSize)}</div>
          <div className="text-xs text-terminal-muted">Per transaction</div>
        </div>
        
        <div className="metric-card text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <Users className="w-4 h-4 text-terminal-success" />
            <span className="text-xs text-terminal-muted">New Addresses</span>
          </div>
          <div className="text-lg font-bold text-terminal-text">{formatNumber(currentMetrics.newAddresses)}</div>
          <div className="text-xs text-terminal-muted">24h</div>
        </div>
        
        <div className="metric-card text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <Zap className="w-4 h-4 text-terminal-error" />
            <span className="text-xs text-terminal-muted">Whale TXs</span>
          </div>
          <div className="text-lg font-bold text-terminal-text">{currentMetrics.whaleTransactions}</div>
          <div className="text-xs text-terminal-muted">Large transfers</div>
        </div>
      </div>

      {/* Exchange Flow and Additional Metrics */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-4 h-4 text-terminal-success" />
            <h4 className="text-sm font-bold text-terminal-text">EXCHANGE FLOW</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
              <div>
                <div className="text-sm font-bold text-terminal-success">Exchange Inflow</div>
                <div className="text-xs text-terminal-muted">Tokens moving to exchanges</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-terminal-success">${formatNumber(currentMetrics.exchangeInflow)}</div>
                <div className="text-xs text-terminal-muted">24h volume</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
              <div>
                <div className="text-sm font-bold text-terminal-warning">Exchange Outflow</div>
                <div className="text-xs text-terminal-muted">Tokens leaving exchanges</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-terminal-warning">${formatNumber(currentMetrics.exchangeOutflow)}</div>
                <div className="text-xs text-terminal-muted">24h volume</div>
              </div>
            </div>
            
            <div className="p-3 bg-slate-700/30 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-terminal-text">Net Flow</span>
                <span className={`text-sm font-bold ${
                  currentMetrics.exchangeOutflow > currentMetrics.exchangeInflow ? 'text-terminal-success' : 'text-terminal-error'
                }`}>
                  {currentMetrics.exchangeOutflow > currentMetrics.exchangeInflow ? 'Bullish' : 'Bearish'}
                </span>
              </div>
              <div className="text-xs text-terminal-muted">
                Net: ${formatNumber(Math.abs(currentMetrics.exchangeOutflow - currentMetrics.exchangeInflow))} 
                {currentMetrics.exchangeOutflow > currentMetrics.exchangeInflow ? ' outflow' : ' inflow'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Database className="w-4 h-4 text-terminal-accent" />
            <h4 className="text-sm font-bold text-terminal-text">STAKING & UTILIZATION</h4>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-slate-700/30 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-terminal-text">Staking Ratio</span>
                <span className="text-lg font-bold text-terminal-success">{currentMetrics.stakingRatio.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className="bg-terminal-success h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(100, currentMetrics.stakingRatio)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="p-3 bg-slate-700/30 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-terminal-text">Gas Utilization</span>
                <span className={`text-lg font-bold ${
                  currentMetrics.gasUtilization > 90 ? 'text-terminal-error' :
                  currentMetrics.gasUtilization > 70 ? 'text-terminal-warning' :
                  'text-terminal-success'
                }`}>
                  {currentMetrics.gasUtilization.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentMetrics.gasUtilization > 90 ? 'bg-terminal-error' :
                    currentMetrics.gasUtilization > 70 ? 'bg-terminal-warning' :
                    'bg-terminal-success'
                  }`}
                  style={{ width: `${Math.min(100, currentMetrics.gasUtilization)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="p-3 bg-slate-700/30 rounded">
              <div className="text-sm font-bold text-terminal-text mb-2">Network Growth</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-terminal-muted">24h address growth</span>
                <span className={`text-sm font-bold ${
                  currentMetrics.networkGrowth > 0 ? 'text-terminal-success' : 'text-terminal-error'
                }`}>
                  {currentMetrics.networkGrowth > 0 ? '+' : ''}{currentMetrics.networkGrowth.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-6 bg-slate-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="flex items-center space-x-2 text-terminal-success">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Updating on-chain data...</span>
          </div>
        </div>
      )}
    </div>
  )
} 