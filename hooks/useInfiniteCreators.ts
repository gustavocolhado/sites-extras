import { useState, useEffect, useCallback } from 'react'
import { Creator, Pagination } from '@/types/common'

interface CreatorsResponse {
  creators: Creator[]
  pagination: Pagination
}

export function useInfiniteCreators(searchTerm: string = '') {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasMore: false
  })
  // Seed determinístico por sessão para manter lista aleatória consistente durante o scroll
  const [seed] = useState<number>(() => Date.now())

  const fetchCreators = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      // Passa o seed como timestamp para embaralhar determinísticamente no backend
      const qs = new URLSearchParams({
        page: String(page),
        limit: '12',
        timestamp: String(seed)
      })
      if (searchTerm && searchTerm.trim() !== '') {
        qs.set('search', searchTerm.trim())
      }
      const response = await fetch(`/api/creators?${qs.toString()}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar criadores')
      }
      
      const data: CreatorsResponse = await response.json()
      
      if (append) {
        setCreators(prev => [...prev, ...data.creators])
      } else {
        setCreators(data.creators)
      }
      
      setPagination(data.pagination)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao buscar criadores:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [seed, searchTerm])

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && pagination.hasMore) {
      fetchCreators(pagination.page + 1, true)
    }
  }, [loading, loadingMore, pagination.hasMore, pagination.page, fetchCreators])

  useEffect(() => {
    // Ao mudar o termo de busca, reiniciar paginação e refazer busca
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchCreators(1, false)
  }, [fetchCreators, searchTerm])

  return {
    creators,
    loading,
    loadingMore,
    error,
    pagination,
    loadMore,
    refetch: () => fetchCreators(1, false)
  }
}