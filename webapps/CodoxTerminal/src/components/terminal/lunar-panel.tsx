'use client'

import { useQuery } from '@tanstack/react-query'
import { Moon, TrendingUp, TrendingDown, Calendar, Target } from 'lucide-react'
import { LunarAnalysis } from '@/lib/lunar-analysis'

export function LunarPanel() {
  const { data: lunarData } = useQuery({
    queryKey: ['lunar-analysis'],
    queryFn: () => LunarAnalysis.getLunarMarketCorrelation(),
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  if (!lunarData) {
    return (
      <div className="terminal-window h-full p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Moon className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-terminal-text">LUNAR ANALYSIS</h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-pulse text-purple-400">🌙</div>
            <div className="text-sm opacity-70 mt-2">Loading lunar data...</div>
          </div>
        </div>
      </div>
    )
  }

  const tradingSignal = LunarAnalysis.getLunarTradingSignals(lunarData)
  
  const getPhaseEmoji = (phase: string) => {
    const phaseEmojis: Record<string, string> = {
      'New Moon': '🌑',
      'Waxing Crescent': '🌒',
      'First Quarter': '🌓',
      'Waxing Gibbous': '🌔',
      'Full Moon': '🌕',
      'Waning Gibbous': '🌖',
      'Last Quarter': '🌗',
      'Waning Crescent': '🌘'
    }
    return phaseEmojis[phase] || '🌙'
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return 'text-terminal-success'
      case 'sell': return 'text-terminal-error'
      default: return 'text-terminal-warning'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="terminal-window h-full p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Moon className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-bold text-terminal-text">LUNAR ANALYSIS</h2>
      </div>

      <div className="space-y-4">
        {/* Current Phase */}
        <div className="bg-terminal-border p-4 rounded">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{getPhaseEmoji(lunarData.phase_name)}</span>
              <div>
                <div className="font-bold">{lunarData.phase_name}</div>
                <div className="text-xs opacity-70">{lunarData.illumination}% illuminated</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-70">Correlation Score</div>
              <div className="text-lg font-bold text-purple-400">
                {lunarData.correlation_score}%
              </div>
            </div>
          </div>
        </div>

        {/* Trading Signal */}
        <div className="bg-terminal-border p-4 rounded">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-terminal-accent" />
            <span className="text-sm font-bold">LUNAR SIGNAL</span>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <div className={`font-bold text-lg uppercase ${getSignalColor(tradingSignal.recommendation)}`}>
              {tradingSignal.recommendation}
            </div>
            <div className="text-sm">
              <span className="opacity-70">Confidence: </span>
              <span className="font-bold text-terminal-accent">
                {tradingSignal.confidence}%
              </span>
            </div>
          </div>
          
          <p className="text-xs opacity-80 leading-relaxed">
            {tradingSignal.reasoning}
          </p>
        </div>

        {/* Upcoming Phases */}
        <div className="bg-terminal-border p-4 rounded">
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="w-4 h-4 text-terminal-accent" />
            <span className="text-sm font-bold">UPCOMING PHASES</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span>🌑</span>
                <span>Next New Moon</span>
              </div>
              <span className="font-mono text-terminal-success">
                {formatDate(lunarData.next_new_moon)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span>🌕</span>
                <span>Next Full Moon</span>
              </div>
              <span className="font-mono text-terminal-error">
                {formatDate(lunarData.next_full_moon)}
              </span>
            </div>
          </div>
        </div>

        {/* Historical Performance */}
        <div className="bg-terminal-border p-4 rounded">
          <div className="text-sm font-bold mb-3">PHASE PERFORMANCE</div>
          
          <div className="space-y-1 max-h-32 overflow-auto scrollbar-terminal">
            {lunarData.historical_performance
              .sort((a, b) => b.avg_return - a.avg_return)
              .map((phase) => (
                <div key={phase.phase} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span>{getPhaseEmoji(phase.phase)}</span>
                    <span className="truncate">{phase.phase}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={phase.avg_return >= 0 ? 'text-terminal-success' : 'text-terminal-error'}>
                      {phase.avg_return >= 0 ? '+' : ''}{phase.avg_return.toFixed(1)}%
                    </span>
                    <span className="opacity-70">
                      ({phase.success_rate}%)
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs opacity-70 text-center">
        Lunar correlation analysis • Historical data from 2020-2024
      </div>
    </div>
  )
} 