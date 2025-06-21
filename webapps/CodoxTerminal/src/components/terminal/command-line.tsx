'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Terminal, 
  Search, 
  Calculator, 
  TrendingUp, 
  Calendar, 
  Newspaper, 
  Settings,
  HelpCircle,
  Zap,
  ChevronRight
} from 'lucide-react'

interface Command {
  command: string
  description: string
  category: 'market' | 'analysis' | 'tools' | 'navigation'
  function: string
  example?: string
}

interface CommandResult {
  type: 'success' | 'error' | 'info'
  message: string
  data?: any
}

interface CommandLineProps {
  onCommand?: (command: string) => void
  onViewChange?: (view: string) => void
}

export function CommandLine({ onCommand, onViewChange }: CommandLineProps) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [suggestions, setSuggestions] = useState<Command[]>([])
  const [showHelp, setShowHelp] = useState(false)
  const [results, setResults] = useState<CommandResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Bloomberg-style commands
  const commands: Command[] = [
    // Market Data
    { command: 'BTC', description: 'Bitcoin price and analysis', category: 'market', function: 'BTC<GO>' },
    { command: 'ETH', description: 'Ethereum price and analysis', category: 'market', function: 'ETH<GO>' },
    { command: 'SOL', description: 'Solana price and analysis', category: 'market', function: 'SOL<GO>' },
    { command: 'TOP', description: 'Top movers and market overview', category: 'market', function: 'TOP<GO>' },
    { command: 'HEAT', description: 'Market heatmap visualization', category: 'market', function: 'HEAT<GO>' },
    { command: 'VOL', description: 'Volume analysis', category: 'market', function: 'VOL<GO>' },
    
    // Analysis Tools
    { command: 'CORR', description: 'Correlation analysis', category: 'analysis', function: 'CORR<GO>' },
    { command: 'TECH', description: 'Technical analysis', category: 'analysis', function: 'TECH<GO>' },
    { command: 'FLOW', description: 'Institutional flow analysis', category: 'analysis', function: 'FLOW<GO>' },
    { command: 'WHALE', description: 'Whale activity tracker', category: 'analysis', function: 'WHALE<GO>' },
    { command: 'SENT', description: 'Social sentiment analysis', category: 'analysis', function: 'SENT<GO>' },
    { command: 'AI', description: 'AI insights and predictions', category: 'analysis', function: 'AI<GO>' },
    
    // Tools
    { command: 'CALC', description: 'Position size calculator', category: 'tools', function: 'CALC<GO>' },
    { command: 'ALERT', description: 'Price alerts manager', category: 'tools', function: 'ALERT<GO>' },
    { command: 'SCREEN', description: 'Token screener', category: 'tools', function: 'SCREEN<GO>' },
    { command: 'RISK', description: 'Risk management tools', category: 'tools', function: 'RISK<GO>' },
    
    // Navigation
    { command: 'NEWS', description: 'Market news feed', category: 'navigation', function: 'NEWS<GO>' },
    { command: 'CAL', description: 'Economic calendar', category: 'navigation', function: 'CAL<GO>' },
    { command: 'SET', description: 'Settings panel', category: 'navigation', function: 'SET<GO>' },
    { command: 'HELP', description: 'Command help system', category: 'navigation', function: 'HELP<GO>' },
    { command: 'MAIN', description: 'Main dashboard', category: 'navigation', function: 'MAIN<GO>' },
    { command: 'CLEAR', description: 'Clear terminal', category: 'navigation', function: 'CLEAR<GO>' }
  ]

  // Function key mappings (Bloomberg style)
  const functionKeys = [
    { key: 'F1', command: 'HELP', description: 'Help' },
    { key: 'F2', command: 'NEWS', description: 'News' },
    { key: 'F3', command: 'CAL', description: 'Calendar' },
    { key: 'F4', command: 'TECH', description: 'Charts' },
    { key: 'F5', command: 'SCREEN', description: 'Screener' },
    { key: 'F6', command: 'WHALE', description: 'Whales' },
    { key: 'F7', command: 'FLOW', description: 'Flows' },
    { key: 'F8', command: 'AI', description: 'AI' },
    { key: 'F9', command: 'RISK', description: 'Risk' },
    { key: 'F10', command: 'SET', description: 'Settings' }
  ]

  useEffect(() => {
    // Filter suggestions based on input
    if (input.length > 0) {
      const filtered = commands.filter(cmd => 
        cmd.command.toLowerCase().includes(input.toLowerCase()) ||
        cmd.description.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 8)
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }, [input])

  useEffect(() => {
    // Handle function key presses
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= 'F1' && e.key <= 'F12') {
        e.preventDefault()
        const functionKey = functionKeys.find(fk => fk.key === e.key)
        if (functionKey) {
          executeCommand(functionKey.command)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const executeCommand = (cmd: string) => {
    const command = cmd.toUpperCase().trim()
    
    // Add to history
    setHistory(prev => [...prev, command].slice(-50))
    setHistoryIndex(-1)
    
    // Clear input
    setInput('')
    setSuggestions([])

    // Execute command
    const commandObj = commands.find(c => c.command === command)
    
    if (commandObj) {
      const result: CommandResult = {
        type: 'success',
        message: `Executing ${commandObj.function}...`
      }
      
      setResults(prev => [...prev, result].slice(-20))
      
      // Handle specific commands
      switch (command) {
        case 'BTC':
        case 'ETH':
        case 'SOL':
          onViewChange?.('price-charts')
          break
        case 'HEAT':
          onViewChange?.('3d-heatmap')
          break
        case 'NEWS':
          onViewChange?.('news')
          break
        case 'CAL':
          onViewChange?.('calendar')
          break
        case 'AI':
          onViewChange?.('ai-analysis')
          break
        case 'WHALE':
          onViewChange?.('whale-tracker')
          break
        case 'FLOW':
          onViewChange?.('institutional-flow')
          break
        case 'CORR':
          onViewChange?.('correlation-matrix')
          break
        case 'SENT':
          onViewChange?.('social-sentiment')
          break
        case 'TOP':
          onViewChange?.('top-movers')
          break
        case 'MAIN':
          onViewChange?.('main')
          break
        case 'HELP':
          setShowHelp(true)
          break
        case 'CLEAR':
          setResults([])
          break
        case 'CALC':
          calculatePosition()
          break
        default:
          onViewChange?.(command.toLowerCase())
      }
      
      onCommand?.(command)
    } else {
      // Handle calculation commands
      if (command.includes('*') || command.includes('+') || command.includes('-') || command.includes('/')) {
        try {
          const result = eval(command)
          setResults(prev => [...prev, {
            type: 'success' as const,
            message: `${command} = ${result}`
          }].slice(-20))
        } catch {
          setResults(prev => [...prev, {
            type: 'error' as const,
            message: `Invalid calculation: ${command}`
          }].slice(-20))
        }
      } else {
        setResults(prev => [...prev, {
          type: 'error' as const,
          message: `Unknown command: ${command}. Type HELP for available commands.`
        }].slice(-20))
      }
    }
  }

  const calculatePosition = () => {
    const result: CommandResult = {
      type: 'info',
      message: 'Position Calculator: Risk 2% of $10,000 = $200 max loss. At 5% stop loss, max position = $4,000'
    }
    setResults(prev => [...prev, result].slice(-20))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setInput(history[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= history.length) {
          setHistoryIndex(-1)
          setInput('')
        } else {
          setHistoryIndex(newIndex)
          setInput(history[newIndex])
        }
      }
    } else if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault()
      setInput(suggestions[0].command)
      setSuggestions([])
    } else if (e.key === 'Escape') {
      setInput('')
      setSuggestions([])
      setShowHelp(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'market': return 'text-terminal-accent'
      case 'analysis': return 'text-terminal-success'
      case 'tools': return 'text-terminal-warning'
      case 'navigation': return 'text-purple-400'
      default: return 'text-terminal-muted'
    }
  }

  return (
    <div className="terminal-panel p-4 h-full flex flex-col">
      {/* Function Keys Bar */}
      <div className="flex items-center justify-between mb-4 p-2 bg-terminal-glass rounded border border-terminal-border">
        <div className="flex items-center space-x-1">
          <Terminal className="w-4 h-4 text-terminal-accent" />
          <span className="text-xs text-terminal-muted font-mono">BLOOMBERG TERMINAL</span>
        </div>
        <div className="flex items-center space-x-1">
          {functionKeys.slice(0, 5).map(fk => (
            <button
              key={fk.key}
              onClick={() => executeCommand(fk.command)}
              className="px-2 py-1 text-2xs bg-terminal-border hover:bg-terminal-accent/20 rounded font-mono transition-colors"
              title={fk.description}
            >
              {fk.key}
            </button>
          ))}
        </div>
      </div>

      {/* Command Input */}
      <div className="relative mb-4">
        <div className="flex items-center space-x-2 p-3 bg-terminal-glass border border-terminal-border rounded">
          <ChevronRight className="w-4 h-4 text-terminal-accent" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command... (e.g., BTC<GO>, NEWS<GO>, HELP<GO>)"
            className="flex-1 bg-transparent text-terminal-text font-mono text-sm focus:outline-none"
            autoFocus
          />
          <div className="text-xs text-terminal-muted">
            Press F1-F10 for shortcuts
          </div>
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 z-50 mt-1 bg-terminal-panel border border-terminal-border rounded shadow-xl max-h-64 overflow-auto"
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.command}
                  onClick={() => {
                    setInput(suggestion.command)
                    setSuggestions([])
                    inputRef.current?.focus()
                  }}
                  className="flex items-center justify-between p-3 hover:bg-terminal-glass cursor-pointer border-b border-terminal-border last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`text-sm font-bold font-mono ${getCategoryColor(suggestion.category)}`}>
                      {suggestion.function}
                    </div>
                    <div className="text-xs text-terminal-muted">
                      {suggestion.description}
                    </div>
                  </div>
                  <div className="text-2xs text-terminal-muted font-mono">
                    {suggestion.category.toUpperCase()}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-auto space-y-2">
        {results.map((result, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-2 rounded text-sm font-mono ${
              result.type === 'success' ? 'text-terminal-success bg-terminal-success/10' :
              result.type === 'error' ? 'text-terminal-error bg-terminal-error/10' :
              'text-terminal-text bg-terminal-glass'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-terminal-muted">→</span>
              <span>{result.message}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-terminal-panel border border-terminal-border rounded-xl p-6 max-w-4xl max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <HelpCircle className="w-6 h-6 text-terminal-accent" />
                  <h2 className="text-xl font-bold text-terminal-text">Command Reference</h2>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-terminal-muted hover:text-terminal-text"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {['market', 'analysis', 'tools', 'navigation'].map(category => (
                  <div key={category}>
                    <h3 className={`text-lg font-bold mb-3 ${getCategoryColor(category)}`}>
                      {category.toUpperCase()}
                    </h3>
                    <div className="space-y-2">
                      {commands.filter(cmd => cmd.category === category).map(cmd => (
                        <div key={cmd.command} className="flex items-center justify-between p-2 bg-terminal-glass rounded">
                          <div>
                            <div className="text-sm font-bold font-mono text-terminal-text">
                              {cmd.function}
                            </div>
                            <div className="text-xs text-terminal-muted">
                              {cmd.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-terminal-border">
                <h3 className="text-lg font-bold mb-3 text-terminal-warning">FUNCTION KEYS</h3>
                <div className="grid grid-cols-5 gap-2">
                  {functionKeys.map(fk => (
                    <div key={fk.key} className="p-2 bg-terminal-glass rounded text-center">
                      <div className="text-sm font-bold font-mono text-terminal-accent">{fk.key}</div>
                      <div className="text-xs text-terminal-muted">{fk.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Bar */}
      <div className="mt-4 pt-2 border-t border-terminal-border flex items-center justify-between text-xs text-terminal-muted">
        <div className="flex items-center space-x-4">
          <span>Commands: {commands.length}</span>
          <span>History: {history.length}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="w-3 h-3 text-terminal-accent" />
          <span>Ready</span>
        </div>
      </div>
    </div>
  )
} 