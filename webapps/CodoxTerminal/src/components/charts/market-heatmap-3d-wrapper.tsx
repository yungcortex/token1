'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { MarketHeatmap2D } from './market-heatmap-2d-fallback'

// Dynamically import the 3D component to avoid SSR issues
const MarketHeatmap3DClient = dynamic(() => import('./market-heatmap-3d-client'), {
  ssr: false,
  loading: () => (
    <div className="terminal-panel p-6 h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-terminal-accent border-b-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-terminal-muted">Loading 3D Visualization...</div>
      </div>
    </div>
  )
})

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

export function MarketHeatmap3D({ data, autoRotate = true }: MarketHeatmap3DProps) {
  const [isClient, setIsClient] = useState(false)
  const [use3D, setUse3D] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Check for WebGL support
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        console.warn('WebGL not supported, falling back to 2D')
        setUse3D(false)
      }
    } catch (error) {
      console.warn('WebGL check failed, falling back to 2D:', error)
      setUse3D(false)
    }
  }, [])

  if (!isClient) {
    return (
      <div className="terminal-panel p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-terminal-accent border-b-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-terminal-muted">Initializing Visualization...</div>
        </div>
      </div>
    )
  }

  // If 3D is disabled or errored, use 2D fallback
  if (!use3D || hasError) {
    return <MarketHeatmap2D data={data} />
  }

  // Try 3D with error boundary
  return (
    <ErrorBoundary onError={() => setHasError(true)}>
      <MarketHeatmap3DClient data={data} autoRotate={autoRotate} />
    </ErrorBoundary>
  )
}

// Simple error boundary component
function ErrorBoundary({ children, onError }: { children: React.ReactNode, onError: () => void }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      if (error.message && (
        error.message.includes('Three') || 
        error.message.includes('WebGL') ||
        error.message.includes('reconciler')
      )) {
        console.error('3D visualization error:', error)
        setHasError(true)
        onError()
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [onError])

  if (hasError) {
    return (
      <div className="terminal-panel p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-terminal-error mb-2">⚠️ 3D Error Detected</div>
          <div className="text-terminal-muted text-sm">Switching to 2D visualization...</div>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 