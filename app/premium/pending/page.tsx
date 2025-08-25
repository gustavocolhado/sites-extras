'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Home,
  Mail,
  Phone
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PremiumPendingPage() {
  const router = useRouter()
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-theme-primary">
      <Header />
      
      <div className="flex items-center justify-center p-4 pt-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Pending Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
              <Clock className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Pending Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-theme-primary mb-6">
            Pagamento em Processamento
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-theme-primary mb-4">
            Aguarde um momento...
          </h2>
          <p className="text-lg text-theme-secondary mb-8 max-w-md mx-auto">
            Seu pagamento está sendo processado. Isso pode levar alguns minutos. 
            Você receberá uma confirmação assim que for aprovado.
          </p>

          {/* Status Information */}
          <div className="bg-theme-card rounded-2xl p-8 shadow-xl mb-8 border border-theme-border-primary">
            <h3 className="text-xl font-semibold text-theme-primary mb-6">
              Status do Pagamento
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-theme-primary">Em Processamento</h4>
                  <p className="text-sm text-theme-secondary">Aguardando confirmação do banco</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-theme-primary">Próximo Passo</h4>
                  <p className="text-sm text-theme-secondary">Aprovação automática em breve</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-theme-primary">Acesso Imediato</h4>
                  <p className="text-sm text-theme-secondary">Conteúdo liberado automaticamente</p>
                </div>
              </div>
            </div>
          </div>

          {/* What to Expect */}
          <div className="bg-theme-card rounded-2xl p-8 shadow-xl mb-8 border border-theme-border-primary">
            <h3 className="text-xl font-semibold text-theme-primary mb-6">
              O que esperar agora?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-primary mb-1">Confirmação por Email</h4>
                  <p className="text-sm text-theme-secondary">Receba a confirmação em alguns minutos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600 dark:text-green-400 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-primary mb-1">Acesso Liberado</h4>
                  <p className="text-sm text-theme-secondary">Conteúdo premium disponível automaticamente</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-primary mb-1">Notificação Push</h4>
                  <p className="text-sm text-theme-secondary">Alerta quando o pagamento for aprovado</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-600 dark:text-orange-400 font-semibold text-sm">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-theme-primary mb-1">Suporte Disponível</h4>
                  <p className="text-sm text-theme-secondary">Equipe pronta para ajudar se necessário</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/premium/success')}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Verificar Status</span>
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
                <RefreshCw className="w-4 h-4" />
                <span>Ver Vídeos Gratuitos</span>
              </button>
            </div>
          </div>

          {/* Support Section */}
          <div className="mt-12 bg-theme-card rounded-2xl p-6 shadow-lg border border-theme-border-primary">
            <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center justify-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span>Dúvidas sobre o pagamento?</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <h4 className="font-semibold text-theme-primary mb-2">Email</h4>
                <p className="text-sm text-theme-secondary mb-3">Resposta em até 2h</p>
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center justify-center space-x-1 mx-auto">
                  <Mail className="w-4 h-4" />
                  <span>Enviar email</span>
                </button>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                <h4 className="font-semibold text-theme-primary mb-2">WhatsApp</h4>
                <p className="text-sm text-theme-secondary mb-3">Resposta imediata</p>
                <button className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium flex items-center justify-center space-x-1 mx-auto">
                  <Phone className="w-4 h-4" />
                  <span>Conversar</span>
                </button>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl">
                <h4 className="font-semibold text-theme-primary mb-2">FAQ</h4>
                <p className="text-sm text-theme-secondary mb-3">Perguntas frequentes</p>
                <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium">
                  Ver perguntas
                </button>
              </div>
            </div>
          </div>

          {/* User Info */}
          {session?.user && (
            <div className="mt-8 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
              <p className="text-sm text-theme-secondary">
                Olá <span className="font-semibold text-theme-primary">{session.user.name}</span>, 
                seu pagamento está sendo processado com segurança! 🔒
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
} 