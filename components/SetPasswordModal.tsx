'use client'

import { useState } from 'react'
import { X, KeyRound, CheckCircle } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface SetPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
}

export default function SetPasswordModal({ isOpen, onClose, userEmail }: SetPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível definir a senha.')
      }

      setSuccess(true)
      // Aguarda um pouco para o usuário ver a mensagem de sucesso e depois fecha
      setTimeout(() => {
        onClose()
        // Força um refresh da sessão para atualizar o estado do usuário
        window.location.reload();
      }, 2000)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-80 z-50" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-lg w-full max-w-md relative p-8">
          {!success && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors z-10"
              aria-label="Fechar modal"
            >
              <X size={22} />
            </button>
          )}

          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Senha Definida!</h2>
              <p className="text-neutral-300">Sua conta está pronta. Aproveite o conteúdo!</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <KeyRound className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo! Defina sua Senha</h2>
                <p className="text-neutral-400">Para proteger sua conta, por favor, crie uma senha de acesso.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-1 block">Nova Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-1 block">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Repita a nova senha"
                    required
                  />
                </div>

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all duration-300 disabled:bg-red-400"
                >
                  {isLoading ? 'Salvando...' : 'Salvar Senha e Acessar'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}
