'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import Section from '@/components/Section'
import InfiniteScrollTrigger from '@/components/InfiniteScrollTrigger'
import { Search, Users } from 'lucide-react'
import { useInfiniteCreators } from '@/hooks/useInfiniteCreators'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import { Creator } from '@/types/common'

export default function CreatorsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [submittedTerm, setSubmittedTerm] = useState('')
  const { creators, loading, loadingMore, error, pagination, loadMore } = useInfiniteCreators(submittedTerm)
  const { isPremium } = usePremiumStatus()


  const handleCreatorClick = (creator: Creator) => {
    // Navegação para a página do criador
    window.location.href = `/creators/${creator.id}`
  }

  if (loading) {
    return (
      <Layout>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <Section background="white" padding="lg">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {[...Array(10)].map((_, index) => (
                  <div key={index} className="bg-theme-card rounded-lg shadow-md p-4">
                    <div className="w-full aspect-square bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/3 mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </main>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <Section background="white" padding="lg">
            <div className="text-center">
              <div className="text-red-500 text-lg mb-4">
                Erro ao carregar criadores
              </div>
              <div className="text-gray-600 mb-4">
                {error}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-dark transition-colors"
              >
                Tentar novamente
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
          {/* Header da página */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-theme-primary" />
              <h1 className="text-3xl font-bold text-theme-primary">
                Criadores
              </h1>
            </div>
                         <p className="text-theme-secondary mb-6">
               Descubra os melhores criadores de conteúdo e explore seus vídeos
             </p>
            
            {/* Barra de busca */}
            <div className="relative max-w-md">
                             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-muted w-5 h-5" />
               <input
                 type="text"
                 placeholder="Buscar criadores..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') {
                     setSubmittedTerm(searchTerm.trim())
                   }
                 }}
                 className="w-full pl-10 pr-4 py-3 border border-theme-primary rounded-lg focus:ring-2 focus:ring-accent-red focus:border-transparent bg-theme-input text-theme-primary"
              />
            </div>
          </div>

          {/* Grid de criadores */}
          {creators.length === 0 ? (
            <div className="text-center py-12">
                             <Users className="w-16 h-16 text-theme-muted mx-auto mb-4" />
               <h3 className="text-xl font-semibold text-theme-secondary mb-2">
                 {searchTerm ? 'Nenhum criador encontrado' : 'Nenhum criador disponível'}
               </h3>
               <p className="text-theme-muted">
                {searchTerm 
                  ? 'Tente ajustar sua busca' 
                  : 'Os criadores aparecerão aqui quando estiverem disponíveis'
                }
              </p>
            </div>
          ) : (
            <InfiniteScrollTrigger
              onLoadMore={loadMore}
              loading={loadingMore}
              hasMore={pagination.hasMore}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {creators.map((creator) => (
                  <div
                    key={creator.id}
                    onClick={() => { if (!isPremium) return; handleCreatorClick(creator) }}
                    role="button"
                    aria-disabled={!isPremium}
                    className={`bg-theme-card rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform flex flex-col overflow-hidden ${isPremium ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
                  >
                    {/* Foto do criador (topo) */}
                    <img
                      src={creator.image || '/creators/default-creator.jpg'}
                      alt={creator.name}
                      className={`w-full aspect-square object-cover rounded-t-lg ${!isPremium ? 'blur-2xl' : ''}`}
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTI0IDI0QzI4LjQxODMgMjQgMzIgMjAuNDE4MyAzMiAxNkMzMiAxMS41ODE3IDI4LjQxODMgOCAyNCA4QzE5LjU4MTcgOCAxNiAxMS41ODE3IDE2IDE2QzE2IDIwLjQxODMgMTkuNTgxNyAyNCAyNCAyNFoiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTQwIDQwQzQwIDMyLjI2ODAxIDMyLjgzNiAyNiAyNCAyNkMxNS4xNjQgMjYgOCAzMi4yNjgwMSA4IDQwIiBmaWllbGw9IiNEMUQ1REIiLz4KPC9zdmc+Cg=='
                      }}
                    />

                    {/* Nome e quantidade (abaixo) */}
                    <div className="p-3 text-center">
                      <h3 className={`text-sm font-semibold mb-1 text-theme-primary ${!isPremium ? 'blur-sm' : ''}`}>
                        {creator.name}
                      </h3>
                      <div className="text-xs text-theme-secondary">
                        {creator.qtd || 0} vídeos
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </InfiniteScrollTrigger>
          )}
        </Section>
      </main>
    </Layout>
  )
}
