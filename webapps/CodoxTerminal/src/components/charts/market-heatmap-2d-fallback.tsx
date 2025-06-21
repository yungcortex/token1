'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface MarketData {
  symbol: string
  name: string
  price: number
  change24h: number
  volume: number
  marketCap: number
  sector: string
}

const mockData: MarketData[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 67500, change24h: 3.2, volume: 12.4e9, marketCap: 1.3e12, sector: 'Store of Value' },
  { symbol: 'ETH', name: 'Ethereum', price: 3850, change24h: 5.1, volume: 8.2e9, marketCap: 460e9, sector: 'Smart Contract' },
  { symbol: 'SOL', name: 'Solana', price: 165, change24h: 8.7, volume: 2.1e9, marketCap: 78e9, sector: 'Smart Contract' },
  { symbol: 'BONK', name: 'Bonk', price: 0.000032, change24h: -12.3, volume: 450e6, marketCap: 2.1e9, sector: 'Meme' },
  { symbol: 'WIF', name: 'dogwifhat', price: 3.2, change24h: 15.4, volume: 180e6, marketCap: 3.2e9, sector: 'Meme' },
  { symbol: 'PEPE', name: 'Pepe', price: 0.000021, change24h: -8.1, volume: 320e6, marketCap: 8.8e9, sector: 'Meme' },
  { symbol: 'MATIC', name: 'Polygon', price: 0.92, change24h: 2.8, volume: 180e6, marketCap: 9.1e9, sector: 'Layer 2' },
  { symbol: 'AVAX', name: 'Avalanche', price: 34.5, change24h: 6.2, volume: 240e6, marketCap: 13.2e9, sector: 'Smart Contract' },
  { symbol: 'LINK', name: 'Chainlink', price: 15.8, change24h: 4.1, volume: 320e6, marketCap: 9.5e9, sector: 'Oracle' },
  { symbol: 'UNI', name: 'Uniswap', price: 8.9, change24h: -1.2, volume: 120e6, marketCap: 5.3e9, sector: 'DEX' },
  { symbol: 'AAVE', name: 'Aave', price: 145, change24h: 7.3, volume: 85e6, marketCap: 2.1e9, sector: 'DeFi' },
  { symbol: 'COMP', name: 'Compound', price: 62, change24h: -3.4, volume: 45e6, marketCap: 380e6, sector: 'DeFi' },
]

interface MarketHeatmap2DProps {
  data?: MarketData[]
}

export function MarketHeatmap2D({ data = mockData }: MarketHeatmap2DProps) {
  const [selectedAsset, setSelectedAsset] = useState<MarketData | null>(null)

  const getColor = (change: number) => {
    if (change > 5) return 'bg-terminal-success'
    if (change > 0) return 'bg-green-500'
    if (change > -5) return 'bg-terminal-error'
    return 'bg-red-700'
  }

  const getSize = (marketCap: number) => {
    const minSize = 60
    const maxSize = 120
    const scale = Math.log10(marketCap / 1e6)
    return Math.max(minSize, Math.min(maxSize, scale * 10))
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="terminal-panel p-6 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-terminal-accent rounded-full animate-pulse"></div>
          <h3 className="text-lg font-bold text-terminal-text font-display">
            Market Heatmap (2D Fallback)
          </h3>
        </div>
        <div className="text-xs text-terminal-muted font-mono">
          Size: Market Cap | Color: 24h Change
        </div>
      </div>

      {/* 2D Grid */}
      <div className="relative h-96 bg-gradient-to-br from-terminal-bg to-terminal-glass rounded-lg overflow-hidden p-4">
        <div className="flex flex-wrap gap-2 h-full items-center justify-center">
          {data.map((asset, index) => (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedAsset(asset)}
              className={`
                ${getColor(asset.change24h)} 
                rounded-lg cursor-pointer transition-all duration-300
                hover:scale-110 hover:shadow-lg hover:shadow-terminal-accent/20
                flex flex-col items-center justify-center p-2
              `}
              style={{ 
                width: getSize(asset.marketCap),
                height: getSize(asset.marketCap) * 0.8
              }}
            >
              <div className="text-xs font-bold text-white">{asset.symbol}</div>
              <div className="text-2xs text-white/80">
                {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(1)}%
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Asset Details Panel */}
      {selectedAsset && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-terminal-glass rounded-lg border border-terminal-border"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-bold text-terminal-text">{selectedAsset.name}</div>
              <div className="text-xs text-terminal-muted">({selectedAsset.symbol})</div>
              <div className="px-2 py-1 bg-terminal-accent/20 text-terminal-accent text-2xs rounded">
                {selectedAsset.sector}
              </div>
            </div>
            <button
              onClick={() => setSelectedAsset(null)}
              className="text-terminal-muted hover:text-terminal-text transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-terminal-muted">Price</div>
              <div className="text-terminal-text font-mono">
                ${selectedAsset.price >= 1 
                  ? selectedAsset.price.toLocaleString() 
                  : selectedAsset.price.toFixed(6)
                }
              </div>
            </div>
            <div>
              <div className="text-terminal-muted">24h Change</div>
              <div className={`font-mono ${selectedAsset.change24h >= 0 ? 'text-terminal-success' : 'text-terminal-error'}`}>
                {selectedAsset.change24h >= 0 ? '+' : ''}{selectedAsset.change24h.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-terminal-muted">Volume</div>
              <div className="text-terminal-text font-mono">
                ${(selectedAsset.volume / 1e9).toFixed(2)}B
              </div>
            </div>
            <div>
              <div className="text-terminal-muted">Market Cap</div>
              <div className="text-terminal-text font-mono">
                ${(selectedAsset.marketCap / 1e9).toFixed(1)}B
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-2xs text-terminal-muted">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-terminal-success rounded"></div>
          <span>Strong Gain (+5%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Gain (0-5%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-terminal-error rounded"></div>
          <span>Loss (0-5%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-700 rounded"></div>
          <span>Strong Loss (-5%)</span>
        </div>
      </div>
    </motion.div>
  )
}