'use client'

import { useEffect, useRef, useState } from 'react'

interface WebSocketOptions {
  url: string
  onMessage?: (data: any) => void
  onError?: (error: Event) => void
  onOpen?: () => void
  onClose?: () => void
  autoReconnect?: boolean
  reconnectInterval?: number
}

export function useWebSocket(options: WebSocketOptions) {
  const {
    url,
    onMessage,
    onError,
    onOpen,
    onClose,
    autoReconnect = true,
    reconnectInterval = 3000
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const websocketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = () => {
    try {
      setConnectionStatus('connecting')
      websocketRef.current = new WebSocket(url)

      websocketRef.current.onopen = () => {
        setIsConnected(true)
        setConnectionStatus('connected')
        onOpen?.()
      }

      websocketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage?.(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      websocketRef.current.onerror = (error) => {
        setConnectionStatus('error')
        onError?.(error)
      }

      websocketRef.current.onclose = () => {
        setIsConnected(false)
        setConnectionStatus('disconnected')
        onClose?.()

        if (autoReconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        }
      }
    } catch (error) {
      setConnectionStatus('error')
      console.error('WebSocket connection error:', error)
    }
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    websocketRef.current?.close()
  }

  const sendMessage = (message: any) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [url])

  return {
    isConnected,
    connectionStatus,
    sendMessage,
    connect,
    disconnect
  }
}

// Binance WebSocket Hook for Crypto Prices
export function useBinanceWebSocket(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, number>>({})

  const { isConnected, connectionStatus } = useWebSocket({
    url: 'wss://stream.binance.com:9443/ws/btcusdt@ticker',
    onMessage: (data) => {
      if (data.e === '24hrTicker') {
        setPrices(prev => ({
          ...prev,
          [data.s]: parseFloat(data.c)
        }))
      }
    },
    onOpen: () => {
      console.log('Connected to Binance WebSocket')
    },
    onError: (error) => {
      console.error('Binance WebSocket error:', error)
    }
  })

  return {
    prices,
    isConnected,
    connectionStatus
  }
}

// Coinbase WebSocket Hook
export function useCoinbaseWebSocket(productIds: string[]) {
  const [prices, setPrices] = useState<Record<string, number>>({})

  const { isConnected, sendMessage } = useWebSocket({
    url: 'wss://ws-feed.exchange.coinbase.com',
    onMessage: (data) => {
      if (data.type === 'ticker') {
        setPrices(prev => ({
          ...prev,
          [data.product_id]: parseFloat(data.price)
        }))
      }
    },
    onOpen: () => {
      // Subscribe to ticker channels
      sendMessage({
        type: 'subscribe',
        product_ids: productIds,
        channels: ['ticker']
      })
    }
  })

  return {
    prices,
    isConnected
  }
} 