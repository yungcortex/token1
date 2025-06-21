export interface CryptoAsset {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation: number
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  last_updated: string
}

export interface PriceData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface MarketData {
  btc_dominance: number
  eth_dominance: number
  total_market_cap: number
  total_volume: number
  market_cap_change_24h: number
  volume_change_24h: number
  active_cryptocurrencies: number
  fear_greed_index: number
}

export interface NewsItem {
  id: string
  title: string
  summary: string
  content: string
  source: string
  author: string
  published_at: string
  url: string
  image_url: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  sentiment_score: number
  tags: string[]
  related_coins: string[]
}

export interface AIInsight {
  id: string
  type: 'prediction' | 'pattern' | 'sentiment' | 'technical' | 'lunar' | 'alert'
  title: string
  description: string
  confidence: number
  timeframe: string
  target_price?: number
  probability: number
  impact: 'high' | 'medium' | 'low'
  created_at: string
  expires_at: string
  symbol: string
  tags: string[]
}

export interface LunarData {
  phase: string
  phase_name: string
  illumination: number
  next_new_moon: string
  next_full_moon: string
  correlation_score: number
  historical_performance: {
    phase: string
    avg_return: number
    success_rate: number
  }[]
}

export interface TradingSignal {
  id: string
  symbol: string
  signal_type: 'buy' | 'sell' | 'hold'
  strength: number
  price_target: number
  stop_loss: number
  timeframe: string
  confidence: number
  created_at: string
  source: string
  technical_indicators: {
    rsi: number
    macd: number
    bollinger_position: number
    moving_average_signal: string
  }
}

export interface Portfolio {
  id: string
  user_id: string
  assets: PortfolioAsset[]
  total_value: number
  total_pnl: number
  total_pnl_percentage: number
  created_at: string
  updated_at: string
}

export interface PortfolioAsset {
  symbol: string
  amount: number
  avg_buy_price: number
  current_price: number
  value: number
  pnl: number
  pnl_percentage: number
  allocation_percentage: number
}

export interface Subscription {
  id: string
  user_id: string
  plan: 'basic' | 'pro' | 'enterprise'
  status: 'active' | 'cancelled' | 'past_due'
  current_period_start: string
  current_period_end: string
  stripe_subscription_id: string
  features: string[]
} 