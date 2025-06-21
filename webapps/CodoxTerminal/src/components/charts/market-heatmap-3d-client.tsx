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

interface MarketHeatmap3DProps {
  data?: MarketData[]
  autoRotate?: boolean
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
]

function MarketCube({ 
  data, 
  onClick,
  style
}: { 
  data: MarketData
  onClick: (data: MarketData) => void
  style: React.CSSProperties
}) {
  const [hovered, setHovered] = useState(false)

  // Calculate color based on 24h change
  let backgroundColor = '#64748B'
  let borderColor = '#64748B'
  if (data.change24h > 5) {
    backgroundColor = '#00FF88'
    borderColor = '#00FF88'
  } else if (data.change24h > 0) {
    backgroundColor = '#10B981'
    borderColor = '#10B981'
  } else if (data.change24h > -5) {
    backgroundColor = '#EF4444'
    borderColor = '#EF4444'
  } else {
    backgroundColor = '#DC2626'
    borderColor = '#DC2626'
  }

  const textColor = data.change24h >= 0 ? '#00FF88' : '#FF4757'

  return (
    <motion.div
      className="relative cursor-pointer transition-all duration-300"
      style={{
        ...style,
        background: `linear-gradient(135deg, ${backgroundColor}33, ${backgroundColor}66)`,
        border: `2px solid ${borderColor}`,
        borderRadius: '8px',
        transform: hovered ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)',
        boxShadow: hovered 
          ? `0 8px 25px ${backgroundColor}33, 0 0 0 1px ${borderColor}66`
          : `0 4px 10px ${backgroundColor}22`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(data)}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Symbol */}
      <div className="absolute top-2 left-2 text-white font-bold text-sm">
        {data.symbol}
      </div>
      
      {/* Performance */}
      <div 
        className="absolute bottom-2 right-2 font-mono text-xs font-medium"
        style={{ color: textColor }}
      >
        {data.change24h >= 0 ? '+' : ''}{data.change24h.toFixed(1)}%
      </div>

      {/* Market Cap Indicator */}
      <div className="absolute bottom-2 left-2 text-white/70 text-2xs">
        ${(data.marketCap / 1e9).toFixed(1)}B
      </div>

      {/* Glow effect when hovered */}
      {hovered && (
        <div 
          className="absolute inset-0 rounded-lg opacity-30 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${backgroundColor}66, transparent)`,
            filter: 'blur(8px)',
          }}
        />
      )}
    </motion.div>
  )
}

function PseudoThreeVisualization({ data, onCubeClick }: { 
  data: MarketData[], 
  onCubeClick: (data: MarketData) => void 
}) {
  // Create a 3D-like grid layout
  const gridSize = Math.ceil(Math.sqrt(data.length))
  
  const cubes = data.map((item, index) => {
    const col = index % gridSize
    const row = Math.floor(index / gridSize)
    
    // Calculate 3D-like position and size
    const baseSize = 60
    const heightMultiplier = Math.log10(item.marketCap / 1e6) * 0.3
    const height = Math.max(40, baseSize + heightMultiplier * 20)
    const width = baseSize + (col % 2) * 10 // Slight width variation for 3D effect
    
    // Add perspective-like positioning
    const x = col * (baseSize + 20) + row * 5 // Slight offset for depth
    const y = row * (baseSize + 20) + col * 3 // Slight offset for depth
    
    return {
      data: item,
      style: {
        position: 'absolute' as const,
        left: x,
        top: y,
        width: width,
        height: height,
        zIndex: data.length - index, // Higher market cap in front
      }
    }
  })

  return (
    <div className="relative h-96 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 rounded-lg overflow-hidden border border-slate-700/50">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Market Cubes */}
      <div className="relative p-8">
        {cubes.map((cube, index) => (
          <MarketCube
            key={`${cube.data.symbol}-${index}`}
            data={cube.data}
            onClick={onCubeClick}
            style={cube.style}
          />
        ))}
      </div>
      
      {/* Controls overlay */}
      <div className="absolute top-4 right-4 text-2xs text-terminal-muted font-mono space-y-1 bg-slate-900/80 p-2 rounded">
        <div>Click: Select Asset</div>
        <div>Height: Market Cap</div>
        <div>Color: 24h Change</div>
      </div>

      {/* 3D Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/20 pointer-events-none" />
    </div>
  )
}

export default function MarketHeatmap3DClient({ data = mockData }: MarketHeatmap3DProps) {
  const [selectedAsset, setSelectedAsset] = useState<MarketData | null>(null)

  const handleCubeClick = (data: MarketData) => {
    setSelectedAsset(data)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="terminal-panel p-6 h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-terminal-accent rounded-full animate-pulse"></div>
          <h3 className="text-lg font-bold text-terminal-text font-display">
            Market Performance Map
          </h3>
        </div>
        <div className="text-xs text-terminal-muted font-mono">
          Real-time • Height: Market Cap • Color: 24h Change
        </div>
      </div>

      <PseudoThreeVisualization 
        data={data} 
        onCubeClick={handleCubeClick} 
      />

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