'use client'

import { Clock, Settings, User, Bell, Zap, Activity, 
  BarChart3, TrendingUp, PieChart, Target, Coins, Fish, Moon,
  Search, Calendar, Newspaper, Brain, Box, ChevronDown, Monitor } from 'lucide-react'
import { useState, useEffect } from 'react'

const navigationTabs = [
  { id: 'main', icon: BarChart3, label: 'Dashboard', hotkey: 'F1' },
  { id: 'trading', icon: TrendingUp, label: 'Trading', hotkey: 'F2' },
  { id: 'correlations', icon: PieChart, label: 'Analytics', hotkey: 'F3' },
  { id: 'sentiment', icon: Activity, label: 'Sentiment', hotkey: 'F4' },
  { id: 'options', icon: Target, label: 'Options', hotkey: 'F5' },
  { id: 'onchain', icon: Coins, label: 'On-Chain', hotkey: 'F6' },
  { id: 'whale', icon: Fish, label: 'Whales', hotkey: 'F7' },
  { id: 'lunar', icon: Moon, label: 'Lunar', hotkey: 'F8' },
  { id: 'terminal', icon: Monitor, label: 'Terminal', hotkey: 'F9' },
  { id: 'news', icon: Newspaper, label: 'News', hotkey: 'F10' },
  { id: 'screener', icon: Search, label: 'Screener', hotkey: 'F11' },
]

interface HeaderProps {
  activeView?: string
  onNavigate?: (view: string) => void
}

export function Header({ activeView = 'main', onNavigate }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  useEffect(() => {
    // Set initial time after hydration on client-side only
    if (typeof window !== 'undefined') {
      setCurrentTime(new Date())
      
      const timer = setInterval(() => {
        setCurrentTime(new Date())
      }, 1000)

      // Keyboard shortcuts
      const handleKeyPress = (e: KeyboardEvent) => {
        const tab = navigationTabs.find(t => t.hotkey === e.code.replace('Key', '').replace('Digit', 'F'))
        if (tab && onNavigate) {
          onNavigate(tab.id)
        }
      }

      window.addEventListener('keydown', handleKeyPress)

      return () => {
        clearInterval(timer)
        window.removeEventListener('keydown', handleKeyPress)
      }
    }
  }, [onNavigate])

  const handleTabClick = (tabId: string) => {
    if (onNavigate) {
      onNavigate(tabId)
    }
  }

  const visibleTabs = navigationTabs.slice(0, 8)
  const hiddenTabs = navigationTabs.slice(8)

  return (
    <header className="h-12 terminal-header flex items-center justify-between px-4 sticky top-0 z-50 border-b border-slate-700/50">
      {/* Left Section - Branding + Navigation */}
      <div className="flex items-center space-x-6 flex-1">
        <div className="flex items-center space-x-3">
          <div className="text-terminal-success font-bold text-lg gradient-text">
            CODOX TERMINAL
          </div>
          <div className="flex items-center space-x-2 text-xs text-terminal-muted">
            <span className="text-2xs font-medium">v1.0.0</span>
            <div className="w-1 h-1 bg-terminal-muted rounded-full"></div>
            <div className="status-indicator status-live">
              <Activity className="w-2.5 h-2.5 mr-1" />
              LIVE
            </div>
          </div>
        </div>

        {/* Bloomberg-style Navigation Tabs */}
        <div className="flex items-center space-x-0.5">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeView === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium transition-all duration-200 rounded-md border ${
                  isActive
                    ? 'bg-gradient-to-r from-terminal-success/20 to-emerald-500/20 border-terminal-success/40 text-terminal-success shadow-glow-xs'
                    : 'border-transparent text-terminal-muted hover:text-terminal-success hover:bg-slate-700/30'
                }`}
                title={`${tab.label} (${tab.hotkey})`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
          
          {/* More Menu */}
          {hiddenTabs.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-terminal-muted hover:text-terminal-success hover:bg-slate-700/30 transition-all duration-200 rounded-md border border-transparent"
              >
                <span>More</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {showMoreMenu && (
                <div className="absolute top-full mt-1 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 min-w-32">
                  {hiddenTabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeView === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          handleTabClick(tab.id)
                          setShowMoreMenu(false)
                        }}
                        className={`w-full flex items-center space-x-2 px-3 py-2 text-xs transition-colors ${
                          isActive
                            ? 'text-terminal-success bg-terminal-success/10'
                            : 'text-terminal-muted hover:text-terminal-success hover:bg-slate-700/50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Status + Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 status-indicator bg-gradient-to-r from-terminal-accent/20 to-terminal-warning/20 border-terminal-accent/30 px-2 py-1">
          <Zap className="w-2.5 h-2.5 text-terminal-accent" />
          <span className="text-2xs font-semibold gradient-text-accent">REAL-TIME</span>
        </div>

        <div className="flex items-center space-x-1.5 text-xs font-mono bg-slate-800/50 px-2.5 py-1 rounded border border-slate-700/50">
          <Clock className="w-3.5 h-3.5 text-terminal-success" />
          <span className="text-terminal-text">
            {currentTime?.toLocaleTimeString('en-US', { 
              hour12: false,
              timeZoneName: 'short'
            }) || '--:--:--'}
          </span>
        </div>
        
        <div className="flex items-center space-x-0.5">
          <button className="p-1.5 hover:bg-slate-700/50 rounded transition-all duration-200 group border border-transparent hover:border-slate-600/50">
            <Bell className="w-3.5 h-3.5 text-terminal-muted group-hover:text-terminal-success transition-colors" />
          </button>
          <button className="p-1.5 hover:bg-slate-700/50 rounded transition-all duration-200 group border border-transparent hover:border-slate-600/50">
            <Settings className="w-3.5 h-3.5 text-terminal-muted group-hover:text-terminal-success transition-colors" />
          </button>
          <button className="p-1.5 hover:bg-slate-700/50 rounded transition-all duration-200 group border border-transparent hover:border-slate-600/50">
            <User className="w-3.5 h-3.5 text-terminal-muted group-hover:text-terminal-success transition-colors" />
          </button>
        </div>
      </div>
    </header>
  )
} 