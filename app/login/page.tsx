'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import AuthModal from '@/components/AuthModal'
import { useState } from 'react'

export default function LoginPage() {
  const { session, status } = useAuth()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Se já está logado, redireciona para home
    if (status === 'authenticated' && session) {
      router.push('/')
      return
    }

    // Se não está carregando e não está logado, abre o modal
    if (status === 'unauthenticated') {
      setIsModalOpen(true)
    }
  }, [status, session, router])

  const handleCloseModal = () => {
    setIsModalOpen(false)
    // Redireciona para home após fechar o modal
    router.push('/')
  }

  // Se está carregando, mostra loading
  if (status === 'loading') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-accent-red border-t-transparent rounded-full animate-spin"></div>
            <span className="text-theme-primary">Carregando...</span>
          </div>
        </div>
      </Layout>
    )
  }

  // Se já está logado, mostra loading até redirecionar
  if (status === 'authenticated') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-accent-red border-t-transparent rounded-full animate-spin"></div>
            <span className="text-theme-primary">Redirecionando...</span>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Header />
      
      {/* Conteúdo da página (opcional) */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-theme-background to-theme-card">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-theme-primary mb-4">
            Bem-vindo ao CORNOS BRASIL
          </h1>
          <p className="text-theme-secondary text-lg mb-8">
            Faça login para acessar seu conteúdo exclusivo
          </p>
          
          {/* Botão para abrir modal manualmente (caso não abra automaticamente) */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-accent-red hover:bg-accent-red-hover text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>

      {/* Modal de Autenticação */}
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
      />
    </Layout>
  )
} 