import { useState, useEffect } from 'react'
import { Creator } from '@/types/common'

export function useCreators() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

    useEffect(() => {
    const fetchCreators = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/creators')

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
  }, [])

  return { creators, loading, error }
} 