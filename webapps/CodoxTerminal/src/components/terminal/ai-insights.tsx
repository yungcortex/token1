'use client'

import { useQuery } from '@tanstack/react-query'
import { Brain, Target, Moon, TrendingUp, AlertTriangle, Activity, Zap, Eye } from 'lucide-react'

interface AIInsight {
  type: 'prediction' | 'lunar' | 'pattern' | 'alert'
  title: string
  description: string
  confidence: number
  timeframe: string
  impact: 'high' | 'medium' | 'low'
}

const mockInsights: AIInsight[] = [
  {
    type: 'prediction',
    title: 'BTC Bull Flag Pattern',
    description: 'AI detects strong bull flag formation with 78% historical success rate. Target: $48,500',
    confidence: 85,
    timeframe: '3-7 days',
    impact: 'high'
  },
  {
    type: 'lunar',
    title: 'New Moon Phase Impact',
    description: 'Historical data shows 67% positive correlation with meme coin rallies during new moon phase.',
    confidence: 67,
    timeframe: '3-7 days',
    impact: 'medium'
  },
  {
    type: 'pattern',
    title: 'Solana Ecosystem Momentum',
    description: 'On-chain metrics indicate increasing DEX volume and new wallet creation. Bullish for SOL ecosystem tokens.',
    confidence: 72,
    timeframe: '1-2 weeks',
    impact: 'high'
  },
  {
    type: 'alert',
    title: 'Unusual Whale Activity',
    description: 'Large wallet movements detected in PEPE token. Monitor for potential breakout or dump.',
    confidence: 90,
    timeframe: 'Immediate',
    impact: 'high'
  }
]

export function AIInsights() {
  const { data: insights = mockInsights, isLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => Promise.resolve(mockInsights),
    refetchInterval: 900000, // 15 minutes
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <Target className="w-4 h-4" />
      case 'lunar': return <Moon className="w-4 h-4" />
      case 'pattern': return <TrendingUp className="w-4 h-4" />
      case 'alert': return <AlertTriangle className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prediction': return 'text-cyan-400'
      case 'lunar': return 'text-purple-400'
      case 'pattern': return 'text-terminal-success'
      case 'alert': return 'text-terminal-warning'
      default: return 'text-terminal-accent'
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'prediction': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      case 'lunar': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'pattern': return 'bg-terminal-success/20 text-terminal-success border-terminal-success/30'
      case 'alert': return 'bg-terminal-warning/20 text-terminal-warning border-terminal-warning/30'
      default: return 'bg-terminal-accent/20 text-terminal-accent border-terminal-accent/30'
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-terminal-success'
    if (confidence >= 60) return 'text-terminal-warning'
    return 'text-terminal-error'
  }

  const getConfidenceBar = (confidence: number) => {
    const color = confidence >= 80 ? 'bg-terminal-success' : 
                 confidence >= 60 ? 'bg-terminal-warning' : 'bg-terminal-error'
    return { width: `${confidence}%`, color }
  }

  return (
    <div className="terminal-window h-full p-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-5 h-5 text-terminal-accent" />
          <h2 className="text-xl font-bold gradient-text">AI INSIGHTS</h2>
          <div className="status-indicator status-live">
            <Activity className="w-3 h-3 mr-1 animate-pulse" />
            HIGH
          </div>
        </div>
        <div className="flex items-center space-x-1 text-xs text-terminal-muted">
          <Eye className="w-3 h-3 text-terminal-accent" />
          <span>78% Success Rate</span>
        </div>
      </div>
      
      <div className="space-y-4 h-5/6 overflow-auto">
        {insights.map((insight, index) => (
          <div key={index} className="metric-card group hover:border-terminal-accent/30 transition-all duration-300 animate-slideIn" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className={`status-indicator ${getTypeBadge(insight.type)}`}>
                  {getTypeIcon(insight.type)}
                  <span className="text-xs font-semibold ml-1">{insight.type.toUpperCase()}</span>
                </div>
                
                <div className={`status-indicator ${getImpactBadge(insight.impact)}`}>
                  <span className="text-xs font-semibold">{insight.impact.toUpperCase()}</span>
                </div>
              </div>
              
              {/* Title */}
              <h3 className="font-bold text-sm group-hover:text-terminal-accent transition-colors">
                {insight.title}
              </h3>
              
              {/* Description */}
              <p className="text-xs text-terminal-muted leading-relaxed">
                {insight.description}
              </p>
              
              {/* Confidence Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-terminal-muted">Confidence:</span>
                  <span className={`font-bold ${getConfidenceColor(insight.confidence)}`}>
                    {insight.confidence}%
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getConfidenceBar(insight.confidence).color}`}
                    style={{ width: getConfidenceBar(insight.confidence).width }}
                  ></div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-700/30">
                <div className="flex items-center space-x-2 text-xs text-terminal-muted">
                  <Zap className="w-3 h-3 text-terminal-accent" />
                  <span>Timeframe: <span className="text-terminal-accent font-medium">{insight.timeframe}</span></span>
                </div>
                
                <div className="text-xs text-terminal-muted font-mono">
                  Updated 5m ago
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <div className="status-indicator bg-gradient-to-r from-terminal-success/20 to-emerald-500/20 border-terminal-success/30 text-terminal-success">
          <span className="text-xs font-medium">AI powered by advanced ML models • Updated every 15 minutes</span>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="flex items-center space-x-2 text-terminal-success">
            <Activity className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Analyzing market patterns...</span>
          </div>
        </div>
      )}
    </div>
  )
} 