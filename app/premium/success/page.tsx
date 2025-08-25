'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  CheckCircle, 
  Crown, 
  Video, 
  Zap, 
  Shield, 
  ArrowRight,
  Home,
  Play,
  AlertCircle,
  Loader2
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

function PremiumSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [countdown, setCountdown] = useState(5)
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'confirmed' | 'pending' | 'failed'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const sessionId = searchParams.get('session_id')

  const processPaymentManually = async () => {
    if (!sessionId) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/stripe/process-pending-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPaymentStatus('confirmed');
        setError(null);
      } else {
        setError(data.error || 'Erro ao processar pagamento');
      }
    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      setError('Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!sessionId) {
        setPaymentStatus('failed')
        setError('ID da sessão não encontrado')
        return
      }

      try {
        // Verificar status do pagamento na API do Stripe
        const response = await fetch(`/api/stripe/webhook/status?session_id=${sessionId}`)
        const data = await response.json()

        if (response.ok && data.confirmed) {
          setPaymentStatus('confirmed')
        } else {
          setPaymentStatus('pending')
          setError(data.message || 'Pagamento ainda não foi confirmado')
        }
      } catch (err) {
        console.error('Erro ao verificar status do pagamento:', err)
        setPaymentStatus('failed')
        setError('Erro ao verificar status do pagamento')
      }
    }

    checkPaymentStatus()

    // Se o pagamento estiver pendente, verificar novamente a cada 10 segundos
    if (paymentStatus === 'pending') {
      const retryInterval = setInterval(() => {
        checkPaymentStatus()
      }, 10000) // 10 segundos

      return () => clearInterval(retryInterval)
    }
  }, [sessionId, paymentStatus])

  useEffect(() => {
    // Só inicia o countdown se o pagamento foi confirmado
    if (paymentStatus === 'confirmed') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push('/')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [router, paymentStatus])

  // Loading state
  if (paymentStatus === 'loading') {
    return (
      <div className="min-h-screen bg-theme-primary">
        <Header />
        <div className="flex items-center justify-center p-4 pt-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-semibold text-theme-primary mb-4">
              Verificando pagamento...
            </h2>
            <p className="text-theme-secondary">
              Aguarde enquanto confirmamos seu pagamento.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Error state
  if (paymentStatus === 'failed' || paymentStatus === 'pending') {
    return (
      <div className="min-h-screen bg-theme-primary">
        <Header />
        <div className="flex items-center justify-center p-4 pt-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-theme-primary mb-6">
              Pagamento Pendente
            </h1>
            
            <p className="text-lg text-theme-secondary mb-8 max-w-md mx-auto">
              {error || 'Seu pagamento ainda não foi confirmado. Isso pode levar alguns minutos.'}
            </p>

            {sessionId && (
              <div className="bg-theme-card rounded-xl p-4 mb-8 shadow-lg border border-theme-border-primary">
                <p className="text-sm text-theme-secondary mb-2">ID da Sessão:</p>
                <p className="font-mono text-sm bg-theme-hover p-2 rounded-lg break-all text-theme-primary">
                  {sessionId}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={processPaymentManually}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Processar Pagamento</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Loader2 className="w-5 h-5" />
                <span>Verificar Novamente</span>
              </button>
              
              <button
                onClick={() => router.push('/premium')}
                className="w-full bg-theme-hover text-theme-primary py-3 px-6 rounded-xl font-medium hover:bg-theme-border-primary transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Voltar ao Premium</span>
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Success state (only shown when paymentStatus === 'confirmed')
  return (
    <div className="min-h-screen bg-theme-primary">
      <Header />
      
      <div className="flex items-center justify-center p-4 pt-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Crown className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-theme-primary mb-6">
            Parabéns! 🎉
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-theme-primary mb-4">
            Você agora é Premium!
          </h2>
          <p className="text-lg text-theme-secondary mb-8 max-w-md mx-auto">
            Seu pagamento foi processado com sucesso. Agora você tem acesso a todo o conteúdo exclusivo.
          </p>

          {/* Session ID Display */}
          {sessionId && (
            <div className="bg-theme-card rounded-xl p-4 mb-8 shadow-lg border border-theme-border-primary">
              <p className="text-sm text-theme-secondary mb-2">ID da Sessão:</p>
              <p className="font-mono text-sm bg-theme-hover p-2 rounded-lg break-all text-theme-primary">
                {sessionId}
              </p>
            </div>
          )}

          {/* Premium Features */}
          <div className="bg-theme-card rounded-2xl p-8 shadow-xl mb-8 border border-theme-border-primary">
            <h3 className="text-xl font-semibold text-theme-primary mb-6">
              O que você ganhou:
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-theme-primary mb-2">Vídeos Exclusivos</h4>
                <p className="text-sm text-theme-secondary">Acesso a todo conteúdo premium</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-theme-primary mb-2">Sem Anúncios</h4>
                <p className="text-sm text-theme-secondary">Experiência limpa e sem interrupções</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-theme-primary mb-2">Qualidade Máxima</h4>
                <p className="text-sm text-theme-secondary">HD/4K em todos os vídeos</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/videos')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Começar a Assistir</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full bg-theme-hover text-theme-primary py-3 px-6 rounded-xl font-medium hover:bg-theme-border-primary transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Voltar ao Início</span>
            </button>
          </div>

          {/* Auto Redirect */}
          <div className="mt-8 text-center">
            <p className="text-sm text-theme-muted">
              Redirecionando automaticamente em{' '}
              <span className="font-semibold text-purple-600 dark:text-purple-400">{countdown}</span> segundos...
            </p>
          </div>

          {/* User Info */}
          {session?.user && (
            <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl">
              <p className="text-sm text-theme-secondary">
                Bem-vindo ao Premium, <span className="font-semibold text-theme-primary">{session.user.name}</span>! 🎉
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function PremiumSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-theme-secondary">Carregando...</p>
        </div>
      </div>
    }>
      <PremiumSuccessContent />
    </Suspense>
  )
} 