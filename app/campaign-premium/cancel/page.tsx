'use client'

import { Crown, ArrowLeft, AlertCircle } from 'lucide-react'

export default function CampaignCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Cancelamento */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
            <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-orange-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              😔 Pagamento Cancelado
            </h1>
            
            <p className="text-gray-300 text-lg mb-6">
              Você cancelou o processo de pagamento. Não se preocupe, sua oferta especial ainda está disponível!
            </p>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">🎯 Sua Oferta Ainda Está Válida!</h3>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-2">
                  R$ 19,90 → R$ 9,90
                </div>
                <p className="text-gray-300">
                  50% de desconto - Economize R$ 10,00
                </p>
              </div>
            </div>

            <div className="flex space-x-4 justify-center">
              <a
                href="/campaign-premium"
                className="bg-accent-red hover:bg-accent-red-hover text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Crown className="w-5 h-5" />
                <span>Tentar Novamente</span>
              </a>
              
              <a
                href="/videos"
                className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar aos Vídeos</span>
              </a>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Problemas com o pagamento? Entre em contato conosco.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
