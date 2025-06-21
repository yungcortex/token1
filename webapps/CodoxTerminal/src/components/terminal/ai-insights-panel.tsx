'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  Activity,
  Eye,
  Zap,
  BarChart3
} from 'lucide-react'
import { aiAnalysis } from '@/lib/ai-analysis-engine'
import { openRouterAI, SentimentResult } from '@/lib/openrouter-ai'
import type { MarketSignal, MarketRegime, SentimentAnalysis } from '@/lib/ai-analysis-engine'

interface AIInsightsPanelProps {
  symbol: string
  priceData?: number[][]
  volume?: number[]
}

// Helper functions for mock data generation
const generateMockPriceData = (): number[][] => {
  const data = []
  let price = 45000 + Math.random() * 20000
  
  for (let i = 0; i < 100; i++) {
    const change = (Math.random() - 0.5) * price * 0.02
    price += change
    data.push([
      Date.now() - (100 - i) * 60000, // timestamp
      price + Math.random() * 100, // open
      price + Math.random() * 200, // high
      price - Math.random() * 200, // low
      price, // close
      Math.random() * 1000000 // volume
    ])
  }
  
  return data
}

const generateMockVolume = (): number[] => {
  return Array.from({ length: 50 }, () => Math.random() * 1000000)
}

export function AIInsightsPanel({ 
  symbol = 'BTC', 
  priceData = [],
  volume = []
}: AIInsightsPanelProps) {
  const [signals, setSignals] = useState<MarketSignal[]>([])
  const [marketRegime, setMarketRegime] = useState<MarketRegime | null>(null)
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'signals' | 'regime' | 'sentiment'>('signals')
  const [lastUpdate, setLastUpdate] = useState<number>(0)

  // Generate stable mock data only once per component mount
  const [stableMockData] = useState(() => ({
    priceData: generateMockPriceData(),
    volume: generateMockVolume()
  }))

  useEffect(() => {
    const fetchAnalysis = async () => {
      const now = Date.now()
      // Prevent rapid-fire updates
      if (now - lastUpdate < 5000) return
      
      setIsLoading(true)
      try {
        // Use stable mock data to prevent constant regeneration
        const mockPriceData = priceData.length > 0 ? priceData : stableMockData.priceData
        const mockVolume = volume.length > 0 ? volume : stableMockData.volume

        const [signalsData, regimeData, sentimentData] = await Promise.all([
          aiAnalysis.generateSignals(symbol, mockPriceData, mockVolume),
          aiAnalysis.detectMarketRegime({ [symbol]: mockPriceData }),
          aiAnalysis.analyzeSentiment(symbol)
        ])

        setSignals(signalsData)
        setMarketRegime(regimeData)
        setSentiment(sentimentData)
        setLastUpdate(now)
      } catch (error) {
        console.error('AI Analysis error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchAnalysis()
    
    // Update every 60 seconds (reduced from 30s to prevent excessive updates)
    const interval = setInterval(fetchAnalysis, 60000)
    return () => clearInterval(interval)
  }, [symbol]) // Removed priceData and volume from dependencies to prevent constant updates



  const getSignalColor = (signal: MarketSignal['signal']) => {
    switch (signal) {
      case 'STRONG_BUY': return 'text-terminal-success bg-terminal-success/20 border-terminal-success'
      case 'BUY': return 'text-green-400 bg-green-400/20 border-green-400'
      case 'HOLD': return 'text-terminal-muted bg-terminal-muted/20 border-terminal-muted'
      case 'SELL': return 'text-orange-400 bg-orange-400/20 border-orange-400'
      case 'STRONG_SELL': return 'text-terminal-error bg-terminal-error/20 border-terminal-error'
    }
  }

  const getSignalIcon = (signal: MarketSignal['signal']) => {
    switch (signal) {
      case 'STRONG_BUY': return <TrendingUp className="w-3 h-3" />
      case 'BUY': return <TrendingUp className="w-3 h-3" />
      case 'HOLD': return <Activity className="w-3 h-3" />
      case 'SELL': return <TrendingDown className="w-3 h-3" />
      case 'STRONG_SELL': return <TrendingDown className="w-3 h-3" />
    }
  }

  const getRegimeColor = (regime: MarketRegime['regime']) => {
    switch (regime) {
      case 'bull': return 'text-terminal-success'
      case 'bear': return 'text-terminal-error'
      case 'crab': return 'text-terminal-warning'
      case 'transition': return 'text-terminal-purple'
    }
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'text-terminal-success'
    if (sentiment < -0.3) return 'text-terminal-error'
    return 'text-terminal-warning'
  }

  if (isLoading) {
    return (
      <div className="terminal-panel p-3 h-full">
        <div className="flex items-center space-x-2 mb-3">
          <Brain className="w-4 h-4 text-terminal-accent animate-pulse" />
          <h3 className="text-sm font-bold text-terminal-text font-display">AI Analysis</h3>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center space-x-2 text-terminal-muted">
            <div className="w-2 h-2 bg-terminal-accent rounded-full animate-pulse"></div>
            <span className="font-mono text-xs">Analyzing...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="terminal-panel p-3 h-full overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-terminal-accent" />
          <h3 className="text-sm font-bold text-terminal-text font-display">AI Analysis</h3>
          <div className="px-1.5 py-0.5 bg-terminal-accent/20 text-terminal-accent text-2xs rounded font-mono">
            LIVE
          </div>
        </div>
        <div className="text-2xs text-terminal-muted font-mono">
          {symbol} • 60s updates
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-3 bg-terminal-bg/50 rounded-lg p-1">
        {[
          { id: 'signals' as const, label: 'Signals', icon: Target },
          { id: 'regime' as const, label: 'Regime', icon: BarChart3 },
          { id: 'sentiment' as const, label: 'Sentiment', icon: Eye }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-1.5 px-2 py-1.5 rounded-md text-2xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-terminal-accent text-terminal-bg shadow-lg'
                : 'text-terminal-muted hover:text-terminal-text hover:bg-terminal-glass'
            }`}
          >
            <tab.icon className="w-3 h-3" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="h-48 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'signals' && (
            <motion.div
              key="signals"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {signals.slice(0, 4).map((signal, index) => (
                <div
                  key={`signal-${signal.timeframe}-${signal.signal}`}
                  className="p-2 bg-terminal-glass rounded-lg border border-terminal-border hover:border-terminal-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded text-2xs border ${getSignalColor(signal.signal)}`}>
                        {getSignalIcon(signal.signal)}
                        <span className="font-bold">{signal.signal.replace('_', ' ')}</span>
                      </div>
                      <span className="text-xs text-terminal-muted font-mono">{signal.timeframe}</span>
                    </div>
                    <div className="text-xs font-mono text-terminal-text">
                      {signal.confidence}% confidence
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-2 text-2xs">
                    <div>
                      <div className="text-terminal-muted">Entry</div>
                      <div className="text-terminal-text font-mono">${signal.entry_price.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-terminal-muted">Target</div>
                      <div className="text-terminal-success font-mono">${signal.target_price.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-terminal-muted">R:R</div>
                      <div className="text-terminal-accent font-mono">{signal.risk_reward_ratio.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  {signal.reasoning.length > 0 && (
                    <div className="text-2xs text-terminal-muted">
                      {signal.reasoning[0]}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'regime' && marketRegime && (
            <motion.div
              key="regime"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center p-6 bg-terminal-glass rounded-lg border border-terminal-border">
                <div className={`text-3xl font-bold ${getRegimeColor(marketRegime.regime)} mb-2`}>
                  {marketRegime.regime.toUpperCase()}
                </div>
                <div className="text-sm text-terminal-muted mb-4">Market Regime</div>
                <div className="flex justify-center space-x-4 text-xs">
                  <div>
                    <div className="text-terminal-muted">Confidence</div>
                    <div className="text-terminal-text font-mono">{marketRegime.confidence}%</div>
                  </div>
                  <div>
                    <div className="text-terminal-muted">Volatility</div>
                    <div className="text-terminal-text font-mono capitalize">{marketRegime.volatility}</div>
                  </div>
                  <div>
                    <div className="text-terminal-muted">Risk</div>
                    <div className="text-terminal-text font-mono capitalize">{marketRegime.risk_level}</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-terminal-glass rounded-lg border border-terminal-border">
                <h4 className="text-sm font-semibold text-terminal-text mb-2">Analysis</h4>
                <p className="text-xs text-terminal-muted leading-relaxed">
                  {marketRegime.dominant_narrative}
                </p>
                <div className="mt-3 flex items-center space-x-2">
                  <div className="w-full bg-terminal-bg rounded-full h-2">
                    <div 
                      className="bg-terminal-accent h-2 rounded-full transition-all duration-500"
                      style={{ width: `${marketRegime.trend_strength * 100}%` }}
                    />
                  </div>
                  <span className="text-2xs text-terminal-muted font-mono">
                    {Math.round(marketRegime.trend_strength * 100)}% strength
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'sentiment' && sentiment && (
            <motion.div
              key="sentiment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center p-6 bg-terminal-glass rounded-lg border border-terminal-border">
                <div className={`text-3xl font-bold ${getSentimentColor(sentiment.overall_sentiment)} mb-2`}>
                  {sentiment.overall_sentiment > 0.3 ? 'BULLISH' : 
                   sentiment.overall_sentiment < -0.3 ? 'BEARISH' : 'NEUTRAL'}
                </div>
                <div className="text-sm text-terminal-muted mb-4">Overall Sentiment</div>
                <div className="flex justify-center space-x-4 text-xs">
                  <div>
                    <div className="text-terminal-muted">Fear & Greed</div>
                    <div className="text-terminal-text font-mono">{sentiment.fear_greed_index}/100</div>
                  </div>
                  <div>
                    <div className="text-terminal-muted">Social</div>
                    <div className="text-terminal-text font-mono">{sentiment.social_mentions.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-terminal-muted">Whales</div>
                    <div className="text-terminal-text font-mono capitalize">{sentiment.whale_activity}</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(sentiment.sources).map(([source, value]) => (
                  <div key={source} className="p-3 bg-terminal-glass rounded-lg border border-terminal-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-terminal-text capitalize">{source}</span>
                      <span className={`text-xs font-mono ${getSentimentColor(value)}`}>
                        {value > 0 ? '+' : ''}{(value * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-terminal-bg rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all duration-300 ${
                          value > 0 ? 'bg-terminal-success' : 'bg-terminal-error'
                        }`}
                        style={{ width: `${Math.abs(value) * 50}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-terminal-border">
        <div className="flex items-center justify-between text-2xs text-terminal-muted">
          <div className="flex items-center space-x-2">
            <Zap className="w-3 h-3" />
            <span>Live AI Analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>Stable updates</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 