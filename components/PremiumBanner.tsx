'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Crown, 
  Sparkles, 
  X, 
  ArrowRight,
  Video,
  Zap,
  Shield,
  Star,
  Heart,
  Gem,
  CheckCircle,
  Play
} from 'lucide-react'

interface PremiumBannerProps {
  variant?: 'default' | 'compact' | 'hero'
  onClose?: () => void
  showCloseButton?: boolean
}

export default function PremiumBanner({ 
  variant = 'default', 
  onClose, 
  showCloseButton = true 
}: PremiumBannerProps) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  const handleUpgrade = () => {
    router.push('/premium')
  }

  if (!isVisible) return null

  if (variant === 'compact') {
    return (
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white p-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)] animate-pulse"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)] animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="flex items-center justify-between max-w-7xl mx-auto relative z-10">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Crown className="w-6 h-6 text-yellow-300 animate-bounce" style={{animationDuration: '2s'}} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-bold">DESBLOQUEIE PREMIUM</span>
              <div className="flex space-x-1">
                <Star className="w-3 h-3 text-yellow-300 fill-current" />
                <Star className="w-3 h-3 text-yellow-300 fill-current" />
                <Star className="w-3 h-3 text-yellow-300 fill-current" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleUpgrade}
              className="bg-white text-purple-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-yellow-300 hover:text-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
            >
              <Gem className="w-4 h-4" />
              <span>UPGRADE AGORA</span>
            </button>
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="text-white hover:text-yellow-300 transition-colors p-1 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'hero') {
    return (
      <div className="relative bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 text-white overflow-hidden min-h-[600px]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:30px_30px]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-6 py-3 rounded-full mb-8 font-bold shadow-lg animate-pulse">
              <Sparkles className="w-5 h-5" />
              <span>🔥 CONTEÚDO EXCLUSIVO 🔥</span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-6xl md:text-7xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent animate-pulse">
                DESBLOQUEIE
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
                O PREMIUM
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              <span className="text-yellow-300 font-bold">Milhares de vídeos exclusivos</span> em qualidade HD/4K, 
              <span className="text-pink-300 font-bold"> sem anúncios</span> e com 
              <span className="text-purple-300 font-bold"> acesso ilimitado</span>
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
              <div className="group text-center transform hover:scale-105 transition-all duration-300">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl">
                  <Video className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-yellow-300">Vídeos Exclusivos</h3>
                <p className="text-gray-300">Conteúdo premium que você não encontra em nenhum outro lugar</p>
              </div>
              <div className="group text-center transform hover:scale-105 transition-all duration-300">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-yellow-300">Zero Anúncios</h3>
                <p className="text-gray-300">Experiência limpa e sem interrupções irritantes</p>
              </div>
              <div className="group text-center transform hover:scale-105 transition-all duration-300">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-yellow-300">Qualidade HD/4K</h3>
                <p className="text-gray-300">A melhor qualidade de vídeo disponível na plataforma</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <button
                onClick={handleUpgrade}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-12 py-6 rounded-3xl font-black text-xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-110 flex items-center space-x-3"
              >
                <Crown className="w-8 h-8 group-hover:animate-bounce" />
                <span>COMEÇAR AGORA</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
              
              <button
                onClick={() => router.push('/videos')}
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all duration-300 border-2 border-white/20 hover:border-white/40 flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Ver Vídeos Gratuitos</span>
              </button>
            </div>

            {/* Pricing with Animation */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-12 text-lg">
                <div className="text-center">
                  <div className="text-3xl font-black text-yellow-300 mb-2">R$ 19,90</div>
                  <div className="text-gray-300">por mês</div>
                </div>
                <div className="text-gray-400 text-2xl hidden md:block">|</div>
                <div className="text-center relative">
                  <div className="text-3xl font-black text-yellow-300 mb-2">R$ 199,90</div>
                  <div className="text-gray-300">por ano</div>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    -17% OFF
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Cancelamento a qualquer momento</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>7 dias de teste grátis</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Suporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)] animate-pulse"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)] animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Crown className="w-8 h-8 text-yellow-300 animate-bounce" style={{animationDuration: '2s'}} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
              </div>
              <span className="font-black text-xl">PREMIUM</span>
            </div>
            <div className="hidden lg:flex items-center space-x-8">
              <div className="flex items-center space-x-2 group">
                <Video className="w-5 h-5 text-yellow-300 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">Vídeos Exclusivos</span>
              </div>
              <div className="flex items-center space-x-2 group">
                <Zap className="w-5 h-5 text-yellow-300 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">Sem Anúncios</span>
              </div>
              <div className="flex items-center space-x-2 group">
                <Shield className="w-5 h-5 text-yellow-300 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">HD/4K</span>
              </div>
              <div className="flex items-center space-x-2 group">
                <Heart className="w-5 h-5 text-pink-300 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">Download</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right hidden sm:block">
              <div className="text-sm text-gray-200">A partir de</div>
              <div className="font-black text-lg text-yellow-300">R$ 19,90/mês</div>
            </div>
            
            <button
              onClick={handleUpgrade}
              className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-3 rounded-2xl font-black hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
            >
              <Gem className="w-5 h-5" />
              <span>UPGRADE AGORA</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="text-white hover:text-yellow-300 transition-colors p-2 hover:scale-110 hover:bg-white/10 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 