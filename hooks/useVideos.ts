import { useState, useEffect, useCallback, useRef } from 'react'

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

interface UseVideosOptions {
  filter?: 'recent' | 'popular' | 'liked' | 'long' | 'random'
  search?: string
  category?: string
  page?: number
  limit?: number
  isPremium?: boolean
  timestamp?: number
}

// Cache simples para armazenar resultados
const videoCache = new Map<string, { data: VideosResponse; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Função para limpar cache específico por categoria
function clearCacheForCategory(category: string) {
  const keysToDelete: string[] = []
  videoCache.forEach((value, key) => {
    if (key.includes(`category=${category}`)) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach(key => videoCache.delete(key))
  console.log('🗑️ Cache limpo para categoria:', category)
}

export function useVideos(options: UseVideosOptions = {}) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(false) // Loading específico para mudança de página
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchVideos = async (isPageChange = false) => {
    try {
  
      
      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Criar novo AbortController
      abortControllerRef.current = new AbortController()

      // Definir loading state apropriado
      if (isPageChange) {
        setPageLoading(true)
      } else {
        setLoading(true)
      }

      // Construir query params
      const queryParams = new URLSearchParams({
        page: (options.page || 1).toString(),
        limit: (options.limit || 12).toString()
      })

      if (options.filter) {
        queryParams.append('filter', options.filter)
      }

      if (options.search) {
        queryParams.append('search', options.search)
      }

      if (options.category) {
        queryParams.append('category', options.category)
      }

      if (options.isPremium !== undefined) {
        queryParams.append('isPremium', options.isPremium.toString())
      }

      if (options.timestamp) {
        queryParams.append('timestamp', options.timestamp.toString())
      }

      const cacheKey = queryParams.toString()
      const cached = videoCache.get(cacheKey)




      // Verificar cache
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
  
        setVideos(cached.data.videos)
        setPagination(cached.data.pagination)
        setError(null)
        return
      }

      const response = await fetch(`/api/videos?${cacheKey}`, {
        signal: abortControllerRef.current.signal
      })
      
      if (!response.ok) {
        throw new Error('Erro ao buscar vídeos')
      }
      
      const data: VideosResponse = await response.json()
      

      
      // Armazenar no cache
      videoCache.set(cacheKey, { data, timestamp: Date.now() })
      
      setVideos(data.videos)
      setPagination(data.pagination)
      setError(null)
    } catch (err) {
      // Ignorar erros de abort
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao buscar vídeos:', err)
    } finally {
      setLoading(false)
      setPageLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
    
    // Cleanup: cancelar requisição ao desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [options.filter, options.search, options.category, options.page, options.limit, options.isPremium])

  // Função específica para mudança de página
  const changePage = (page: number) => {
    fetchVideos(true) // Indicar que é mudança de página
  }

  // Função para forçar refetch ignorando cache
  const forceRefetch = () => {
    fetchVideos()
  }

  return {
    videos,
    loading,
    pageLoading, // Loading específico para mudança de página
    error,
    pagination,
    refetch: fetchVideos,
    forceRefetch,
    changePage
  }
} 