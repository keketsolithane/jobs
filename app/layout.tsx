// app/layout.tsx
'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { useServiceWorker } from '@/hooks/useServiceWorker'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isSupported } = useServiceWorker()

  useEffect(() => {
    // Add manifest link dynamically
    const link = document.createElement('link')
    link.rel = 'manifest'
    link.href = '/manifest.json'
    document.head.appendChild(link)

    // Add theme color meta tag
    const metaTheme = document.createElement('meta')
    metaTheme.name = 'theme-color'
    metaTheme.content = '#000000'
    document.head.appendChild(metaTheme)

    // Add Apple specific meta tags (keep these for iOS)
    const appleCapable = document.createElement('meta')
    appleCapable.name = 'apple-mobile-web-app-capable'
    appleCapable.content = 'yes'
    document.head.appendChild(appleCapable)

    const appleStatusBar = document.createElement('meta')
    appleStatusBar.name = 'apple-mobile-web-app-status-bar-style'
    appleStatusBar.content = 'default'
    document.head.appendChild(appleStatusBar)

    const appleTitle = document.createElement('meta')
    appleTitle.name = 'apple-mobile-web-app-title'
    appleTitle.content = 'JobFinder'
    document.head.appendChild(appleTitle)

    const appleIcon = document.createElement('link')
    appleIcon.rel = 'apple-touch-icon'
    appleIcon.href = '/icon-192.png' // Updated path
    document.head.appendChild(appleIcon)

    // Add the non-deprecated mobile-web-app-capable tag
    const mobileWebApp = document.createElement('meta')
    mobileWebApp.name = 'mobile-web-app-capable'
    mobileWebApp.content = 'yes'
    document.head.appendChild(mobileWebApp)
  }, [])

  return (
    <html lang="en">
      <head>
        <title>JobFinder - Find Your Dream Job</title>
        <meta name="description" content="Connect with employers and find your perfect job match" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          {isSupported && (
            <div className="fixed top-0 left-0 right-0 bg-green-600 text-white text-center py-1 text-xs">
              ✅ Offline support enabled
            </div>
          )}
        </AuthProvider>
      </body>
    </html>
  )
}