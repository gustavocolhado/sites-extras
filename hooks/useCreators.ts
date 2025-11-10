import { useState, useEffect } from 'react'
import { Creator } from '@/types/common'

type Options = {
  limit?: number
  page?: number
  timestamp?: number
}

export function useCreators(options?: Options) {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

    useEffect(() => {
    const fetchCreators = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (options?.limit) params.set('limit', String(options.limit))
        if (options?.page) params.set('page', String(options.page))
        if (options?.timestamp) params.set('timestamp', String(options.timestamp))

        const qs = params.toString()
        const url = qs ? `/api/creators?${qs}` : '/api/creators'
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error('Erro ao buscar criadores')
        }

        const data = await response.json()
        // Compatibilidade com nova API
        if (data.creators) {
          setCreators(data.creators)
        } else {
          setCreators(data) // Fallback para API antiga
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        console.error('Erro ao buscar criadores:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCreators()
  }, [options?.limit, options?.page, options?.timestamp])

  return { creators, loading, error }
}