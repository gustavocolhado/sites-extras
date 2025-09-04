'use client'

import { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import Section from '@/components/Section'
import VideoCard from '@/components/VideoCard'
import Pagination from '@/components/Pagination'
import PremiumTeaser from '@/components/PremiumTeaser'
import SEOHead from '@/components/SEOHead'
import { Search, Play, TrendingUp, Heart, Clock, Shuffle, Filter } from 'lucide-react'
import { useVideos } from '@/hooks/useVideos'
import { useSession } from 'next-auth/react'
import { formatDuration } from '@/utils/formatDuration'

type FilterType = 'recent' | 'popular' | 'liked' | 'long' | 'random'

interface FilterOption {
  id: FilterType
  label: string
  icon: React.ReactNode
  description: string
}

const filterOptions: FilterOption[] = [
  {
    id: 'recent',
    label: 'Mais Recentes',
    icon: <Play className="w-4 h-4" />,
    description: 'Vídeos publicados recentemente'
  },
  {
    id: 'popular',
    label: 'Mais Vistos',
    icon: <TrendingUp className="w-4 h-4" />,
    description: 'Vídeos com mais visualizações'
  },
  {
    id: 'liked',
    label: 'Mais Curtidos',
    icon: <Heart className="w-4 h-4" />,
    description: 'Vídeos com mais likes'
  },
  {
    id: 'long',
    label: 'Vídeos Longos',
    icon: <Clock className="w-4 h-4" />,
    description: 'Vídeos com mais de 10 minutos'
  },
  {
    id: 'random',
    label: 'Aleatórios',
    icon: <Shuffle className="w-4 h-4" />,
    description: 'Vídeos em ordem aleatória'
  }
]

export default function VideosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('recent')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const { videos, loading, pageLoading, error, pagination, refetch, changePage } = useVideos({
    filter: selectedFilter,
    search: searchTerm,
    page: currentPage
  })
  
  const { data: session } = useSession()

  const filteredVideos = useMemo(() => videos, [videos])

  // SEO dinâmico baseado no filtro e busca
  const getSEOTitle = () => {
    if (searchTerm) {
      return `Vídeos de "${searchTerm}" - CORNOS BRASIL`
    }
    
    const filterLabels = {
      recent: 'Vídeos Mais Recentes de Todas as Categorias',
      popular: 'Vídeos Mais Vistos de Todas as Categorias',
      liked: 'Vídeos Mais Curtidos de Todas as Categorias',
      long: 'Vídeos Longos de Todas as Categorias',
      random: 'Vídeos Aleatórios de Todas as Categorias'
    }
    
    return `${filterLabels[selectedFilter]} - CORNOS BRASIL`
  }

  const getSEODescription = () => {
    if (searchTerm) {
      return `Assista vídeos de "${searchTerm}" no CORNOS BRASIL. Videos porno amador, videos de corno, porno brasileiro. Encontre os melhores videos porno grátis.`
    }
    
    const filterDescriptions = {
      recent: 'Assista os vídeos mais recentes de todas as categorias no CORNOS BRASIL. Videos porno amador, videos de corno, porno brasileiro. Os melhores videos porno grátis atualizados diariamente.',
      popular: 'Os vídeos mais vistos de todas as categorias no CORNOS BRASIL. Videos porno amador populares, videos de corno mais assistidos, porno brasileiro em alta. Videos porno grátis com mais visualizações.',
      liked: 'Os vídeos mais curtidos de todas as categorias no CORNOS BRASIL. Videos porno amador favoritos, videos de corno mais apreciados, porno brasileiro com mais likes. Videos porno grátis mais populares.',
      long: 'Vídeos longos de todas as categorias no CORNOS BRASIL. Videos porno amador extensos, videos de corno com mais de 10 minutos, porno brasileiro completo. Videos porno grátis com duração prolongada.',
      random: 'Vídeos aleatórios de todas as categorias no CORNOS BRASIL. Videos porno amador surpresa, videos de corno aleatórios, porno brasileiro variado. Videos porno grátis em ordem aleatória.'
    }
    
    return filterDescriptions[selectedFilter]
  }

  const getSEOKeywords = () => {
    const baseKeywords = [
      'videos porno',
      'porno amador',
      'videos de corno',
      'cornos brasil',
      'videos porno grátis',
      'porno brasileiro',
      'videos de sexo amador',
      'porno corno',
      'videos porno amador',
      'videos de sexo'
    ]

    if (searchTerm) {
      return [
        searchTerm,
        `videos de ${searchTerm}`,
        `${searchTerm} porno`,
        `${searchTerm} amador`,
        ...baseKeywords
      ]
    }

    const filterKeywords = {
      recent: ['videos recentes', 'videos novos', 'porno recente', ...baseKeywords],
      popular: ['videos populares', 'mais vistos', 'porno popular', 'videos em alta', ...baseKeywords],
      liked: ['videos curtidos', 'mais likes', 'porno favorito', 'videos apreciados', ...baseKeywords],
      long: ['videos longos', 'porno extenso', 'videos completos', 'duração longa', ...baseKeywords],
      random: ['videos aleatórios', 'porno surpresa', 'videos variados', 'ordem aleatória', ...baseKeywords]
    }

    return filterKeywords[selectedFilter]
  }

  const handleVideoClick = (video: any) => {
    window.location.href = `/video/${video.id}`
  }

  const handleFilterChange = (filter: FilterType) => {
    setSelectedFilter(filter)
    setShowFilters(false)
    setCurrentPage(1) // Reset para primeira página ao mudar filtro
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll suave para o topo apenas se não estiver carregando
    if (!pageLoading) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset para primeira página ao buscar
  }

  if (loading) {
    return (
      <>
        <SEOHead
          title="Vídeos - CORNOS BRASIL"
          description="Assista videos porno amador, videos de corno, porno brasileiro. Os melhores videos porno grátis no CORNOS BRASIL."
          keywords={[
            'videos porno',
            'porno amador',
            'videos de corno',
            'cornos brasil',
            'videos porno grátis',
            'porno brasileiro'
          ]}
          canonical="https://cornosbrasil.com/videos"
        />
        <Layout>
          <Header />
          <main className="min-h-screen bg-gray-50">
            <Section background="white" padding="lg">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {[...Array(12)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
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
      </>
    )
  }

  if (error) {
    return (
      <>
        <SEOHead
          title="Vídeos - CORNOS BRASIL"
          description="Assista videos porno amador, videos de corno, porno brasileiro. Os melhores videos porno grátis no CORNOS BRASIL."
          keywords={[
            'videos porno',
            'porno amador',
            'videos de corno',
            'cornos brasil',
            'videos porno grátis',
            'porno brasileiro'
          ]}
          canonical="https://cornosbrasil.com/videos"
        />
        <Layout>
          <Header />
          <main className="min-h-screen bg-gray-50">
            <Section background="white" padding="lg">
              <div className="text-center">
                <div className="text-red-500 text-lg mb-4">
                  Erro ao carregar vídeos
                </div>
                <div className="text-gray-600 mb-4">
                  {error}
                </div>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-dark transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            </Section>
          </main>
        </Layout>
      </>
    )
  }

  return (
    <>
      <SEOHead
        title={getSEOTitle()}
        description={getSEODescription()}
        keywords={getSEOKeywords()}
        canonical={`https://cornosbrasil.com/videos${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}${selectedFilter !== 'recent' ? `&filter=${selectedFilter}` : ''}`}
        ogType="website"
      />
      <Layout>
        <Header />
        <main className="min-h-screen bg-theme-primary">
          <Section background="white" padding="lg">
            {/* Header da página */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Play className="w-8 h-8 text-theme-primary" />
                <h1 className="text-3xl font-bold text-theme-primary">
                  {searchTerm ? `Vídeos de "${searchTerm}"` : 'Vídeos de Todas as Categorias'}
                </h1>
              </div>
              <p className="text-theme-secondary mb-6">
                {searchTerm 
                  ? `Explore vídeos relacionados a "${searchTerm}" no CORNOS BRASIL`
                  : 'Explore nossa coleção completa de vídeos de todas as categorias com filtros avançados'
                }
              </p>
              
              {/* Barra de busca e filtros */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Barra de busca */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-muted w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar vídeos..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-3 border border-theme-primary rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent bg-theme-input text-theme-primary"
                  />
                </div>

                {/* Botão de filtros */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-3 border border-theme-primary rounded-lg hover:bg-theme-hover transition-colors bg-theme-input text-theme-primary"
                  >
                    <Filter className="w-5 h-5" />
                    <span>Filtros</span>
                  </button>

                  {/* Dropdown de filtros */}
                  {showFilters && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-theme-card border border-theme-primary rounded-lg shadow-lg z-50">
                      <div className="p-4">
                        <h3 className="font-semibold text-theme-primary mb-3">Ordenar por:</h3>
                        <div className="space-y-2">
                          {filterOptions.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => handleFilterChange(option.id)}
                              className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                                selectedFilter === option.id
                                  ? 'bg-accent-red text-white'
                                  : 'hover:bg-theme-hover'
                              }`}
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                {option.icon}
                              </div>
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className={`text-sm ${
                                  selectedFilter === option.id ? 'text-white/80' : 'text-theme-muted'
                                }`}>
                                  {option.description}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Filtro ativo */}
              <div className="mt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-red/10 text-accent-red rounded-full text-sm">
                  {filterOptions.find(f => f.id === selectedFilter)?.icon}
                  <span>{filterOptions.find(f => f.id === selectedFilter)?.label}</span>
                </div>
              </div>
            </div>

            {/* Loading overlay para mudança de página */}
            {pageLoading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-red"></div>
                  <span className="text-theme-primary font-medium">Carregando vídeos...</span>
                </div>
              </div>
            )}

            {/* Grid de vídeos */}
            {filteredVideos.length === 0 ? (
              <div className="text-center py-12">
                <Play className="w-16 h-16 text-theme-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-theme-secondary mb-2">
                  {searchTerm ? 'Nenhum vídeo encontrado' : 'Nenhum vídeo disponível'}
                </h3>
                <p className="text-theme-muted">
                  {searchTerm 
                    ? 'Tente ajustar sua busca ou filtros' 
                    : 'Os vídeos aparecerão aqui quando estiverem disponíveis'
                  }
                </p>
              </div>
            ) : (
              <>
                <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 mb-8 ${pageLoading ? 'opacity-50' : ''}`}>
                  {filteredVideos.map((video, index) => (
                    <div key={video.id}>
                                             <VideoCard
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
                         onClick={handleVideoClick}
                       />
                      
                      {/* Mostrar PremiumTeaser a cada 8 vídeos para usuários não premium */}
                      {!session?.user?.premium && (index + 1) % 11 === 0 && (
                        <div className="col-span-full mt-6">
                          <PremiumTeaser />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Paginação */}
                {pagination && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                    onPageChange={handlePageChange}
                    className="mt-8"
                  />
                )}
              </>
            )}
          </Section>
        </main>
      </Layout>
    </>
  )
} 