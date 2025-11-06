// components/PWAInstallPrompt.tsx
'use client'

import { useState, useEffect } from 'react'

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [pwaStatus, setPwaStatus] = useState({
    serviceWorker: 'checking',
    manifest: 'checking',
    icons: 'checking',
    https: 'checking'
  })

  useEffect(() => {
    const checkPWAStatus = async () => {
      const status = {
        serviceWorker: 'checking',
        manifest: 'checking',
        icons: 'checking',
        https: 'checking'
      }

      // Check service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        status.serviceWorker = registration ? 'ready' : 'missing'
      } else {
        status.serviceWorker = 'unsupported'
      }

      // Check manifest
      try {
        const response = await fetch('/manifest.json')
        if (response.ok) {
          const manifest = await response.json()
          status.manifest = 'loaded'
          
          // Check icons
          if (manifest.icons && manifest.icons.length > 0) {
            // Test if first icon exists
            const iconResponse = await fetch(manifest.icons[0].src)
            status.icons = iconResponse.ok ? 'loaded' : 'missing'
          } else {
            status.icons = 'missing'
          }
        } else {
          status.manifest = 'missing'
        }
      } catch (error) {
        status.manifest = 'error'
      }

      // Check HTTPS
      status.https = window.location.protocol === 'https:' || 
                    window.location.hostname === 'localhost' ? 'secure' : 'insecure'

      setPwaStatus(status)
      
      // Show prompt if basic requirements are met
      if (status.serviceWorker === 'ready' && status.manifest === 'loaded') {
        setShowPrompt(true)
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎯 beforeinstallprompt event fired!')
      e.preventDefault()
      setInstallPrompt(e)
      setShowPrompt(true)
    }

    const handleAppInstalled = () => {
      console.log('✅ App installed')
      setIsInstalled(true)
      setInstallPrompt(null)
      setShowPrompt(false)
    }

    checkPWAStatus()

    // Event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    setIsInstalled(isStandalone)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (installPrompt) {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') {
        setInstallPrompt(null)
        setShowPrompt(false)
      }
    }
  }

  const dismissPrompt = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }

  if (isInstalled) return null

  const lastDismissed = localStorage.getItem('pwa-prompt-dismissed')
  if (lastDismissed && !showPrompt) {
    const timeSinceDismiss = Date.now() - parseInt(lastDismissed)
    if (timeSinceDismiss < 24 * 60 * 60 * 1000) return null
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 bg-gradient-to-br from-blue-600 to-purple-700 text-white p-4 rounded-xl shadow-2xl max-w-sm border border-white/20 backdrop-blur-sm z-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm mb-1">Install JobFinder</p>
          <p className="text-xs opacity-90 mb-3">Get the full app experience</p>
          
          {/* Status indicator */}
          <div className="text-xs bg-black/20 p-2 rounded mb-3 space-y-1">
            <div className="flex justify-between">
              <span>Service Worker:</span>
              <span>{pwaStatus.serviceWorker === 'ready' ? '✅' : '⏳'}</span>
            </div>
            <div className="flex justify-between">
              <span>Manifest:</span>
              <span>{pwaStatus.manifest === 'loaded' ? '✅' : '❌'}</span>
            </div>
            <div className="flex justify-between">
              <span>Icons:</span>
              <span>{pwaStatus.icons === 'loaded' ? '✅' : '❌'}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={installApp}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors flex-1 shadow-lg"
            >
              Install Now
            </button>
            <button
              onClick={dismissPrompt}
              className="bg-white/20 px-3 py-2 rounded-lg text-sm hover:bg-white/30 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}