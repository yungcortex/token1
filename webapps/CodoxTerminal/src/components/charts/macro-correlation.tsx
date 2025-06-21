'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Globe, DollarSign, Zap, AlertTriangle } from 'lucide-react'

interface MacroAsset {
  symbol: string
  name: string
  price: number
  change24h: number
  correlation: number
  beta: number
  risk: 'low' | 'medium' | 'high'
  category: 'crypto' | 'equity' | 'commodity' | 'forex' | 'bond'
}

interface CorrelationPair {
  crypto: string
  asset: string
  correlation: number
  significance: number
  trend: 'strengthening' | 'weakening' | 'stable'
}

export function MacroCorrelation() {
  const [assets, setAssets] = useState<MacroAsset[]>([])
  const [correlationPairs, setCorrelationPairs] = useState<CorrelationPair[]>([])
  const [selectedCrypto, setSelectedCrypto] = useState('BTC')
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '90D' | '1Y'>('30D')
  const [riskRegime, setRiskRegime] = useState<'risk-on' | 'risk-off' | 'neutral'>('neutral')

  const cryptos = ['BTC', 'ETH', 'SOL', 'TOTAL_CRYPTO']

  useEffect(() => {
    const generateMacroData = () => {
      const macroAssets: MacroAsset[] = [
        // Crypto
            { symbol: 'BTC', name: 'Bitcoin', price: 106088, change24h: 1.27, correlation: 1.0, beta: 1.0, risk: 'high', category: 'crypto' },
    { symbol: 'ETH', name: 'Ethereum', price: 2553, change24h: 1.16, correlation: 0.85, beta: 1.2, risk: 'high', category: 'crypto' },
        
        // Equities
        { symbol: 'SPY', name: 'S&P 500', price: 450, change24h: 0.8, correlation: 0.45, beta: 0.6, risk: 'medium', category: 'equity' },
        { symbol: 'QQQ', name: 'Nasdaq 100', price: 380, change24h: 1.2, correlation: 0.62, beta: 0.8, risk: 'medium', category: 'equity' },
        { symbol: 'ARKK', name: 'ARK Innovation', price: 45, change24h: 2.8, correlation: 0.71, beta: 1.4, risk: 'high', category: 'equity' },
        
        // Commodities
        { symbol: 'GLD', name: 'Gold', price: 195, change24h: -0.5, correlation: -0.15, beta: -0.2, risk: 'low', category: 'commodity' },
        { symbol: 'USO', name: 'Oil', price: 78, change24h: 1.8, correlation: 0.25, beta: 0.3, risk: 'medium', category: 'commodity' },
        
        // Forex
        { symbol: 'DXY', name: 'Dollar Index', price: 103.5, change24h: -0.3, correlation: -0.35, beta: -0.4, risk: 'low', category: 'forex' },
        { symbol: 'USDJPY', name: 'USD/JPY', price: 150.2, change24h: 0.2, correlation: 0.18, beta: 0.2, risk: 'low', category: 'forex' },
        
        // Bonds
        { symbol: 'TLT', name: '20Y Treasury', price: 92, change24h: -0.8, correlation: -0.42, beta: -0.5, risk: 'low', category: 'bond' },
        { symbol: 'HYG', name: 'High Yield', price: 78, change24h: 1.1, correlation: 0.55, beta: 0.7, risk: 'medium', category: 'bond' }
      ]

      // Add randomness to simulate real-time updates
      const updatedAssets = macroAssets.map(asset => ({
        ...asset,
        price: asset.price * (1 + (Math.random() - 0.5) * 0.02),
        change24h: asset.change24h + (Math.random() - 0.5) * 0.5,
        correlation: Math.max(-1, Math.min(1, asset.correlation + (Math.random() - 0.5) * 0.1))
      }))

      setAssets(updatedAssets)

      // Generate correlation pairs
      const pairs: CorrelationPair[] = []
      const cryptoAssets = updatedAssets.filter(a => a.category === 'crypto')
      const nonCryptoAssets = updatedAssets.filter(a => a.category !== 'crypto')

      cryptoAssets.forEach(crypto => {
        nonCryptoAssets.forEach(asset => {
          const correlation = asset.correlation + (Math.random() - 0.5) * 0.2
          pairs.push({
            crypto: crypto.symbol,
            asset: asset.symbol,
            correlation: Math.max(-1, Math.min(1, correlation)),
            significance: Math.random(),
            trend: Math.random() > 0.6 ? 'strengthening' : Math.random() > 0.3 ? 'weakening' : 'stable'
          })
        })
      })

      setCorrelationPairs(pairs)

      // Determine risk regime
      const spyChange = updatedAssets.find(a => a.symbol === 'SPY')?.change24h || 0
      const vixLevel = 15 + Math.random() * 20 // Mock VIX
      const btcChange = updatedAssets.find(a => a.symbol === 'BTC')?.change24h || 0

      if (spyChange > 1 && btcChange > 2 && vixLevel < 20) {
        setRiskRegime('risk-on')
      } else if (spyChange < -1 && btcChange < -2 && vixLevel > 25) {
        setRiskRegime('risk-off')
      } else {
        setRiskRegime('neutral')
      }
    }

    generateMacroData()
    const interval = setInterval(generateMacroData, 10000)
    
    return () => clearInterval(interval)
  }, [timeframe])

  const getCorrelationColor = (correlation: number) => {
    const intensity = Math.abs(correlation)
    if (correlation > 0.5) return 'text-green-400'
    if (correlation > 0.2) return 'text-yellow-400'
    if (correlation > -0.2) return 'text-terminal-text'
    if (correlation > -0.5) return 'text-orange-400'
    return 'text-red-400'
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-terminal-text'
    }
  }

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'risk-on': return 'text-green-400'
      case 'risk-off': return 'text-red-400'
      case 'neutral': return 'text-yellow-400'
      default: return 'text-terminal-text'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'crypto': return '₿'
      case 'equity': return '📈'
      case 'commodity': return '🏗️'
      case 'forex': return '💱'
      case 'bond': return '🏛️'
      default: return '📊'
    }
  }

  const selectedCorrelations = correlationPairs.filter(p => p.crypto === selectedCrypto)

  return (
    <div className="terminal-window h-full">
      <div className="terminal-header">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-terminal-accent" />
            <h3 className="text-lg font-bold text-terminal-text">MACRO CORRELATION</h3>
            <div className="animate-pulse">
              <span className="text-terminal-success">●</span> LIVE
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Crypto selector */}
            <select 
              value={selectedCrypto} 
              onChange={(e) => setSelectedCrypto(e.target.value)}
              className="terminal-input text-sm"
            >
              {cryptos.map(crypto => (
                <option key={crypto} value={crypto}>{crypto}</option>
              ))}
            </select>

            {/* Timeframe selector */}
            <div className="flex space-x-1">
              {(['7D', '30D', '90D', '1Y'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`terminal-button text-xs px-2 py-1 ${
                    timeframe === tf ? 'bg-terminal-success text-black' : ''
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Regime Indicator */}
        <div className="mb-4 p-3 bg-terminal-border rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-terminal-accent" />
              <span className="text-sm font-bold">MARKET REGIME:</span>
              <span className={`text-sm font-bold uppercase ${getRegimeColor(riskRegime)}`}>
                {riskRegime}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <span className="text-terminal-text opacity-70">Risk Assets:</span>
                <span className={riskRegime === 'risk-on' ? 'text-green-400' : 'text-red-400'}>
                  {riskRegime === 'risk-on' ? '🔥 HOT' : '❄️ COLD'}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-terminal-text opacity-70">Volatility:</span>
                <span className="text-terminal-warning">
                  {riskRegime === 'risk-off' ? 'HIGH' : 'NORMAL'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="terminal-content">
        <div className="grid grid-cols-2 gap-4 h-full">
          {/* All Assets Overview */}
          <div>
            <h4 className="text-sm font-bold mb-3 flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>ALL ASSETS</span>
            </h4>
            <div className="space-y-2 max-h-80 overflow-auto">
              {assets.map(asset => (
                <div key={asset.symbol} className="flex items-center justify-between p-2 bg-terminal-border rounded hover:bg-opacity-80 transition-colors">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCategoryIcon(asset.category)}</span>
                    <div>
                      <div className="font-bold text-sm">{asset.symbol}</div>
                      <div className="text-xs text-terminal-text opacity-70">{asset.name}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-bold">${asset.price.toFixed(2)}</div>
                    <div className={`text-xs ${asset.change24h >= 0 ? 'text-terminal-success' : 'text-terminal-error'}`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-bold ${getCorrelationColor(asset.correlation)}`}>
                      {asset.correlation.toFixed(2)}
                    </div>
                    <div className="text-xs text-terminal-text opacity-70">
                      β: {asset.beta.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className={`text-xs font-bold ${getRiskColor(asset.risk)}`}>
                    {asset.risk.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Correlation Details */}
          <div>
            <h4 className="text-sm font-bold mb-3 flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>{selectedCrypto} CORRELATIONS</span>
            </h4>
            <div className="space-y-2 max-h-80 overflow-auto">
              {selectedCorrelations
                .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
                .map((pair, index) => {
                  const asset = assets.find(a => a.symbol === pair.asset)
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-terminal-border rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getCategoryIcon(asset?.category || 'equity')}</span>
                        <div>
                          <div className="font-bold text-sm">{pair.asset}</div>
                          <div className="text-xs text-terminal-text opacity-70">{asset?.name}</div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-sm font-bold ${getCorrelationColor(pair.correlation)}`}>
                          {pair.correlation >= 0 ? '+' : ''}{pair.correlation.toFixed(3)}
                        </div>
                        <div className="text-xs text-terminal-text opacity-70">
                          p: {pair.significance.toFixed(3)}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-xs font-bold ${
                          pair.trend === 'strengthening' ? 'text-green-400' :
                          pair.trend === 'weakening' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {pair.trend === 'strengthening' ? '↗️ STR' :
                           pair.trend === 'weakening' ? '↘️ WEK' : '→ STB'}
                        </div>
                        <div className="flex items-center">
                          {pair.correlation >= 0 ? 
                            <TrendingUp className="w-3 h-3 text-green-400" /> : 
                            <TrendingDown className="w-3 h-3 text-red-400" />
                          }
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      </div>

      <div className="terminal-footer mt-4">
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div className="bg-terminal-border p-2 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-terminal-text opacity-70">Positive Correlations</span>
            </div>
            <div className="font-bold text-green-400">
              {selectedCorrelations.filter(p => p.correlation > 0.3).length}
            </div>
          </div>

          <div className="bg-terminal-border p-2 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <TrendingDown className="w-3 h-3 text-red-400" />
              <span className="text-terminal-text opacity-70">Negative Correlations</span>
            </div>
            <div className="font-bold text-red-400">
              {selectedCorrelations.filter(p => p.correlation < -0.3).length}
            </div>
          </div>

          <div className="bg-terminal-border p-2 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
              <span className="text-terminal-text opacity-70">Strong Correlations</span>
            </div>
            <div className="font-bold text-yellow-400">
              {selectedCorrelations.filter(p => Math.abs(p.correlation) > 0.6).length}
            </div>
          </div>

          <div className="bg-terminal-border p-2 rounded">
            <div className="flex items-center space-x-1 mb-1">
              <Zap className="w-3 h-3 text-purple-400" />
              <span className="text-terminal-text opacity-70">Changing Trends</span>
            </div>
            <div className="font-bold text-purple-400">
              {selectedCorrelations.filter(p => p.trend !== 'stable').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 