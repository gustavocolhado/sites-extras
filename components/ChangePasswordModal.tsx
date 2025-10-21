'use client'

import { useState } from 'react'
import { X, KeyRound, CheckCircle, AlertCircle } from 'lucide-react'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmNewPassword) {
      setError('As novas senhas não coincidem.')
      return
    }
    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível alterar a senha.')
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setNewPassword('')
        setConfirmNewPassword('')
        setSuccess(false)
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
              <h2 className="text-2xl font-bold text-white mb-2">Senha Alterada!</h2>
              <p className="text-neutral-300">Sua senha foi alterada com sucesso.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <KeyRound className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Alterar Senha</h2>
                <p className="text-neutral-400">Mantenha sua conta segura com uma nova senha.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-1 block">Nova Senha</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400 mb-1 block">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Repita a nova senha"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center space-x-2 text-red-400 text-sm text-center justify-center">
                    <AlertCircle size={16} />
                    <p>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all duration-300 disabled:bg-red-400"
                >
                  {isLoading ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}
