'use client'

import { MessageCircle } from 'lucide-react'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import SEOHead from '@/components/SEOHead'

export default function ContactPage() {
  const handleTelegramClick = () => {
    // Substitua pelo seu username do Telegram
    const telegramUsername = 'SuporteAssinante'
    const message = encodeURIComponent('Olá! Preciso de ajuda com o CORNOS BRASIL.')
    window.open(`https://t.me/${telegramUsername}?text=${message}`, '_blank')
  }

  return (
    <>
      <SEOHead 
        title="Contato - CORNOS BRASIL | Suporte e Ajuda"
        description="Entre em contato conosco para suporte e dúvidas. Nosso suporte é 24/7 via Telegram."
        keywords={['contato', 'suporte', 'ajuda', 'telegram', 'cornos brasil']}
      />
      
      <Layout>
        <Header />
        
        <div className="min-h-screen bg-gradient-to-br from-theme-background to-theme-card">
          {/* Hero Section */}
          <div className="container-content py-16">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold text-theme-primary mb-4">
                Entre em Contato
              </h1>
              <p className="text-xl text-theme-secondary max-w-2xl mx-auto">
                Estamos aqui para ajudar! Entre em contato conosco para suporte e dúvidas.
                Nosso suporte é 24/7 via Telegram.
              </p>
            </div>

            <div className="grid lg:grid-cols-1 gap-12 justify-items-center">
              {/* Telegram Card */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-8 text-white max-w-md w-full">
                <div className="flex items-center space-x-4 mb-4">
                  <MessageCircle size={32} />
                  <h3 className="text-2xl font-bold">Suporte via Telegram</h3>
                </div>
                <p className="text-blue-100 mb-6">
                  Para suporte rápido e direto, fale conosco no Telegram. 
                  Resposta em até 5 minutos!
                </p>
                <button
                  onClick={handleTelegramClick}
                  className="w-full bg-white text-blue-600 font-bold py-4 px-6 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle size={20} />
                  <span>Falar no Telegram</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
