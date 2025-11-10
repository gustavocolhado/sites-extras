'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import VideoCard from '@/components/VideoCard'
import Pagination from '@/components/Pagination'
import SEOHead from '@/components/SEOHead'
import Section from '@/components/Section'
import { ArrowLeft, Grid } from 'lucide-react'
import Link from 'next/link'
import { useVideos } from '@/hooks/useVideos'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import { formatDuration } from '@/utils/formatDuration'

interface Category {
  id: string
  name: string
  qtd: number
  slug: string
  images?: string
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      fetchCategory()
    }
  }, [slug])

  const fetchCategory = async () => {
    try {
      setLoading(true)
      console.log('🔍 Buscando categoria com slug:', slug)
      
      const response = await fetch(`/api/categories?slug=${slug}&limit=1`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar categoria')
      }
      
      const data = await response.json()
      console.log('📊 Dados recebidos da API:', data)
      
      const foundCategory = data.categories?.[0]
      
      if (!foundCategory) {
        throw new Error('Categoria não encontrada')
      }
      
      console.log('✅ Categoria encontrada:', foundCategory)
      setCategory(foundCategory)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao buscar categoria:', err)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    
    if (name.includes('vip')) return '⭐'
    if (name.includes('amador') || name.includes('amadores')) return '👥'
    if (name.includes('recente') || name.includes('novo')) return '🕐'
    if (name.includes('popular') || name.includes('trending')) return '📈'
    if (name.includes('favorito') || name.includes('curtido')) return '❤️'
    
    return '▶️'
  }

  const getCategoryColor = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    
    if (name.includes('vip')) return 'from-yellow-400 to-orange-500'
    if (name.includes('amador') || name.includes('amadores')) return 'from-blue-400 to-purple-500'
    if (name.includes('recente') || name.includes('novo')) return 'from-green-400 to-teal-500'
    if (name.includes('popular') || name.includes('trending')) return 'from-red-400 to-pink-500'
    if (name.includes('favorito') || name.includes('curtido')) return 'from-pink-400 to-rose-500'
    
    return 'from-gray-400 to-gray-600'
  }

  if (loading) {
    return (
      <Layout>
        <Header />
        <main className="min-h-screen bg-theme-primary">
          <Section background="white" padding="lg">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            </div>
          </Section>
        </main>
      </Layout>
    )
  }

  if (error || !category) {
    return (
      <Layout>
        <Header />
        <main className="min-h-screen bg-theme-primary">
          <Section background="white" padding="lg">
            <div className="text-center py-12">
              <Grid className="w-16 h-16 text-theme-muted mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-theme-secondary mb-2">
                Categoria não encontrada
              </h1>
              <p className="text-theme-muted mb-6">
                {error || 'A categoria que você está procurando não existe.'}
              </p>
              <Link 
                href="/categories"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-accent-red text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para Categorias</span>
              </Link>
            </div>
          </Section>
        </main>
      </Layout>
    )
  }

  return (
    <>
      <SEOHead 
        title={`${category.name} - CORNOS BRASIL | Videos Porno ${category.name}`}
        description={`Assista videos porno da categoria ${category.name}. Encontre os melhores videos de ${category.name.toLowerCase()} no CORNOS BRASIL.`}
        keywords={[
          category.name.toLowerCase(),
          `videos ${category.name.toLowerCase()}`,
          `porno ${category.name.toLowerCase()}`,
          'videos porno',
          'porno amador',
          'cornos brasil'
        ]}
        canonical={`https://cornosbrasil.com/categories/${category.slug}`}
      />
      <Layout>
        <Header />
        <main className="min-h-screen bg-theme-primary">
          {/* Category Header */}
          <Section className={`bg-gradient-to-r ${getCategoryColor(category.name)} py-8 px-4`}>
            <div className="container w-full">
              <div className="flex items-center space-x-4 mb-4">
                <Link 
                  href="/categories"
                  className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm">Voltar para Categorias</span>
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-4xl">
                  {getCategoryIcon(category.name)}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {category.name.toUpperCase()}
                  </h1>
                  <p className="text-white/80 text-lg">
                    {category.qtd || 0} vídeos disponíveis
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* Videos Section */}
          <CategoryVideoSection categoryName={category.name} />
        </main>
      </Layout>
    </>
  )
}

// Componente para mostrar vídeos da categoria
function CategoryVideoSection({ categoryName }: { categoryName: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryName)
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'liked'>('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()
  const { isPremium } = usePremiumStatus()
  
  // Para usuários premium, sempre usar filtro aleatório
  const effectiveFilter = isPremium ? 'random' : sortBy
  // Timestamp fixo por refresh quando aleatório, para ordem diferente a cada atualização
  const refreshTimestamp = useMemo(() => Date.now(), [])
  
  const { videos, pagination, loading, error, refetch } = useVideos({
    page: currentPage,
    limit: 20,
    filter: effectiveFilter,
    category: selectedCategory,
    isPremium: isPremium,
    timestamp: effectiveFilter === 'random' ? refreshTimestamp : undefined
  })

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSortChange = (newSort: 'recent' | 'popular' | 'liked') => {
    setSortBy(newSort)
    setCurrentPage(1)
  }

  return (
    <Section background="white" padding="md">
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <h2 className="text-xl md:text-2xl font-bold text-theme-primary">
              VIDEOS {categoryName.toUpperCase()}
            </h2>
          </div>
          
          {!isPremium && (
            <div className="flex items-center space-x-4 overflow-x-auto pb-2">
              <button 
                onClick={() => handleSortChange('recent')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  sortBy === 'recent' 
                    ? 'bg-accent-red text-white' 
                    : 'bg-theme-hover text-theme-primary'
                }`}
              >
                <span className="text-sm">VIDEOS RECENTES</span>
              </button>
              
              <button 
                onClick={() => handleSortChange('popular')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  sortBy === 'popular' 
                    ? 'bg-accent-red text-white' 
                    : 'bg-theme-hover text-theme-primary'
                }`}
              >
                <span className="text-sm">MAIS VISTOS</span>
              </button>
              
              <button 
                onClick={() => handleSortChange('liked')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  sortBy === 'liked' 
                    ? 'bg-accent-red text-white' 
                    : 'bg-theme-hover text-theme-primary'
                }`}
              >
                <span className="text-sm">MAIS CURTIDOS</span>
              </button>
            </div>
          )}
          
          {isPremium && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-theme-secondary bg-yellow-100 px-3 py-2 rounded-lg">
                ✨ Conteúdo VIP exclusivo
              </span>
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {videos.map((video: any) => (
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
            onClick={() => router.push(`/video/${video.id}`)}
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
          <Grid className="w-16 h-16 text-theme-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-theme-secondary mb-2">
            Nenhum vídeo encontrado nesta categoria
          </h3>
          <p className="text-theme-muted">
            Tente ajustar os filtros ou volte mais tarde
          </p>
        </div>
      )}
    </Section>
  )
}
