'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import AuthModal from '@/components/AuthModal'
import { useAuth } from '@/contexts/AuthContext'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { openAuthModal } = useAuth()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Token de redefinição inválido ou expirado')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validações
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao redefinir senha')
      } else {
        setSuccess(true)
        // Abre o modal de login após 2 segundos
        setTimeout(() => {
          setIsModalOpen(true)
        }, 2000)
      }
    } catch (error) {
      setError('Erro ao redefinir senha. Tente novamente.')
    }

    setIsLoading(false)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    router.push('/')
  }

  if (!token) {
    return (
      <Layout>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-theme-background to-theme-card">
          <div className="max-w-md w-full mx-4">
            <div className="bg-theme-card rounded-lg shadow-xl p-8">
              <div className="text-center">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-theme-primary mb-2">
                  Token Inválido
                </h1>
                <p className="text-theme-secondary mb-6">
                  O link de redefinição de senha é inválido ou expirou.
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="bg-accent-red hover:bg-accent-red-hover text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Voltar ao Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (success) {
    return (
      <Layout>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-theme-background to-theme-card">
          <div className="max-w-md w-full mx-4">
            <div className="bg-theme-card rounded-lg shadow-xl p-8">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-theme-primary mb-2">
                  Senha Redefinida!
                </h1>
                <p className="text-theme-secondary mb-6">
                  Sua senha foi redefinida com sucesso. Você será redirecionado para o login.
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-accent-red border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-theme-secondary">Redirecionando...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Login */}
        <AuthModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-theme-background to-theme-card">
        <div className="max-w-md w-full mx-4">
          <div className="bg-theme-card rounded-lg shadow-xl p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-theme-primary mb-2">
                Redefinir Senha
              </h1>
              <p className="text-theme-secondary">
                Digite sua nova senha abaixo
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-theme-primary text-sm font-medium mb-2">
                  Nova Senha:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 theme-input rounded-lg pr-12"
                    placeholder="Digite sua nova senha"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-secondary hover:text-theme-primary"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-theme-secondary text-xs mt-1">
                  Mínimo 6 caracteres
                </p>
              </div>

              <div>
                <label className="block text-theme-primary text-sm font-medium mb-2">
                  Confirmar Senha:
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 theme-input rounded-lg pr-12"
                    placeholder="Confirme sua nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-secondary hover:text-theme-primary"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent-red hover:bg-accent-red-hover disabled:bg-accent-red/50 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Redefinindo...</span>
                  </div>
                ) : (
                  'Redefinir Senha'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="flex items-center justify-center space-x-2 text-accent-red hover:underline text-sm mx-auto"
                >
                  <ArrowLeft size={16} />
                  <span>Voltar ao login</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Layout>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-theme-background to-theme-card">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
            <p className="text-theme-secondary">Carregando...</p>
          </div>
        </div>
      </Layout>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
} 