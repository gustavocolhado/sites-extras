'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { normalizeEmail } from '@/lib/utils'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess?: () => void
}

type AuthMode = 'login' | 'signup' | 'forgotPassword'

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const { signIn, initialAuthMode } = useAuth()
  const [mode, setMode] = useState<AuthMode>(initialAuthMode)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('')
  const [forgotPasswordError, setForgotPasswordError] = useState('')

  const handleInputChange = (field: string, value: string) => {
    const normalizedValue = field === 'email' ? normalizeEmail(value) : value
    setFormData(prev => ({ ...prev, [field]: normalizedValue }))
    setAuthError('')
  }

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    setAuthError('')
    try {
      const result = await signIn(provider, { callbackUrl: '/', source: 'website' })
      if (result?.error) setAuthError(`Erro ao fazer login com ${provider}`)
    } catch {
      setAuthError(`Erro ao fazer login com ${provider}`)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')

    if (mode === 'signup') {
      if (formData.password.length < 6) {
        setAuthError('A senha deve ter pelo menos 6 caracteres.')
        return
      }
    }

    setIsLoading(true)
    try {
      const normalizedEmail = normalizeEmail(formData.email)

      if (mode === 'login') {
        const result = await signIn('credentials', {
          email: normalizedEmail,
          password: formData.password,
          redirect: false,
          source: 'website'
        })
        if (result?.error) {
          setAuthError('Email ou senha incorretos.')
        } else {
          onClose()
          onAuthSuccess?.()
        }
      } else {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: normalizedEmail,
            password: formData.password,
            source: 'website',
            acceptPromotionalEmails: true,
            acceptTermsOfUse: true
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          setAuthError(data.error || 'Erro ao criar conta.')
        } else {
          const loginResult = await signIn('credentials', {
            email: normalizedEmail,
            password: formData.password,
            redirect: false,
            source: 'website'
          })
          if (loginResult?.error) {
            setAuthError('Conta criada, mas erro ao fazer login automático.')
          } else {
            onClose()
            onAuthSuccess?.()
          }
        }
      }
    } catch {
      setAuthError('Ocorreu um erro. Tente novamente.')
    }
    setIsLoading(false)
  }

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotPasswordError('')
    setForgotPasswordMessage('')
    setIsLoading(true)

    try {
      const normalizedEmail = normalizeEmail(forgotPasswordEmail)
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      const data = await response.json()
      if (!response.ok) {
        setForgotPasswordError(data.error || 'Erro ao solicitar recuperação de senha.')
      } else {
        setForgotPasswordMessage('Se um email válido foi fornecido, um link de recuperação foi enviado.')
        setForgotPasswordEmail('')
      }
    } catch {
      setForgotPasswordError('Ocorreu um erro. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      setMode(initialAuthMode)
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, initialAuthMode])

  if (!isOpen) return null

  const togglePassword = () => setShowPassword(prev => !prev)

  const renderSignupForm = () => (
    <>
      <p className="text-center text-gray-400 text-sm">
        Já possui uma conta? <button onClick={() => setMode('login')} className="text-white underline">Inicie sessão aqui</button>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Email */}
        <input
          type="email"
          placeholder="Introduza o seu e-mail"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full px-4 py-3 bg-white text-gray-900 rounded-sm text-sm placeholder-gray-500 focus:ring-2 focus:ring-white"
          required
        />

        {/* Senha */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Selecione a sua palavra-passe"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="w-full px-4 py-3 bg-white text-gray-900 rounded-sm text-sm placeholder-gray-500 focus:ring-2 focus:ring-white pr-12"
            required
          />
          <button type="button" onClick={togglePassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showPassword ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12(dtypeC3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 text-xs text-gray-400">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-white mt-0.5 rounded" required />
            <span>
              Ao inscrever-se, você concorda com os nossos 
              <a href="#" className="text-white underline">Termos de Serviço</a> e a nossa 
              <a href="#" className="text-white underline">Política de Privacidade</a>.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-white mt-0.5 rounded" />
            <span>Receba novidades, atualizações e ofertas da nossa parte.</span>
          </label>
        </div>

        {authError && <p className="text-red-600 text-sm text-center font-medium py-2">{authError}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-full text-sm transition"
        >
          {isLoading ? 'Criando conta...' : 'CRIAR A MINHA CONTA GRATUITA'}
        </button>

        <div className="flex items-center my-6 text-gray-500 text-xs">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="px-3">OU REGISTE-SE COM</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        <div className="flex justify-center gap-8">
          <button type="button" onClick={() => handleSocialLogin('google')}>
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
          </button>
        </div>
      </form>
    </>
  )

  const renderLoginForm = () => (
    <>
      <p className="text-center text-gray-400 text-sm">
        Não tem uma conta? <button onClick={() => setMode('signup')} className="text-white underline">Cadastre-se aqui</button>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Introduza o seu e-mail"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full px-4 py-3 bg-white text-gray-900 rounded-sm text-sm placeholder-gray-500 focus:ring-2 focus:ring-white"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Introduza a sua palavra-passe"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="w-full px-4 py-3 bg-white text-gray-900 rounded-sm text-sm placeholder-gray-500 focus:ring-2 focus:ring-white pr-12"
            required
          />
          <button type="button" onClick={togglePassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showPassword ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </>
              )}
            </svg>
          </button>
        </div>

        <div className="text-right">
          <button type="button" onClick={() => setMode('forgotPassword')} className="text-gray-400 hover:text-gray-300 text-sm">
            Esqueceu a palavra-passe?
          </button>
        </div>

        {authError && <p className="text-red-600 text-sm text-center font-medium py-2">{authError}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-full text-sm transition"
        >
          {isLoading ? 'Entrando...' : 'INICIAR SESSÃO'}
        </button>

        <div className="flex items-center my-6 text-gray-500 text-xs">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="px-3">OU INICIE SESSÃO COM</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        <div className="flex justify-center gap-8">
          <button type="button" onClick={() => handleSocialLogin('google')}>
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
          </button>
        </div>
      </form>
    </>
  )

  const renderForgotPasswordForm = () => (
    <>
      <p className="text-center text-gray-400 text-sm">
        Lembrou da senha? <button onClick={() => setMode('login')} className="text-white underline">Inicie sessão aqui</button>
      </p>

      <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Introduza o seu e-mail"
          value={forgotPasswordEmail}
          onChange={(e) => setForgotPasswordEmail(normalizeEmail(e.target.value))}
          className="w-full px-4 py-3 bg-white text-gray-900 rounded-sm text-sm placeholder-gray-500 focus:ring-2 focus:ring-white"
          required
        />

        {forgotPasswordError && <p className="text-red-600 text-sm text-center font-medium py-2">{forgotPasswordError}</p>}
        {forgotPasswordMessage && <p className="text-green-600 text-sm text-center font-medium py-2">{forgotPasswordMessage}</p>}

        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-full text-sm transition"
        >
          {isLoading ? 'Enviando...' : 'ENVIAR LINK DE RECUPERAÇÃO'}
        </button>
      </form>
    </>
  )

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 z-50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* MODAL CONTAINER */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
        <div className="relative w-full max-w-2xl bg-black border-[5px] border-gray-300 border-opacity-40">

          {/* BOTÃO X – FORA DO HEADER, NO TOPO DIREITO */}
          <button
            onClick={onClose}
            className="absolute -top-6 -right-3 bg-black rounded-full p-1 border-[2px] border-gray-400 text-white hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          {/* HEADER – SEM O BOTÃO X */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 text-sm w-full sm:w-auto">
              {/* Criar conta */}
              <button
                onClick={() => setMode('signup')}
                className={`
                  flex items-center gap-2 w-full sm:w-auto py-3 px-2
                  border-b border-gray-700 sm:border-b-0 justify-start
                  ${mode === 'signup' 
                    ? 'text-white font-medium sm:border-b-2 sm:border-white hover:bg-gray-600 rounded-sm' 
                    : 'text-gray-400 hover:text-gray-300'
                  } transition-colors
                `}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <span>Criar conta</span>
              </button>

              {/* Log in */}
              <button
                onClick={() => setMode('login')}
                className={`
                  flex items-center gap-1 w-full sm:w-auto py-3 px-2
                  border-b border-gray-700 sm:border-b-0 justify-start
                  ${mode === 'login' 
                    ? 'text-white font-medium sm:border-b-2 sm:border-white hover:bg-gray-600 rounded-sm' 
                    : 'text-gray-400 hover:text-gray-300'
                  } transition-colors
                `}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-4v-5h4v5zm-6-6H5V9h3l1-2h4l1 2h3v2z"/>
                </svg>
                <span>Log in</span>
              </button>

              {/* Esqueci-me */}
              <button
                onClick={() => setMode('forgotPassword')}
                className={`
                  flex items-center gap-1 w-full sm:w-auto py-3 px-2
                  ${mode === 'forgotPassword' 
                    ? 'text-white font-medium sm:border-b-2 sm:border-white hover:bg-gray-600 rounded-sm' 
                    : 'text-gray-400 hover:text-gray-300'
                  } transition-colors
                `}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Esqueci-me da palavra-passe</span>
              </button>
            </div>
          </div>

          {/* FORM CONTENT */}
          <div className="p-6 space-y-5">
            {mode === 'signup' ? renderSignupForm() : mode === 'login' ? renderLoginForm() : renderForgotPasswordForm()}
          </div>
        </div>
      </div>
    </>
  )
}