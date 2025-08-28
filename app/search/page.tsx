'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Filter, X, Video, Clock, TrendingUp } from 'lucide-react'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SEOHead from '@/components/SEOHead'
import VideoCard from '@/components/VideoCard'
import { useVideos } from '@/hooks/useVideos'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import Pagination from '@/components/Pagination'
import { formatDuration } from '@/utils/formatDuration'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isPremium } = usePremiumStatus()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'recent' | 'popular' | 'liked'>('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // Pegar termo de busca da URL
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setSearchTerm(q)
    }
  }, [searchParams])

  // Buscar vídeos
  const { videos, loading, error, pagination } = useVideos({
    search: searchTerm,
    filter,
    page: currentPage,
    limit: 50,
    isPremium
  })



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    router.push('/search')
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const popularSearches = [
    'amador brasileiro',
    'cornos',
    'hotwife',
    'swinger',
    'casal amador',
    'sexo real',
    'porno caseiro',
    'videos amadores'
  ]



  return (
    <>
      <SEOHead 
        title={`Busca: ${searchTerm || 'Vídeos'} - Cornos Brasil`}
        description={`Resultados da busca por "${searchTerm}" no Cornos Brasil. Encontre os melhores vídeos amadores brasileiros.`}
        keywords={['busca', 'pesquisa', 'vídeos amadores', 'porno brasileiro', searchTerm].filter(Boolean)}
      />
      
      <Layout>
        <Header />
        
        <div className="min-h-screen bg-gradient-to-br from-theme-background via-theme-card to-theme-primary/5">
          <div className="container-content mx-auto px-4 py-8">
            
            {/* Header da Busca */}
            <div className="mb-8 mt-8">
              <h1 className="text-3xl font-bold text-theme-primary mb-4">
                {searchTerm ? `Resultados para: "${searchTerm}"` : 'Buscar Vídeos'}
              </h1>
              
              {/* Barra de Busca */}
              <form onSubmit={handleSearch} className="max-w-2xl mb-6">
                <div className="flex items-center theme-input rounded-lg overflow-hidden">
                  <div className="flex-1 flex items-center px-4">
                    <Search className="w-5 h-5 text-theme-secondary mr-3" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Pesquisar vídeos amadores..."
                      className="flex-1 bg-transparent py-3 focus:outline-none text-theme-primary"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="ml-2 p-1 text-theme-secondary hover:text-theme-primary transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="theme-btn-primary px-6 py-3"
                  >
                    BUSCAR
                  </button>
                </div>
              </form>

              {/* Filtros */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                                     <button
                     onClick={() => setShowFilters(!showFilters)}
                     className="flex items-center space-x-2 px-4 py-2 theme-btn-secondary rounded-lg"
                   >
                     <Filter className="w-4 h-4" />
                     <span>Filtros</span>
                   </button>
                   
                   
                  
                  {showFilters && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setFilter('recent')}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                          filter === 'recent' 
                            ? 'bg-theme-primary text-white' 
                            : 'bg-theme-hover text-theme-primary'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span className="text-sm">Recentes</span>
                      </button>
                      
                      <button
                        onClick={() => setFilter('popular')}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                          filter === 'popular' 
                            ? 'bg-theme-primary text-white' 
                            : 'bg-theme-hover text-theme-primary'
                        }`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-sm">Populares</span>
                      </button>
                    </div>
                  )}
                </div>
                
                {pagination && (
                  <p className="text-theme-secondary text-sm">
                    {pagination.total} vídeo{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Resultados ou Sugestões */}
            {!searchTerm ? (
              /* Página inicial de busca */
              <div className="max-w-4xl mx-auto">
                <div className="bg-theme-card rounded-2xl p-8 shadow-xl border border-theme-border-primary mb-8">
                  <h2 className="text-2xl font-bold text-theme-primary mb-6 flex items-center">
                    <Search className="w-6 h-6 mr-3" />
                    Buscas Populares
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchTerm(term)
                          router.push(`/search?q=${encodeURIComponent(term)}`)
                        }}
                        className="p-4 bg-theme-hover rounded-lg hover:bg-theme-primary/10 transition-colors text-left"
                      >
                        <div className="flex items-center space-x-2">
                          <Video className="w-4 h-4 text-accent-red" />
                          <span className="text-theme-primary font-medium">{term}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-theme-card rounded-2xl p-8 shadow-xl border border-theme-border-primary">
                  <h2 className="text-2xl font-bold text-theme-primary mb-6">
                    Como Usar a Busca
                  </h2>
                  
                  <div className="space-y-4 text-theme-secondary">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-accent-red rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                        1
                      </div>
                      <div>
                        <h3 className="font-semibold text-theme-primary mb-1">Digite palavras-chave</h3>
                        <p>Use termos como "amador", "casal", "hotwife", "swinger" para encontrar vídeos específicos.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-accent-red rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                        2
                      </div>
                      <div>
                        <h3 className="font-semibold text-theme-primary mb-1">Use filtros</h3>
                        <p>Filtre por vídeos recentes ou populares para encontrar o conteúdo que você procura.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-accent-red rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                        3
                      </div>
                      <div>
                        <h3 className="font-semibold text-theme-primary mb-1">Explore categorias</h3>
                        <p>Navegue pelas categorias para descobrir novos vídeos e criadores.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Resultados da busca */
              <div className="mb-8">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-theme-primary">Buscando vídeos...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-16">
                    <p className="text-red-500 mb-4">Erro ao buscar vídeos: {error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="theme-btn-primary px-6 py-2"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                ) : videos.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-theme-hover rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-theme-secondary" />
                    </div>
                    <h3 className="text-xl font-bold text-theme-primary mb-2">
                      Nenhum vídeo encontrado
                    </h3>
                    <p className="text-theme-secondary mb-6">
                      Tente usar termos diferentes ou verifique a ortografia.
                    </p>
                    <button
                      onClick={handleClearSearch}
                      className="theme-btn-primary px-6 py-2"
                    >
                      Limpar Busca
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Grid de Vídeos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 mb-8">
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
                        />
                      ))}
                    </div>
                    
                    {/* Paginação */}
                    {pagination && pagination.totalPages > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
      </Layout>
    </>
  )
}
