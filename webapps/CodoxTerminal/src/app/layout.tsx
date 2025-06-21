import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Codox Terminal - Advanced Crypto Trading Platform',
  description: 'Professional-grade cryptocurrency trading terminal with real-time data, AI predictions, and lunar analysis.',
  keywords: ['crypto', 'trading', 'terminal', 'solana', 'meme coins', 'bloomberg'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-terminal-bg">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
} 