'use client'

import { useState, useEffect } from 'react'
import { QrCode, Copy, Check, Clock, AlertCircle } from 'lucide-react'

interface PixPaymentProps {
  preferenceId: string
  onSuccess: () => void
  onCancel: () => void
}

interface PixData {
  qr_code: string
  qr_code_base64: string
  expires_at: string
  payment_id?: string
  provider?: string
}

export default function PixPayment({ preferenceId, onSuccess, onCancel }: PixPaymentProps) {
  const [pixData, setPixData] = useState<PixData | null>(null)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')

  // Buscar dados do PIX
  useEffect(() => {
    const fetchPixData = async () => {
      try {
        console.log('🎯 PixPayment - Iniciando busca de dados PIX para preferenceId:', preferenceId)
        
        const response = await fetch('/api/premium/create-pix', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ preferenceId }),
        })

        if (!response.ok) {
          throw new Error('Erro ao gerar PIX')
        }

        const data = await response.json()
        console.log('📊 Dados PIX recebidos:', data)
        console.log('🔍 Verificando campos do QR Code:', {
          hasQRCode: !!data.qr_code,
          hasQRCodeBase64: !!data.qr_code_base64,
          qrCodeLength: data.qr_code?.length,
          qrCodeBase64Length: data.qr_code_base64?.length,
          qrCodeType: typeof data.qr_code,
          qrCodeBase64Type: typeof data.qr_code_base64,
          provider: data.provider,
          qrCodeBase64Start: data.qr_code_base64?.substring(0, 50) + '...',
          fullData: data
        })
        setPixData(data)
        
        // Log quando pixData é definido
        console.log('🎯 PixPayment - Dados definidos:', {
          hasQRCode: !!data.qr_code,
          hasQRCodeBase64: !!data.qr_code_base64,
          qrCodeBase64Length: data.qr_code_base64?.length,
          provider: data.provider
        })
        
        // Calcular tempo restante
        const expiresAt = new Date(data.expires_at).getTime()
        const now = Date.now()
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000))
        setTimeLeft(remaining)
      } catch (err) {
        console.error('❌ Erro ao buscar dados PIX:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchPixData()
  }, [preferenceId])

  // Verificar status do pagamento
  useEffect(() => {
    if (!preferenceId || paymentStatus !== 'pending') return

    let checkCount = 0
    const maxChecks = 60 // Máximo 5 minutos (60 * 5 segundos)

    const checkPaymentStatus = async () => {
      try {
        console.log(`🔍 Verificando status do pagamento (tentativa ${checkCount + 1}/${maxChecks})`)
        console.log(`🔍 PreferenceId sendo verificado:`, preferenceId)
        
        // Primeiro, verificar o status do pagamento específico
        const paymentResponse = await fetch('/api/premium/check-payment-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ preferenceId }),
        })

        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json()
          console.log('📊 Status do pagamento:', paymentData)
          
          if (paymentData.status === 'approved' || paymentData.status === 'paid') {
            console.log('✅ Pagamento aprovado! Redirecionando...')
            setPaymentStatus('approved')
            setTimeout(() => {
              // Redirecionar para a página de sucesso com o payment_id
              window.location.href = `/premium/success?payment_id=${pixData?.payment_id || preferenceId}`
            }, 2000)
            return
          } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
            console.log('❌ Pagamento rejeitado')
            setPaymentStatus('rejected')
            return
          } else {
            console.log('⏳ Pagamento ainda pendente:', paymentData.status)
          }
        } else {
          console.log('❌ Erro na resposta da API de verificação:', paymentResponse.status)
        }

        // Como fallback, verificar o status premium do usuário
        // Mas só considerar se o pagamento específico foi processado
        const userResponse = await fetch('/api/premium/check-user-status')
        if (userResponse.ok) {
          const userData = await userResponse.json()
          console.log('👤 Status do usuário:', userData)
          
          // Só considerar aprovado se o usuário tem premium E o pagamento foi processado recentemente
          if (userData.isActive && userData.paymentDate) {
            const paymentDate = new Date(userData.paymentDate)
            const now = new Date()
            const timeDiff = now.getTime() - paymentDate.getTime()
            const minutesDiff = timeDiff / (1000 * 60)
            
            // Só considerar se o pagamento foi feito nos últimos 10 minutos
            if (minutesDiff < 10) {
              console.log('✅ Usuário tem premium ativo e pagamento recente! Redirecionando...')
              setPaymentStatus('approved')
              setTimeout(() => {
                // Redirecionar para a página de sucesso com o payment_id
                window.location.href = `/premium/success?payment_id=${pixData?.payment_id || preferenceId}`
              }, 2000)
              return
            }
          }
        }
        
        checkCount++
        if (checkCount >= maxChecks) {
          console.log('⏰ Tempo limite de verificação atingido')
          return
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error)
        checkCount++
      }
    }

    // Verificar imediatamente e depois a cada 5 segundos
    checkPaymentStatus()
    const interval = setInterval(checkPaymentStatus, 5000)
    
    return () => clearInterval(interval)
  }, [preferenceId, paymentStatus, onSuccess])

  // Atualizar contador regressivo
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const copyPixCode = async () => {
    if (!pixData?.qr_code) return

    try {
      await navigator.clipboard.writeText(pixData.qr_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red"></div>
          <div className="absolute inset-0 rounded-full border-2 border-accent-red/20"></div>
        </div>
        <h3 className="text-lg font-semibold text-theme-primary mb-2">Gerando PIX...</h3>
        <p className="text-theme-secondary text-center">Preparando seu pagamento seguro</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-theme-primary mb-3">Erro ao gerar PIX</h3>
        <p className="text-theme-secondary mb-6 max-w-sm mx-auto">{error}</p>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (paymentStatus === 'approved') {
    return (
      <div className="text-center p-8">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-theme-primary mb-3">Pagamento Aprovado!</h3>
        <p className="text-theme-secondary mb-4">Seu pagamento foi processado com sucesso</p>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
          <p className="text-green-700 dark:text-green-300 font-medium">Redirecionando para a página de sucesso...</p>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'rejected') {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-theme-primary mb-3">Pagamento Rejeitado</h3>
        <p className="text-theme-secondary mb-6 max-w-sm mx-auto">O pagamento não foi aprovado. Verifique os dados e tente novamente.</p>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!pixData) {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h3 className="text-xl font-bold text-theme-primary mb-3">Dados PIX não encontrados</h3>
        <p className="text-theme-secondary mb-6">Não foi possível gerar os dados do PIX. Tente novamente.</p>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
        >
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-theme-card rounded-2xl shadow-xl border border-theme-border-primary">
      <div className="text-center mb-8">
        <div className="relative inline-block mb-6">
          <QrCode className="w-20 h-20 text-green-600 dark:text-green-400 mx-auto" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-theme-primary mb-3">Pagamento PIX</h3>
        <p className="text-theme-secondary text-lg">Escaneie o QR Code ou copie o código PIX</p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-lg">
          {(() => {
            console.log('🎨 Renderizando QR Code:', {
              hasQRCodeBase64: !!pixData.qr_code_base64,
              qrCodeBase64Length: pixData.qr_code_base64?.length,
              qrCodeBase64Start: pixData.qr_code_base64?.substring(0, 30) + '...'
            })
            
                         if (pixData.qr_code_base64) {
               // Verificar se o base64 já tem o prefixo data:image/png;base64,
               const base64Data = pixData.qr_code_base64.startsWith('data:image/png;base64,') 
                 ? pixData.qr_code_base64 
                 : `data:image/png;base64,${pixData.qr_code_base64}`
               
               console.log('🔧 Base64 processado:', {
                 original: pixData.qr_code_base64.substring(0, 50) + '...',
                 processed: base64Data.substring(0, 50) + '...',
                 hasPrefix: pixData.qr_code_base64.startsWith('data:image/png;base64,')
               })
               
               return (
                 <img
                   src={base64Data}
                   alt="QR Code PIX"
                   className="w-56 h-56"
                   onLoad={() => console.log('✅ QR Code carregado com sucesso')}
                   onError={(e) => {
                     console.error('❌ Erro ao carregar QR Code:', e)
                     console.error('❌ Dados do QR Code:', {
                       length: pixData.qr_code_base64?.length,
                       start: pixData.qr_code_base64?.substring(0, 50),
                       processedLength: base64Data?.length
                     })
                     e.currentTarget.style.display = 'none'
                   }}
                 />
               )
             } else {
              console.log('❌ QR Code base64 não disponível')
              return (
                <div className="w-56 h-56 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    QR Code não disponível
                  </p>
                </div>
              )
            }
          })()}
        </div>
      </div>

      {/* Código PIX */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-theme-primary mb-3">
          Código PIX
        </label>
        <div className="flex">
          <input
            type="text"
            value={pixData.qr_code || 'Código PIX não disponível'}
            readOnly
            className="flex-1 px-4 py-3 border border-theme-border-primary rounded-l-xl bg-theme-hover text-sm font-mono text-theme-primary"
          />
          <button
            onClick={copyPixCode}
            disabled={!pixData.qr_code}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-r-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
        {copied && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm mt-2">
            <Check className="w-4 h-4" />
            <span className="font-medium">Código copiado!</span>
          </div>
        )}
        {!pixData.qr_code && (
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm mt-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Código PIX não foi gerado</span>
          </div>
        )}
      </div>

      {/* Timer */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-center space-x-3 text-orange-600 dark:text-orange-400 mb-2">
            <Clock className="w-6 h-6" />
            <span className="font-mono text-2xl font-bold">
              {formatTime(timeLeft)}
            </span>
          </div>
          <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
            Tempo restante para pagamento
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-center space-x-3 text-blue-600 dark:text-blue-400">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span className="font-medium">Aguardando pagamento...</span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
            Verificando status automaticamente a cada 5 segundos
          </p>
          <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
            <p>💡 <strong>Dica:</strong> Após fazer o pagamento, aguarde alguns segundos.</p>
            <p>O sistema detectará automaticamente quando o pagamento for confirmado.</p>
          </div>
        </div>
      </div>

      {/* Botão cancelar */}
      <div className="text-center">
        <button
          onClick={onCancel}
          className="px-6 py-3 text-theme-secondary hover:text-theme-primary transition-colors font-medium hover:bg-theme-hover rounded-xl"
        >
          Cancelar pagamento
        </button>
      </div>
    </div>
  )
} 