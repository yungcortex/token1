'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, TrendingUp, TrendingDown, Heart, Hash, Users, RefreshCw, AlertCircle } from 'lucide-react'

interface SentimentData {
  timestamp: number
  price: number
  sentiment: number // -1 to 1
  volume: number
  mentions: number
  platform: 'twitter' | 'reddit' | 'telegram' | 'discord'
  influencerScore: number
}

interface SentimentMetrics {
  overall: number
  bullish: number
  bearish: number
  neutral: number
  fear: number
  greed: number
  fomo: number
}

interface PlatformActivity {
  platform: string
  change: number
  mentions: number
  influence: number
  icon: string
}

async function fetchSentimentData(symbol: string): Promise<{
  timeline: SentimentData[]
  metrics: SentimentMetrics
  platformActivity: PlatformActivity[]
}> {
  try {
    // Simulate API call - in real app, this would fetch from sentiment APIs like LunarCrush, Santiment, etc.
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const now = Date.now()
    const timeline: SentimentData[] = []
    
    // Generate realistic sentiment timeline (last 24 hours)
    for (let i = 23; i >= 0; i--) {
      const timestamp = now - (i * 60 * 60 * 1000)
          const basePrice = symbol === 'BTC' ? 106088 :
                     symbol === 'ETH' ? 2553 : 
                                               symbol === 'SOL' ? 147.78 : 2.5
      
      // Create more dynamic sentiment that changes over time
      const hourOfDay = new Date(timestamp).getHours()
      const marketActive = hourOfDay >= 9 && hourOfDay <= 16 // Market hours effect
      const baseSentiment = marketActive ? 0.1 : -0.05
      
      // Add trending momentum
      const trendFactor = Math.sin((i / 24) * Math.PI * 2) * 0.3
      const randomFactor = (Math.random() - 0.5) * 0.4
      const sentiment = Math.max(-1, Math.min(1, baseSentiment + trendFactor + randomFactor))
      
      const priceVariation = sentiment * 0.02 + (Math.random() - 0.5) * 0.01
      const price = basePrice * (1 + priceVariation)
      
      const platforms: SentimentData['platform'][] = ['twitter', 'reddit', 'telegram', 'discord']
      const platform = platforms[Math.floor(Math.random() * platforms.length)]
      
      timeline.push({
        timestamp,
        price,
        sentiment,
        volume: Math.random() * 2000000 + 500000,
        mentions: Math.floor(Math.random() * 8000 + 1000),
        platform,
        influencerScore: Math.random() * 100
      })
    }
    
    // Calculate metrics from timeline
    const totalMentions = timeline.reduce((sum, d) => sum + d.mentions, 0)
    const avgSentiment = timeline.reduce((sum, d) => sum + d.sentiment, 0) / timeline.length
    
    const bullishCount = timeline.filter(d => d.sentiment > 0.2).length
    const bearishCount = timeline.filter(d => d.sentiment < -0.2).length
    const neutralCount = timeline.length - bullishCount - bearishCount
    
    const metrics: SentimentMetrics = {
      overall: (avgSentiment + 1) * 50, // Convert to 0-100 scale
      bullish: (bullishCount / timeline.length) * 100,
      bearish: (bearishCount / timeline.length) * 100,
      neutral: (neutralCount / timeline.length) * 100,
      fear: Math.max(0, -avgSentiment * 100),
      greed: Math.max(0, avgSentiment * 100),
      fomo: timeline.filter(d => d.sentiment > 0.7).length / timeline.length * 100
    }
    
    // Platform activity data
    const platformActivity: PlatformActivity[] = [
      {
        platform: 'Discord',
        change: 0.26,
        mentions: 2004,
        influence: 34,
        icon: '💬'
      },
      {
        platform: 'Reddit',
        change: 0.02,
        mentions: 4725,
        influence: 90,
        icon: '🔴'
      },
      {
        platform: 'Twitter',
        change: 0.42,
        mentions: 3683,
        influence: 73,
        icon: '🐦'
      },
      {
        platform: 'Telegram',
        change: 0.30,
        mentions: 3413,
        influence: 24,
        icon: '✈️'
      }
    ]
    
    return { timeline, metrics, platformActivity }
    
  } catch (error) {
    console.error('Error fetching sentiment data:', error)
    // Fallback data
    return {
      timeline: [],
      metrics: { overall: 53, bullish: 17, bearish: 8, neutral: 75, fear: 0, greed: 6, fomo: 0 },
      platformActivity: []
    }
  }
}

export function SocialSentiment() {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([])
  const [metrics, setMetrics] = useState<SentimentMetrics>({
    overall: 0, bullish: 0, bearish: 0, neutral: 0, fear: 0, greed: 0, fomo: 0
  })
  const [platformActivity, setPlatformActivity] = useState<PlatformActivity[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState('BTC')
  const [timeframe, setTimeframe] = useState<'1H' | '4H' | '1D' | '7D'>('1D')
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'twitter' | 'reddit' | 'telegram'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const symbols = ['BTC', 'ETH', 'SOL', 'BONK', 'WIF', 'DOGE']
  const platforms = ['all', 'twitter', 'reddit', 'telegram']

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const data = await fetchSentimentData(selectedSymbol)
        setSentimentData(data.timeline)
        setMetrics(data.metrics)
        setPlatformActivity(data.platformActivity)
        setLastUpdate(new Date())
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
    const interval = setInterval(loadData, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [selectedSymbol, timeframe, selectedPlatform])

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.5) return 'text-green-400'
    if (sentiment > 0.2) return 'text-yellow-400'
    if (sentiment > -0.2) return 'text-terminal-text'
    if (sentiment > -0.5) return 'text-orange-400'
    return 'text-red-400'
  }

  const getSentimentBg = (sentiment: number) => {
    if (sentiment > 0.5) return 'bg-green-500'
    if (sentiment > 0.2) return 'bg-yellow-500'
    if (sentiment > -0.2) return 'bg-terminal-accent'
    if (sentiment > -0.5) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getMetricColor = (value: number) => {
    if (value > 70) return 'text-green-400'
    if (value > 50) return 'text-yellow-400'
    if (value > 30) return 'text-orange-400'
    return 'text-red-400'
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const data = await fetchSentimentData(selectedSymbol)
      setSentimentData(data.timeline)
      setMetrics(data.metrics)
      setPlatformActivity(data.platformActivity)
      setLastUpdate(new Date())
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="terminal-window h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <MessageCircle className="w-6 h-6 text-terminal-accent" />
          <h3 className="text-xl font-bold text-terminal-text">SOCIAL SENTIMENT</h3>
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
          
          {/* Symbol selector */}
          <select 
            value={selectedSymbol} 
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="terminal-input text-sm px-3 py-1"
          >
            {symbols.map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>

          {/* Platform selector */}
          <select 
            value={selectedPlatform} 
            onChange={(e) => setSelectedPlatform(e.target.value as any)}
            className="terminal-input text-sm px-3 py-1"
          >
            {platforms.map(platform => (
              <option key={platform} value={platform}>
                {platform === 'all' ? 'All Platforms' : platform.charAt(0).toUpperCase() + platform.slice(1)}
              </option>
            ))}
          </select>

          {/* Timeframe selector */}
          <div className="flex space-x-1">
            {(['1H', '4H', '1D', '7D'] as const).map(tf => (
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
        Last updated: {lastUpdate.toLocaleTimeString()} • Real-time sentiment tracking for {selectedSymbol}
      </div>

      {/* Sentiment Metrics Grid */}
      <div className="grid grid-cols-7 gap-3 mb-6">
        <div className="metric-card text-center">
          <div className="text-2xl font-bold text-terminal-text mb-1">{metrics.overall.toFixed(0)}</div>
          <div className="text-xs text-terminal-muted">Overall</div>
        </div>
        <div className="metric-card text-center">
          <div className="text-2xl font-bold text-terminal-success mb-1">{metrics.bullish.toFixed(0)}%</div>
          <div className="text-xs text-terminal-muted">Bullish</div>
        </div>
        <div className="metric-card text-center">
          <div className="text-2xl font-bold text-terminal-error mb-1">{metrics.bearish.toFixed(0)}%</div>
          <div className="text-xs text-terminal-muted">Bearish</div>
        </div>
        <div className="metric-card text-center">
          <div className="text-2xl font-bold text-terminal-text mb-1">{metrics.neutral.toFixed(0)}%</div>
          <div className="text-xs text-terminal-muted">Neutral</div>
        </div>
        <div className="metric-card text-center">
          <div className="text-2xl font-bold text-terminal-error mb-1">{metrics.fear.toFixed(0)}</div>
          <div className="text-xs text-terminal-muted">Fear</div>
        </div>
        <div className="metric-card text-center">
          <div className="text-2xl font-bold text-terminal-success mb-1">{metrics.greed.toFixed(0)}</div>
          <div className="text-xs text-terminal-muted">Greed</div>
        </div>
        <div className="metric-card text-center">
          <div className="text-2xl font-bold text-terminal-warning mb-1">{metrics.fomo.toFixed(0)}%</div>
          <div className="text-xs text-terminal-muted">FOMO</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Sentiment Timeline */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-4 h-4 text-terminal-success" />
            <h4 className="text-sm font-bold text-terminal-text">SENTIMENT TIMELINE</h4>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sentimentData.slice(-12).map((data, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded text-xs">
                <div className="flex items-center space-x-2">
                  <div className="text-terminal-muted">{formatTime(data.timestamp)}</div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    data.sentiment > 0.2 ? 'bg-green-500/20 text-green-400' :
                    data.sentiment < -0.2 ? 'bg-red-500/20 text-red-400' :
                    'bg-slate-600/20 text-terminal-text'
                  }`}>
                    {data.sentiment > 0 ? '+' : ''}{data.sentiment.toFixed(2)}
                  </div>
                </div>
                <div className="text-terminal-muted">{data.mentions.toLocaleString()} mentions</div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Activity */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Hash className="w-4 h-4 text-terminal-accent" />
            <h4 className="text-sm font-bold text-terminal-text">PLATFORM ACTIVITY</h4>
          </div>
          
          <div className="space-y-3">
            {platformActivity.map((platform, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{platform.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-terminal-text">{platform.platform}</div>
                    <div className="text-xs text-terminal-muted">{platform.mentions.toLocaleString()} mentions</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${
                    platform.change > 0 ? 'text-terminal-success' : 'text-terminal-error'
                  }`}>
                    {platform.change > 0 ? '+' : ''}{platform.change.toFixed(2)}
                  </div>
                  <div className="text-xs text-terminal-muted">Influence: {platform.influence}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="metric-card text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <Users className="w-4 h-4 text-terminal-accent" />
            <span className="text-xs text-terminal-muted">Total Mentions</span>
          </div>
          <div className="text-lg font-bold text-terminal-text">
            {sentimentData.reduce((sum, d) => sum + d.mentions, 0).toLocaleString()}
          </div>
        </div>
        <div className="metric-card text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <TrendingUp className="w-4 h-4 text-terminal-success" />
            <span className="text-xs text-terminal-muted">Positive Trend</span>
          </div>
          <div className="text-lg font-bold text-terminal-success">
            {Math.round(sentimentData.filter(d => d.sentiment > 0).length / sentimentData.length * 100)}%
          </div>
        </div>
        <div className="metric-card text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <Heart className="w-4 h-4 text-terminal-warning" />
            <span className="text-xs text-terminal-muted">Avg Influence</span>
          </div>
          <div className="text-lg font-bold text-terminal-warning">
            {(sentimentData.reduce((sum, d) => sum + d.influencerScore, 0) / sentimentData.length).toFixed(0)}
          </div>
        </div>
        <div className="metric-card text-center">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <AlertCircle className="w-4 h-4 text-terminal-accent" />
            <span className="text-xs text-terminal-muted">Peak Activity</span>
          </div>
          <div className="text-lg font-bold text-terminal-accent">
            {formatTime(Math.max(...sentimentData.map(d => d.timestamp)))}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-6 bg-slate-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="flex items-center space-x-2 text-terminal-success">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Updating sentiment data...</span>
          </div>
        </div>
      )}
    </div>
  )
} 