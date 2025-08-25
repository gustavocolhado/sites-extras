'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  CreditCard, 
  QrCode, 
  Check, 
  Shield, 
  Zap, 
  Crown,
  ArrowRight,
  Heart,
  Gem,
  Play,
  Star
} from 'lucide-react'
import Header from '@/components/Header'
import PixPayment from '@/components/PixPayment'
import Footer from '@/components/Footer'
import { useCountry } from '@/hooks/useCountry'
import CurrencySelector from '@/components/CurrencySelector'

interface Plan {
  id: string
  name: string
  price: number
  period: string
  description: string
  popular?: boolean
  savings?: string
  originalPrice?: number
}

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Mensal',
    price: 19.90,
    period: 'mês',
    description: 'Acesso completo por 1 mês'
  },
  {
    id: 'quarterly',
    name: 'Trimestral',
    price: 32.90,
    period: '3 meses',
    description: 'Acesso completo por 3 meses',
    originalPrice: 59.70,
    savings: '45% OFF'
  },
  {
    id: 'semiannual',
    name: 'Semestral',
    price: 57.90,
    period: '6 meses',
    description: 'Acesso completo por 6 meses',
    originalPrice: 119.40,
    savings: '52% OFF'
  },
  {
    id: 'yearly',
    name: 'Anual',
    price: 99.90,
    period: '12 meses',
    description: 'Acesso completo por 12 meses',
    originalPrice: 238.80,
    savings: '58% OFF',
    popular: true
  },
  {
    id: 'lifetime',
    name: 'Vitalício',
    price: 499.90,
    period: 'para sempre',
    description: 'Acesso completo vitalício',
    originalPrice: 2388.00,
    savings: '79% OFF'
  }
]

const benefits = [
  {
    icon: Play,
    title: 'Vídeos Exclusivos',
    description: 'Conteúdo que você não encontra em nenhum outro lugar'
  },
  {
    icon: Zap,
    title: 'Sem Anúncios',
    description: 'Experiência limpa sem interrupções'
  },
  {
    icon: Shield,
    title: 'Privacidade Total',
    description: 'Seus dados estão 100% seguros'
  },
  {
    icon: Crown,
    title: 'Qualidade HD/4K',
    description: 'A melhor qualidade disponível'
  }
]

export default function PremiumPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { countryInfo, loading: countryLoading, formatPrice, changeCountry } = useCountry()
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [campaignData, setCampaignData] = useState<any>(null)

  // Capturar dados da campanha da URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const source = urlParams.get('source')
    const campaign = urlParams.get('campaign')
    
    if (source && campaign) {
      setCampaignData({ source, campaign })
      
      // Salvar dados da campanha no localStorage se não existir
      const existingData = localStorage.getItem('campaignData')
      if (!existingData) {
        const data = {
          source,
          campaign,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          utm_source: urlParams.get('utm_source'),
          utm_medium: urlParams.get('utm_medium'),
          utm_campaign: urlParams.get('utm_campaign'),
          utm_term: urlParams.get('utm_term'),
          utm_content: urlParams.get('utm_content')
        }
        localStorage.setItem('campaignData', JSON.stringify(data))
      }
    }
  }, [])

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin')
    }
  }, [status, router])

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan)
    setPaymentMethod(null)
    setError(null)
  }

  const handlePaymentMethodSelect = (method: 'pix' | 'card') => {
    setPaymentMethod(method)
    setError(null)
  }

  const createSubscription = async () => {
    if (!selectedPlan || !paymentMethod) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/premium/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          paymentMethod: paymentMethod === 'pix' ? 'mercadopago' : 'stripe',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar assinatura')
      }

      if (paymentMethod === 'pix') {
        setPreferenceId(data.preferenceId)
      } else if (paymentMethod === 'card') {
        // Registrar conversão para pagamentos com cartão
        if (selectedPlan && campaignData) {
          registerConversion(selectedPlan.id, selectedPlan.price)
        }
        // Redirecionar para checkout do Stripe
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Função para registrar conversão da campanha
  const registerConversion = async (planId: string, amount: number) => {
    if (!campaignData || !session?.user?.id) return

    try {
      await fetch('/api/campaigns/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          source: campaignData.source,
          campaign: campaignData.campaign,
          planId,
          amount
        }),
      })
    } catch (error) {
      console.error('Erro ao registrar conversão:', error)
    }
  }

  const handlePixSuccess = () => {
    // Registrar conversão se houver dados de campanha
    if (selectedPlan && campaignData) {
      registerConversion(selectedPlan.id, selectedPlan.price)
    }
    router.push('/premium/success')
  }

  const handlePixCancel = () => {
    setPreferenceId(null)
    setPaymentMethod(null)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent-red mx-auto mb-6"></div>
          <p className="text-theme-primary text-lg font-semibold">Carregando...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  if (preferenceId && paymentMethod === 'pix') {
    return (
      <div className="min-h-screen bg-theme-primary">
        <Header />
        <div className="flex items-center justify-center p-4 pt-20">
          <PixPayment
            preferenceId={preferenceId}
            onSuccess={handlePixSuccess}
            onCancel={handlePixCancel}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-theme-primary">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="inline-flex items-center space-x-2 bg-accent-red text-white px-6 py-3 rounded-full font-bold shadow-lg">
              <Heart className="w-5 h-5" />
              <span>CONTEÚDO EXCLUSIVO</span>
            </div>
            <CurrencySelector 
              currentCountry={countryInfo}
              onCountryChange={changeCountry}
              loading={countryLoading}
            />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            <span className="text-accent-red">DESBLOQUEIE</span>
            <br />
            <span className="text-theme-primary">O PREMIUM</span>
          </h1>
          
          <p className="text-xl text-theme-secondary max-w-3xl mx-auto mb-8">
            Acesse <span className="text-accent-red font-bold">milhares de vídeos exclusivos</span> em qualidade HD/4K, 
            <span className="text-accent-red font-bold"> sem anúncios</span> e com 
            <span className="text-accent-red font-bold"> acesso ilimitado</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Plan Selection */}
          <div className="lg:col-span-2">
            <div className="bg-theme-card border border-theme-border-primary rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-theme-primary mb-8 flex items-center space-x-3">
                <Crown className="w-6 h-6 text-accent-red" />
                <span>Escolha seu Plano</span>
              </h3>

              <div className="space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative bg-theme-hover border-2 rounded-xl p-6 transition-all duration-300 cursor-pointer group hover:bg-theme-hover ${
                      selectedPlan?.id === plan.id
                        ? 'border-accent-red shadow-lg'
                        : 'border-theme-border-primary hover:border-accent-red/50'
                    }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <div className="absolute -top-3 left-6 bg-accent-red text-white px-3 py-1 rounded-full text-sm font-bold">
                        ⭐ MAIS POPULAR
                      </div>
                    )}

                    {/* Savings Badge */}
                    {plan.savings && !plan.popular && (
                      <div className="absolute -top-3 left-6 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        💰 {plan.savings}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      {/* Left side - Plan info */}
                      <div className="flex items-center space-x-4">
                        {/* Checkbox */}
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          selectedPlan?.id === plan.id
                            ? 'border-accent-red bg-accent-red'
                            : 'border-theme-border-primary group-hover:border-accent-red/50'
                        }`}>
                          {selectedPlan?.id === plan.id && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>

                        {/* Plan details */}
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-theme-primary mb-1">
                            {plan.name}
                          </h4>
                          <p className="text-theme-secondary text-sm">
                            {plan.description}
                          </p>
                          {plan.originalPrice && (
                            <p className="text-sm text-theme-muted line-through mt-1">
                              De {countryLoading ? (
                                <span className="animate-pulse bg-theme-muted/20 h-4 w-16 rounded"></span>
                              ) : (
                                formatPrice(plan.originalPrice)
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                                              {/* Right side - Price */}
                        <div className="text-right">
                          <div className="text-2xl font-black text-accent-red mb-1">
                            {countryLoading ? (
                              <div className="animate-pulse bg-accent-red/20 h-8 w-20 rounded"></div>
                            ) : (
                              formatPrice(plan.price)
                            )}
                          </div>
                          <div className="text-theme-secondary text-sm">
                            por {plan.period}
                          </div>
                          {!countryLoading && countryInfo.currency !== 'BRL' && (
                            <div className="text-xs text-theme-muted mt-1">
                              {countryInfo.country}
                            </div>
                          )}
                        </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Method Selection */}
              {selectedPlan && (
                <div className="mt-8">
                  <h4 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-3">
                    <Gem className="w-5 h-5 text-accent-red" />
                    <span>Forma de Pagamento</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* PIX */}
                    <button
                      onClick={() => handlePaymentMethodSelect('pix')}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 group ${
                        paymentMethod === 'pix'
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-theme-border-primary hover:border-green-500/50 hover:bg-theme-hover'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          paymentMethod === 'pix' 
                            ? 'bg-green-500' 
                            : 'bg-theme-hover group-hover:bg-green-500/20'
                        }`}>
                          <QrCode className={`w-5 h-5 ${paymentMethod === 'pix' ? 'text-white' : 'text-green-500'}`} />
                        </div>
                        <div className="text-left">
                          <h5 className="font-bold text-theme-primary">PIX</h5>
                          <p className="text-theme-secondary text-sm">Pagamento instantâneo</p>
                        </div>
                      </div>
                    </button>

                    {/* Cartão de Crédito */}
                    <button
                      onClick={() => handlePaymentMethodSelect('card')}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 group ${
                        paymentMethod === 'card'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-theme-border-primary hover:border-blue-500/50 hover:bg-theme-hover'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          paymentMethod === 'card' 
                            ? 'bg-blue-500' 
                            : 'bg-theme-hover group-hover:bg-blue-500/20'
                        }`}>
                          <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-white' : 'text-blue-500'}`} />
                        </div>
                        <div className="text-left">
                          <h5 className="font-bold text-theme-primary">Cartão de Crédito</h5>
                          <p className="text-theme-secondary text-sm">Visa, Mastercard, etc.</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
                      <p className="text-red-500 text-sm">{error}</p>
                    </div>
                  )}

                  {paymentMethod && (
                    <button
                      onClick={createSubscription}
                      disabled={loading}
                      className="w-full bg-accent-red hover:bg-accent-red-hover text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processando...</span>
                        </>
                      ) : (
                        <>
                          <Crown className="w-5 h-5" />
                          <span>IR PARA O PAGAMENTO</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Trust Indicators */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-theme-secondary">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Cancelamento a qualquer momento</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>7 dias de teste grátis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Suporte 24/7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Benefits */}
          <div className="lg:col-span-1">
            <div className="bg-theme-card border border-theme-border-primary rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center space-x-3">
                <Star className="w-5 h-5 text-accent-red" />
                <span>Benefícios Premium</span>
              </h3>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg group hover:bg-theme-hover transition-all duration-300">
                    <div className="w-10 h-10 bg-accent-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-accent-red" />
                    </div>
                    <div>
                      <h4 className="text-theme-primary font-bold text-sm mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-theme-secondary text-xs">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Section */}
              <div className="mt-8 text-center">
                <div className="w-16 h-16 bg-accent-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-bold text-theme-primary mb-2">
                  Junte-se aos Premium!
                </h4>
                <p className="text-theme-secondary text-sm">
                  Milhares de usuários já descobriram o poder do conteúdo exclusivo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

