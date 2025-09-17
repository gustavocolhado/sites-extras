'use client'

import { useState, useEffect } from 'react'

interface VideoPreloadIndicatorProps {
  progress: number
  isPreloading: boolean
  className?: string
}

export default function VideoPreloadIndicator({ 
  progress, 
  isPreloading, 
  className = '' 
}: VideoPreloadIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    // Só mostrar se está preloadando E há progresso real (não 0%)
    if (isPreloading && progress > 0 && progress < 1) {
      setShowIndicator(true)
    } else if (progress >= 1) {
      // Esconder após 1 segundo quando completo
      const timer = window.setTimeout(() => setShowIndicator(false), 1000)
      return () => clearTimeout(timer)
    } else {
      setShowIndicator(false)
    }
  }, [isPreloading, progress])

  if (!showIndicator) return null

  return (
    <div className={`fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm z-50 transition-all duration-300 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        <span>Preparando vídeos...</span>
      </div>
      <div className="mt-2 w-full bg-white/20 rounded-full h-1">
        <div 
          className="bg-accent-red h-1 rounded-full transition-all duration-300"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <div className="text-xs text-white/70 mt-1">
        {Math.round(progress * 100)}% concluído
      </div>
    </div>
  )
}
