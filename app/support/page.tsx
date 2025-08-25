'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import SEOHead from '@/components/SEOHead'

export default function SupportPage() {
  const router = useRouter()

  useEffect(() => {
    // Redireciona para a página de contato após 2 segundos
    const timer = setTimeout(() => {
      router.push('/contact')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <>
      <SEOHead 
        title="Suporte - CORNOS BRASIL | Central de Ajuda"
        description="Central de suporte e ajuda do CORNOS BRASIL. Redirecionando para nossa página de contato."
        keywords={['suporte', 'ajuda', 'contato', 'cornos brasil']}
      />
      
      <Layout>
        <Header />
        
        <div className="min-h-screen bg-gradient-to-br from-theme-background to-theme-card flex items-center justify-center">
          <div className="text-center max-w-md mx-4">
            <div className="bg-theme-card rounded-xl shadow-xl p-8">
              <div className="w-16 h-16 bg-accent-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h1 className="text-2xl font-bold text-theme-primary mb-4">
                Central de Suporte
              </h1>
              
              <p className="text-theme-secondary mb-6">
                Redirecionando você para nossa página de contato onde poderá encontrar 
                todas as opções de suporte disponíveis.
              </p>
              
              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="w-4 h-4 border-2 border-accent-red border-t-transparent rounded-full animate-spin"></div>
                <span className="text-theme-secondary">Redirecionando...</span>
              </div>
              
              <button
                onClick={() => router.push('/contact')}
                className="w-full bg-accent-red hover:bg-accent-red-hover text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Ir para Contato
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
} 