'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Newspaper, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Zap,
  ExternalLink,
  Volume2,
  VolumeX,
  Activity,
  Target
} from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  publishedAt: Date
  category: 'breaking' | 'market' | 'defi' | 'regulation' | 'adoption'
  tags: string[]
  sentiment: {
    score: number
    label: 'extremely_bullish' | 'bullish' | 'neutral' | 'bearish' | 'extremely_bearish'
    confidence: number
  }
  marketImpact: {
    level: 'low' | 'medium' | 'high' | 'critical'
    prediction: string
    affectedAssets: string[]
  }
  isBreaking: boolean
  socialMetrics: {
    mentions: number
    viralScore: number
  }
}

export function RealTimeNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [breakingNews, setBreakingNews] = useState<NewsItem | null>(null)

  useEffect(() => {
    const generateNewsData = (): NewsItem[] => {
      return [
        {
          id: '1',
          title: 'BREAKING: BlackRock Bitcoin ETF Sees Record $2.1B Single-Day Inflow',
          summary: 'Largest single-day inflow in Bitcoin ETF history as major pension funds allocate to digital assets.',
          source: 'Reuters',
          publishedAt: new Date(Date.now() - 15 * 60 * 1000),
          category: 'breaking',
          tags: ['BTC', 'ETF', 'BlackRock', 'Institutional'],
          sentiment: {
            score: 0.85,
            label: 'extremely_bullish',
            confidence: 92
          },
          marketImpact: {
            level: 'critical',
            prediction: 'Strong upward pressure on BTC price. Expect 3-7% rally in next 24h.',
            affectedAssets: ['BTC', 'ETH', 'MSTR', 'COIN']
          },
          isBreaking: true,
          socialMetrics: {
            mentions: 15420,
            viralScore: 94
          }
        },
        {
          id: '2',
          title: 'Fed Vice Chair Signals Crypto Framework Could Be Finalized This Quarter',
          summary: 'Federal Reserve official indicates comprehensive crypto regulation may be announced ahead of schedule.',
          source: 'Bloomberg',
          publishedAt: new Date(Date.now() - 45 * 60 * 1000),
          category: 'regulation',
          tags: ['FED', 'Regulation', 'Policy'],
          sentiment: {
            score: 0.65,
            label: 'bullish',
            confidence: 78
          },
          marketImpact: {
            level: 'high',
            prediction: 'Regulatory clarity reduces uncertainty premium. Expect gradual institutional adoption.',
            affectedAssets: ['BTC', 'ETH', 'COIN']
          },
          isBreaking: false,
          socialMetrics: {
            mentions: 8920,
            viralScore: 67
          }
        },
        {
          id: '3',
          title: 'Major DeFi Protocol Suffers $47M Exploit in Cross-Chain Bridge Attack',
          summary: 'Sophisticated attack targets bridge vulnerabilities, raising questions about interoperability security.',
          source: 'The Block',
          publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          category: 'defi',
          tags: ['DeFi', 'Exploit', 'Bridge', 'Security'],
          sentiment: {
            score: -0.78,
            label: 'bearish',
            confidence: 91
          },
          marketImpact: {
            level: 'high',
            prediction: 'Negative sentiment for DeFi tokens. Expect 5-15% selloff in bridge protocols.',
            affectedAssets: ['DeFi tokens', 'Bridge protocols']
          },
          isBreaking: false,
          socialMetrics: {
            mentions: 12400,
            viralScore: 76
          }
        }
      ]
    }

    const updateNews = () => {
      const newsData = generateNewsData()
      setNews(newsData)

      const breaking = newsData.find(item => item.isBreaking)
      if (breaking && breaking.id !== breakingNews?.id) {
        setBreakingNews(breaking)
        if (soundEnabled) {
          console.log('🚨 BREAKING NEWS ALERT')
        }
      }
    }

    updateNews()
    const interval = setInterval(updateNews, 30000)
    return () => clearInterval(interval)
  }, [soundEnabled, breakingNews?.id])

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'extremely_bullish': return 'text-terminal-success bg-terminal-success/20 border-terminal-success'
      case 'bullish': return 'text-green-400 bg-green-400/20 border-green-400'
      case 'neutral': return 'text-terminal-muted bg-terminal-muted/20 border-terminal-muted'
      case 'bearish': return 'text-orange-400 bg-orange-400/20 border-orange-400'
      case 'extremely_bearish': return 'text-terminal-error bg-terminal-error/20 border-terminal-error'
      default: return 'text-terminal-muted bg-terminal-muted/20 border-terminal-muted'
    }
  }

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-terminal-error bg-terminal-error/30 border-terminal-error animate-pulse'
      case 'high': return 'text-terminal-warning bg-terminal-warning/20 border-terminal-warning'
      case 'medium': return 'text-blue-400 bg-blue-400/20 border-blue-400'
      case 'low': return 'text-terminal-muted bg-terminal-muted/20 border-terminal-muted'
      default: return 'text-terminal-muted bg-terminal-muted/20 border-terminal-muted'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ago`
    return `${minutes}m ago`
  }

  return (
    <div className="terminal-panel p-6 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Newspaper className="w-5 h-5 text-terminal-accent" />
          <h3 className="text-lg font-bold text-terminal-text">Real-Time News Feed</h3>
          <div className="px-2 py-1 bg-terminal-accent/20 text-terminal-accent text-2xs rounded animate-pulse">
            LIVE
          </div>
          <div className="px-2 py-1 bg-terminal-success/20 text-terminal-success text-2xs rounded">
            AI POWERED
          </div>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-lg transition-colors ${
            soundEnabled ? 'bg-terminal-success/20 text-terminal-success' : 'bg-terminal-muted/20 text-terminal-muted'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Breaking News Banner */}
      <AnimatePresence>
        {breakingNews && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-gradient-to-r from-terminal-error/30 to-terminal-warning/30 rounded-lg border-2 border-terminal-error/50 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-terminal-error animate-bounce" />
                <div>
                  <div className="text-sm font-bold text-terminal-error uppercase">
                    🚨 BREAKING NEWS
                  </div>
                  <div className="text-sm text-terminal-text font-medium">
                    {breakingNews.title}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setBreakingNews(null)}
                className="text-terminal-muted hover:text-terminal-text"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* News List */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {news.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-terminal-glass rounded-lg border border-terminal-border hover:border-terminal-accent/50 transition-all"
          >
            {/* Article Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-lg">📰</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-terminal-text">{item.source}</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-terminal-muted" />
                      <span className="text-xs text-terminal-muted">{formatTimeAgo(item.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {item.isBreaking && (
                  <div className="px-2 py-1 bg-terminal-error/20 text-terminal-error text-2xs rounded border animate-pulse">
                    BREAKING
                  </div>
                )}
                <div className={`px-2 py-1 rounded text-2xs border ${getSentimentColor(item.sentiment.label)}`}>
                  {item.sentiment.label.replace('_', ' ').toUpperCase()}
                </div>
                <div className={`px-2 py-1 rounded text-2xs border ${getImpactColor(item.marketImpact.level)}`}>
                  {item.marketImpact.level.toUpperCase()} IMPACT
                </div>
              </div>
            </div>

            {/* Article Title */}
            <h4 className="text-sm font-bold text-terminal-text mb-2 leading-relaxed">
              {item.title}
            </h4>

            {/* Article Summary */}
            <p className="text-xs text-terminal-muted mb-3 leading-relaxed">
              {item.summary}
            </p>

            {/* Market Impact Analysis */}
            <div className="mb-3 p-3 bg-terminal-border/50 rounded">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-3 h-3 text-terminal-accent" />
                <span className="text-xs font-bold text-terminal-text">AI Market Impact</span>
                <span className="text-xs text-terminal-success">{item.sentiment.confidence}% confidence</span>
              </div>
              <p className="text-xs text-terminal-muted mb-2">{item.marketImpact.prediction}</p>
              <div className="text-xs text-terminal-muted">
                Affected: {item.marketImpact.affectedAssets.join(', ')}
              </div>
            </div>

            {/* Tags and Metrics */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {item.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="bg-terminal-accent/20 text-terminal-accent text-2xs px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <Activity className="w-3 h-3 text-terminal-muted" />
                  <span className="text-terminal-muted">{item.socialMetrics.mentions.toLocaleString()} mentions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-terminal-warning" />
                  <span className="text-terminal-warning">{item.socialMetrics.viralScore}% viral</span>
                </div>
                <button className="flex items-center space-x-1 text-terminal-muted hover:text-terminal-accent">
                  <ExternalLink className="w-3 h-3" />
                  <span>Read</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Footer */}
      <div className="mt-4 pt-4 border-t border-terminal-border">
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div className="text-center">
            <div className="text-terminal-muted">Breaking</div>
            <div className="text-terminal-error font-bold">
              {news.filter(n => n.isBreaking).length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-terminal-muted">High Impact</div>
            <div className="text-terminal-warning font-bold">
              {news.filter(n => n.marketImpact.level === 'high' || n.marketImpact.level === 'critical').length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-terminal-muted">Bullish</div>
            <div className="text-terminal-success font-bold">
              {news.filter(n => n.sentiment.score > 0.3).length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-terminal-muted">Sources</div>
            <div className="text-terminal-accent font-bold">
              {new Set(news.map(n => n.source)).size}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 