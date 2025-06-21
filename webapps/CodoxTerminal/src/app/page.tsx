'use client'

import { useState } from 'react'
import { Dashboard } from '@/components/terminal/dashboard'
import { Header } from '@/components/terminal/header'
import { DataStatus } from '@/components/terminal/data-status'

export default function Home() {
  const [activeView, setActiveView] = useState('main')

  const handleNavigation = (view: string) => {
    setActiveView(view)
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 overflow-hidden">
      <Header activeView={activeView} onNavigate={handleNavigation} />
      <main className="flex-1 min-h-0 relative overflow-hidden">
        <Dashboard activeView={activeView} onViewChange={setActiveView} />
      </main>
      <DataStatus />
    </div>
  )
} 