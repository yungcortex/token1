'use client'

import { useState, useEffect, useRef } from 'react'

interface BinanceTickerData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  timestamp: number
}

interface UseBinanceWebSocketProps {
  symbols?: string[]
  enabled?: boolean
}

export function useBinanceWebSocket({ 
  symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BONKUSDT', 'WIFUSDT'], 
  enabled = true 
}: UseBinanceWebSocketProps = {}) {
  const [prices, setPrices] = useState<Record<string, BinanceTickerData>>({})
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  const connect = () => {
    if (!enabled) return

    try {
      // Create WebSocket streams for all symbols
      const streams = symbols.map(symbol => `${symbol.toLowerCase()}@ticker`).join('/')
      const wsUrl = `wss://stream.binance.us:9443/ws/${streams}`
      
      setConnectionStatus('connecting')
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        setConnectionStatus('connected')
        reconnectAttemptsRef.current = 0
        console.log('Binance.us WebSocket connected for real-time pricing')
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          const tickerData: BinanceTickerData = {
            symbol: data.s,
            price: parseFloat(data.c),
            change24h: parseFloat(data.P),
            volume24h: parseFloat(data.v),
            timestamp: Date.now()
          }

          setPrices(prev => ({
            ...prev,
            [data.s]: tickerData
          }))
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      wsRef.current.onclose = (event) => {
        setConnectionStatus('disconnected')
        console.log('Binance.us WebSocket disconnected:', event.code, event.reason)
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000)
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`)
          setTimeout(connect, delay)
        }
      }

      wsRef.current.onerror = (error) => {
        setConnectionStatus('error')
        console.error('Binance.us WebSocket error:', error)
      }
    } catch (error) {
      setConnectionStatus('error')
      console.error('Failed to create WebSocket connection:', error)
    }
  }

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setConnectionStatus('disconnected')
  }

  useEffect(() => {
    if (enabled) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, symbols.join(',')])

  // Helper function to get price for a specific symbol
  const getPrice = (symbol: string): BinanceTickerData | null => {
    return prices[symbol] || null
  }

  // Helper function to format price for display
  const formatPrice = (symbol: string, decimals: number = 2): string => {
    const price = getPrice(symbol)
    if (!price) return '---.--'
    
    // Handle different decimal places for different assets
    if (symbol.includes('BONK')) decimals = 8
    if (symbol.includes('WIF') || symbol.includes('POPCAT')) decimals = 4
    
    return price.price.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  return {
    prices,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    getPrice,
    formatPrice,
    connect,
    disconnect
  }
} 