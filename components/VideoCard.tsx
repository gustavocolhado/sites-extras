'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, ExternalLink } from 'lucide-react'
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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const router = useRouter()
  const isPremium = useIsPremium()

  // Função para formatar o título
  const formatTitle = (title: string) => {
    if (!title) return ''
    const lowercasedTitle = title.toLowerCase()
    return lowercasedTitle.charAt(0).toUpperCase() + lowercasedTitle.slice(1)
  }
  
  // Fechar menu de contexto com tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeContextMenu()
      }
    }

    if (contextMenu) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [contextMenu])
  
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

  // Função para lidar com o clique do botão direito
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Impede a propagação do evento
    
    // Se o vídeo é premium e o usuário não é premium, não mostrar menu
    if (premium && !isPremium) {
      return
    }
    
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  // Função para fechar o menu de contexto
  const closeContextMenu = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setContextMenu(null)
  }

  // Função para abrir vídeo em nova aba
  const openInNewTab = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const videoUrl = `/video/${id}`
    window.open(videoUrl, '_blank')
    closeContextMenu()
  }

  // Função para copiar link do vídeo
  const copyVideoLink = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const videoUrl = `${window.location.origin}/video/${id}`
    try {
      await navigator.clipboard.writeText(videoUrl)
      closeContextMenu()
    } catch (err) {
      console.error('Erro ao copiar link:', err)
    }
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
      onContextMenu={handleContextMenu}
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
      
      <div className="relative aspect-video theme-card overflow-hidden w-full min-h-36">
        {/* Trailer (se iframe e mouse sobre) */}
        {showTrailer && isIframe && trailerUrl && (
          <div className="absolute inset-0 z-10">
            <img
              src={trailerUrl}
              className="w-full h-full object-cover"
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
        
        {/* Grátis Badge */}
        {!premium && (
          <div 
            className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded"
            aria-label="Conteúdo Gratuito"
          >
            GRÁTIS
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
        {formatTitle(title)}
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
      
      {/* Menu de Contexto */}
      {contextMenu && (
        <>
          {/* Overlay para fechar o menu ao clicar fora */}
          <div 
            className="fixed inset-0 z-50"
            onClick={closeContextMenu}
          />
          
          {/* Menu de contexto */}
          <div 
            className="fixed z-50 bg-theme-card border border-theme-border-primary rounded-lg shadow-xl py-1 min-w-48"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              transform: 'translate(-50%, -100%) translateY(-10px)'
            }}
          >
            <button
              onClick={openInNewTab}
              className="w-full flex items-center space-x-3 px-4 py-2 text-theme-primary hover:bg-theme-hover transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir em nova aba</span>
            </button>
            
            <button
              onClick={copyVideoLink}
              className="w-full flex items-center space-x-3 px-4 py-2 text-theme-primary hover:bg-theme-hover transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copiar link</span>
            </button>
          </div>
        </>
      )}
    </article>
  )
}
