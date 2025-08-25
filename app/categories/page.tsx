'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import SEOHead from '@/components/SEOHead'
import Section from '@/components/Section'
import { Grid, Play, Users, Star, TrendingUp, Clock, Heart } from 'lucide-react'

interface Category {
  id: string
  name: string
  qtd: number
  slug: string
  images?: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories?limit=100')
      
      if (!response.ok) {
        throw new Error('Erro ao buscar categorias')
      }
      
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao buscar categorias:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (category: Category) => {
    router.push(`/categories/${category.slug}`)
  }

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    
    if (name.includes('vip')) return <Star className="w-6 h-6 text-yellow-500" />
    if (name.includes('amador') || name.includes('amadores')) return <Users className="w-6 h-6 text-blue-500" />
    if (name.includes('recente') || name.includes('novo')) return <Clock className="w-6 h-6 text-green-500" />
    if (name.includes('popular') || name.includes('trending')) return <TrendingUp className="w-6 h-6 text-red-500" />
    if (name.includes('favorito') || name.includes('curtido')) return <Heart className="w-6 h-6 text-pink-500" />
    
    return <Play className="w-6 h-6 text-accent-red" />
  }

  const getCategoryColor = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    
    if (name.includes('vip')) return 'bg-gradient-to-r from-yellow-400 to-orange-500'
    if (name.includes('amador') || name.includes('amadores')) return 'bg-gradient-to-r from-blue-400 to-purple-500'
    if (name.includes('recente') || name.includes('novo')) return 'bg-gradient-to-r from-green-400 to-teal-500'
    if (name.includes('popular') || name.includes('trending')) return 'bg-gradient-to-r from-red-400 to-pink-500'
    if (name.includes('favorito') || name.includes('curtido')) return 'bg-gradient-to-r from-pink-400 to-rose-500'
    
    return 'bg-gradient-to-r from-gray-400 to-gray-600'
  }

  return (
    <>
      <SEOHead 
        title="Categorias - CORNOS BRASIL | Videos Porno por Categoria"
        description="Explore todas as categorias de videos porno amador. Encontre videos de corno, porno amador, videos porno grátis organizados por categoria."
        keywords={[
          'categorias porno',
          'videos porno por categoria',
          'porno amador categorias',
          'videos de corno categorias',
          'categorias videos porno',
          'porno brasileiro categorias'
        ]}
        canonical="https://cornosbrasil.com/categories"
      />
      <Layout>
        <Header />
        <main className="min-h-screen bg-theme-primary">
          <Section background="white" padding="lg">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Grid className="w-8 h-8 text-accent-red" />
                <h1 className="text-3xl md:text-4xl font-bold text-theme-primary">
                  CATEGORIAS
                </h1>
              </div>
              <p className="text-theme-secondary text-lg max-w-2xl mx-auto">
                Explore todas as categorias de videos porno amador. Encontre o conteúdo que mais te interessa.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                <p className="text-red-500 text-sm">{error}</p>
                <button 
                  onClick={fetchCategories}
                  className="mt-2 text-red-500 hover:text-red-600 text-sm underline"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* Categories Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(10)].map((_, index) => (
                  <div key={index} className="bg-theme-card rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="aspect-video bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className="bg-theme-card rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg group"
                  >
                    {/* Category Image or Placeholder */}
                    <div className={`aspect-video ${getCategoryColor(category.name)} flex items-center justify-center`}>
                      {category.images ? (
                        <img 
                          src={category.images} 
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center">
                          {getCategoryIcon(category.name)}
                        </div>
                      )}
                    </div>
                    
                    {/* Category Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-theme-primary text-sm mb-1 group-hover:text-accent-red transition-colors">
                        {category.name.toUpperCase()}
                      </h3>
                      <p className="text-theme-secondary text-xs">
                        {category.qtd || 0} vídeos
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Categories Message */}
            {!loading && categories.length === 0 && !error && (
              <div className="text-center py-12">
                <Grid className="w-16 h-16 text-theme-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-theme-secondary mb-2">
                  Nenhuma categoria encontrada
                </h3>
                <p className="text-theme-muted">
                  Tente novamente mais tarde
                </p>
              </div>
            )}
          </Section>
        </main>
      </Layout>
    </>
  )
}
