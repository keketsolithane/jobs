'use client'

import { usePWA } from '../hooks/usePWA'

export default function InstallButton() {
  const { installPrompt, isInstalled, installApp } = usePWA()

  if (!installPrompt || isInstalled) {
    return null
  }

  return (
    <button 
      onClick={installApp}
      className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
    >
      Install App
    </button>
  )
}