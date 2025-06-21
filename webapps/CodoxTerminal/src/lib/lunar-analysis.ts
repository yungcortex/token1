import type { LunarData } from '@/types/market'

export class LunarAnalysis {
  // Calculate current moon phase
  static getMoonPhase(date: Date = new Date()): { phase: number; name: string; illumination: number } {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    // Julian day calculation
    let jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) +
             Math.floor(275 * month / 9) + day + 1721013.5

    // Days since last new moon
    const daysSinceNew = (jd - 2451549.5) % 29.53058867
    
    // Phase calculation (0 = new moon, 0.5 = full moon)
    const phase = daysSinceNew / 29.53058867
    
    // Illumination percentage
    const illumination = Math.abs(Math.cos(2 * Math.PI * phase)) * 100

    // Phase names
    let phaseName: string
    if (phase < 0.0625) phaseName = 'New Moon'
    else if (phase < 0.1875) phaseName = 'Waxing Crescent'
    else if (phase < 0.3125) phaseName = 'First Quarter'
    else if (phase < 0.4375) phaseName = 'Waxing Gibbous'
    else if (phase < 0.5625) phaseName = 'Full Moon'
    else if (phase < 0.6875) phaseName = 'Waning Gibbous'
    else if (phase < 0.8125) phaseName = 'Last Quarter'
    else phaseName = 'Waning Crescent'

    return {
      phase,
      name: phaseName,
      illumination: Math.round(illumination)
    }
  }

  // Get next moon phases
  static getNextPhases(date: Date = new Date()): { nextNew: Date; nextFull: Date } {
    const current = this.getMoonPhase(date)
    const lunarCycle = 29.53058867 // days

    // Calculate days until next new and full moon
    let daysToNew = current.phase > 0.5 
      ? (1 - current.phase) * lunarCycle
      : (0.5 - current.phase) * lunarCycle + lunarCycle / 2

    let daysToFull = current.phase < 0.5
      ? (0.5 - current.phase) * lunarCycle
      : (1.5 - current.phase) * lunarCycle

    const nextNew = new Date(date.getTime() + daysToNew * 24 * 60 * 60 * 1000)
    const nextFull = new Date(date.getTime() + daysToFull * 24 * 60 * 60 * 1000)

    return { nextNew, nextFull }
  }

  // Analyze historical correlation with crypto prices
  static async getLunarMarketCorrelation(): Promise<LunarData> {
    const currentPhase = this.getMoonPhase()
    const nextPhases = this.getNextPhases()

    // Mock historical data - in real implementation, this would analyze
    // actual historical price data against moon phases
    const historicalPerformance = [
      { phase: 'New Moon', avg_return: 3.2, success_rate: 67 },
      { phase: 'Waxing Crescent', avg_return: 1.8, success_rate: 55 },
      { phase: 'First Quarter', avg_return: -0.5, success_rate: 45 },
      { phase: 'Waxing Gibbous', avg_return: 2.1, success_rate: 58 },
      { phase: 'Full Moon', avg_return: -1.2, success_rate: 42 },
      { phase: 'Waning Gibbous', avg_return: 0.8, success_rate: 52 },
      { phase: 'Last Quarter', avg_return: 1.5, success_rate: 54 },
      { phase: 'Waning Crescent', avg_return: 2.8, success_rate: 63 }
    ]

    // Calculate correlation score based on current phase
    const currentPhaseData = historicalPerformance.find(p => p.phase === currentPhase.name)
    const correlationScore = currentPhaseData ? currentPhaseData.success_rate : 50

    return {
      phase: currentPhase.phase.toString(),
      phase_name: currentPhase.name,
      illumination: currentPhase.illumination,
      next_new_moon: nextPhases.nextNew.toISOString(),
      next_full_moon: nextPhases.nextFull.toISOString(),
      correlation_score: correlationScore,
      historical_performance: historicalPerformance
    }
  }

  // Get trading recommendations based on lunar phase
  static getLunarTradingSignals(lunarData: LunarData): {
    recommendation: 'buy' | 'sell' | 'hold'
    confidence: number
    reasoning: string
  } {
    const { phase_name, correlation_score, historical_performance } = lunarData
    
    const phaseData = historical_performance.find(p => p.phase === phase_name)
    
    if (!phaseData) {
      return {
        recommendation: 'hold',
        confidence: 50,
        reasoning: 'Insufficient lunar data for current phase'
      }
    }

    let recommendation: 'buy' | 'sell' | 'hold'
    let reasoning: string

    if (phaseData.avg_return > 2 && phaseData.success_rate > 60) {
      recommendation = 'buy'
      reasoning = `${phase_name} historically shows ${phaseData.avg_return}% average returns with ${phaseData.success_rate}% success rate`
    } else if (phaseData.avg_return < -1 && phaseData.success_rate < 50) {
      recommendation = 'sell'
      reasoning = `${phase_name} historically shows ${phaseData.avg_return}% average returns with ${phaseData.success_rate}% success rate`
    } else {
      recommendation = 'hold'
      reasoning = `${phase_name} shows mixed signals with ${phaseData.avg_return}% average returns`
    }

    return {
      recommendation,
      confidence: Math.min(correlation_score, 85), // Cap confidence at 85%
      reasoning
    }
  }

  // Analyze specific coins for lunar correlation
  static analyzeCoinLunarCorrelation(symbol: string, priceHistory: number[][]): {
    correlation: number
    bestPhases: string[]
    worstPhases: string[]
  } {
    // This would analyze actual price data against historical moon phases
    // For now, return mock data with some realistic correlations
    
    const mockCorrelations: Record<string, any> = {
      'BTC': { correlation: 0.15, bestPhases: ['New Moon', 'Waning Crescent'], worstPhases: ['Full Moon'] },
      'ETH': { correlation: 0.12, bestPhases: ['Waxing Crescent', 'New Moon'], worstPhases: ['Full Moon', 'Waning Gibbous'] },
      'SOL': { correlation: 0.23, bestPhases: ['New Moon', 'First Quarter'], worstPhases: ['Full Moon'] },
      'BONK': { correlation: 0.31, bestPhases: ['New Moon', 'Waxing Crescent'], worstPhases: ['Full Moon', 'Waning Gibbous'] },
      'WIF': { correlation: 0.28, bestPhases: ['New Moon'], worstPhases: ['Full Moon', 'Last Quarter'] },
      'PEPE': { correlation: 0.25, bestPhases: ['New Moon', 'Waning Crescent'], worstPhases: ['Full Moon'] }
    }

    return mockCorrelations[symbol] || {
      correlation: Math.random() * 0.2, // Random correlation up to 20%
      bestPhases: ['New Moon'],
      worstPhases: ['Full Moon']
    }
  }
}

export const lunarAnalysis = new LunarAnalysis() 