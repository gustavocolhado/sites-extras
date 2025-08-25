'use client'

import { useEffect } from 'react'
import { useDomainContext } from '@/contexts/DomainContext'

export default function DynamicMetadata() {
  const { domainConfig, isLoading } = useDomainContext()

  useEffect(() => {
    if (isLoading || !domainConfig) return

    // Update document title
    document.title = domainConfig.title

    // Update meta description
    const descriptionMeta = document.querySelector('meta[name="description"]')
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', domainConfig.description)
    }

    // Update meta keywords
    const keywordsMeta = document.querySelector('meta[name="keywords"]')
    if (keywordsMeta) {
      keywordsMeta.setAttribute('content', domainConfig.keywords.join(', '))
    }

    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]')
    if (canonicalLink) {
      canonicalLink.setAttribute('href', domainConfig.canonical)
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', domainConfig.title)
    }

    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', domainConfig.description)
    }

    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) {
      ogUrl.setAttribute('content', domainConfig.canonical)
    }

    const ogSiteName = document.querySelector('meta[property="og:site_name"]')
    if (ogSiteName) {
      ogSiteName.setAttribute('content', domainConfig.siteName)
    }

    const ogImage = document.querySelector('meta[property="og:image"]')
    if (ogImage) {
      ogImage.setAttribute('content', `${domainConfig.canonical}${domainConfig.ogImage}`)
    }

    // Update Twitter Card tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (twitterTitle) {
      twitterTitle.setAttribute('content', domainConfig.title)
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]')
    if (twitterDescription) {
      twitterDescription.setAttribute('content', domainConfig.description)
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]')
    if (twitterImage) {
      twitterImage.setAttribute('content', `${domainConfig.canonical}${domainConfig.ogImage}`)
    }

    // Update favicon
    const favicon = document.querySelector('link[rel="icon"]')
    if (favicon) {
      favicon.setAttribute('href', domainConfig.favicon)
    }

    const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]')
    if (appleTouchIcon) {
      appleTouchIcon.setAttribute('href', domainConfig.favicon)
    }

    // Update theme color
    const themeColor = document.querySelector('meta[name="theme-color"]')
    if (themeColor) {
      themeColor.setAttribute('content', domainConfig.primaryColor)
    }

    // Update CSS custom properties for theme colors
    document.documentElement.style.setProperty('--primary-color', domainConfig.primaryColor)

  }, [domainConfig, isLoading])

  return null
}
