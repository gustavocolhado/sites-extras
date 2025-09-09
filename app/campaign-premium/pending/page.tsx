'use client'

import { Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function CampaignPendingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Pendente */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-blue-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              ⏳ Pagamento em Processamento
            </h1>
            
            <p className="text-gray-300 text-lg mb-6">
              Seu pagamento está sendo processado. Você receberá uma confirmação por email assim que for aprovado.
            </p>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">📧 O que acontece agora?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Pagamento processado pelo Mercado Pago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Confirmação enviada por email</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Ativação automática do Premium</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-6">
              <AlertCircle className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <h4 className="text-lg font-bold text-white mb-2">Tempo de Processamento</h4>
              <p className="text-gray-300 text-sm">
                Pagamentos via PIX são processados instantaneamente. 
                Cartão de crédito pode levar até 2 dias úteis.
              </p>
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">
                Você pode fechar esta página. Receberá um email quando o pagamento for confirmado.
              </p>
              
              <a
                href="/videos"
                className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center space-x-2"
              >
                <span>Continuar Navegando</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
