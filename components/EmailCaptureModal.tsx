'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { X, Mail, ArrowRight } from 'lucide-react'
import { FaGoogle } from 'react-icons/fa'

interface EmailCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (email: string) => void
  isLoading: boolean
}

export default function EmailCaptureModal({ isOpen, onClose, onSubmit, isLoading }: EmailCaptureModalProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, insira um e-mail válido.')
      return
    }
    setError('')
    onSubmit(email)
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-75 z-50 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-lg w-full max-w-md max-h-[95vh] overflow-y-auto relative p-8 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors z-10 rounded-full p-1 hover:bg-neutral-800"
            aria-label="Fechar modal"
          >
            <X size={22} />
          </button>
          
          <div className="text-center">
            <Mail className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Informe seu E-mail</h2>
            <p className="text-neutral-400 mb-6">Você usará este e-mail para acessar sua conta após o pagamento.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email-capture" className="sr-only">Email</label>
              <div className="relative">
                <input
                  id="email-capture"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-200"
                  placeholder="seuemail@exemplo.com"
                  required
                />
              </div>
              {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-all duration-300 ease-in-out disabled:bg-red-400 disabled:cursor-not-allowed transform hover:scale-[1.02] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Aguarde...' : 'Continuar para Pagamento'}
              {!isLoading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-700"></div>
            </div>
            <div className="relative px-2 bg-neutral-900 text-sm text-neutral-400">
              OU
            </div>
          </div>

          <button
            onClick={() => signIn('google')}
            className="w-full bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-neutral-200 transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white flex items-center justify-center gap-3"
          >
            <FaGoogle />
            Continuar com Google
          </button>
        </div>
      </div>
    </>
  )
}
