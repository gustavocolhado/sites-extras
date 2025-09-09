'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, ExternalLink } from 'lucide-react'

export default function TrackPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const trackClick = async () => {
      try {
        const trackingId = params.trackingId as string

        if (!trackingId) {
          setError('Link inválido')
          setIsLoading(false)
          return
        }

        // Rastrear o clique
        const response = await fetch('/api/track/click', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trackingId,
            userAgent: navigator.userAgent,
            referrer: document.referrer,
          }),
        })

        if (!response.ok) {
          throw new Error('Erro ao rastrear clique')
        }

        const data = await response.json()

        if (data.success && data.redirectUrl) {
          // Redirecionar para a URL original
          window.location.href = data.redirectUrl
        } else {
          setError('Link não encontrado')
        }

      } catch (error) {
        console.error('Erro ao rastrear clique:', error)
        setError('Erro ao processar link')
      } finally {
        setIsLoading(false)
      }
    }

    trackClick()
  }, [params.trackingId])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Link Inválido
            </h1>
            <p className="text-gray-300 mb-6">
              {error}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-accent-red hover:bg-accent-red-hover text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Redirecionando...
          </h1>
          <p className="text-gray-300">
            Aguarde enquanto você é redirecionado para a página desejada.
          </p>
        </div>
      </div>
    </div>
  )
}
