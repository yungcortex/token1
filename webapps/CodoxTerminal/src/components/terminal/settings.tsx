'use client'

import { useState } from 'react'
import { 
  Settings, 
  Key, 
  Bell, 
  Palette, 
  Clock, 
  Shield, 
  Database,
  Zap,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Save
} from 'lucide-react'

interface SettingsState {
  apiKeys: {
    binance: { key: string; secret: string; enabled: boolean }
    coinbase: { key: string; secret: string; enabled: boolean }
    helius: { key: string; enabled: boolean }
    tradingview: { key: string; enabled: boolean }
  }
  dataSettings: {
    refreshInterval: number
    realTimeUpdates: boolean
    websocketEnabled: boolean
    cacheEnabled: boolean
  }
  displaySettings: {
    theme: 'dark' | 'matrix' | 'cyberpunk'
    glowEffects: boolean
    animations: boolean
    compactMode: boolean
    showGridLines: boolean
  }
  alertSettings: {
    priceAlerts: boolean
    whaleAlerts: boolean
    volumeAlerts: boolean
    newsAlerts: boolean
    soundEnabled: boolean
    desktopNotifications: boolean
  }
  riskSettings: {
    maxPositionSize: number
    stopLossDefault: number
    takeProfitDefault: number
    riskPerTrade: number
  }
}

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState('api')
  const [showSecrets, setShowSecrets] = useState<{[key: string]: boolean}>({})
  const [settings, setSettings] = useState<SettingsState>({
    apiKeys: {
      binance: { key: '', secret: '', enabled: true },
      coinbase: { key: '', secret: '', enabled: false },
      helius: { key: 'b301277c-743a-4448-9a15-03fbfce4c6ed', enabled: true },
      tradingview: { key: '', enabled: false }
    },
    dataSettings: {
      refreshInterval: 10,
      realTimeUpdates: true,
      websocketEnabled: true,
      cacheEnabled: true
    },
    displaySettings: {
      theme: 'dark',
      glowEffects: true,
      animations: true,
      compactMode: false,
      showGridLines: true
    },
    alertSettings: {
      priceAlerts: true,
      whaleAlerts: true,
      volumeAlerts: false,
      newsAlerts: true,
      soundEnabled: true,
      desktopNotifications: true
    },
    riskSettings: {
      maxPositionSize: 10000,
      stopLossDefault: 2,
      takeProfitDefault: 6,
      riskPerTrade: 1
    }
  })

  const tabs = [
    { id: 'api', icon: Key, label: 'API Keys', description: 'Exchange and data provider APIs' },
    { id: 'data', icon: Database, label: 'Data Sources', description: 'Real-time data configuration' },
    { id: 'display', icon: Palette, label: 'Display', description: 'Theme and visual preferences' },
    { id: 'alerts', icon: Bell, label: 'Alerts', description: 'Notification settings' },
    { id: 'risk', icon: Shield, label: 'Risk Management', description: 'Trading safety settings' }
  ]

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const updateApiKey = (provider: string, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: {
          ...prev.apiKeys[provider as keyof typeof prev.apiKeys],
          [field]: value
        }
      }
    }))
  }

  const updateDataSettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      dataSettings: {
        ...prev.dataSettings,
        [field]: value
      }
    }))
  }

  const updateDisplaySettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      displaySettings: {
        ...prev.displaySettings,
        [field]: value
      }
    }))
  }

  const updateAlertSettings = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      alertSettings: {
        ...prev.alertSettings,
        [field]: value
      }
    }))
  }

  const updateRiskSettings = (field: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      riskSettings: {
        ...prev.riskSettings,
        [field]: value
      }
    }))
  }

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem('codox-settings', JSON.stringify(settings))
    // Show success notification
    console.log('Settings saved successfully')
  }

  const renderApiKeysTab = () => (
    <div className="space-y-6">
      {Object.entries(settings.apiKeys).map(([provider, config]) => (
        <div key={provider} className="terminal-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-terminal-success/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                <Key className="w-4 h-4 text-terminal-success" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-terminal-text capitalize">{provider}</h3>
                <p className="text-sm text-terminal-muted">
                  {provider === 'binance' && 'Spot and futures trading data'}
                  {provider === 'coinbase' && 'Professional trading API'}
                  {provider === 'helius' && 'Solana blockchain data'}
                  {provider === 'tradingview' && 'Advanced charting data'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-terminal-muted">Enabled</span>
              <button
                onClick={() => updateApiKey(provider, 'enabled', !config.enabled)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  config.enabled ? 'bg-terminal-success' : 'bg-slate-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  config.enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-terminal-text mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showSecrets[`${provider}-key`] ? 'text' : 'password'}
                  value={config.key}
                  onChange={(e) => updateApiKey(provider, 'key', e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-terminal-text pr-12"
                  placeholder="Enter API key..."
                />
                <button
                  onClick={() => toggleSecret(`${provider}-key`)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-terminal-muted hover:text-terminal-text"
                >
                  {showSecrets[`${provider}-key`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {provider !== 'helius' && provider !== 'tradingview' && (
              <div>
                <label className="block text-sm font-medium text-terminal-text mb-2">
                  Secret Key
                </label>
                <div className="relative">
                  <input
                    type={showSecrets[`${provider}-secret`] ? 'text' : 'password'}
                    value={'secret' in config ? config.secret : ''}
                    onChange={(e) => updateApiKey(provider, 'secret', e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-terminal-text pr-12"
                    placeholder="Enter secret key..."
                  />
                  <button
                    onClick={() => toggleSecret(`${provider}-secret`)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-terminal-muted hover:text-terminal-text"
                  >
                    {showSecrets[`${provider}-secret`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 text-sm">
              {config.key ? (
                <>
                  <Check className="w-4 h-4 text-terminal-success" />
                  <span className="text-terminal-success">API key configured</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4 text-terminal-error" />
                  <span className="text-terminal-error">API key required</span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderDataTab = () => (
    <div className="space-y-6">
      <div className="terminal-panel p-6">
        <div className="flex items-center space-x-3 mb-6">
          <RefreshCw className="w-5 h-5 text-terminal-success" />
          <h3 className="text-lg font-semibold text-terminal-text">Data Refresh Settings</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Refresh Interval (seconds)
            </label>
            <select
              value={settings.dataSettings.refreshInterval}
              onChange={(e) => updateDataSettings('refreshInterval', Number(e.target.value))}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-terminal-text"
            >
              <option value={5}>5 seconds (High frequency)</option>
              <option value={10}>10 seconds (Recommended)</option>
              <option value={15}>15 seconds (Balanced)</option>
              <option value={30}>30 seconds (Low frequency)</option>
              <option value={60}>1 minute (Minimal)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries({
              realTimeUpdates: 'Real-time Updates',
              websocketEnabled: 'WebSocket Connections',
              cacheEnabled: 'Data Caching'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                <span className="text-sm font-medium text-terminal-text">{label}</span>
                <button
                  onClick={() => updateDataSettings(key, !settings.dataSettings[key as keyof typeof settings.dataSettings])}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.dataSettings[key as keyof typeof settings.dataSettings] ? 'bg-terminal-success' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.dataSettings[key as keyof typeof settings.dataSettings] ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderDisplayTab = () => (
    <div className="space-y-6">
      <div className="terminal-panel p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Palette className="w-5 h-5 text-terminal-success" />
          <h3 className="text-lg font-semibold text-terminal-text">Visual Preferences</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-terminal-text mb-3">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {['dark', 'matrix', 'cyberpunk'].map((theme) => (
                <button
                  key={theme}
                  onClick={() => updateDisplaySettings('theme', theme)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.displaySettings.theme === theme
                      ? 'border-terminal-success bg-terminal-success/10'
                      : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
                  }`}
                >
                  <div className="text-sm font-medium text-terminal-text capitalize">{theme}</div>
                  <div className="text-xs text-terminal-muted mt-1">
                    {theme === 'dark' && 'Classic dark theme'}
                    {theme === 'matrix' && 'Green matrix style'}
                    {theme === 'cyberpunk' && 'Neon cyberpunk'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries({
              glowEffects: 'Glow Effects',
              animations: 'Animations',
              compactMode: 'Compact Mode',
              showGridLines: 'Show Grid Lines'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                <span className="text-sm font-medium text-terminal-text">{label}</span>
                <button
                  onClick={() => updateDisplaySettings(key, !settings.displaySettings[key as keyof typeof settings.displaySettings])}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.displaySettings[key as keyof typeof settings.displaySettings] ? 'bg-terminal-success' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.displaySettings[key as keyof typeof settings.displaySettings] ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderAlertsTab = () => (
    <div className="space-y-6">
      <div className="terminal-panel p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="w-5 h-5 text-terminal-success" />
          <h3 className="text-lg font-semibold text-terminal-text">Alert Preferences</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries({
            priceAlerts: 'Price Alerts',
            whaleAlerts: 'Whale Alerts',
            volumeAlerts: 'Volume Alerts',
            newsAlerts: 'News Alerts',
            soundEnabled: 'Sound Notifications',
            desktopNotifications: 'Desktop Notifications'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
              <span className="text-sm font-medium text-terminal-text">{label}</span>
              <button
                onClick={() => updateAlertSettings(key, !settings.alertSettings[key as keyof typeof settings.alertSettings])}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.alertSettings[key as keyof typeof settings.alertSettings] ? 'bg-terminal-success' : 'bg-slate-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.alertSettings[key as keyof typeof settings.alertSettings] ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderRiskTab = () => (
    <div className="space-y-6">
      <div className="terminal-panel p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-5 h-5 text-terminal-success" />
          <h3 className="text-lg font-semibold text-terminal-text">Risk Management</h3>
        </div>

        <div className="space-y-6">
          {Object.entries({
            maxPositionSize: { label: 'Max Position Size ($)', min: 100, max: 100000, step: 100 },
            stopLossDefault: { label: 'Default Stop Loss (%)', min: 0.5, max: 10, step: 0.1 },
            takeProfitDefault: { label: 'Default Take Profit (%)', min: 1, max: 20, step: 0.1 },
            riskPerTrade: { label: 'Risk Per Trade (%)', min: 0.1, max: 5, step: 0.1 }
          }).map(([key, config]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-terminal-text mb-2">
                {config.label}
              </label>
              <input
                type="number"
                value={settings.riskSettings[key as keyof typeof settings.riskSettings]}
                onChange={(e) => updateRiskSettings(key, Number(e.target.value))}
                min={config.min}
                max={config.max}
                step={config.step}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-terminal-text"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-terminal-success" />
            <h1 className="text-2xl font-bold text-terminal-text">Settings</h1>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-terminal-success/20 hover:bg-terminal-success/30 
                     border border-terminal-success/50 text-terminal-success px-4 py-2 rounded-lg 
                     transition-all duration-200"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar Navigation */}
        <div className="w-72 border-r border-slate-700/50 bg-slate-800/30 p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-all duration-300 rounded-lg group ${
                    isActive
                      ? 'bg-gradient-to-r from-terminal-success/20 to-emerald-500/20 border border-terminal-success/30 text-terminal-success'
                      : 'text-terminal-text hover:bg-slate-700/50 hover:text-terminal-success border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-terminal-success' : ''
                  }`} />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs text-terminal-muted opacity-70">{tab.description}</div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-terminal-success rounded-full animate-pulse"></div>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'api' && renderApiKeysTab()}
          {activeTab === 'data' && renderDataTab()}
          {activeTab === 'display' && renderDisplayTab()}
          {activeTab === 'alerts' && renderAlertsTab()}
          {activeTab === 'risk' && renderRiskTab()}
        </div>
      </div>
    </div>
  )
} 