'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import Section from '@/components/Section'
import VideoCard from '@/components/VideoCard'
import Pagination from '@/components/Pagination'
import { ArrowLeft, Play, Users, Eye } from 'lucide-react'
import { formatDuration } from '@/utils/formatDuration'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'

interface Video {
  id: string
  title: string
  description: string | null
  url: string
  videoUrl: string
  viewCount: number

  thumbnailUrl: string
  duration: number | null
  premium: boolean
  iframe: boolean
  trailerUrl: string | null
  category: string[]
  creator: string | null
  created_at: string | null
}

interface Creator {
  id: string
  name: string
  qtd: number | null
  description: string | null
  image: string | null
  created_at: string | null
  update_at: string | null
}

interface CreatorVideosResponse {
  videos: Video[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  creator: {
    name: string
  }
}

export default function CreatorPage() {
  const params = useParams()
  const creatorId = params.id as string
  const { isPremium } = usePremiumStatus()
  
  const [creator, setCreator] = useState<Creator | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        setLoading(true)
        
        // Busca dados do criador
        const creatorResponse = await fetch(`/api/creators/${creatorId}`)
        if (!creatorResponse.ok) {
          throw new Error('Criador não encontrado')
        }
        const creatorData = await creatorResponse.json()
        setCreator(creatorData)
        
        // Busca vídeos do criador
        const videosResponse = await fetch(`/api/creators/${creatorId}/videos?page=${currentPage}`)
        if (!videosResponse.ok) {
          throw new Error('Erro ao buscar vídeos')
        }
        const videosData: CreatorVideosResponse = await videosResponse.json()
        setVideos(videosData.videos)
        setPagination(videosData.pagination)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        console.error('Erro ao buscar dados do criador:', err)
      } finally {
        setLoading(false)
      }
    }

    if (creatorId) {
      fetchCreatorData()
    }
  }, [creatorId, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackClick = () => {
    window.history.back()
  }

  if (loading) {
    return (
             <Layout>
         <Header />
         <main className="min-h-screen bg-theme-primary">
           <Section background="white" padding="lg">
             <div className="animate-pulse">
                             <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
               <div className="flex items-center gap-4 mb-8">
                 <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                 <div>
                   <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                   <div className="h-4 bg-gray-200 rounded w-32"></div>
                 </div>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                 {[...Array(10)].map((_, index) => (
                   <div key={index} className="bg-theme-card rounded-lg shadow-md overflow-hidden">
                     <div className="aspect-video bg-gray-200"></div>
                     <div className="p-3">
                       <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                       <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </Section>
        </main>
      </Layout>
    )
  }

  if (error || !creator) {
    return (
             <Layout>
         <Header />
         <main className="min-h-screen bg-theme-primary">
           <Section background="white" padding="lg">
             <div className="text-center">
                             <div className="text-red-500 text-lg mb-4">
                 {error || 'Criador não encontrado'}
               </div>
               <button
                 onClick={handleBackClick}
                 className="flex items-center gap-2 mx-auto px-4 py-2 bg-accent-red text-white rounded-lg hover:bg-accent-red-hover transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
            </div>
          </Section>
        </main>
      </Layout>
    )
  }

  return (
    <Layout>
      <Header />
      <main className="min-h-screen bg-theme-primary">
        <Section background="white" padding="lg">
          {/* Botão voltar */}
                     <button
             onClick={handleBackClick}
             className="flex items-center gap-2 mb-6 text-theme-primary hover:text-accent-red transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          {/* Header do criador */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div className="flex-shrink-0">
              <img
                src={creator.image || '/creators/default-creator.jpg'}
                alt={creator.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-gray-100"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTI0IDI0QzI4LjQxODMgMjQgMzIgMjAuNDE4MyAzMiAxNkMzMiAxMS41ODE3IDI4LjQxODMgOCAyNCA4QzE5LjU4MTcgOCAxNiAxMS41ODE3IDE2IDE2QzE2IDIwLjQxODMgMTkuNTgxNyAyNCAyNCAyNFoiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTQwIDQwQzQwIDMyLjI2ODAxIDMyLjgzNiAyNiAyNCAyNkMxNS4xNjQgMjYgOCAzMi4yNjgwMSA4IDQwIiBmaWxsPSIjRDFENURCIi8+Cjwvc3ZnPgo='
                }}
              />
            </div>
            
                                     <div className="flex-1">
              <h1 className={`text-3xl md:text-4xl font-bold mb-2 text-theme-primary ${!isPremium ? 'blur-sm' : ''}`}>
                {creator.name}
              </h1>
               
               {creator.description && (
                 <p className="text-theme-secondary mb-4 max-w-2xl">
                   {creator.description}
                 </p>
               )}
               
               <div className="flex items-center gap-6 text-sm text-theme-muted">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  <span>{pagination.total} vídeos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Visualizações</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de vídeos */}
          {videos.length === 0 ? (
                         <div className="text-center py-12">
               <Play className="w-16 h-16 text-theme-muted mx-auto mb-4" />
               <h3 className="text-xl font-semibold text-theme-secondary mb-2">
                 Nenhum vídeo encontrado
               </h3>
               <p className="text-theme-muted">
                 Este criador ainda não possui vídeos publicados.
               </p>
             </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 mb-8">
                {videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    id={video.id}
                    title={video.title}
                    duration={formatDuration(video.duration)}
                    thumbnailUrl={video.thumbnailUrl}
                    videoUrl={video.videoUrl}
                                         trailerUrl={video.trailerUrl || undefined}
                     isIframe={video.iframe}
                     premium={video.premium}
                     viewCount={video.viewCount}

                     category={video.category}
                     creator={video.creator || undefined}
                  />
                ))}
              </div>
              
              {/* Paginação */}
              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </Section>
      </main>
    </Layout>
  )
} 