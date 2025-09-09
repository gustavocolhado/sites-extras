'use client'

import { useRouter } from 'next/navigation'
import { Lock, Crown } from 'lucide-react'

/**
 * Componente PremiumTeaser que se parece com um vídeo no grid
 */
const PremiumVideoTeaser = () => {
  const router = useRouter()

  const handleClick = () => {
    router.push('/premium')
  }

  return (
    <article 
      className="group cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div className="relative aspect-video theme-card overflow-hidden">
        {/* Background gradiente */}
        <div className="w-full h-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
          {/* Ícone de coroa central */}
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Crown className="w-8 h-8 text-white" />
          </div>
        </div>
        
        {/* Premium Badge */}
        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
          PREMIUM
        </div>
        
        {/* Premium Overlay - Vídeo borrado com cadeado */}
        <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div className="text-white text-sm font-semibold mb-1">
              Conteúdo Premium
            </div>
            <div className="text-white/80 text-xs">
              Faça upgrade para desbloquear
            </div>
          </div>
        </div>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div 
              className="w-0 h-0 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1"
              aria-hidden="true"
            ></div>
          </div>
        </div>
      </div>
      
      {/* Título */}
      <h3 className="text-sm text-theme-primary mt-2 line-clamp-2 group-hover:text-accent-red transition-colors">
        Conteúdo Premium
      </h3>
      
      {/* Info */}
      <p className="text-xs mt-1 text-theme-secondary">
        Faça upgrade para desbloquear
      </p>
    </article>
  )
}

export default PremiumVideoTeaser
