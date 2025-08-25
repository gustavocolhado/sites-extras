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
        setPixData(data)
        
        // Calcular tempo restante
        const expiresAt = new Date(data.expires_at).getTime()
        const now = Date.now()
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000))
        setTimeLeft(remaining)
      } catch (err) {
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

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch('/api/premium/check-payment-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ preferenceId }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.status === 'approved') {
            setPaymentStatus('approved')
            setTimeout(() => onSuccess(), 2000)
          } else if (data.status === 'rejected') {
            setPaymentStatus('rejected')
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error)
      }
    }

    // Verificar a cada 5 segundos
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
          <img
            src={`data:image/png;base64,${pixData.qr_code_base64}`}
            alt="QR Code PIX"
            className="w-56 h-56"
          />
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
            value={pixData.qr_code}
            readOnly
            className="flex-1 px-4 py-3 border border-theme-border-primary rounded-l-xl bg-theme-hover text-sm font-mono text-theme-primary"
          />
          <button
            onClick={copyPixCode}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-r-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
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
            Verificando status automaticamente
          </p>
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