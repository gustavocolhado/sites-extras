'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { useIsPremium } from '@/hooks/usePremiumStatus'

interface VideoCardProps {
  id: string
  title: string
  duration: string | number
  thumbnailUrl: string | null
  videoUrl: string
  trailerUrl?: string | null
  isIframe?: boolean
  premium?: boolean
  viewCount?: number
  category?: string[]
  creator?: string
  uploader?: {
    id: string
    name: string
    username: string
  } | null
  onClick?: (video: VideoCardProps) => void
}

export default function VideoCard({ 
  id, 
  title, 
  duration, 
  thumbnailUrl, 
  videoUrl, 
  trailerUrl,
  isIframe = false,
  premium = false, 
  viewCount = 0, 
  category = [], 
  creator, 
  uploader, 
  onClick 
}: VideoCardProps) {
  const [showTrailer, setShowTrailer] = useState(false)
  const router = useRouter()
  const isPremium = useIsPremium()
  
  // Função para construir a URL do thumbnail
  const getThumbnailUrl = (url: string | null | undefined, isIframe: boolean) => {
    // Se não há URL, retornar URL padrão
    if (!url) {
      return '/imgs/logo.png' // URL padrão quando não há thumbnail
    }
    
    // Se é iframe, retornar a URL como está (geralmente já é completa)
    if (isIframe) {
      return url
    }
    
    // Se a URL já é completa (começa com http), retornar como está
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL
    if (!mediaUrl) {
      console.warn('NEXT_PUBLIC_MEDIA_URL não está configurada')
      // Se não há mediaUrl configurada, tentar usar a URL como está
      return url
    }
    
    // Remove barra dupla se existir
    const cleanMediaUrl = mediaUrl.endsWith('/') ? mediaUrl.slice(0, -1) : mediaUrl
    const cleanThumbnailUrl = url.startsWith('/') ? url : `/${url}`
    
    const fullUrl = `${cleanMediaUrl}${cleanThumbnailUrl}`
    return fullUrl
  }
  
  const handleClick = () => {
    // Se o vídeo é premium e o usuário não é premium, redirecionar para a página premium
    if (premium && !isPremium) {
      router.push('/premium')
      return
    }
    
    if (onClick) {
      onClick({ id, title, duration, thumbnailUrl, videoUrl, trailerUrl, isIframe, premium, viewCount, category, creator, uploader })
    } else {
      // Navegar para a página do vídeo
      router.push(`/video/${id}`)
    }
  }



  const handleMouseEnter = () => {
    if (isIframe && trailerUrl) {
      setShowTrailer(true)
    }
  }

  const handleMouseLeave = () => {
    setShowTrailer(false)
  }

  // Structured data para SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": title,
    "description": `${title} - Videos porno amador no CORNOS BRASIL`,
    "thumbnailUrl": getThumbnailUrl(thumbnailUrl, isIframe),
    "uploadDate": new Date().toISOString(),
    "duration": duration,
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/WatchAction",
        "userInteractionCount": viewCount
      }
    ],
    "creator": creator || uploader?.name,
    "publisher": {
      "@type": "Organization",
      "name": "CORNOS BRASIL",
      "url": "https://cornosbrasil.com"
    },
    "genre": category.join(', '),
    "isFamilyFriendly": false,
    "contentRating": "adult"
  }

  return (
    <article 
      className="group cursor-pointer" 
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      itemScope
      itemType="https://schema.org/VideoObject"
      aria-label={`Vídeo: ${title}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      <div className="relative aspect-video theme-card overflow-hidden">
        {/* Trailer (se iframe e mouse sobre) */}
        {showTrailer && isIframe && trailerUrl && (
          <div className="absolute inset-0 z-10">
            <video
              src={trailerUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              style={{
                pointerEvents: 'none' // Desabilita interações com o vídeo
              }}
              aria-label={`Trailer do vídeo: ${title}`}
            />
          </div>
        )}
        
        {/* Thumbnail (visível quando não há trailer) */}
        {(!showTrailer || !isIframe || !trailerUrl) && (
          <>
            {thumbnailUrl ? (
              <img 
                src={getThumbnailUrl(thumbnailUrl, isIframe)} 
                alt={`Thumbnail do vídeo: ${title}`}
                className="w-full h-full object-cover"
                itemProp="thumbnailUrl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            
            {/* Fallback Thumbnail */}
            <div className={`w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center ${thumbnailUrl ? 'hidden' : ''}`}>
              <div className="text-gray-600 text-sm">Thumbnail</div>
            </div>
          </>
        )}
        
        {/* Premium Badge */}
        {premium && (
          <div 
            className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded"
            aria-label="Conteúdo Premium"
          >
            PREMIUM
          </div>
        )}
        
        {/* Premium Overlay - Vídeo borrado com cadeado */}
        {premium && !isPremium && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-20"
            aria-label="Conteúdo Premium - Faça upgrade para desbloquear"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-8 h-8 text-white" aria-hidden="true" />
              </div>
              <div className="text-white text-sm font-semibold mb-1">
                Conteúdo Premium
              </div>
              <div className="text-white/80 text-xs">
                Faça upgrade para desbloquear
              </div>
            </div>
          </div>
        )}
        
        {/* Duration */}
        <div 
          className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded"
          aria-label={`Duração: ${duration}`}
          itemProp="duration"
        >
          {duration}
        </div>
        
        {/* View Count */}
        {viewCount > 0 && (
          <div 
            className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded"
            aria-label={`${viewCount.toLocaleString()} visualizações`}
          >
            {viewCount.toLocaleString()} views
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div 
              className="w-0 h-0 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1"
              aria-hidden="true"
            ></div>
          </div>
        </div>


      </div>
      
      {/* Title */}
      <h3 
        className={`text-sm text-theme-primary mt-2 line-clamp-2 group-hover:text-accent-red transition-colors ${
          premium && !isPremium ? 'blur-sm' : ''
        }`}
        itemProp="name"
      >
        {title}
        {premium && !isPremium && (
          <span className="inline-flex items-center ml-2 text-yellow-500">
            <Lock className="w-3 h-3 mr-1" aria-hidden="true" />
            Premium
          </span>
        )}
      </h3>
      
      {/* Creator Info */}
      {(creator || uploader) && (
        <p 
          className={`text-xs mt-1 text-theme-secondary ${!isPremium ? 'blur-sm' : ''}`}
          itemProp="creator"
        >
          {uploader?.name || uploader?.username || creator}
        </p>
      )}
      
      {/* Stats */}
      <div className="flex items-center space-x-2 mt-1">
        {viewCount > 0 && (
          <span 
            className="text-xs text-theme-secondary"
            aria-label={`${viewCount.toLocaleString()} visualizações`}
          >
            {viewCount.toLocaleString()} views
          </span>
        )}
      </div>
    </article>
  )
} 