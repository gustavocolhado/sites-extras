import { useState, useEffect, useCallback } from 'react'

interface Video {
  id: string
  title: string
  description: string | null
  url: string
  videoUrl: string
  viewCount: number
  likesCount: number
  thumbnailUrl: string
  duration: number | null
  premium: boolean
  iframe: boolean
  trailerUrl: string | null
  category: string[]
  creator: string | null
  created_at: string | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

interface VideosResponse {
  videos: Video[]
  pagination: Pagination
}

interface UseInfiniteVideosParams {
  filter?: 'recent' | 'popular' | 'liked' | 'long' | 'random'
  search?: string
  category?: string
}

export function useInfiniteVideos(params: UseInfiniteVideosParams = {}) {
  const [videos, setVideos] = useState<Video[]>([])
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

  const fetchVideos = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      // Construir query params
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      })

      if (params.filter) {
        queryParams.append('filter', params.filter)
      }

      if (params.search) {
        queryParams.append('search', params.search)
      }

      if (params.category) {
        queryParams.append('category', params.category)
      }

      const response = await fetch(`/api/videos?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar vídeos')
      }
      
      const data: VideosResponse = await response.json()
      
      if (append) {
        setVideos(prev => [...prev, ...data.videos])
      } else {
        setVideos(data.videos)
      }
      
      setPagination(data.pagination)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao buscar vídeos:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [params.filter, params.search, params.category])

  const loadMore = useCallback(() => {
    if (!loadingMore && pagination.hasMore) {
      fetchVideos(pagination.page + 1, true)
    }
  }, [loadingMore, pagination.hasMore, pagination.page, fetchVideos])

  useEffect(() => {
    fetchVideos(1, false)
  }, [fetchVideos])

  return {
    videos,
    loading,
    loadingMore,
    error,
    pagination,
    loadMore,
    refetch: () => fetchVideos(1, false)
  }
} 