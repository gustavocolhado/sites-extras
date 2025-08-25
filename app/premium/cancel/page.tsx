'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  XCircle, 
  ArrowLeft, 
  RefreshCw, 
  Home,
  HelpCircle,
  Mail
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PremiumCancelPage() {
  const router = useRouter()
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-theme-primary">
      <Header />
      
      <div className="flex items-center justify-center p-4 pt-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Cancel Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <XCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Cancel Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-theme-primary mb-6">
            Pagamento Cancelado
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-theme-primary mb-4">
            Não se preocupe!
          </h2>
          <p className="text-lg text-theme-secondary mb-8 max-w-md mx-auto">
            O pagamento foi cancelado. Você pode tentar novamente a qualquer momento ou escolher outro método de pagamento.
          </p>

          {/* Why Cancel */}
          <div className="bg-theme-card rounded-2xl p-8 shadow-xl mb-8 border border-theme-border-primary">
            <h3 className="text-xl font-semibold text-theme-primary mb-6">
              Por que o pagamento foi cancelado?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-primary mb-1">Decisão sua</h4>
                  <p className="text-sm text-theme-secondary">Você cancelou o processo de pagamento</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600 dark:text-green-400 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-primary mb-1">Problema técnico</h4>
                  <p className="text-sm text-theme-secondary">Alguma falha no processamento</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-primary mb-1">Dados inválidos</h4>
                  <p className="text-sm text-theme-secondary">Informações do cartão incorretas</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-600 dark:text-orange-400 font-semibold text-sm">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-primary mb-1">Limite insuficiente</h4>
                  <p className="text-sm text-theme-secondary">Saldo ou limite do cartão</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/premium')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Tentar Novamente</span>
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/')}
                className="w-full bg-theme-hover text-theme-primary py-3 px-6 rounded-xl font-medium hover:bg-theme-border-primary transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Voltar ao Início</span>
              </button>
              
              <button
                onClick={() => router.push('/videos')}
                className="w-full bg-theme-hover text-theme-primary py-3 px-6 rounded-xl font-medium hover:bg-theme-border-primary transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ver Vídeos Gratuitos</span>
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-12 bg-theme-card rounded-2xl p-6 shadow-lg border border-theme-border-primary">
            <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center justify-center space-x-2">
              <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Precisa de ajuda?</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <h4 className="font-semibold text-theme-primary mb-2">Suporte Técnico</h4>
                <p className="text-sm text-theme-secondary mb-3">Problemas com pagamento</p>
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                  Falar com suporte
                </button>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                <h4 className="font-semibold text-theme-primary mb-2">Email de Suporte</h4>
                <p className="text-sm text-theme-secondary mb-3">Envie suas dúvidas</p>
                <button className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium flex items-center justify-center space-x-1 mx-auto">
                  <Mail className="w-4 h-4" />
                  <span>Enviar email</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Info */}
          {session?.user && (
            <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl">
              <p className="text-sm text-theme-secondary">
                Olá <span className="font-semibold text-theme-primary">{session.user.name}</span>, 
                estamos aqui para ajudar! 💪
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
} 