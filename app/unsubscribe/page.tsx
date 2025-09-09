'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Mail, User } from 'lucide-react'

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    alreadyUnsubscribed?: boolean
  } | null>(null)

  // Verificar se há email na URL
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
      handleUnsubscribe(emailParam)
    }
  }, [searchParams])

  const handleUnsubscribe = async (emailToUnsubscribe?: string) => {
    const emailToUse = emailToUnsubscribe || email
    
    if (!emailToUse) {
      setResult({
        success: false,
        message: 'Por favor, digite um email válido'
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToUse }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          alreadyUnsubscribed: data.alreadyUnsubscribed
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Erro ao processar solicitação'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro de conexão. Tente novamente.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Cancelar Emails Promocionais
            </h1>
            <p className="text-gray-300 text-sm">
              Remova seu email da nossa lista de promoções
            </p>
          </div>

          {/* Form */}
          {!result && (
            <form onSubmit={(e) => {
              e.preventDefault()
              handleUnsubscribe()
            }} className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Seu email:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Digite seu email"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processando...</span>
                  </div>
                ) : (
                  'Cancelar Emails Promocionais'
                )}
              </button>
            </form>
          )}

          {/* Result */}
          {result && (
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                result.success ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {result.success ? (
                  <CheckCircle className="w-8 h-8 text-green-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-400" />
                )}
              </div>

              <h2 className={`text-xl font-bold mb-2 ${
                result.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {result.success ? 'Sucesso!' : 'Erro'}
              </h2>

              <p className="text-gray-300 mb-6">
                {result.message}
              </p>

              {result.success && !result.alreadyUnsubscribed && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                  <p className="text-green-400 text-sm">
                    ✅ Você não receberá mais emails promocionais da nossa plataforma.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <a
                  href="/"
                  className="block w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Voltar ao Site
                </a>
                
                {!result.success && (
                  <button
                    onClick={() => {
                      setResult(null)
                      setEmail('')
                    }}
                    className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Tentar Novamente
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-gray-400 text-xs text-center">
              Se você mudar de ideia, pode reativar os emails promocionais nas configurações da sua conta.
            </p>
            <p className="text-gray-500 text-xs text-center mt-2">
              💡 Dica: Nossos emails contêm ofertas especiais como R$ 19,90 por apenas R$ 9,90!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
