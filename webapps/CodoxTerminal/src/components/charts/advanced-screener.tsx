'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap,
  Activity,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Eye,
  Star
} from 'lucide-react'
import { openRouterAI, PatternDetectionResult } from '@/lib/openrouter-ai'

interface ScreenerResult {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  patterns: PatternDetectionResult[]
  technicalScore: number
  momentum: 'strong_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong_bearish'
  signals: {
    rsi: number
    macd: 'bullish' | 'bearish' | 'neutral'
    volumeSpike: boolean
    breakout: boolean
  }
  aiAnalysis: {
    recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL'
    confidence: number
    reasoning: string
  }
  alerts: string[]
}

interface ScreenerFilters {
  patterns: string[]
  momentum: string[]
  volumeMin: number
  marketCapMin: number
  priceChangeMin: number
  priceChangeMax: number
  technicalScoreMin: number
}

export function AdvancedScreener() {
  const [results, setResults] = useState<ScreenerResult[]>([])
  const [filteredResults, setFilteredResults] = useState<ScreenerResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'technicalScore' | 'change24h' | 'volume24h' | 'marketCap'>('technicalScore')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filters, setFilters] = useState<ScreenerFilters>({
    patterns: [],
    momentum: [],
    volumeMin: 0,
    marketCapMin: 0,
    priceChangeMin: -100,
    priceChangeMax: 100,
    technicalScoreMin: 0
  })
  const [watchlist, setWatchlist] = useState<string[]>([])

  // Available patterns to filter by
  const availablePatterns = [
    'Bull Flag', 'Bear Flag', 'Head and Shoulders', 'Inverse Head and Shoulders',
    'Double Top', 'Double Bottom', 'Ascending Triangle', 'Descending Triangle',
    'Symmetrical Triangle', 'Cup and Handle', 'Breakout', 'Breakdown'
  ]

  useEffect(() => {
    scanMarket()
    const interval = setInterval(scanMarket, 120000) // Scan every 2 minutes
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    applyFilters()
  }, [results, searchTerm, filters, sortBy, sortDirection])

  const scanMarket = async () => {
    setIsLoading(true)
    
    try {
      // In production, this would fetch real market data
      const mockMarketData = await generateMockScreenerData()
      setResults(mockMarketData)
    } catch (error) {
      console.error('Screener scan failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockScreenerData = async (): Promise<ScreenerResult[]> => {
    const symbols = [
      { symbol: 'BTC', name: 'Bitcoin', price: 106088, change24h: 2.4, volume24h: 28500000000, marketCap: 2100000000000 },
      { symbol: 'ETH', name: 'Ethereum', price: 4127, change24h: 3.1, volume24h: 15200000000, marketCap: 496000000000 },
      { symbol: 'SOL', name: 'Solana', price: 238.45, change24h: 8.7, volume24h: 3400000000, marketCap: 113000000000 },
      { symbol: 'ADA', name: 'Cardano', price: 1.08, change24h: -2.1, volume24h: 1200000000, marketCap: 38000000000 },
      { symbol: 'DOT', name: 'Polkadot', price: 8.94, change24h: 5.2, volume24h: 320000000, marketCap: 12000000000 },
      { symbol: 'AVAX', name: 'Avalanche', price: 42.18, change24h: 12.3, volume24h: 890000000, marketCap: 16000000000 },
      { symbol: 'LINK', name: 'Chainlink', price: 24.67, change24h: 6.8, volume24h: 650000000, marketCap: 15000000000 },
      { symbol: 'UNI', name: 'Uniswap', price: 13.42, change24h: -1.4, volume24h: 280000000, marketCap: 8000000000 },
      { symbol: 'MATIC', name: 'Polygon', price: 0.52, change24h: 4.1, volume24h: 190000000, marketCap: 5200000000 },
      { symbol: 'ATOM', name: 'Cosmos', price: 7.89, change24h: 7.2, volume24h: 85000000, marketCap: 3100000000 }
    ]

    const screenerResults: ScreenerResult[] = []

    for (const asset of symbols) {
      // Generate mock price data for pattern detection
      const priceData = generateMockPriceData(asset.price, 50)
      
      // Use OpenRouter AI for pattern detection (with fallback)
      const patterns = await openRouterAI.detectPatterns(priceData, asset.symbol)
      
      // Calculate technical score
      const technicalScore = calculateTechnicalScore(asset, patterns)
      
      // Generate momentum and signals
      const momentum = getMomentum(asset.change24h, technicalScore)
      const signals = generateSignals(asset, patterns)
      
      // AI analysis
      const aiAnalysis = await generateAIAnalysis(asset, patterns, technicalScore)
      
      // Generate alerts
      const alerts = generateAlerts(asset, patterns, signals)

      screenerResults.push({
        ...asset,
        patterns,
        technicalScore,
        momentum,
        signals,
        aiAnalysis,
        alerts
      })
    }

    return screenerResults.sort((a, b) => b.technicalScore - a.technicalScore)
  }

  const generateMockPriceData = (currentPrice: number, candles: number): number[][] => {
    const data: number[][] = []
    let price = currentPrice * 0.95 // Start 5% lower

    for (let i = 0; i < candles; i++) {
      const open = price
      const volatility = 0.02 + Math.random() * 0.03
      const change = (Math.random() - 0.48) * volatility // Slight bullish bias
      const close = open * (1 + change)
      const high = Math.max(open, close) * (1 + Math.random() * 0.01)
      const low = Math.min(open, close) * (1 - Math.random() * 0.01)
      const volume = 1000000 + Math.random() * 5000000

      data.push([Date.now() - (candles - i) * 3600000, open, high, low, close, volume])
      price = close
    }

    return data
  }

  const calculateTechnicalScore = (asset: any, patterns: PatternDetectionResult[]): number => {
    let score = 50 // Base score

    // Volume factor
    if (asset.volume24h > 1000000000) score += 15
    else if (asset.volume24h > 100000000) score += 10
    else if (asset.volume24h > 10000000) score += 5

    // Price change factor
    if (asset.change24h > 10) score += 20
    else if (asset.change24h > 5) score += 15
    else if (asset.change24h > 0) score += 10
    else if (asset.change24h > -5) score += 5

    // Pattern factor
    patterns.forEach(pattern => {
      if (pattern.confidence > 85) score += 20
      else if (pattern.confidence > 75) score += 15
      else if (pattern.confidence > 70) score += 10
    })

    return Math.min(100, Math.max(0, score))
  }

  const getMomentum = (change24h: number, technicalScore: number): any => {
    const combinedScore = (change24h * 2) + (technicalScore - 50)
    
    if (combinedScore > 20) return 'strong_bullish'
    if (combinedScore > 5) return 'bullish'
    if (combinedScore > -5) return 'neutral'
    if (combinedScore > -20) return 'bearish'
    return 'strong_bearish'
  }

     const generateSignals = (asset: any, patterns: PatternDetectionResult[]) => {
     return {
       rsi: 30 + Math.random() * 40, // Mock RSI
       macd: Math.random() > 0.5 ? 'bullish' as const : 'bearish' as const,
       volumeSpike: asset.volume24h > 500000000,
       breakout: patterns.some(p => p.pattern.includes('Breakout') || p.pattern.includes('Bull Flag'))
     }
   }

  const generateAIAnalysis = async (asset: any, patterns: PatternDetectionResult[], technicalScore: number) => {
    // Use OpenRouter AI for analysis (with fallback)
    try {
      const marketData = {
        symbol: asset.symbol,
        price: asset.price,
        change24h: asset.change24h,
        volume: asset.volume24h,
        patterns: patterns,
        technicalScore: technicalScore
      }

      const prediction = await openRouterAI.predictMarketMovement(marketData)
      
      let recommendation: any = 'HOLD'
      if (prediction.direction === 'up' && prediction.confidence > 75) {
        recommendation = prediction.magnitude > 8 ? 'STRONG_BUY' : 'BUY'
      } else if (prediction.direction === 'down' && prediction.confidence > 75) {
        recommendation = prediction.magnitude > 8 ? 'STRONG_SELL' : 'SELL'
      }

      return {
        recommendation,
        confidence: prediction.confidence,
        reasoning: prediction.factors.join(', ')
      }
    } catch (error) {
      // Fallback analysis
      let recommendation: any = 'HOLD'
      if (technicalScore > 80) recommendation = 'STRONG_BUY'
      else if (technicalScore > 65) recommendation = 'BUY'
      else if (technicalScore < 20) recommendation = 'STRONG_SELL'
      else if (technicalScore < 35) recommendation = 'SELL'

      return {
        recommendation,
        confidence: 65,
        reasoning: 'Local technical analysis'
      }
    }
  }

  const generateAlerts = (asset: any, patterns: PatternDetectionResult[], signals: any): string[] => {
    const alerts: string[] = []

    if (signals.volumeSpike) alerts.push('📈 Volume Spike')
    if (signals.breakout) alerts.push('🚀 Breakout Pattern')
    if (asset.change24h > 15) alerts.push('⚡ Strong Rally')
    if (patterns.length > 0) alerts.push(`📊 ${patterns.length} Pattern${patterns.length > 1 ? 's' : ''} Detected`)
    if (signals.rsi < 30) alerts.push('🔄 RSI Oversold')
    if (signals.rsi > 70) alerts.push('⚠️ RSI Overbought')

    return alerts
  }

  const applyFilters = () => {
    let filtered = results

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(result => 
        result.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Technical filters
    filtered = filtered.filter(result => {
      return result.volume24h >= filters.volumeMin &&
             result.marketCap >= filters.marketCapMin &&
             result.change24h >= filters.priceChangeMin &&
             result.change24h <= filters.priceChangeMax &&
             result.technicalScore >= filters.technicalScoreMin
    })

    // Pattern filters
    if (filters.patterns.length > 0) {
      filtered = filtered.filter(result =>
        result.patterns.some(pattern =>
          filters.patterns.includes(pattern.pattern)
        )
      )
    }

    // Momentum filters
    if (filters.momentum.length > 0) {
      filtered = filtered.filter(result =>
        filters.momentum.includes(result.momentum)
      )
    }

    // Sort results
    filtered.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      return sortDirection === 'desc' ? bVal - aVal : aVal - bVal
    })

    setFilteredResults(filtered)
  }

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    )
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'STRONG_BUY': return 'text-terminal-success bg-terminal-success/20 border-terminal-success'
      case 'BUY': return 'text-green-400 bg-green-400/20 border-green-400'
      case 'HOLD': return 'text-terminal-muted bg-terminal-muted/20 border-terminal-muted'
      case 'SELL': return 'text-orange-400 bg-orange-400/20 border-orange-400'
      case 'STRONG_SELL': return 'text-terminal-error bg-terminal-error/20 border-terminal-error'
      default: return 'text-terminal-muted bg-terminal-muted/20 border-terminal-muted'
    }
  }

  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
      case 'strong_bullish': return 'text-terminal-success'
      case 'bullish': return 'text-green-400'
      case 'neutral': return 'text-terminal-muted'
      case 'bearish': return 'text-orange-400'
      case 'strong_bearish': return 'text-terminal-error'
      default: return 'text-terminal-muted'
    }
  }

  return (
    <div className="terminal-panel p-6 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Search className="w-5 h-5 text-terminal-accent" />
          <h3 className="text-lg font-bold text-terminal-text">Advanced Crypto Screener</h3>
          <div className="px-2 py-1 bg-terminal-accent/20 text-terminal-accent text-2xs rounded">
            AI POWERED
          </div>
                     <div className="px-2 py-1 bg-terminal-success/20 text-terminal-success text-2xs rounded">
             ChatGPT-o3
           </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={scanMarket}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-terminal-glass border border-terminal-border rounded hover:border-terminal-accent transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm">Scan</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search symbols or names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-terminal-glass border border-terminal-border rounded text-terminal-text text-sm"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 bg-terminal-glass border border-terminal-border rounded text-terminal-text text-sm"
        >
          <option value="technicalScore">Technical Score</option>
          <option value="change24h">24h Change</option>
          <option value="volume24h">Volume</option>
          <option value="marketCap">Market Cap</option>
        </select>
        <button className="p-2 bg-terminal-glass border border-terminal-border rounded hover:border-terminal-accent transition-colors">
          <Filter className="w-4 h-4 text-terminal-muted" />
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto space-y-3">
        <AnimatePresence>
          {filteredResults.map((result, index) => (
            <motion.div
              key={result.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-terminal-glass rounded-lg border border-terminal-border hover:border-terminal-accent/50 transition-all"
            >
              {/* Header Row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="text-lg font-bold text-terminal-text">{result.symbol}</div>
                    <div className="text-sm text-terminal-muted">{result.name}</div>
                    <button
                      onClick={() => toggleWatchlist(result.symbol)}
                      className={`p-1 rounded ${
                        watchlist.includes(result.symbol) 
                          ? 'text-terminal-warning' 
                          : 'text-terminal-muted hover:text-terminal-warning'
                      }`}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-lg font-bold text-terminal-text">
                      ${result.price.toLocaleString()}
                    </div>
                    <div className={`text-sm font-medium ${
                      result.change24h >= 0 ? 'text-terminal-success' : 'text-terminal-error'
                    }`}>
                      {result.change24h >= 0 ? '+' : ''}{result.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-center">
                    <div className="text-xs text-terminal-muted">Technical Score</div>
                    <div className={`text-lg font-bold ${
                      result.technicalScore > 75 ? 'text-terminal-success' :
                      result.technicalScore > 50 ? 'text-terminal-warning' : 'text-terminal-error'
                    }`}>
                      {result.technicalScore}/100
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-2xs border ${getRecommendationColor(result.aiAnalysis.recommendation)}`}>
                    {result.aiAnalysis.recommendation}
                  </div>
                </div>
              </div>

              {/* Patterns and Signals */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-terminal-muted mb-2">Detected Patterns</div>
                  <div className="space-y-1">
                    {result.patterns.slice(0, 2).map((pattern, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-terminal-text">{pattern.pattern}</span>
                        <span className="text-terminal-accent">{pattern.confidence}%</span>
                      </div>
                    ))}
                    {result.patterns.length === 0 && (
                      <div className="text-xs text-terminal-muted">No patterns detected</div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-terminal-muted mb-2">Technical Signals</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>RSI:</span>
                      <span className={result.signals.rsi < 30 ? 'text-terminal-success' : 
                                    result.signals.rsi > 70 ? 'text-terminal-error' : 'text-terminal-muted'}>
                        {result.signals.rsi.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>MACD:</span>
                      <span className={result.signals.macd === 'bullish' ? 'text-terminal-success' : 
                                      result.signals.macd === 'bearish' ? 'text-terminal-error' : 'text-terminal-muted'}>
                        {result.signals.macd}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="mb-3 p-3 bg-terminal-border/50 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-3 h-3 text-terminal-accent" />
                                     <span className="text-xs font-bold text-terminal-text">ChatGPT-o3 Analysis</span>
                  <span className="text-xs text-terminal-success">{result.aiAnalysis.confidence}% confidence</span>
                </div>
                <p className="text-xs text-terminal-muted">{result.aiAnalysis.reasoning}</p>
              </div>

              {/* Alerts */}
              {result.alerts.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {result.alerts.map((alert, idx) => (
                    <span key={idx} className="bg-terminal-warning/20 text-terminal-warning text-2xs px-2 py-1 rounded">
                      {alert}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      <div className="mt-4 pt-4 border-t border-terminal-border">
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div className="text-center">
            <div className="text-terminal-muted">Scanned</div>
            <div className="text-terminal-text font-bold">{results.length}</div>
          </div>
          <div className="text-center">
            <div className="text-terminal-muted">Strong Buy</div>
            <div className="text-terminal-success font-bold">
              {filteredResults.filter(r => r.aiAnalysis.recommendation === 'STRONG_BUY').length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-terminal-muted">Patterns</div>
            <div className="text-terminal-accent font-bold">
              {filteredResults.reduce((sum, r) => sum + r.patterns.length, 0)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-terminal-muted">Watchlist</div>
            <div className="text-terminal-warning font-bold">{watchlist.length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}