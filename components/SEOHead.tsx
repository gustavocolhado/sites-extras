'use client'

import Head from 'next/head'
import { useDomainContext } from '@/contexts/DomainContext'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[] | string
  canonical?: string
  ogImage?: string
  ogType?: string
  noIndex?: boolean
}

export default function SEOHead({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  noIndex = false
}: SEOHeadProps) {
  const { domainConfig, isLoading } = useDomainContext()

  // Use domain config if available, otherwise use props or defaults
  const finalTitle = title || (domainConfig?.title || 'CORNOS BRASIL - Videos Porno de Sexo Amador | Corno Videos')
  const finalDescription = description || (domainConfig?.description || 'Videos porno de sexo amador brasileiro. Assista videos de corno, porno amador, videos porno grátis. CORNOS BRASIL - O melhor site de videos porno amador do Brasil.')
  const finalKeywords = keywords || (domainConfig?.keywords || [
    'videos porno',
    'porno amador', 
    'videos de corno',
    'cornos brasil',
    'sexo amador',
    'videos porno grátis',
    'porno brasileiro',
    'videos de sexo',
    'amador porno',
    'videos porno amador',
    'cornos videos',
    'porno corno',
    'videos de sexo amador',
    'porno grátis',
    'videos porno brasileiro'
  ])
  const finalCanonical = canonical || (domainConfig?.canonical || 'https://cornosbrasil.com')
  const finalOgImage = ogImage || (domainConfig?.ogImage || '/imgs/logo.png')
  const finalSiteName = domainConfig?.siteName || 'CORNOS BRASIL'

  const fullTitle = finalTitle.includes(finalSiteName) ? finalTitle : `${finalTitle} | ${finalSiteName}`
  
  // Handle keywords as string or array
  const keywordsString = Array.isArray(finalKeywords) ? finalKeywords.join(', ') : finalKeywords
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={keywordsString} />
      <meta name="author" content={finalSiteName} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={finalCanonical} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:site_name" content={finalSiteName} />
      <meta property="og:image" content={`${finalCanonical}${finalOgImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={`${finalCanonical}${finalOgImage}`} />
      
      {/* Additional SEO */}
      <meta name="language" content="pt-BR" />
      <meta name="geo.region" content="BR" />
      <meta name="geo.country" content="Brasil" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="adult" />
      <meta name="classification" content="adult" />
      
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": finalSiteName,
            "description": finalDescription,
            "url": finalCanonical,
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${finalCanonical}/videos?search={search_term_string}`,
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": finalSiteName,
              "url": finalCanonical
            }
          })
        }}
      />
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Additional meta for adult content */}
      <meta name="adult-content" content="true" />
      <meta name="rating" content="adult" />
      <meta name="classification" content="adult" />
    </Head>
  )
} 