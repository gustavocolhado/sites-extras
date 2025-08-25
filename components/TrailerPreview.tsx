'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

interface TrailerPreviewProps {
  trailerUrl: string
  title: string
  className?: string
}

export default function TrailerPreview({ trailerUrl, title, className = '' }: TrailerPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = () => {
    setIsPlaying(true)
    // Redirecionar para o vídeo ou abrir em nova aba
    window.open(trailerUrl, '_blank')
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
          <div className="text-gray-600 text-sm">Trailer Preview</div>
        </div>
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-all"
        >
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Play size={24} className="text-white ml-1" />
          </div>
        </button>
      </div>
    </div>
  )
} 