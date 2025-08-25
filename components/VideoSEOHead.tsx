'use client'

import Head from 'next/head'
import { useDomainContext } from '@/contexts/DomainContext'

interface VideoSEOHeadProps {
  title: string
  description?: string
  thumbnailUrl: string
  videoUrl: string
  duration: string
  uploadDate: string
  creatorName: string
  tags: string[]
  category: string[]
  viewCount: number
  likesCount: number
  canonical?: string
  noIndex?: boolean
}

export default function VideoSEOHead({
  title,
  description,
  thumbnailUrl,
  videoUrl,
  duration,
  uploadDate,
  creatorName,
  tags,
  category,
  viewCount,
  likesCount,
  canonical,
  noIndex = false
}: VideoSEOHeadProps) {
  const { domainConfig, isLoading } = useDomainContext()

  // Fallback para quando o domínio ainda não foi carregado
  const siteName = isLoading || !domainConfig ? 'CORNOS BRASIL' : domainConfig.siteName
  const canonicalDomain = isLoading || !domainConfig ? 'https://cornosbrasil.com' : domainConfig.canonical

  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`
  const fullDescription = description || `Assista ${title} - Videos porno amador brasileiro no ${siteName}. ${creatorName} apresenta este video de ${category.join(', ')}.`
  const keywords = [...tags, ...category, 'videos porno', 'porno amador', 'videos de corno', siteName.toLowerCase(), 'sexo amador']
  const canonicalUrl = canonical || `${canonicalDomain}/video/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  
  // Converter duração para formato ISO 8601
  const parseDuration = (duration: string) => {
    const parts = duration.split(':')
    if (parts.length === 2) {
      const minutes = parseInt(parts[0])
      const seconds = parseInt(parts[1])
      return `PT${minutes}M${seconds}S`
    }
    return 'PT0M'
  }

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={siteName} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
             <meta property="og:image" content={thumbnailUrl.startsWith('http') ? thumbnailUrl : `${canonicalDomain}${thumbnailUrl}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content="video" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Video specific Open Graph */}
      <meta property="og:video" content={videoUrl} />
      <meta property="og:video:type" content="video/mp4" />
      <meta property="og:video:width" content="1280" />
      <meta property="og:video:height" content="720" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="player" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
             <meta name="twitter:image" content={thumbnailUrl.startsWith('http') ? thumbnailUrl : `${canonicalDomain}${thumbnailUrl}`} />
      <meta name="twitter:player" content={videoUrl} />
      <meta name="twitter:player:width" content="1280" />
      <meta name="twitter:player:height" content="720" />
      
      {/* Additional SEO */}
      <meta name="language" content="pt-BR" />
      <meta name="geo.region" content="BR" />
      <meta name="geo.country" content="Brasil" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="adult" />
      <meta name="classification" content="adult" />
      
      {/* Schema.org VideoObject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": title,
            "description": fullDescription,
                         "thumbnailUrl": thumbnailUrl.startsWith('http') ? thumbnailUrl : `${canonicalDomain}${thumbnailUrl}`,
            "uploadDate": uploadDate,
            "duration": parseDuration(duration),
            "contentUrl": videoUrl,
            "embedUrl": videoUrl,
            "interactionStatistic": [
              {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/WatchAction",
                "userInteractionCount": viewCount
              },
              {
                "@type": "InteractionCounter", 
                "interactionType": "https://schema.org/LikeAction",
                "userInteractionCount": likesCount
              }
            ],
            "creator": {
              "@type": "Person",
              "name": creatorName
            },
                         "publisher": {
               "@type": "Organization",
               "name": siteName,
               "url": canonicalDomain
             },
            "genre": category,
            "keywords": keywords.join(', '),
            "inLanguage": "pt-BR",
            "isFamilyFriendly": false,
            "contentRating": "adult"
          })
        }}
      />
      
      {/* BreadcrumbList Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                             {
                 "@type": "ListItem",
                 "position": 1,
                 "name": "Home",
                 "item": canonicalDomain
               },
               {
                 "@type": "ListItem", 
                 "position": 2,
                 "name": "Vídeos",
                 "item": `${canonicalDomain}/videos`
               },
               {
                 "@type": "ListItem",
                 "position": 3,
                 "name": category[0] || "Categoria",
                 "item": `${canonicalDomain}/categories/${category[0]?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
               },
              {
                "@type": "ListItem",
                "position": 4,
                "name": title,
                "item": canonicalUrl
              }
            ]
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
