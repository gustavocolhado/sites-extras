'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Check, Star, Crown, Zap, Shield, Download, X, QrCode, CreditCard } from 'lucide-react'
import PixPayment from '@/components/PixPayment'

interface CampaignData {
  campaignId: string
  campaignName: string
  originalPrice: number
  promotionalPrice: number
  discount: number
}

export default function CampaignPremiumPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | null>(null)
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCampaignData = async () => {
      try {
        const campaignId = searchParams.get('campaign')
        const userEmail = searchParams.get('email')
        
        if (campaignId) {
          // Buscar dados da campanha
          const response = await fetch(`/api/admin/email-campaigns/${campaignId}`)
          if (response.ok) {
            const data = await response.json()
            setCampaignData({
              campaignId: data.campaign.id,
              campaignName: data.campaign.name,
              originalPrice: 19.90,
              promotionalPrice: 9.90,
              discount: 50
            })
          }
        } else {
          // Dados padrão se não houver campanha
          setCampaignData({
            campaignId: 'default',
            campaignName: 'Oferta Especial',
            originalPrice: 19.90,
            promotionalPrice: 9.90,
            discount: 50
          })
        }

        // Se há email na URL e usuário não está logado, tentar login automático
        if (userEmail && !session?.user) {
          console.log('Email detectado na URL:', userEmail)
          try {
            const response = await fetch('/api/auth/auto-login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email: userEmail }),
            })
            
            if (response.ok) {
              const data = await response.json()
              console.log('Usuário verificado:', data)
              // Aqui você pode implementar login automático se necessário
            } else {
              console.log('Usuário não encontrado ou erro na API:', response.status)
            }
          } catch (error) {
            console.error('Erro ao verificar usuário:', error)
            // Continuar normalmente mesmo com erro
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados da campanha:', error)
        // Dados padrão em caso de erro
        setCampaignData({
          campaignId: 'default',
          campaignName: 'Oferta Especial',
          originalPrice: 19.90,
          promotionalPrice: 9.90,
          discount: 50
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCampaignData()
  }, [searchParams, session])

  const handleSubscribe = async () => {
    const userEmail = searchParams.get('email')
    
    if (!session?.user && !userEmail) {
      // Redirecionar para login apenas se não houver email na URL
      window.location.href = '/login?callbackUrl=' + encodeURIComponent(window.location.href)
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Usar a API premium existente com planos promocionais
      const response = await fetch('/api/premium/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan === 'monthly' ? 'campaign-monthly' : 'campaign-quarterly',
          paymentMethod: 'mercadopago',
          userEmail: session?.user?.email || searchParams.get('email')
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Resposta da API:', data)
        
        if (data.preferenceId) {
          setPreferenceId(data.preferenceId)
          // Mostrar seleção de método de pagamento
          setPaymentMethod('pix') // Por padrão, mostrar PIX
        } else {
          throw new Error('ID da preferência não encontrado')
        }
      } else {
        const errorData = await response.json()
        console.error('❌ Erro na API:', errorData)
        throw new Error(errorData.error || 'Erro ao processar assinatura')
      }
    } catch (error) {
      console.error('Erro ao assinar:', error)
      setError(error instanceof Error ? error.message : 'Erro ao processar assinatura')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentMethodSelect = (method: 'pix' | 'card') => {
    setPaymentMethod(method)
    setError(null)
  }

  const handlePaymentSuccess = () => {
    // Redirecionar para página de sucesso
    window.location.href = `/campaign-premium/success?paymentSessionId=${preferenceId}`
  }

  const handlePaymentCancel = () => {
    setPaymentMethod(null)
    setPreferenceId(null)
    setError(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-red"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold">🎉 OFERTA EXCLUSIVA!</h1>
          <p className="text-sm opacity-90">Válida apenas por tempo limitado</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Banner de Oferta */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 mb-8 text-center text-white">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 mr-2" />
            <h2 className="text-3xl font-bold">OFERTA ESPECIAL</h2>
          </div>
          <div className="text-4xl font-bold mb-2">
            De R$ {campaignData?.originalPrice} por apenas R$ {campaignData?.promotionalPrice}
          </div>
          <div className="text-lg opacity-90">
            {campaignData?.discount}% de desconto - Economize R$ {(campaignData?.originalPrice || 0) - (campaignData?.promotionalPrice || 0)}
          </div>
        </div>

        {/* Plano de Assinatura */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-4">
                Assinatura Premium
              </h3>
              <p className="text-gray-300 text-lg">
                Acesso completo a todo o conteúdo exclusivo
              </p>
            </div>

            {/* Seleção de Plano */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div 
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPlan === 'monthly' 
                    ? 'border-accent-red bg-accent-red/10' 
                    : 'border-white/20 bg-white/5'
                }`}
                onClick={() => setSelectedPlan('monthly')}
              >
                <div className="text-center">
                  <h4 className="text-xl font-bold text-white mb-2">Mensal</h4>
                  <div className="text-3xl font-bold text-accent-red mb-2">
                    R$ {campaignData?.promotionalPrice}
                  </div>
                  <div className="text-sm text-gray-400 line-through">
                    De R$ {campaignData?.originalPrice}
                  </div>
                  <div className="text-sm text-green-400 font-semibold mt-1">
                    Economize R$ {(campaignData?.originalPrice || 0) - (campaignData?.promotionalPrice || 0)}
                  </div>
                </div>
              </div>

              <div 
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPlan === 'quarterly' 
                    ? 'border-accent-red bg-accent-red/10' 
                    : 'border-white/20 bg-white/5'
                }`}
                onClick={() => setSelectedPlan('quarterly')}
              >
                <div className="text-center">
                  <h4 className="text-xl font-bold text-white mb-2">Trimestral</h4>
                  <div className="text-3xl font-bold text-accent-red mb-2">
                    R$ 19,90
                  </div>
                  <div className="text-sm text-gray-400 line-through">
                    De R$ {(campaignData?.originalPrice || 0) * 3}
                  </div>
                  <div className="text-sm text-green-400 font-semibold mt-1">
                    Economize R$ {((campaignData?.originalPrice || 0) * 3) - 19.90}
                  </div>
                  <div className="text-xs text-yellow-400 mt-1">
                    Melhor custo-benefício
                  </div>
                </div>
              </div>
            </div>

            {/* Benefícios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-3">
                <Check className="w-6 h-6 text-green-400" />
                <span className="text-white">Milhares de vídeos exclusivos</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-6 h-6 text-green-400" />
                <span className="text-white">Qualidade HD sem anúncios</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-6 h-6 text-green-400" />
                <span className="text-white">Download de vídeos</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-6 h-6 text-green-400" />
                <span className="text-white">Conteúdo novo toda semana</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-6 h-6 text-green-400" />
                <span className="text-white">Suporte prioritário</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-6 h-6 text-green-400" />
                <span className="text-white">Acesso em todos os dispositivos</span>
              </div>
            </div>

            {/* Botão de Assinatura */}
            {!paymentMethod && (
              <div className="text-center">
                <button
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-accent-red to-orange-600 hover:from-accent-red-hover hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <Crown className="w-6 h-6" />
                      <span>ASSINAR AGORA - R$ {selectedPlan === 'monthly' ? campaignData?.promotionalPrice : '19,90'}</span>
                    </>
                  )}
                </button>
                
                <p className="text-gray-400 text-sm mt-4">
                  Cancele a qualquer momento. Sem compromisso.
                </p>
              </div>
            )}

            {/* Seleção de Método de Pagamento */}
            {preferenceId && !paymentMethod && (
              <div className="mt-8">
                <h4 className="text-xl font-bold text-white mb-6 text-center">
                  Escolha a forma de pagamento
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* PIX */}
                  <button
                    onClick={() => handlePaymentMethodSelect('pix')}
                    className="p-6 rounded-xl border-2 border-green-500 bg-green-500/10 hover:bg-green-500/20 transition-all duration-300 group"
                  >
                    <div className="text-center">
                      <QrCode className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <h5 className="text-lg font-bold text-white mb-2">PIX</h5>
                      <p className="text-gray-300 text-sm">Pagamento instantâneo</p>
                    </div>
                  </button>

                  {/* Cartão */}
                  <button
                    onClick={() => handlePaymentMethodSelect('card')}
                    className="p-6 rounded-xl border-2 border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="text-center">
                      <CreditCard className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                      <h5 className="text-lg font-bold text-white mb-2">Cartão</h5>
                      <p className="text-gray-300 text-sm">Crédito ou débito</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Componente PIX */}
            {paymentMethod === 'pix' && preferenceId && (
              <div className="mt-8">
                <PixPayment
                  preferenceId={preferenceId}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                />
              </div>
            )}

            {/* Erro */}
            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-center">{error}</p>
                <div className="text-center mt-4">
                  <button
                    onClick={() => setError(null)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Garantia */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mt-8 text-center">
            <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-white mb-2">Garantia de 7 Dias</h4>
            <p className="text-gray-300">
              Se não ficar satisfeito, devolvemos seu dinheiro em até 7 dias.
            </p>
          </div>

          {/* Urgência */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mt-6 text-center">
            <Zap className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-white mb-2">Oferta Limitada</h4>
            <p className="text-gray-300">
              Esta oferta expira em breve. Não perca esta oportunidade única!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
