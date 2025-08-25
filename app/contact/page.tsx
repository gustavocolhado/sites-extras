'use client'

import { useState } from 'react'
import { Send, MessageCircle, Mail, Phone, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import SEOHead from '@/components/SEOHead'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
    if (success) setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    // Validações básicas
    if (!formData.name || !formData.email || !formData.message) {
      setError('Por favor, preencha todos os campos obrigatórios')
      setIsLoading(false)
      return
    }

    if (!formData.email.includes('@')) {
      setError('Por favor, insira um email válido')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao enviar mensagem')
      } else {
        setSuccess(true)
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        })
      }
    } catch (error) {
      setError('Erro ao enviar mensagem. Tente novamente.')
    }

    setIsLoading(false)
  }

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
        description="Entre em contato conosco para suporte, dúvidas ou parcerias. Suporte 24/7 via Telegram e formulário de contato."
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
                Estamos aqui para ajudar! Entre em contato conosco para suporte, 
                dúvidas, parcerias ou qualquer outra questão.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Formulário de Contato */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-theme-primary mb-6">
                  Envie uma Mensagem
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-500 text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <p className="text-green-500 text-sm">
                          Mensagem enviada com sucesso! Entraremos em contato em breve.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-theme-primary text-sm font-medium mb-2">
                        Nome *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-3 theme-input rounded-lg"
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-theme-primary text-sm font-medium mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 theme-input rounded-lg"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-theme-primary text-sm font-medium mb-2">
                      Assunto
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="w-full px-4 py-3 theme-input rounded-lg"
                      placeholder="Qual o motivo do contato?"
                    />
                  </div>

                  <div>
                    <label className="block text-theme-primary text-sm font-medium mb-2">
                      Mensagem *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 theme-input rounded-lg resize-none"
                      placeholder="Descreva sua dúvida, sugestão ou solicitação..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-accent-red hover:bg-accent-red-hover disabled:bg-accent-red/50 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        <span>Enviar Mensagem</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Informações de Contato */}
              <div className="space-y-8">
                {/* Telegram Card */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-8 text-white">
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

                {/* Informações de Contato */}
                <div className="bg-theme-card rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-theme-primary mb-6">
                    Informações de Contato
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-accent-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-accent-red" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-theme-primary">Email</h4>
                        <p className="text-theme-secondary">contato@cornosbrasil.com</p>
                        <p className="text-sm text-theme-secondary">Resposta em até 24h</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-accent-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-5 h-5 text-accent-red" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-theme-primary">Telegram</h4>
                        <p className="text-theme-secondary">@SuporteAssinante</p>
                        <p className="text-sm text-theme-secondary">Resposta em até 5 min</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-accent-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-accent-red" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-theme-primary">Horário de Atendimento</h4>
                        <p className="text-theme-secondary">24 horas por dia, 7 dias por semana</p>
                        <p className="text-sm text-theme-secondary">Suporte técnico disponível</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ Rápido */}
                <div className="bg-theme-card rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-theme-primary mb-6">
                    Perguntas Frequentes
                  </h3>

                  <div className="space-y-4">
                    <div className="border-b border-theme-border-primary pb-4">
                      <h4 className="font-semibold text-theme-primary mb-2">
                        Como criar uma conta?
                      </h4>
                      <p className="text-theme-secondary text-sm">
                        Clique em "Criar Conta" no cabeçalho do site e siga as instruções.
                      </p>
                    </div>

                    <div className="border-b border-theme-border-primary pb-4">
                      <h4 className="font-semibold text-theme-primary mb-2">
                        Esqueci minha senha, o que fazer?
                      </h4>
                      <p className="text-theme-secondary text-sm">
                        Clique em "Esqueceu sua senha?" na página de login para recuperar.
                      </p>
                    </div>

                    <div className="border-b border-theme-border-primary pb-4">
                      <h4 className="font-semibold text-theme-primary mb-2">
                        Como funciona o plano Premium?
                      </h4>
                      <p className="text-theme-secondary text-sm">
                        O plano Premium oferece acesso exclusivo a conteúdo especial e sem anúncios.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-theme-primary mb-2">
                        Posso fazer parceria com o site?
                      </h4>
                      <p className="text-theme-secondary text-sm">
                        Sim! Entre em contato conosco para discutir oportunidades de parceria.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
} 