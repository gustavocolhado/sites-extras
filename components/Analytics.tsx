'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { GA_TRACKING_ID, ANALYTICS_CONFIG } from '@/app/analytics'

// Google Analytics tracking functions
export const gtag = {
  // Track page views
  pageview: (url: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA_TRACKING_ID, {
        page_path: url,
      })
    }
  },
  // Track custom events
  event: (action: string, parameters?: any) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, parameters)
    }
  }
}

// Declare gtag function globally
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: any
    ) => void
    dataLayer: any[]
  }
}

// Analytics component
export default function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (ANALYTICS_CONFIG.enabled && GA_TRACKING_ID && GA_TRACKING_ID !== 'G-XXXXXXXXXX' && pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      gtag.pageview(url)
      
      if (ANALYTICS_CONFIG.debug) {
        console.log('Analytics pageview:', url)
      }
    }
  }, [pathname, searchParams])

  if (!ANALYTICS_CONFIG.enabled || !GA_TRACKING_ID || GA_TRACKING_ID === 'G-XXXXXXXXXX') {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: ${ANALYTICS_CONFIG.anonymizeIp},
              cookie_flags: '${ANALYTICS_CONFIG.cookieFlags}'${ANALYTICS_CONFIG.debug ? ',\n              debug_mode: true' : ''}
            });
          `,
        }}
      />
    </>
  )
}
