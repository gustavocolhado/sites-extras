'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Crown, Download, Star, ArrowRight } from 'lucide-react'

export default function CampaignSuccessPage() {
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const paymentSessionId = searchParams.get('paymentSessionId')
    
    if (paymentSessionId) {
      // Buscar dados da sessão de pagamento
      fetch(`/api/premium/payment-session/${paymentSessionId}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setPaymentData({
              id: data.payment.id,
              amount: data.payment.amount,
              planType: data.payment.plan,
              expireDate: new Date(data.payment.expireDate)
            })
          }
        })
        .catch(error => {
          console.error('Erro ao buscar dados do pagamento:', error)
          // Dados padrão em caso de erro
          setPaymentData({
            id: paymentSessionId,
            amount: 9.90,
            planType: 'monthly',
            expireDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          })
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-red"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Sucesso */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center mb-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              🎉 Parabéns! Assinatura Confirmada
            </h1>
            
            <p className="text-gray-300 text-lg mb-6">
              Sua assinatura Premium foi ativada com sucesso!
            </p>

            {paymentData && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Detalhes da Assinatura</h3>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-gray-400 text-sm">Valor Pago:</p>
                    <p className="text-white font-bold">R$ {paymentData.amount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Plano:</p>
                    <p className="text-white font-bold capitalize">{paymentData.planType}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Válido até:</p>
                    <p className="text-white font-bold">
                      {paymentData.expireDate.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">ID do Pagamento:</p>
                    <p className="text-white font-mono text-sm">{paymentData.id}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4 justify-center">
              <a
                href="/videos"
                className="bg-accent-red hover:bg-accent-red-hover text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Crown className="w-5 h-5" />
                <span>Acessar Conteúdo Premium</span>
              </a>
              
              <a
                href="/profile"
                className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Star className="w-5 h-5" />
                <span>Minha Conta</span>
              </a>
            </div>
          </div>

          {/* Benefícios Ativados */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              🚀 Seus Benefícios Premium
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
                <Crown className="w-6 h-6 text-yellow-400" />
                <span className="text-white">Acesso a milhares de vídeos exclusivos</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
                <Download className="w-6 h-6 text-blue-400" />
                <span className="text-white">Download de vídeos</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
                <Star className="w-6 h-6 text-purple-400" />
                <span className="text-white">Qualidade HD sem anúncios</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
                <ArrowRight className="w-6 h-6 text-green-400" />
                <span className="text-white">Conteúdo novo toda semana</span>
              </div>
            </div>
          </div>

          {/* Próximos Passos */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-4">
              📧 Confirmação por Email
            </h3>
            <p className="text-gray-300 mb-4">
              Enviamos um email de confirmação com todos os detalhes da sua assinatura.
            </p>
            <p className="text-gray-400 text-sm">
              Verifique sua caixa de entrada e a pasta de spam.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
