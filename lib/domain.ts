import { headers } from 'next/headers'
import { Metadata, Viewport } from 'next'
import { DomainConfig, getDomainConfig } from '@/config/domains'

export function getServerDomainConfig(): DomainConfig {
  try {
    const headersList = headers()
    const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost'
    
    // Remover porta se presente
    const domain = host.split(':')[0]
    
    return getDomainConfig(domain)
  } catch (error) {
    console.error('Erro ao obter configuração do domínio:', error)
    return getDomainConfig('cornosbrasil.com') // Fallback
  }
}

export function generateDomainMetadata(domainConfig: DomainConfig): Metadata {
  return {
    title: {
      default: domainConfig.title,
      template: `%s | ${domainConfig.siteName}`
    },
    description: domainConfig.description,
    keywords: domainConfig.keywords,
    authors: [{ name: domainConfig.siteName }],
    creator: domainConfig.siteName,
    publisher: domainConfig.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(domainConfig.canonical),
    alternates: {
      canonical: domainConfig.canonical,
    },
    openGraph: {
      title: domainConfig.title,
      description: domainConfig.description,
      url: domainConfig.canonical,
      siteName: domainConfig.siteName,
      images: [
        {
          url: domainConfig.ogImage,
          width: 1200,
          height: 630,
          alt: domainConfig.siteName,
        },
      ],
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: domainConfig.title,
      description: domainConfig.description,
      images: [domainConfig.ogImage],
      creator: '@cornosbrasil',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
    icons: {
      icon: domainConfig.favicon,
      shortcut: domainConfig.favicon,
      apple: domainConfig.favicon,
    },
    manifest: '/manifest.json',
  }
}

export function generateViewport(domainConfig: DomainConfig): Viewport {
  return {
    themeColor: domainConfig.primaryColor,
    width: 'device-width',
    initialScale: 1,
  }
}
