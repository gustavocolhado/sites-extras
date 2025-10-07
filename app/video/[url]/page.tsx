'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  ThumbsUp,
  Download,
  Info,
  Flag,
  MessageCircle,
  Plus,
  Eye,
  User,
  Clock,
  RefreshCw,
  Heart,
  Bookmark
} from 'lucide-react'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import Player from '@/components/Player'
import VideoCard from '@/components/VideoCard'
import VideoSEOHead from '@/components/VideoSEOHead'
import VideoBreadcrumbs from '@/components/VideoBreadcrumbs'
import { useRelatedVideos } from '@/hooks/useRelatedVideos'
import { useVideoActions } from '@/hooks/useVideoActions'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import { useVideoPreload } from '@/hooks/useVideoPreload'
import AdIframe300x250 from '@/components/ads/300x250'
import AdIframe728x90 from '@/components/ads/728x90'
import AdIframe300x100 from '@/components/ads/300x100'
import VideoAdBanner from '@/components/ads/VideoAdBanner'
import PremiumVideoTeaser from '@/components/ads/PremiumVideoTeaser'
import VideoPreloadIndicator from '@/components/VideoPreloadIndicator'

interface VideoData {
  id: string
  url: string
  title: string
  duration: string
  thumbnailUrl: string
  videoUrl: string
  trailerUrl?: string
  isIframe?: boolean
  premium?: boolean
  viewCount: number
  likesCount: number
  dislikesCount: number
  category: string[]
  creator: string
  uploader?: {
    id: string
    name: string
    username: string
  } | null
  uploadTime: string
  description: string
  tags: string[]
}

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const videoUrl = params.url as string
  const { data: session } = useSession()
  const { isPremium } = usePremiumStatus()
  
  const [video, setVideo] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentLikesCount, setCurrentLikesCount] = useState(0)
  const [currentViewCount, setCurrentViewCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Buscar vídeos relacionados
  const { videos: relatedVideos, loading: relatedLoading } = useRelatedVideos({
    videoId: videoUrl,
    limit: 20
  })

  // Hook para ações do vídeo
  const { isLiked, isFavorited, isLoading: actionsLoading, toggleLike, toggleFavorite, recordView } = useVideoActions({
    videoId: videoUrl
  })

  // Hook para preload inteligente de vídeos relacionados
  const { isVideoPreloaded, preloadProgress } = useVideoPreload({
    videoUrls: relatedVideos.map(v => v.videoUrl).filter((url): url is string => Boolean(url)),
    maxPreload: 2,
    preloadDelay: 8000
  })

  // Verificar se o vídeo é premium e o usuário não é premium
  useEffect(() => {
    // Aguardar o carregamento da sessão antes de verificar
    if (session === undefined) {
      console.log('⏳ Aguardando carregamento da sessão...')
      return
    }
    
    if (video && video.premium && !session?.user?.premium) {
      console.log('🔒 Vídeo premium detectado, usuário não premium, redirecionando...')
      router.push('/premium')
      return
    }
  }, [video, session, router])

  // Buscar dados do vídeo
  useEffect(() => {
    let isMounted = true

    const fetchVideo = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/videos/${videoUrl}`)
        
        if (!response.ok) {
          throw new Error('Vídeo não encontrado')
        }
        
        const videoData = await response.json()
        if (isMounted) {
          setVideo(videoData)
          setCurrentLikesCount(videoData.likesCount || 0)
          setCurrentViewCount(videoData.viewCount || 0)

          // Registrar a visualização e atualizar o contador
          recordView().then(newViewCount => {
            if (isMounted && newViewCount !== null) {
              setCurrentViewCount(newViewCount)
            }
          })
        }
        
        // Verificar se o vídeo é premium e o usuário não é premium
        if (videoData.premium && session !== undefined && !session?.user?.premium) {
          console.log('🔒 Vídeo premium detectado, usuário não premium, redirecionando...')
          router.push('/premium')
          return
        }
      } catch (error) {
        console.error('Erro ao buscar vídeo:', error)
        if (isMounted) {
          setError('Erro ao carregar vídeo')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchVideo()

    return () => {
      isMounted = false
    }
  }, [videoUrl, recordView, session, router])

  // A função handleVideoLoad não é mais necessária para contar views,
  // mas pode ser usada para outras lógicas no futuro.
  const handleVideoLoad = useCallback(() => {
    // Lógica a ser executada quando o vídeo carregar (ex: analytics)
  }, [])

  // Função para lidar com like
  const handleLike = async () => {
    if (!session?.user) {
      // Redirecionar para login ou mostrar modal
      alert('Faça login para curtir vídeos')
      return
    }

    try {
      await toggleLike()
      // Atualizar contador de likes
      setCurrentLikesCount(prev => isLiked ? prev - 1 : prev + 1)
    } catch (error) {
      console.error('Erro ao curtir vídeo:', error)
      alert('Erro ao curtir vídeo. Tente novamente.')
    }
  }

  // Função para download do vídeo
  const handleDownload = async () => {
    if (!video) return

    // Verificar se o usuário está logado
    if (!session?.user) {
      alert('Faça login para baixar vídeos')
      router.push('/login')
      return
    }

    // Verificar se o usuário é premium para downloads
    if (!isPremium) {
      alert('Downloads estão disponíveis apenas para usuários Premium. Faça upgrade para baixar vídeos.')
      router.push('/premium')
      return
    }

    try {
      // Obter URL de download da API
      const response = await fetch(`/api/videos/${video.url}/download`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao baixar vídeo')
      }

      // Verificar se é um redirecionamento ou resposta JSON
      if (response.redirected) {
        // É um redirecionamento para download direto
        alert('Download iniciado com sucesso!')
      } else {
        // É uma resposta JSON
        const data = await response.json()
        
        if (data.downloadUrl) {
          if (data.isDirectFile) {
            // Para arquivos diretos, criar iframe oculto para forçar download
            const iframe = document.createElement('iframe')
            iframe.style.display = 'none'
            iframe.src = data.downloadUrl
            document.body.appendChild(iframe)
            
            // Remover iframe após um tempo
            setTimeout(() => {
              document.body.removeChild(iframe)
            }, 5000)
            
            alert('Download iniciado com sucesso!')
          } else {
            // É uma URL externa, abrir em nova aba
            window.open(data.downloadUrl, '_blank')
            alert(data.message || 'Download iniciado em nova aba!')
          }
        } else {
          throw new Error('URL de download não encontrada')
        }
      }
    } catch (error) {
      console.error('Erro ao baixar vídeo:', error)
      alert('Erro ao baixar vídeo. Tente novamente.')
    }
  }

  // Função para solicitar remoção
  const handleReport = () => {
    if (!video) return

    // Redirecionar para a página de remoção com os dados do vídeo
    const reportData = {
      urls: `${window.location.origin}/video/${video.url}`,
      category: 'outros',
      motivation: `Solicitação de remoção para o vídeo: ${video.title}`,
      videoTitle: video.title,
      videoUrl: video.url
    }

    // Codificar os dados para passar via URL
    const encodedData = encodeURIComponent(JSON.stringify(reportData))
    router.push(`/remocao?data=${encodedData}`)
  }

  // Função para lidar com favoritos
  const handleFavorite = async () => {
    if (!session?.user) {
      // Redirecionar para login ou mostrar modal
      alert('Faça login para favoritar vídeos')
      return
    }

    try {
      await toggleFavorite()
    } catch (error) {
      console.error('Erro ao favoritar vídeo:', error)
      alert('Erro ao favoritar vídeo. Tente novamente.')
    }
  }

  // Função para lidar com clique no título (se tem criador, vai para criador)
  const handleTitleClick = async () => {
    if (video?.creator) {
      try {
        // Buscar o ID do criador pelo nome
        const response = await fetch(`/api/creators/search?name=${encodeURIComponent(video.creator)}`)
        if (response.ok) {
          const creatorData = await response.json()
          if (creatorData.id) {
            router.push(`/creators/${creatorData.id}`)
            return
          }
        }
        // Fallback: se não encontrar o ID, usar o nome
        router.push(`/creators/${encodeURIComponent(video.creator)}`)
      } catch (error) {
        console.error('Erro ao buscar criador:', error)
        // Fallback: usar o nome
        router.push(`/creators/${encodeURIComponent(video.creator)}`)
      }
    }
  }


  if (error || !video) {
    return (
      <Layout>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-theme-primary">
            {error || 'Vídeo não encontrado'}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <>
      <VideoSEOHead
        title={video.title}
        description={video.description}
        thumbnailUrl={video.thumbnailUrl}
        videoUrl={video.videoUrl}
        duration={video.duration}
        uploadDate={video.uploadTime}
        creatorName={video.creator}
        tags={video.tags}
        category={video.category}
        viewCount={video.viewCount}
        likesCount={currentLikesCount}
        canonical={`https://cornosbrasil.com/video/${video.url}`}
      />
      <Layout>
        <Header />
      <main className="bg-theme-primary min-h-screen mt-5 overflow-x-hidden">
        <div className="container-content py-6">
          {/* Breadcrumbs */}
          <VideoBreadcrumbs 
            title={video.title}
            category={video.category}
            videoUrl={video.url}
          />

          {/* Banner Mobile - Acima do Vídeo */}
              {!isPremium && (
                <div className="hidden lg:hidden">
                    <div className="w-full h-[100px] flex items-center justify-center">
                      <AdIframe300x100 />
                    </div>
                </div>
              )}
          
          {/* Top Bar */}
          <div className="py-4">
            <div className="flex items-center justify-between">
              {video.creator ? (
                <button
                  onClick={handleTitleClick}
                  className="text-lg font-bold truncate flex-1 mr-4 text-left hover:text-accent-red transition-colors cursor-pointer"
                >
                  {video.title}
                </button>
              ) : (
                <h1 className="text-lg font-bold truncate flex-1 mr-4">
                  {video.title}
                </h1>
              )}
              <div className="flex items-center space-x-2">
                <span className="bg-accent-red px-2 py-1 rounded text-sm font-bold text-white">
                  {video.duration}
                </span>
                <span className="bg-theme-hover text-theme-primary px-2 py-1 rounded text-sm font-bold">
                  HD
                </span>
              </div>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {video.tags.map((tag, index) => (
                <button
                  key={index}
                  className="bg-theme-hover hover:bg-theme-input text-theme-primary px-3 py-1 rounded text-sm transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Video Player */}
            <div className="flex-1">
              

              <div className="-mx-4 sm:-mx-6 lg:mx-0">
                <Player
                  className="lg:rounded-lg lg:aspect-video"
                  videoUrl={video.videoUrl}
                  poster={video.thumbnailUrl}
                  title={video.title}
                  onError={(error) => console.error('Erro no player:', error)}
                  onLoad={handleVideoLoad}
                  autoPlay={false}
                  muted={false}
                  loop={false}
                  preload="auto"
                />
              </div>

              {/* Banner Desktop - Abaixo do Vídeo */}
              {!isPremium && (
                <div className="hidden lg:block mt-4">
                    <div className="w-full h-[90px] flex items-center justify-center">
                      <AdIframe728x90 />
                    </div>
                </div>
              )}

              {/* Engagement Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <button 
                  onClick={handleLike}
                  disabled={actionsLoading}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked 
                      ? 'bg-accent-red hover:bg-accent-red-hover text-white' 
                      : 'bg-theme-hover hover:bg-theme-input text-theme-primary'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">
                    {isLiked ? 'Curtido' : 'Curtir'}
                  </span>
                  <span className="text-sm opacity-75">
                    {currentLikesCount.toLocaleString()}
                  </span>
                </button>
                
                <button 
                  onClick={handleFavorite}
                  disabled={actionsLoading}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isFavorited 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-theme-hover hover:bg-theme-input text-theme-primary'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">
                    {isFavorited ? 'Favoritado' : 'Favoritar'}
                  </span>
                </button>

                <button className="flex items-center space-x-2 bg-theme-hover hover:bg-theme-input text-theme-primary px-4 py-2 rounded-lg transition-colors">
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-medium">INFO</span>
                </button>

                <button 
                  onClick={() => handleDownload()}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isPremium 
                      ? 'bg-theme-hover hover:bg-theme-input text-theme-primary' 
                      : 'bg-gray-400 cursor-not-allowed text-gray-600'
                  }`}
                  disabled={!isPremium}
                  title={!isPremium ? 'Downloads disponíveis apenas para usuários Premium' : 'Baixar vídeo'}
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {isPremium ? 'BAIXAR' : 'PREMIUM'}
                  </span>
                </button>

                <button 
                  onClick={() => handleReport()}
                  className="flex items-center space-x-2 bg-theme-hover hover:bg-theme-input text-theme-primary px-4 py-2 rounded-lg transition-colors"
                >
                  <Flag className="w-4 h-4" />
                  <span className="text-sm font-medium">SOLICITAR REMOÇÃO</span>
                </button>
              </div>

              {/* Video Info */}
              <div className="bg-theme-card border border-theme-primary rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-theme-primary">Informações do Vídeo</h2>
                  {isPremium && (
                    <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-100 px-3 py-1 rounded-lg">
                      <span className="text-sm">✨</span>
                      <span className="text-sm font-medium">Sem anúncios</span>
                    </div>
                  )}
                  <button className="text-theme-muted hover:text-theme-primary">
                    <Info className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-theme-muted" />
                    <div>
                      <span className="text-sm text-theme-muted">Criador:</span>
                      {video.creator ? (
                        <button
                          onClick={handleTitleClick}
                          className="text-sm font-medium text-theme-primary ml-2 hover:text-accent-red transition-colors cursor-pointer"
                        >
                          {video.creator}
                        </button>
                      ) : (
                        <span className="text-sm font-medium text-theme-primary ml-2">{video.creator}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-theme-muted" />
                    <div>
                      <span className="text-sm text-theme-muted">Duração:</span>
                      <span className="text-sm font-medium text-theme-primary ml-2">{video.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Eye className="w-5 h-5 text-theme-muted" />
                    <div>
                      <span className="text-sm text-theme-muted">Visualizações:</span>
                      <span className="text-sm font-medium text-theme-primary ml-2">{currentViewCount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <ThumbsUp className="w-5 h-5 text-theme-muted" />
                    <div>
                      <span className="text-sm text-theme-muted">Curtidas:</span>
                      <span className="text-sm font-medium text-theme-primary ml-2">{currentLikesCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner Mobile - Abaixo das Informações */}
              {!isPremium && (
                <div className="lg:hidden mt-4">
                    <div className="w-full h-[250px] flex items-center justify-center">
                      <AdIframe300x250 />
                    </div>
                </div>
              )}

              {/* Vídeos Relacionados */}
              <div className="py-2 mt-4 mb-8">
                <h3 className="text-lg font-bold text-theme-primary mb-4">Vídeos Relacionados</h3>
                {relatedLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-theme-primary" />
                  </div>
                ) : relatedVideos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-1">
                    {relatedVideos.slice(0, 20).map((relatedVideo, index) => {
                      const items = []
                      
                      // Adicionar o vídeo relacionado
                      items.push(
                        <VideoCard
                          key={relatedVideo.id}
                          id={relatedVideo.id}
                          title={relatedVideo.title}
                          duration={relatedVideo.duration}
                          thumbnailUrl={relatedVideo.thumbnailUrl}
                          videoUrl={relatedVideo.videoUrl || relatedVideo.id}
                          isIframe={relatedVideo.iframe || false}
                          premium={relatedVideo.premium || false}
                          viewCount={relatedVideo.viewCount}
                          category={relatedVideo.category}
                          creator={relatedVideo.creator || undefined}
                          uploader={null}
                        />
                      )
                      
                      // Adicionar anúncio a cada 8 vídeos relacionados para usuários não premium
                      if (!session?.user?.premium && (index + 1) % 8 === 0) {
                        items.push(
                          <VideoAdBanner key={`ad-related-${index}`} />
                        )
                      }
                      
                      // Adicionar PremiumVideoTeaser a cada 12 vídeos relacionados para usuários não premium
                      if (!session?.user?.premium && (index + 1) % 12 === 0) {
                        items.push(
                          <PremiumVideoTeaser key={`teaser-related-${index}`} />
                        )
                      }
                      
                      return items
                    }).flat()}
                  </div>
                ) : (
                  <p className="text-theme-muted text-sm text-center py-8">Nenhum vídeo relacionado encontrado</p>
                )}
              </div>
            </div>

            {/* Sidebar com Anúncios Desktop */}
            {!isPremium && (
              <div className="hidden lg:block lg:w-80 space-y-4">
                {/* Anúncio 1 - 300x250 */}
                  <div className="w-full h-[250px] flex items-center justify-center">
                    <AdIframe300x250 />
                  </div>

                {/* Anúncio 2 - 300x250 */}
                  <div className="w-full h-[250px] flex items-center justify-center">
                    <AdIframe300x250 />
                  </div>

                {/* Anúncio 3 - 300x250 */}
                  <div className="w-full h-[250px] flex items-center justify-center">
                    <AdIframe300x250 />
                  </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Indicador de Preload - só mostra se há vídeos relacionados e preload real */}
      {relatedVideos.length > 0 && (
        <VideoPreloadIndicator 
          progress={preloadProgress} 
          isPreloading={preloadProgress < 1 && preloadProgress > 0}
        />
      )}
        </Layout>
      </>
    )
}
