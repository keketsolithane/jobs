// hooks/useServiceWorker.ts
'use client'

import { useEffect, useState } from 'react'

export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      setIsSupported(true)
      
      const registerSW = async () => {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          })
          console.log('Service Worker registered: ', reg)
          setRegistration(reg)
          
          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New content is available; please refresh.')
                }
              })
            }
          })
        } catch (error) {
          console.error('Service Worker registration failed: ', error)
        }
      }

      // Wait for page load to register SW
      if (document.readyState === 'complete') {
        registerSW()
      } else {
        window.addEventListener('load', registerSW)
      }

      // Handle controller change (when SW takes control)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker now controlling the page')
      })
    }
  }, [])

  return { registration, isSupported }
}