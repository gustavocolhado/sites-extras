'use client'

import { useEffect, useRef, useState } from 'react'

interface UseVideoPreloadOptions {
  videoUrls: string[]
  maxPreload?: number
  preloadDelay?: number
}

export function useVideoPreload({
  videoUrls,
  maxPreload = 2,
  preloadDelay = 2000
}: UseVideoPreloadOptions) {
  const [preloadedVideos, setPreloadedVideos] = useState<Set<string>>(new Set())
  const [isPreloading, setIsPreloading] = useState(false)
  const preloadQueueRef = useRef<string[]>([])
  const preloadTimeoutsRef = useRef<number[]>([])

  // Função para preload de um vídeo
  const preloadVideo = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.crossOrigin = 'anonymous'
        
        const timeout = window.setTimeout(() => {
          video.remove()
          reject(new Error('Preload timeout'))
        }, 8000)

        const handleLoadedMetadata = () => {
          clearTimeout(timeout)
          video.remove()
          setPreloadedVideos(prev => new Set([...prev, url]))
          resolve()
        }

        const handleError = () => {
          clearTimeout(timeout)
          video.remove()
          reject(new Error('Preload failed'))
        }

        video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true })
        video.addEventListener('error', handleError, { once: true })

        video.src = url
      } catch (error) {
        reject(error)
      }
    })
  }

  // Processar fila de preload
  const processPreloadQueue = async () => {
    if (isPreloading || preloadQueueRef.current.length === 0) return

    setIsPreloading(true)
    const currentPreloaded = preloadedVideos.size

    try {
      const videosToPreload = preloadQueueRef.current
        .slice(0, maxPreload - currentPreloaded)
        .filter(url => !preloadedVideos.has(url))

      if (videosToPreload.length === 0) {
        setIsPreloading(false)
        return
      }

      const preloadPromises = videosToPreload.map(url => 
        preloadVideo(url).catch(error => {
          console.warn(`Falha ao preload do vídeo ${url}:`, error)
        })
      )

      await Promise.allSettled(preloadPromises)
    } finally {
      setIsPreloading(false)
    }
  }

  // Inicializar preload quando URLs mudam
  useEffect(() => {
    // Limpar timeouts anteriores
    preloadTimeoutsRef.current.forEach(clearTimeout)
    preloadTimeoutsRef.current = []

    if (videoUrls.length === 0) return

    // Adicionar delay antes de iniciar preload
    const timeout = window.setTimeout(() => {
      preloadQueueRef.current = [...videoUrls]
      processPreloadQueue()
    }, preloadDelay)

    preloadTimeoutsRef.current.push(timeout)

    return () => {
      preloadTimeoutsRef.current.forEach(clearTimeout)
    }
  }, [videoUrls, preloadDelay, maxPreload])

  // Função para verificar se vídeo está preloadado
  const isVideoPreloaded = (url: string) => preloadedVideos.has(url)

  // Limpar preloads quando componente desmonta
  useEffect(() => {
    return () => {
      preloadTimeoutsRef.current.forEach(clearTimeout)
    }
  }, [])

  const progress = videoUrls.length > 0 ? preloadedVideos.size / Math.min(videoUrls.length, maxPreload) : 0

  return {
    preloadedVideos: Array.from(preloadedVideos),
    isPreloading,
    isVideoPreloaded,
    preloadProgress: progress
  }
}
