'use client'

import { useState, useEffect } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { normalizeEmail } from '@/lib/utils'
import Image from 'next/image'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess?: () => void // Adicionando a propriedade opcional
}

type AuthMode = 'login' | 'signup' | 'forgotPassword'

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const { signIn, initialAuthMode } = useAuth()
  const [mode, setMode] = useState<AuthMode>(initialAuthMode)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
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
      const result = await signIn(provider, { 
        callbackUrl: '/',
        source: 'website'
      })
      if (result?.error) {
        setAuthError(`Erro ao fazer login com ${provider}`)
      }
    } catch (error) {
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
      onAuthSuccess?.() // Chama onAuthSuccess se existir
    }
      } else { // signup
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: normalizedEmail,
            password: formData.password,
            name: normalizedEmail.split('@')[0],
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
            onAuthSuccess?.() // Chama onAuthSuccess se existir
          }
        }
      }
    } catch (error) {
      setAuthError('Ocorreu um erro. Tente novamente.')
    }
    
    setIsLoading(false)
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      setMode(initialAuthMode); // Atualiza o modo quando o modal abre
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, initialAuthMode])

  if (!isOpen) return null

  const renderSignupForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-900">Crie sua Conta</h2>
      <p className="text-center text-gray-600 mb-8">Rápido e fácil, vamos começar.</p>
      
      <div className="flex flex-col gap-4 mb-4">
        <button 
          onClick={() => handleSocialLogin('google')} 
          disabled={isLoading} 
          className="flex items-center justify-center gap-3 w-full bg-white border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition-all duration-300 ease-in-out shadow-sm"
        >
          <Image src="/imgs/icons/google.png" alt="Google" width={24} height={24} />
          <span className="text-gray-800 font-semibold">Continuar com Google</span>
        </button>
      </div>

      <div className="flex items-center my-6">
        <hr className="w-full border-gray-200" />
        <span className="px-3 text-gray-400 text-xs font-medium">OU</span>
        <hr className="w-full border-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-200 text-gray-900"
            placeholder="seuemail@exemplo.com"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Senha</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-200 text-gray-900"
              placeholder="Mínimo 6 caracteres"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        
        {authError && <p className="text-red-600 text-sm text-center font-medium py-2">{authError}</p>}

        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-all duration-300 ease-in-out disabled:bg-red-400 disabled:cursor-not-allowed transform hover:scale-[1.02] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          {isLoading ? 'Criando conta...' : 'Criar Conta'}
        </button>
      </form>
      
      <p className="text-center text-sm text-gray-600 mt-8">
        Já possui uma conta?{' '}
        <button onClick={() => setMode('login')} className="text-red-600 font-semibold hover:text-red-700 transition-colors">
          Entrar
        </button>
      </p>
    </>
  )

  const renderLoginForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-900">Acesse sua Conta</h2>
      <p className="text-center text-gray-600 mb-8">Bem-vindo de volta! Faça login para continuar.</p>
      
      <div className="flex flex-col gap-4 mb-4">
        <button 
          onClick={() => handleSocialLogin('google')} 
          disabled={isLoading} 
          className="flex items-center justify-center gap-3 w-full bg-white border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition-all duration-300 ease-in-out shadow-sm"
        >
          <Image src="/imgs/icons/google.png" alt="Google" width={24} height={24} />
          <span className="text-gray-800 font-semibold">Continuar com Google</span>
        </button>
      </div>

      <div className="flex items-center my-6">
        <hr className="w-full border-gray-200" />
        <span className="px-3 text-gray-400 text-xs font-medium">OU</span>
        <hr className="w-full border-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-200 text-gray-900"
            placeholder="seuemail@exemplo.com"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Senha</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-200 text-gray-900"
              placeholder="Digite sua senha"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="text-right mt-2">
            <button type="button" onClick={() => { setMode('forgotPassword'); setAuthError(''); setForgotPasswordError(''); setForgotPasswordMessage(''); }} className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors">
              Esqueceu a senha?
            </button>
          </div>
        </div>
        
        {authError && <p className="text-red-600 text-sm text-center font-medium py-2">{authError}</p>}

        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-all duration-300 ease-in-out disabled:bg-red-400 disabled:cursor-not-allowed transform hover:scale-[1.02] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      
      <p className="text-center text-sm text-gray-600 mt-8">
        Não tem uma conta?{' '}
        <button onClick={() => setMode('signup')} className="text-red-600 font-semibold hover:text-red-700 transition-colors">
          Cadastre-se
        </button>
      </p>
    </>
  )

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
        setForgotPasswordMessage('Se um email válido foi fornecido, um link de recuperação de senha foi enviado para sua caixa de entrada.')
        setForgotPasswordEmail('') // Limpa o campo de email
      }
    } catch (error) {
      setForgotPasswordError('Ocorreu um erro. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderForgotPasswordForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-900">Recuperar Senha</h2>
      <p className="text-center text-gray-600 mb-8">Informe seu email para receber um link de recuperação.</p>
      
      <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
          <input
            type="email"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(normalizeEmail(e.target.value))}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-200 text-gray-900"
            placeholder="seuemail@exemplo.com"
            required
          />
        </div>
        
        {forgotPasswordError && <p className="text-red-600 text-sm text-center font-medium py-2">{forgotPasswordError}</p>}
        {forgotPasswordMessage && <p className="text-green-600 text-sm text-center font-medium py-2">{forgotPasswordMessage}</p>}

        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-all duration-300 ease-in-out disabled:bg-red-400 disabled:cursor-not-allowed transform hover:scale-[1.02] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
        </button>
      </form>
      
      <p className="text-center text-sm text-gray-600 mt-8">
        Lembrou da senha?{' '}
        <button onClick={() => { setMode('login'); setForgotPasswordError(''); setForgotPasswordMessage(''); }} className="text-red-600 font-semibold hover:text-red-700 transition-colors">
          Fazer Login
        </button>
      </p>
    </>
  )

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 z-50 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[95vh] overflow-y-auto relative p-10 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors z-10 rounded-full p-1 hover:bg-gray-100"
            aria-label="Fechar modal"
          >
            <X size={22} />
          </button>
          
          {mode === 'signup' ? renderSignupForm() : mode === 'login' ? renderLoginForm() : renderForgotPasswordForm()}
        </div>
      </div>
    </>
  )
}
