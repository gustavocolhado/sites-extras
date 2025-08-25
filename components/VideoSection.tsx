'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import VideoCard from './VideoCard'
import Section from './Section'
import Pagination from './Pagination'
import { useVideos } from '@/hooks/useVideos'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import { formatDuration } from '@/utils/formatDuration'

export default function VideoSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'liked'>('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const [vipCategory, setVipCategory] = useState<'VIP' | 'VIP Amadores'>('VIP')
  const router = useRouter()
  const { isPremium } = usePremiumStatus()
  
  // Sempre usar filtro aleatório na página inicial para alternar os vídeos
  const effectiveFilter = 'random'
  const effectiveCategory = isPremium ? vipCategory : (selectedCategory || undefined)
  

  


  const { videos, pagination, loading, error, refetch, forceRefetch } = useVideos({
    page: currentPage,
    limit: 50,
    filter: effectiveFilter,
    category: effectiveCategory,
    isPremium: isPremium
  })

  // Remover alternância automática - vídeos só mudam ao atualizar a página

  const handleVideoClick = (video: any) => {
    // Navegar para a página do vídeo
    router.push(`/video/${video.id}`)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll para o topo da seção
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSortChange = (newSort: 'recent' | 'popular' | 'liked') => {
    setSortBy(newSort)
    setCurrentPage(1) // Reset para primeira página ao mudar filtro
  }

  const handleVipCategoryChange = (category: 'VIP' | 'VIP Amadores') => {
    // Redirecionar para a página da categoria específica
    if (category === 'VIP Amadores') {
      router.push('/categories/vip-amadores')
    } else {
      // Para VIP, manter na página inicial mas atualizar o filtro
      setVipCategory(category)
      setCurrentPage(1) // Reset para primeira página ao mudar categoria
      
      // Forçar refetch após um pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => {
        forceRefetch()
      }, 100)
    }
  }

  return (
    <Section background="white" padding="md">
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <h2 className="text-xl md:text-2xl font-bold text-theme-primary">
              {isPremium ? `VIDEOS ${vipCategory} ALEATÓRIOS` : 'VIDEOS DE CORNO GRÁTIS'}
            </h2>
            <div className="flex items-center space-x-2">
              <Plus className="text-accent-red" size={20} />
              {loading && (
                <div className="flex items-center space-x-1 text-green-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Atualizando...</span>
                </div>
              )}
            </div>
          </div>
          
                     {!isPremium && (
                       <div className="flex items-center space-x-4">

                       </div>
                     )}
                     
                                          {isPremium && (
                       <div className="flex items-center space-x-4">        
                         

                         
                           {/* Botões para escolher categoria VIP */}
                           <div className="flex items-center space-x-2">
                           <button 
                             onClick={() => handleVipCategoryChange('VIP')}
                             className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                               vipCategory === 'VIP' 
                                 ? 'bg-accent-red text-white' 
                                 : 'bg-theme-hover text-theme-primary'
                             }`}
                           >
                             <span className="text-sm">VIP</span>
                           </button>
                           
                           <button 
                             onClick={() => handleVipCategoryChange('VIP Amadores')}
                             className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                               vipCategory === 'VIP Amadores' 
                                 ? 'bg-accent-red text-white' 
                                 : 'bg-theme-hover text-theme-primary'
                             }`}
                           >
                             <span className="text-sm">VIP AMADORES</span>
                           </button>
                         </div>
                       </div>
                     )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-500 text-sm">{error}</p>
          <button 
            onClick={() => refetch()}
            className="mt-2 text-red-500 hover:text-red-600 text-sm underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            id={video.id}
            title={video.title}
            duration={video.duration ? formatDuration(video.duration) : '0:00'}
            thumbnailUrl={video.thumbnailUrl}
            videoUrl={video.videoUrl}
            trailerUrl={video.trailerUrl || undefined}
            isIframe={video.iframe}
            premium={video.premium}
            viewCount={video.viewCount}

            category={video.category}
            creator={video.creator || undefined}
            onClick={handleVideoClick}
          />
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="bg-theme-card rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-200"></div>
              <div className="p-3">
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
            showInfo={true}
          />
        </div>
      )}

      {/* No Videos Message */}
      {!loading && videos.length === 0 && !error && (
        <div className="text-center py-12">
          <Plus className="w-16 h-16 text-theme-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-theme-secondary mb-2">
            Nenhum vídeo encontrado
          </h3>
          <p className="text-theme-muted">
            Tente ajustar os filtros ou volte mais tarde
          </p>
        </div>
      )}
    </Section>
  )
} 