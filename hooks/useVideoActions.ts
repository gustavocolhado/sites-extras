import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface UseVideoActionsProps {
  videoId: string
}

export function useVideoActions({ videoId }: UseVideoActionsProps) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Carregar status inicial
  useEffect(() => {
    if (session?.user) {
      loadStatus()
    }
  }, [session, videoId])

  const loadStatus = async () => {
    try {
      // Verificar status do like
      const likeResponse = await fetch(`/api/videos/${videoId}/like/status`)
      if (likeResponse.ok) {
        const likeData = await likeResponse.json()
        setIsLiked(likeData.liked)
      }

      // Verificar status do favorito
      const favoriteResponse = await fetch(`/api/videos/${videoId}/favorite/status`)
      if (favoriteResponse.ok) {
        const favoriteData = await favoriteResponse.json()
        setIsFavorited(favoriteData.favorited)
      }
    } catch (error) {
      console.error('Erro ao carregar status:', error)
    }
  }

  const toggleLike = async () => {
    if (!session?.user) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/videos/${videoId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
      }
    } catch (error) {
      console.error('Erro ao curtir vídeo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async () => {
    if (!session?.user) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/videos/${videoId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIsFavorited(data.favorited)
      }
    } catch (error) {
      console.error('Erro ao favoritar vídeo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const recordView = async (watchDuration?: number) => {
    if (!session?.user) return

    try {
      await fetch(`/api/videos/${videoId}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ watchDuration }),
      })
    } catch (error) {
      console.error('Erro ao registrar visualização:', error)
    }
  }

  return {
    isLiked,
    isFavorited,
    isLoading,
    toggleLike,
    toggleFavorite,
    recordView,
  }
} 