'use client'

import { useQuery } from '@tanstack/react-query'

interface CoinData {
  symbol: string
  name: string
  price: number
  change_24h: number
  market_cap: number
  volume: number
}

const mockCoins: CoinData[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 43000, change_24h: 2.5, market_cap: 850000000000, volume: 25000000000 },
  { symbol: 'ETH', name: 'Ethereum', price: 2600, change_24h: 3.2, market_cap: 320000000000, volume: 15000000000 },
  { symbol: 'SOL', name: 'Solana', price: 180, change_24h: -1.8, market_cap: 45000000000, volume: 3000000000 },
  { symbol: 'ADA', name: 'Cardano', price: 0.45, change_24h: 1.2, market_cap: 15000000000, volume: 800000000 },
  { symbol: 'BONK', name: 'Bonk', price: 0.000012, change_24h: 25.6, market_cap: 800000000, volume: 150000000 },
  { symbol: 'WIF', name: 'Dogwifhat', price: 2.85, change_24h: 18.9, market_cap: 2800000000, volume: 200000000 },
  { symbol: 'POPCAT', name: 'Popcat', price: 1.45, change_24h: -8.3, market_cap: 1400000000, volume: 80000000 },
  { symbol: 'PEPE', name: 'Pepe', price: 0.0000085, change_24h: 12.4, market_cap: 3500000000, volume: 350000000 },
]

export function MarketHeatmap() {
  const { data: coins = mockCoins } = useQuery({
    queryKey: ['market-heatmap'],
    queryFn: () => Promise.resolve(mockCoins),
  })

  const getChangeColor = (change: number) => {
    if (change > 10) return 'bg-green-600'
    if (change > 5) return 'bg-green-500'
    if (change > 0) return 'bg-green-400'
    if (change > -5) return 'bg-red-400'
    if (change > -10) return 'bg-red-500'
    return 'bg-red-600'
  }

  const getTextColor = (change: number) => {
    return Math.abs(change) > 5 ? 'text-white' : 'text-black'
  }

  const getSize = (marketCap: number) => {
    const maxCap = Math.max(...coins.map(c => c.market_cap))
    const ratio = marketCap / maxCap
    if (ratio > 0.5) return 'col-span-4 row-span-3'
    if (ratio > 0.2) return 'col-span-3 row-span-2'
    if (ratio > 0.05) return 'col-span-2 row-span-2'
    return 'col-span-2 row-span-1'
  }

  return (
    <div className="terminal-window h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-terminal-text">MARKET HEATMAP</h2>
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500"></div>
            <span>Gains</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500"></div>
            <span>Losses</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-8 grid-rows-6 gap-1 h-5/6">
        {coins.map((coin) => (
          <div
            key={coin.symbol}
            className={`${getChangeColor(coin.change_24h)} ${getSize(coin.market_cap)} ${getTextColor(coin.change_24h)} p-2 flex flex-col justify-between hover:opacity-80 cursor-pointer transition-opacity`}
          >
            <div>
              <div className="font-bold text-sm">{coin.symbol}</div>
              <div className="text-xs opacity-90">{coin.name}</div>
            </div>
            
            <div className="text-right">
              <div className="text-xs font-mono">
                ${coin.price < 0.01 
                  ? coin.price.toExponential(2) 
                  : coin.price.toLocaleString(undefined, { minimumFractionDigits: 2 })
                }
              </div>
              <div className="text-sm font-bold">
                {coin.change_24h >= 0 ? '+' : ''}{coin.change_24h.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 text-xs opacity-70">
        Size represents market cap • Color intensity represents 24h change
      </div>
    </div>
  )
} 