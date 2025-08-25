'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface AgeVerificationModalProps {
  onConfirm: () => void
}

export default function AgeVerificationModal({ onConfirm }: AgeVerificationModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Verificar se o usuário já confirmou a idade
    const hasConfirmedAge = localStorage.getItem('ageConfirmed')
    
    if (!hasConfirmedAge) {
      setIsVisible(true)
    }
  }, [])

  const handleConfirm = () => {
    localStorage.setItem('ageConfirmed', 'true')
    setIsVisible(false)
    onConfirm()
  }

  const handleDecline = () => {
    // Redirecionar para um site seguro
    window.location.href = 'https://www.google.com'
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-md w-full mx-4 bg-theme-card rounded-2xl shadow-2xl border border-theme-border-primary overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <AlertTriangle className="w-8 h-8 text-white mr-3" />
            <h2 className="text-2xl font-bold text-white">AVISO IMPORTANTE</h2>
          </div>
          <p className="text-white/90 text-sm">
            Conteúdo Exclusivo para Maiores de 18 Anos
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-theme-primary mb-3">
              Verificação de Idade
            </h3>
            <p className="text-theme-secondary text-sm leading-relaxed">
              Este site contém material explícito destinado exclusivamente a adultos com 18 anos ou mais. 
              Ao acessar este conteúdo, você confirma que:
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-theme-secondary text-sm">
                Você tem pelo menos 18 anos de idade
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-theme-secondary text-sm">
                Você não se ofende com conteúdo adulto explícito
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-theme-secondary text-sm">
                Você está acessando este site de forma voluntária
              </p>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <p className="text-yellow-600 text-sm font-medium text-center">
              ⚠️ Se você é menor de 18 anos, saia imediatamente deste site.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleConfirm}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              TENHO 18 ANOS OU MAIS - ENTRAR
            </button>
            
            <button
              onClick={handleDecline}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              SOU MENOR DE IDADE - SAIR
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-theme-hover px-6 py-4 text-center">
          <p className="text-theme-secondary text-xs">
            Ao continuar, você concorda com nossos{' '}
            <a href="/terms" className="text-red-500 hover:underline">
              Termos de Uso
            </a>{' '}
            e{' '}
            <a href="/privacy" className="text-red-500 hover:underline">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
