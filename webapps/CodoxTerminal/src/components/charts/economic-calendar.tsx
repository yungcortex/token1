'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  Building2,
  Zap,
  Globe,
  Activity
} from 'lucide-react'

interface EconomicEvent {
  id: string
  title: string
  description: string
  category: 'fed' | 'macro' | 'crypto' | 'earnings' | 'policy'
  date: Date
  time: string
  impact: 'low' | 'medium' | 'high'
  actual?: number | string
  forecast?: number | string
  previous?: number | string
  currency: string
  historical_correlation: number // -1 to 1 correlation with crypto
  volatility_prediction: number // 0-100% expected volatility
  source: string
  countdown?: number // seconds until event
}

interface CalendarProps {
  timeRange?: '24h' | '7d' | '30d'
}

export function EconomicCalendar({ timeRange = '7d' }: CalendarProps) {
  const [events, setEvents] = useState<EconomicEvent[]>([])
  const [filter, setFilter] = useState<'all' | 'high' | 'crypto'>('all')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    const generateEvents = (): EconomicEvent[] => {
      const now = new Date()
      const mockEvents: EconomicEvent[] = [
        // Fed Events
        {
          id: '1',
          title: 'Federal Reserve Interest Rate Decision',
          description: 'FOMC announces federal funds rate decision. Historical 75% correlation with crypto market movements.',
          category: 'fed',
          date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          time: '14:00 EST',
          impact: 'high',
          forecast: '5.25%',
          previous: '5.25%',
          currency: 'USD',
          historical_correlation: 0.75,
          volatility_prediction: 85,
          source: 'Federal Reserve',
          countdown: 2 * 24 * 60 * 60 // 2 days in seconds
        },
        
        // Macro Events
        {
          id: '2',
          title: 'Consumer Price Index (CPI)',
          description: 'Monthly inflation data release. Strong inverse correlation with risk assets including crypto.',
          category: 'macro',
          date: new Date(now.getTime() + 5 * 60 * 60 * 1000), // 5 hours from now
          time: '08:30 EST',
          impact: 'high',
          forecast: '3.2%',
          previous: '3.4%',
          currency: 'USD',
          historical_correlation: -0.68,
          volatility_prediction: 78,
          source: 'Bureau of Labor Statistics'
        },
        
        {
          id: '3',
          title: 'Non-Farm Payrolls',
          description: 'Monthly employment data. Risk-on sentiment if strong, risk-off if weak.',
          category: 'macro',
          date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day
          time: '08:30 EST',
          impact: 'medium',
          forecast: '180K',
          previous: '199K',
          currency: 'USD',
          historical_correlation: 0.45,
          volatility_prediction: 52,
          source: 'Bureau of Labor Statistics'
        },
        
        // Crypto Events
        {
          id: '4',
          title: 'Ethereum Dencun Upgrade Implementation',
          description: 'Major network upgrade expected to reduce L2 costs significantly.',
          category: 'crypto',
          date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days
          time: '12:00 UTC',
          impact: 'high',
          currency: 'ETH',
          historical_correlation: 0.92,
          volatility_prediction: 65,
          source: 'Ethereum Foundation'
        },
        
        {
          id: '5',
          title: 'Bitcoin ETF Options Launch',
          description: 'Options trading begins for spot Bitcoin ETFs, potentially increasing institutional participation.',
          category: 'crypto',
          date: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000), // 6 days
          time: '09:30 EST',
          impact: 'medium',
          currency: 'BTC',
          historical_correlation: 0.78,
          volatility_prediction: 45,
          source: 'SEC'
        },
        
        // Earnings
        {
          id: '6',
          title: 'Coinbase Q4 Earnings',
          description: 'Major crypto exchange earnings report. Proxy for crypto market health.',
          category: 'earnings',
          date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days
          time: '16:00 EST',
          impact: 'medium',
          forecast: '$0.15',
          previous: '$0.11',
          currency: 'USD',
          historical_correlation: 0.55,
          volatility_prediction: 38,
          source: 'COIN'
        },
        
        {
          id: '7',
          title: 'Tesla Q4 Delivery Numbers',
          description: 'Major BTC holder delivery report. Elon Musk statements often impact crypto.',
          category: 'earnings',
          date: new Date(now.getTime() + 12 * 60 * 60 * 1000), // 12 hours
          time: 'After Market Close',
          impact: 'low',
          currency: 'USD',
          historical_correlation: 0.25,
          volatility_prediction: 22,
          source: 'TSLA'
        }
      ]
      
      return mockEvents.sort((a, b) => a.date.getTime() - b.date.getTime())
    }

    setEvents(generateEvents())
    
    // Update countdown every second
    const interval = setInterval(() => {
      setEvents(prevEvents => 
        prevEvents.map(event => {
          if (event.countdown !== undefined) {
            return { ...event, countdown: Math.max(0, event.countdown - 1) }
          }
          return event
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRange])

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-terminal-error bg-terminal-error/20 border-terminal-error'
      case 'medium': return 'text-terminal-warning bg-terminal-warning/20 border-terminal-warning'
      case 'low': return 'text-terminal-success bg-terminal-success/20 border-terminal-success'
      default: return 'text-terminal-muted bg-terminal-muted/20 border-terminal-muted'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fed': return <Building2 className="w-4 h-4" />
      case 'macro': return <Globe className="w-4 h-4" />
      case 'crypto': return <DollarSign className="w-4 h-4" />
      case 'earnings': return <TrendingUp className="w-4 h-4" />
      case 'policy': return <AlertTriangle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fed': return 'text-red-400'
      case 'macro': return 'text-blue-400'
      case 'crypto': return 'text-terminal-accent'
      case 'earnings': return 'text-green-400'
      case 'policy': return 'text-purple-400'
      default: return 'text-terminal-muted'
    }
  }

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation)
    if (abs > 0.7) return correlation > 0 ? 'text-terminal-success' : 'text-terminal-error'
    if (abs > 0.4) return correlation > 0 ? 'text-green-400' : 'text-orange-400'
    return 'text-terminal-muted'
  }

  const formatCountdown = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60))
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((seconds % (60 * 60)) / 60)
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const filteredEvents = events.filter(event => {
    if (filter === 'high') return event.impact === 'high'
    if (filter === 'crypto') return event.category === 'crypto'
    return true
  })

  const nextHighImpactEvent = events.find(e => e.impact === 'high' && e.date > new Date())

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="terminal-panel p-6 h-full overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-terminal-accent" />
          <h3 className="text-lg font-bold text-terminal-text font-display">Economic Calendar</h3>
          <div className="px-2 py-1 bg-terminal-accent/20 text-terminal-accent text-2xs rounded font-mono">
            LIVE
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="terminal-input text-xs px-2 py-1"
          >
            <option value="all">All Events</option>
            <option value="high">High Impact</option>
            <option value="crypto">Crypto Only</option>
          </select>
        </div>
      </div>

      {/* Next High Impact Event Alert */}
      {nextHighImpactEvent && (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="mb-6 p-4 bg-gradient-to-r from-terminal-error/20 to-terminal-warning/20 rounded-lg border border-terminal-error/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-terminal-error animate-pulse" />
              <div>
                <div className="text-sm font-bold text-terminal-text">NEXT HIGH IMPACT</div>
                <div className="text-xs text-terminal-muted">{nextHighImpactEvent.title}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-terminal-error font-mono">
                {nextHighImpactEvent.countdown ? formatCountdown(nextHighImpactEvent.countdown) : 'NOW'}
              </div>
              <div className="text-xs text-terminal-muted">
                {nextHighImpactEvent.volatility_prediction}% vol expected
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Events List */}
      <div className="space-y-3 h-96 overflow-y-auto">
        {filteredEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-terminal-glass rounded-lg border border-terminal-border hover:border-terminal-accent/50 transition-colors"
          >
            {/* Event Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getCategoryColor(event.category)} bg-current/20`}>
                  {getCategoryIcon(event.category)}
                </div>
                <div>
                  <div className="text-sm font-bold text-terminal-text">{event.title}</div>
                  <div className="text-xs text-terminal-muted">{event.source}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded text-2xs border ${getImpactColor(event.impact)}`}>
                  {event.impact.toUpperCase()}
                </div>
                <div className="text-xs text-terminal-muted font-mono">
                  {event.time}
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div className="text-xs text-terminal-muted mb-3 leading-relaxed">
              {event.description}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="text-center">
                <div className="text-terminal-muted">Correlation</div>
                <div className={`font-mono font-bold ${getCorrelationColor(event.historical_correlation)}`}>
                  {event.historical_correlation > 0 ? '+' : ''}{event.historical_correlation.toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-terminal-muted">Volatility</div>
                <div className="text-terminal-warning font-mono font-bold">
                  {event.volatility_prediction}%
                </div>
              </div>
              {event.forecast && (
                <div className="text-center">
                  <div className="text-terminal-muted">Forecast</div>
                  <div className="text-terminal-text font-mono font-bold">
                    {event.forecast}
                  </div>
                </div>
              )}
              {event.previous && (
                <div className="text-center">
                  <div className="text-terminal-muted">Previous</div>
                  <div className="text-terminal-text font-mono font-bold">
                    {event.previous}
                  </div>
                </div>
              )}
            </div>

            {/* Countdown for upcoming events */}
            {event.countdown !== undefined && event.countdown > 0 && (
              <div className="mt-3 pt-3 border-t border-terminal-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-terminal-accent" />
                    <span className="text-xs text-terminal-muted">Time until event</span>
                  </div>
                  <div className="text-sm font-bold text-terminal-accent font-mono">
                    {formatCountdown(event.countdown)}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-terminal-border">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="text-center">
            <div className="text-terminal-muted">High Impact</div>
            <div className="text-terminal-error font-bold">
              {events.filter(e => e.impact === 'high').length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-terminal-muted">Crypto Events</div>
            <div className="text-terminal-accent font-bold">
              {events.filter(e => e.category === 'crypto').length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-terminal-muted">Next 24h</div>
            <div className="text-terminal-success font-bold">
              {events.filter(e => e.date < new Date(Date.now() + 24 * 60 * 60 * 1000)).length}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 