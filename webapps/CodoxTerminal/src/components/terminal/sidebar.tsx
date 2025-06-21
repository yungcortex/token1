'use client'

import { 
  BarChart3, 
  Coins, 
  TrendingUp, 
  Moon, 
  Fish, 
  Settings,
  Activity,
  Target,
  Zap,
  PieChart,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  Brain,
  Box
} from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  onNavigate?: (view: string) => void
  activeView?: string
}

const menuItems = [
  { id: 'main', icon: BarChart3, label: 'Dashboard', description: 'Main overview', category: 'core' },
  { id: 'trading', icon: TrendingUp, label: 'Trading', description: 'Advanced charts', category: 'core' },
  { id: 'correlations', icon: PieChart, label: 'Correlations', description: 'Market patterns', category: 'analytics' },
  { id: 'sentiment', icon: Activity, label: 'Sentiment', description: 'Social analysis', category: 'analytics' },
  { id: 'options', icon: Target, label: 'Options Flow', description: 'Derivatives data', category: 'advanced' },
  { id: 'onchain', icon: Coins, label: 'On-Chain', description: 'Blockchain metrics', category: 'advanced' },
  { id: 'whale', icon: Fish, label: 'Whale Tracker', description: 'Large transactions', category: 'advanced' },
  { id: 'lunar', icon: Moon, label: 'Lunar Analysis', description: 'Cycle patterns', category: 'advanced' },
  { id: 'arbitrage', icon: Zap, label: 'Arbitrage', description: 'Cross-exchange', category: 'advanced' },
  { id: '3d-heatmap', icon: Box, label: '3D Market Map', description: '3D visualization', category: 'advanced' },
  { id: 'ai-analysis', icon: Brain, label: 'AI Analysis', description: 'AI insights', category: 'ai' },
  { id: 'calendar', icon: Calendar, label: 'Economic Calendar', description: 'Market events', category: 'news' },
  { id: 'terminal', icon: Zap, label: 'Bloomberg Terminal', description: 'Professional terminal', category: 'advanced' },
  { id: 'news', icon: Newspaper, label: 'Real-Time News', description: 'Live market news', category: 'news' },
  { id: 'screener', icon: Search, label: 'Advanced Screener', description: 'Asset screening', category: 'tools' },
  { id: 'settings', icon: Settings, label: 'Settings', description: 'Configuration', category: 'system' },
]

const categories = {
  core: { label: 'Core', color: 'text-terminal-success' },
  analytics: { label: 'Analytics', color: 'text-blue-400' },
  advanced: { label: 'Advanced', color: 'text-purple-400' },
  ai: { label: 'AI', color: 'text-orange-400' },
  news: { label: 'News', color: 'text-yellow-400' },
  tools: { label: 'Tools', color: 'text-cyan-400' },
  system: { label: 'System', color: 'text-gray-400' },
}

export function Sidebar({ onNavigate, activeView = 'main' }: SidebarProps) {
  const [activeItem, setActiveItem] = useState(activeView)
  const [collapsed, setCollapsed] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['core', 'analytics']))

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId)
    if (onNavigate) {
      onNavigate(itemId)
    }
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof menuItems>)

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-48'} terminal-panel border-r border-slate-700/50 flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Header */}
      <div className="p-3 border-b border-slate-700/30 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-terminal-success rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-terminal-muted uppercase tracking-wider">Navigation</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-slate-700/50 text-terminal-muted hover:text-terminal-success transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
        <div className="p-2 space-y-1">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="space-y-1">
              {/* Category Header */}
              {!collapsed && (
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-2 py-1 text-2xs font-semibold uppercase tracking-wider text-terminal-muted hover:text-terminal-success transition-colors"
                >
                  <span className={categories[category as keyof typeof categories]?.color}>
                    {categories[category as keyof typeof categories]?.label}
                  </span>
                  <ChevronRight className={`w-3 h-3 transition-transform ${expandedCategories.has(category) ? 'rotate-90' : ''}`} />
                </button>
              )}
              
              {/* Category Items */}
              {(collapsed || expandedCategories.has(category)) && (
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon
                    const isActive = activeItem === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={`w-full flex items-center space-x-2 px-2 py-2 text-xs transition-all duration-200 rounded-md group relative ${
                          isActive
                            ? 'bg-gradient-to-r from-terminal-success/20 to-emerald-500/20 border border-terminal-success/30 text-terminal-success shadow-glow-sm'
                            : 'text-terminal-text hover:bg-slate-700/50 hover:text-terminal-success border border-transparent'
                        }`}
                        title={collapsed ? `${item.label} - ${item.description}` : undefined}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-terminal-success' : ''
                        }`} />
                        {!collapsed && (
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-medium truncate">{item.label}</div>
                          </div>
                        )}
                        {!collapsed && isActive && (
                          <div className="w-1.5 h-1.5 bg-terminal-success rounded-full animate-pulse flex-shrink-0"></div>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {collapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-terminal-text text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                            {item.label}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="p-3 border-t border-slate-700/30">
        <div className="terminal-panel p-2 space-y-2">
          {!collapsed && (
            <div className="text-2xs font-semibold text-terminal-muted uppercase tracking-wider">
              System Status
            </div>
          )}
          <div className="space-y-1.5">
            <div className={`flex ${collapsed ? 'justify-center' : 'justify-between'} items-center text-2xs`}>
              {!collapsed && <span className="text-terminal-muted">Data Feed:</span>}
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-terminal-success rounded-full animate-pulse"></div>
                {!collapsed && <span className="text-terminal-success font-medium">LIVE</span>}
              </div>
            </div>
            {!collapsed && (
              <>
                <div className="flex justify-between items-center text-2xs">
                  <span className="text-terminal-muted">Latency:</span>
                  <span className="text-terminal-success font-medium">12ms</span>
                </div>
                <div className="flex justify-between items-center text-2xs">
                  <span className="text-terminal-muted">WebSocket:</span>
                  <span className="text-terminal-success font-medium">Connected</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
} 