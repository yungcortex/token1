'use client'

import { useQuery } from '@tanstack/react-query'
import { Clock, ExternalLink, TrendingUp, Activity, Newspaper, Zap } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  timestamp: number
  sentiment: 'bullish' | 'bearish' | 'neutral'
  tags: string[]
}

const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Major Institutional Investors Continue to Pour Money into Bitcoin ETFs with Over $2B in Inflows',
    summary: 'Record institutional adoption accelerates as major financial institutions increase their cryptocurrency exposure through regulated investment vehicles.',
    source: 'CryptoNews',
    timestamp: Date.now() - 300000,
    sentiment: 'bullish',
    tags: ['BTC', 'ETF', 'Institutional']
  },
  {
    id: '2',
    title: 'Solana Meme Coins Rally 40% Following New DEX Launch with Improved AMM Technology',
    summary: 'Popular meme tokens on Solana ecosystem see massive gains after new decentralized exchange introduces enhanced automated market making features.',
    source: 'DeFi Report',
    timestamp: Date.now() - 900000,
    sentiment: 'bullish',
    tags: ['SOL', 'MEME', 'DEX']
  },
  {
    id: '3',
    title: 'Federal Reserve Chair Signals Potential Interest Rate Cuts in Q2 2024',
    summary: 'Central bank indicates possible monetary policy shift that could significantly benefit risk assets including digital currencies and growth stocks.',
    source: 'Financial Times',
    timestamp: Date.now() - 1800000,
    sentiment: 'bullish',
    tags: ['MACRO', 'FED', 'RATES']
  },
  {
    id: '4',
    title: 'Major Cryptocurrency Exchange Reports Technical Issues During Peak Trading Volume',
    summary: 'Users experience connection delays and trading interruptions during high-volume session, raising concerns about infrastructure scalability.',
    source: 'TechCrunch',
    timestamp: Date.now() - 3600000,
    sentiment: 'bearish',
    tags: ['EXCHANGE', 'TECHNICAL']
  }
]

export function NewsPanel() {
  const { data: news = mockNews, isLoading } = useQuery({
    queryKey: ['crypto-news'],
    queryFn: () => Promise.resolve(mockNews),
    refetchInterval: 30000,
  })

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-terminal-success'
      case 'bearish': return 'text-terminal-error'
      default: return 'text-terminal-text'
    }
  }

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'bg-terminal-success/20 text-terminal-success border-terminal-success/30'
      case 'bearish': return 'bg-terminal-error/20 text-terminal-error border-terminal-error/30'
      default: return 'bg-terminal-muted/20 text-terminal-muted border-terminal-muted/30'
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ago`
    return `${minutes}m ago`
  }

  return (
    <div className="terminal-window h-full p-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Newspaper className="w-5 h-5 text-terminal-accent" />
          <h2 className="text-xl font-bold gradient-text">MARKET NEWS</h2>
          <div className="status-indicator status-live">
            <Activity className="w-3 h-3 mr-1 animate-pulse" />
            LIVE
          </div>
        </div>
        <div className="flex items-center space-x-1 text-xs text-terminal-muted">
          <Zap className="w-3 h-3 text-terminal-accent" />
          <span>AI Sentiment Analysis</span>
        </div>
      </div>
      
      <div className="space-y-4 h-5/6 overflow-auto">
        {news.map((item, index) => (
          <div key={item.id} className="metric-card group hover:border-terminal-accent/30 cursor-pointer transition-all duration-300 animate-slideIn" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className={`status-indicator ${getSentimentBadge(item.sentiment)}`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span className="text-xs font-semibold">{item.sentiment.toUpperCase()}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-terminal-muted">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(item.timestamp)}</span>
                </div>
              </div>
              
              {/* Title */}
              <h3 className="font-bold text-sm leading-relaxed group-hover:text-terminal-accent transition-colors line-clamp-2">
                {item.title}
              </h3>
              
              {/* Summary */}
              <p className="text-xs text-terminal-muted leading-relaxed line-clamp-3">
                {item.summary}
              </p>
              
              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-700/30">
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span key={tag} className="bg-terminal-accent/20 text-terminal-accent text-2xs px-2 py-1 rounded-md font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-terminal-muted hover:text-terminal-accent transition-colors">
                  <span className="font-medium">{item.source}</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <div className="status-indicator bg-gradient-to-r from-terminal-success/20 to-emerald-500/20 border-terminal-success/30 text-terminal-success">
          <span className="text-xs font-medium">Updates every 30 seconds • Powered by AI sentiment analysis</span>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="flex items-center space-x-2 text-terminal-success">
            <Activity className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Loading latest news...</span>
          </div>
        </div>
      )}
    </div>
  )
} 