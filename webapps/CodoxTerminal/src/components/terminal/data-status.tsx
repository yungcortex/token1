'use client'

import { useState, useEffect } from 'react'
import { Activity, Wifi, Database, Clock, Globe, Zap, AlertTriangle } from 'lucide-react'

interface DataFeed {
  name: string
  status: 'live' | 'delayed' | 'offline'
  latency: number
  icon: React.ComponentType<any>
  color: string
  lastUpdate: Date
}

export function DataStatus() {
  const [feeds, setFeeds] = useState<DataFeed[]>([])
  const [globalLatency, setGlobalLatency] = useState(12)
  const [totalConnections, setTotalConnections] = useState(8)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted state on client-side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    // Initialize data feeds
    const initialFeeds: DataFeed[] = [
      { name: 'CoinGecko', status: 'live', latency: 8, icon: Database, color: 'text-terminal-success', lastUpdate: new Date() },
      { name: 'Alternative.me', status: 'live', latency: 15, icon: Activity, color: 'text-terminal-success', lastUpdate: new Date() },
      { name: 'Helius', status: 'live', latency: 4, icon: Zap, color: 'text-terminal-success', lastUpdate: new Date() },
      { name: 'Binance WS', status: 'live', latency: 2, icon: Wifi, color: 'text-terminal-success', lastUpdate: new Date() },
      { name: 'Solana RPC', status: 'live', latency: 6, icon: Globe, color: 'text-terminal-success', lastUpdate: new Date() },
      { name: 'BTC Dom', status: 'live', latency: 18, icon: Activity, color: 'text-terminal-success', lastUpdate: new Date() },
    ]

    setFeeds(initialFeeds)
    setCurrentTime(new Date())

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Simulate real-time feed updates
    const feedInterval = setInterval(() => {
      setFeeds(prev => prev.map(feed => ({
        ...feed,
        latency: Math.max(1, feed.latency + (Math.random() - 0.5) * 10),
        lastUpdate: new Date(),
        status: Math.random() > 0.95 ? 'delayed' : 'live' as any
      })))
      
      setGlobalLatency(prev => Math.max(1, prev + (Math.random() - 0.5) * 5))
    }, 3000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(feedInterval)
    }
  }, [isMounted])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'text-terminal-success'
      case 'delayed': return 'text-terminal-warning'
      case 'offline': return 'text-terminal-error'
      default: return 'text-terminal-muted'
    }
  }

  const liveFeeds = feeds.filter(f => f.status === 'live').length
  const avgLatency = feeds.reduce((acc, feed) => acc + feed.latency, 0) / feeds.length

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="h-6 bg-slate-900/90 border-t border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-terminal-success rounded-full animate-pulse"></div>
            <span className="text-2xs font-medium text-terminal-success">LOADING...</span>
          </div>
          <div className="text-2xs text-terminal-muted">Initializing...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-6 bg-slate-900/90 border-t border-slate-700/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 h-full">
        {/* Left Section - Feed Status */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-terminal-success rounded-full animate-pulse"></div>
              <span className="text-2xs font-medium text-terminal-success">LIVE</span>
            </div>
            <span className="text-2xs text-terminal-muted">•</span>
            <span className="text-2xs text-terminal-muted">
              {liveFeeds}/{feeds.length} feeds active
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <Activity className="w-3 h-3 text-terminal-success" />
            <span className="text-2xs text-terminal-muted">Latency:</span>
            <span className="text-2xs font-medium text-terminal-success">
              {Math.round(avgLatency)}ms
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <Wifi className="w-3 h-3 text-terminal-success" />
            <span className="text-2xs text-terminal-muted">Connections:</span>
            <span className="text-2xs font-medium text-terminal-success">{totalConnections}</span>
          </div>
        </div>

        {/* Center Section - Data Sources */}
        <div className="flex items-center space-x-4">
          {feeds.slice(0, 6).map((feed, index) => {
            const Icon = feed.icon
            return (
              <div key={index} className="flex items-center space-x-1" title={`${feed.name}: ${feed.latency}ms`}>
                <Icon className={`w-2.5 h-2.5 ${getStatusColor(feed.status)}`} />
                <span className={`text-2xs font-medium ${getStatusColor(feed.status)}`}>
                  {feed.name}
                </span>
                <span className="text-2xs text-terminal-muted">
                  {Math.round(feed.latency)}ms
                </span>
              </div>
            )
          })}
        </div>

        {/* Right Section - System Status */}
        <div className="flex items-center space-x-4">
                     <div className="flex items-center space-x-2">
             <div className="text-2xs text-terminal-muted">Last Update:</div>
             <div className="text-2xs font-medium text-terminal-success">
               {currentTime ? currentTime.toLocaleTimeString('en-US', { hour12: false }) : '--:--:--'}
             </div>
           </div>

          <div className="flex items-center space-x-2">
            <div className="text-2xs text-terminal-muted">Market:</div>
            <div className="text-2xs font-medium text-terminal-success">OPEN</div>
          </div>

          <div className="flex items-center space-x-2">
            <Globe className="w-3 h-3 text-terminal-success" />
            <div className="text-2xs text-terminal-muted">Global:</div>
            <div className="text-2xs font-medium text-terminal-success">
              {Math.round(globalLatency)}ms
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 