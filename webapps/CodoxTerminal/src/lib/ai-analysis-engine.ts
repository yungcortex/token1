import { LunarAnalysis } from './lunar-analysis'

export interface MarketSignal {
  symbol: string
  signal: 'BUY' | 'SELL' | 'HOLD' | 'STRONG_BUY' | 'STRONG_SELL'
  confidence: number // 0-100
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
  entry_price: number
  target_price: number
  stop_loss: number
  risk_reward_ratio: number
  reasoning: string[]
  patterns: string[]
  indicators: {
    rsi: number
    macd: { signal: number, histogram: number }
    volume_profile: 'accumulation' | 'distribution' | 'neutral'
    support_resistance: { support: number, resistance: number }
  }
}

export interface MarketRegime {
  regime: 'bull' | 'bear' | 'crab' | 'transition'
  confidence: number
  volatility: 'low' | 'medium' | 'high' | 'extreme'
  trend_strength: number // 0-1
  dominant_narrative: string
  risk_level: 'low' | 'medium' | 'high' | 'extreme'
}

export interface PatternRecognition {
  pattern: string
  accuracy: number
  completion: number // 0-1
  target: number
  invalidation: number
  timeframe: string
  description: string
}

export interface SentimentAnalysis {
  overall_sentiment: number // -1 to 1
  fear_greed_index: number // 0-100
  social_mentions: number
  whale_activity: 'accumulating' | 'distributing' | 'neutral'
  institutional_flow: 'inflow' | 'outflow' | 'neutral'
  news_sentiment: number // -1 to 1
  sources: {
    twitter: number
    reddit: number
    discord: number
    telegram: number
  }
}

export class AIAnalysisEngine {
  private static instance: AIAnalysisEngine
  private patterns: Map<string, PatternRecognition[]> = new Map()
  private signals: Map<string, MarketSignal[]> = new Map()
  private sentimentCache: Map<string, SentimentAnalysis> = new Map()

  static getInstance(): AIAnalysisEngine {
    if (!AIAnalysisEngine.instance) {
      AIAnalysisEngine.instance = new AIAnalysisEngine()
    }
    return AIAnalysisEngine.instance
  }

  // Advanced Signal Generation
  async generateSignals(symbol: string, priceData: number[][], volume: number[]): Promise<MarketSignal[]> {
    const signals: MarketSignal[] = []
    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'] as const
    
    for (const timeframe of timeframes) {
      const signal = await this.analyzeTimeframe(symbol, priceData, volume, timeframe)
      if (signal) signals.push(signal)
    }

    // Multi-timeframe analysis for enhanced accuracy
    const consensusSignal = this.buildConsensusSignal(signals, symbol)
    if (consensusSignal) signals.unshift(consensusSignal)

    this.signals.set(symbol, signals)
    return signals
  }

  // Market Regime Detection
  async detectMarketRegime(marketData: { [symbol: string]: number[][] }): Promise<MarketRegime> {
    const btcData = marketData['BTC'] || []
    
    // Analyze overall market structure
    const volatility = this.calculateMarketVolatility(btcData)
    const trendStrength = this.calculateTrendStrength(btcData)
    
    let regime: MarketRegime['regime'] = 'crab'
    let confidence = 0
    let dominantNarrative = 'Range-bound market'
    
    // Regime classification logic
    if (trendStrength > 0.7 && volatility < 0.6) {
      regime = 'bull'
      confidence = 85
      dominantNarrative = 'Strong uptrend with controlled volatility'
    } else if (trendStrength < -0.7 && volatility > 0.4) {
      regime = 'bear'
      confidence = 80
      dominantNarrative = 'Bearish momentum with elevated volatility'
    } else if (volatility > 0.8) {
      regime = 'transition'
      confidence = 70
      dominantNarrative = 'High volatility regime change in progress'
    }

    return {
      regime,
      confidence,
      volatility: volatility > 0.8 ? 'extreme' : volatility > 0.6 ? 'high' : volatility > 0.4 ? 'medium' : 'low',
      trend_strength: Math.abs(trendStrength),
      dominant_narrative: dominantNarrative,
      risk_level: volatility > 0.8 ? 'extreme' : volatility > 0.6 ? 'high' : 'medium'
    }
  }

  // Comprehensive Sentiment Analysis
  async analyzeSentiment(symbol: string): Promise<SentimentAnalysis> {
    // Simulate multi-source sentiment analysis
    const twitterSentiment = this.simulateTwitterSentiment(symbol)
    const redditSentiment = this.simulateRedditSentiment(symbol)
    const discordSentiment = this.simulateDiscordSentiment(symbol)
    const telegramSentiment = this.simulateTelegramSentiment(symbol)
    
    const overallSentiment = (twitterSentiment + redditSentiment + discordSentiment + telegramSentiment) / 4
    const fearGreedIndex = this.calculateFearGreedIndex(symbol)
    const socialMentions = this.calculateSocialMentions(symbol)
    const whaleActivity = this.analyzeWhaleActivity(symbol)
    const institutionalFlow = this.analyzeInstitutionalFlow(symbol)
    const newsSentiment = this.analyzeNewsSentiment(symbol)

    const sentiment: SentimentAnalysis = {
      overall_sentiment: overallSentiment,
      fear_greed_index: fearGreedIndex,
      social_mentions: socialMentions,
      whale_activity: whaleActivity,
      institutional_flow: institutionalFlow,
      news_sentiment: newsSentiment,
      sources: {
        twitter: twitterSentiment,
        reddit: redditSentiment,
        discord: discordSentiment,
        telegram: telegramSentiment
      }
    }

    this.sentimentCache.set(symbol, sentiment)
    return sentiment
  }

  // Private helper methods
  private async analyzeTimeframe(
    symbol: string, 
    priceData: number[][], 
    volume: number[], 
    timeframe: string
  ): Promise<MarketSignal | null> {
    if (priceData.length < 50) return null // Need sufficient data
    
    const currentPrice = priceData[priceData.length - 1][4] // Close price
    const rsi = this.calculateRSI(priceData)
    const macd = this.calculateMACD(priceData)
    const volumeProfile = this.analyzeVolumeProfile(volume)
    const supportResistance = this.findSupportResistance(priceData)
    
    // Signal generation logic
    let signal: MarketSignal['signal'] = 'HOLD'
    let confidence = 50
    let reasoning: string[] = []
    let patterns: string[] = []
    
    // RSI analysis
    if (rsi < 30) {
      reasoning.push(`RSI oversold at ${rsi.toFixed(1)}`)
      confidence += 15
      if (signal === 'HOLD') signal = 'BUY'
    } else if (rsi > 70) {
      reasoning.push(`RSI overbought at ${rsi.toFixed(1)}`)
      confidence += 15
      if (signal === 'HOLD') signal = 'SELL'
    }
    
    // MACD analysis
    if (macd.histogram > 0 && macd.signal > 0) {
      reasoning.push('MACD bullish convergence')
      confidence += 10
      if (signal !== 'SELL') signal = signal === 'BUY' ? 'STRONG_BUY' : 'BUY'
    } else if (macd.histogram < 0 && macd.signal < 0) {
      reasoning.push('MACD bearish divergence')
      confidence += 10
      if (signal !== 'BUY') signal = signal === 'SELL' ? 'STRONG_SELL' : 'SELL'
    }
    
    // Volume analysis
    if (volumeProfile === 'accumulation') {
      reasoning.push('Volume shows accumulation pattern')
      confidence += 12
    } else if (volumeProfile === 'distribution') {
      reasoning.push('Volume shows distribution pattern')
      confidence += 12
    }

    // Calculate targets and stop loss
    const targetPrice = signal.includes('BUY') 
      ? currentPrice * (1 + 0.03 + Math.random() * 0.05)
      : currentPrice * (1 - 0.03 - Math.random() * 0.05)
    
    const stopLoss = signal.includes('BUY')
      ? currentPrice * (1 - 0.02 - Math.random() * 0.02)
      : currentPrice * (1 + 0.02 + Math.random() * 0.02)
    
    const riskRewardRatio = Math.abs(targetPrice - currentPrice) / Math.abs(currentPrice - stopLoss)

    return {
      symbol,
      signal,
      confidence: Math.min(confidence, 95),
      timeframe: timeframe as any,
      entry_price: currentPrice,
      target_price: targetPrice,
      stop_loss: stopLoss,
      risk_reward_ratio: riskRewardRatio,
      reasoning,
      patterns,
      indicators: {
        rsi,
        macd,
        volume_profile: volumeProfile,
        support_resistance: supportResistance
      }
    }
  }

  private buildConsensusSignal(signals: MarketSignal[], symbol: string): MarketSignal | null {
    if (signals.length < 3) return null
    
    const signalCounts = signals.reduce((acc, s) => {
      acc[s.signal] = (acc[s.signal] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const dominantSignal = Object.entries(signalCounts)
      .sort(([,a], [,b]) => b - a)[0][0] as MarketSignal['signal']
    
    const avgConfidence = signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length
    const consensusStrength = signalCounts[dominantSignal] / signals.length
    
    if (consensusStrength < 0.6) return null // Need stronger consensus
    
    return {
      symbol,
      signal: dominantSignal,
      confidence: Math.round(avgConfidence * consensusStrength),
      timeframe: 'consensus' as any,
      entry_price: signals[0].entry_price,
      target_price: signals.reduce((sum, s) => sum + s.target_price, 0) / signals.length,
      stop_loss: signals.reduce((sum, s) => sum + s.stop_loss, 0) / signals.length,
      risk_reward_ratio: signals.reduce((sum, s) => sum + s.risk_reward_ratio, 0) / signals.length,
      reasoning: [`Multi-timeframe consensus: ${(consensusStrength * 100).toFixed(0)}% agreement`],
      patterns: Array.from(new Set(signals.flatMap(s => s.patterns))),
      indicators: signals[0].indicators
    }
  }

  // Technical indicator calculations (simplified)
  private calculateRSI(priceData: number[][], period: number = 14): number {
    if (priceData.length < period + 1) return 50
    
    let gains = 0, losses = 0
    for (let i = 1; i <= period; i++) {
      const change = priceData[priceData.length - i][4] - priceData[priceData.length - i - 1][4]
      if (change > 0) gains += change
      else losses += Math.abs(change)
    }
    
    const avgGain = gains / period
    const avgLoss = losses / period
    const rs = avgGain / (avgLoss || 1)
    return 100 - (100 / (1 + rs))
  }

  private calculateMACD(priceData: number[][]): { signal: number, histogram: number } {
    // Simplified MACD calculation
    const closes = priceData.slice(-26).map(d => d[4])
    if (closes.length < 26) return { signal: 0, histogram: 0 }
    
    const ema12 = this.calculateEMA(closes.slice(-12), 12)
    const ema26 = this.calculateEMA(closes, 26)
    const macdLine = ema12 - ema26
    
    return {
      signal: macdLine > 0 ? 1 : -1,
      histogram: Math.abs(macdLine)
    }
  }

  private calculateEMA(prices: number[], period: number): number {
    const multiplier = 2 / (period + 1)
    let ema = prices[0]
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier))
    }
    
    return ema
  }

  private analyzeVolumeProfile(volume: number[]): 'accumulation' | 'distribution' | 'neutral' {
    if (volume.length < 10) return 'neutral'
    
    const recentAvg = volume.slice(-5).reduce((a, b) => a + b, 0) / 5
    const longerAvg = volume.slice(-20).reduce((a, b) => a + b, 0) / 20
    
    const ratio = recentAvg / longerAvg
    if (ratio > 1.2) return 'accumulation'
    if (ratio < 0.8) return 'distribution'
    return 'neutral'
  }

  private findSupportResistance(priceData: number[][]): { support: number, resistance: number } {
    const closes = priceData.slice(-50).map(d => d[4])
    const highs = priceData.slice(-50).map(d => d[2])
    const lows = priceData.slice(-50).map(d => d[3])
    
    const support = Math.min(...lows)
    const resistance = Math.max(...highs)
    
    return { support, resistance }
  }

  private calculateMarketVolatility(priceData: number[][]): number {
    if (priceData.length < 20) return 0.5
    
    const returns = []
    for (let i = 1; i < priceData.length; i++) {
      const ret = (priceData[i][4] - priceData[i-1][4]) / priceData[i-1][4]
      returns.push(ret)
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length
    return Math.sqrt(variance)
  }

  private calculateTrendStrength(priceData: number[][]): number {
    if (priceData.length < 20) return 0
    
    const start = priceData[0][4]
    const end = priceData[priceData.length - 1][4]
    return (end - start) / start
  }

  // Sentiment simulation methods
  private simulateTwitterSentiment(symbol: string): number {
    return (Math.random() - 0.5) * 1.6 // -0.8 to 0.8
  }

  private simulateRedditSentiment(symbol: string): number {
    return (Math.random() - 0.5) * 1.4 // -0.7 to 0.7
  }

  private simulateDiscordSentiment(symbol: string): number {
    return (Math.random() - 0.5) * 1.2 // -0.6 to 0.6
  }

  private simulateTelegramSentiment(symbol: string): number {
    return (Math.random() - 0.5) * 1.8 // -0.9 to 0.9
  }

  private calculateFearGreedIndex(symbol: string): number {
    return Math.floor(Math.random() * 100)
  }

  private calculateSocialMentions(symbol: string): number {
    return Math.floor(Math.random() * 10000)
  }

  private analyzeWhaleActivity(symbol: string): 'accumulating' | 'distributing' | 'neutral' {
    const activities = ['accumulating', 'distributing', 'neutral'] as const
    return activities[Math.floor(Math.random() * activities.length)]
  }

  private analyzeInstitutionalFlow(symbol: string): 'inflow' | 'outflow' | 'neutral' {
    const flows = ['inflow', 'outflow', 'neutral'] as const
    return flows[Math.floor(Math.random() * flows.length)]
  }

  private analyzeNewsSentiment(symbol: string): number {
    return (Math.random() - 0.5) * 2 // -1 to 1
  }
}

export const aiAnalysis = AIAnalysisEngine.getInstance() 