import { useState, useEffect, useCallback } from 'react'
import { Creator, Pagination } from '@/types/common'

interface CreatorsResponse {
  creators: Creator[]
  pagination: Pagination
}

export function useInfiniteCreators() {
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

  const fetchCreators = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const response = await fetch(`/api/creators?page=${page}&limit=12`)
      
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
  }, [])

  const loadMore = useCallback(() => {
    if (!loadingMore && pagination.hasMore) {
      fetchCreators(pagination.page + 1, true)
    }
  }, [loadingMore, pagination.hasMore, pagination.page, fetchCreators])

  useEffect(() => {
    fetchCreators(1, false)
  }, [fetchCreators])

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