'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Play, Crown, ArrowRight } from 'lucide-react'

interface PremiumTeaserProps {
  className?: string
}

export default function PremiumTeaser({ className = '' }: PremiumTeaserProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const handleUpgradeClick = () => {
    router.push('/premium')
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-6 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-orange-500 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-theme-primary">
              Conteúdo Premium
            </h3>
            <p className="text-sm text-theme-secondary">
              Desbloqueie vídeos exclusivos
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Play className="w-3 h-3 text-yellow-500" />
            </div>
            <span className="text-sm text-theme-secondary">
              Vídeos exclusivos em HD/4K
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Lock className="w-3 h-3 text-yellow-500" />
            </div>
            <span className="text-sm text-theme-secondary">
              Sem anúncios e interrupções
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Crown className="w-3 h-3 text-yellow-500" />
            </div>
            <span className="text-sm text-theme-secondary">
              Acesso prioritário a novos conteúdos
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleUpgradeClick}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
            isHovered
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg scale-105'
              : 'bg-yellow-500 text-white hover:bg-yellow-600'
          }`}
        >
          <span>Fazer Upgrade</span>
          <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
        </button>

        {/* Price Hint */}
        <p className="text-xs text-theme-muted text-center mt-3">
          A partir de R$ 19,90/mês
        </p>
      </div>
    </div>
  )
} 