'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import SEOHead from '@/components/SEOHead'
import { HelpCircle, ChevronDown, ChevronUp, Search, Users, CreditCard, Shield, MessageCircle } from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  // Conta e Registro
  {
    id: 'account-1',
    question: 'Como criar uma conta no CORNOS BRASIL?',
    answer: 'Para criar uma conta, clique em "Criar Conta" no cabeçalho do site. Você pode se registrar usando seu email e senha, ou fazer login com sua conta do Google. O processo é rápido e gratuito.',
    category: 'conta'
  },
  {
    id: 'account-2',
    question: 'Esqueci minha senha, o que fazer?',
    answer: 'Clique em "Esqueceu sua senha?" na página de login. Digite seu email e você receberá um link para redefinir sua senha. O link é válido por 1 hora.',
    category: 'conta'
  },
  {
    id: 'account-3',
    question: 'Posso usar a mesma conta em múltiplos dispositivos?',
    answer: 'Sim! Você pode acessar sua conta de qualquer dispositivo. Apenas certifique-se de fazer logout quando usar dispositivos compartilhados.',
    category: 'conta'
  },
  {
    id: 'account-4',
    question: 'Como excluir minha conta?',
    answer: 'Para excluir sua conta, entre em contato conosco através da página de contato. Processaremos sua solicitação em até 30 dias.',
    category: 'conta'
  },

  // Serviços Premium
  {
    id: 'premium-1',
    question: 'O que inclui o plano Premium?',
    answer: 'O plano Premium oferece acesso exclusivo a conteúdo especial, sem anúncios, qualidade de vídeo superior, downloads e funcionalidades avançadas.',
    category: 'premium'
  },
  {
    id: 'premium-2',
    question: 'Como cancelar minha assinatura Premium?',
    answer: 'Você pode cancelar sua assinatura a qualquer momento através de sua conta. O acesso Premium continuará até o final do período pago.',
    category: 'premium'
  },
  {
    id: 'premium-3',
    question: 'Posso solicitar reembolso?',
    answer: 'Sim, reembolsos são avaliados caso a caso. Entre em contato conosco dentro de 7 dias da compra para solicitar um reembolso.',
    category: 'premium'
  },
  {
    id: 'premium-4',
    question: 'Quais formas de pagamento são aceitas?',
    answer: 'Aceitamos cartões de crédito, PIX, boleto bancário e outras formas de pagamento populares no Brasil. Todos os pagamentos são processados de forma segura.',
    category: 'premium'
  },

  // Conteúdo
  {
    id: 'content-1',
    question: 'Posso baixar vídeos do site?',
    answer: 'Downloads estão disponíveis apenas para usuários Premium. O conteúdo é para uso pessoal e não pode ser redistribuído.',
    category: 'conteudo'
  },
  {
    id: 'content-2',
    question: 'Como reportar conteúdo inadequado?',
    answer: 'Se encontrar conteúdo inadequado, use o botão "Reportar" próximo ao vídeo ou entre em contato conosco. Analisaremos cada denúncia.',
    category: 'conteudo'
  },
  {
    id: 'content-3',
    question: 'Posso fazer upload de vídeos?',
    answer: 'Atualmente, apenas criadores autorizados podem fazer upload de conteúdo. Entre em contato conosco se você é um criador interessado.',
    category: 'conteudo'
  },
  {
    id: 'content-4',
    question: 'O conteúdo é atualizado regularmente?',
    answer: 'Sim! Adicionamos novo conteúdo regularmente. Usuários Premium têm acesso antecipado a novos vídeos.',
    category: 'conteudo'
  },

  // Suporte e Contato
  {
    id: 'support-1',
    question: 'Como entrar em contato com o suporte?',
    answer: 'Você pode nos contatar através da página de contato, email ou Telegram. Nossa equipe responde em até 24 horas.',
    category: 'suporte'
  },
  {
    id: 'support-2',
    question: 'Qual o horário de atendimento?',
    answer: 'Nosso suporte está disponível 24 horas por dia, 7 dias por semana. Para suporte rápido, use nosso Telegram.',
    category: 'suporte'
  },
  {
    id: 'support-3',
    question: 'Posso fazer parceria com o site?',
    answer: 'Sim! Estamos sempre abertos a parcerias. Entre em contato conosco para discutir oportunidades de colaboração.',
    category: 'suporte'
  },
  {
    id: 'support-4',
    question: 'Como reportar um bug ou problema técnico?',
    answer: 'Para reportar problemas técnicos, use nossa página de contato ou envie um email detalhando o problema. Inclua screenshots se possível.',
    category: 'suporte'
  },

  // Privacidade e Segurança
  {
    id: 'privacy-1',
    question: 'Minhas informações estão seguras?',
    answer: 'Sim! Implementamos medidas de segurança robustas, incluindo criptografia SSL, senhas hasheadas e monitoramento contínuo.',
    category: 'privacidade'
  },
  {
    id: 'privacy-2',
    question: 'Vocês vendem meus dados?',
    answer: 'Não! Nunca vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto quando exigido por lei.',
    category: 'privacidade'
  },
  {
    id: 'privacy-3',
    question: 'Como posso exercer meus direitos LGPD?',
    answer: 'Para exercer seus direitos (acesso, correção, exclusão, etc.), envie um email para privacy@cornosbrasil.com. Responderemos em até 15 dias.',
    category: 'privacidade'
  },
  {
    id: 'privacy-4',
    question: 'Vocês usam cookies?',
    answer: 'Sim, usamos cookies essenciais para o funcionamento do site e cookies de analytics para melhorar sua experiência. Você pode controlar cookies nas configurações do navegador.',
    category: 'privacidade'
  }
]

const categories = [
  { id: 'todos', name: 'Todas as Perguntas', icon: HelpCircle },
  { id: 'conta', name: 'Conta e Registro', icon: Users },
  { id: 'premium', name: 'Serviços Premium', icon: CreditCard },
  { id: 'conteudo', name: 'Conteúdo', icon: MessageCircle },
  { id: 'suporte', name: 'Suporte e Contato', icon: MessageCircle },
  { id: 'privacidade', name: 'Privacidade e Segurança', icon: Shield }
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'todos' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <SEOHead 
        title="FAQ - CORNOS BRASIL | Perguntas Frequentes"
        description="Perguntas frequentes sobre o CORNOS BRASIL. Encontre respostas para dúvidas sobre conta, Premium, conteúdo e mais."
        keywords={['faq', 'perguntas frequentes', 'ajuda', 'suporte', 'cornos brasil']}
      />
      
      <Layout>
        <Header />
        
        <div className="min-h-screen bg-gradient-to-br from-theme-background to-theme-card">
          <div className="container-content py-16">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="w-10 h-10 text-purple-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-theme-primary mb-4">
                Perguntas Frequentes
              </h1>
              <p className="text-xl text-theme-secondary max-w-3xl mx-auto">
                Encontre respostas para as dúvidas mais comuns sobre o CORNOS BRASIL
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* Busca */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8 mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-theme-secondary w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar perguntas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 theme-input rounded-lg"
                  />
                </div>
              </div>

              {/* Categorias */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-theme-primary mb-6">Categorias</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`p-4 rounded-lg border transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-accent-red text-white border-accent-red'
                            : 'bg-theme-card border-theme-border-primary text-theme-primary hover:border-accent-red'
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-xs font-medium">{category.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Resultados */}
              <div className="space-y-4">
                {filteredFAQ.length === 0 ? (
                  <div className="bg-theme-card rounded-xl shadow-xl p-8 text-center">
                    <HelpCircle className="w-16 h-16 text-theme-secondary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-theme-primary mb-2">
                      Nenhuma pergunta encontrada
                    </h3>
                    <p className="text-theme-secondary mb-6">
                      Tente ajustar sua busca ou selecionar uma categoria diferente.
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory('todos')
                      }}
                      className="bg-accent-red hover:bg-accent-red-hover text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                ) : (
                  filteredFAQ.map((item) => (
                    <div key={item.id} className="bg-theme-card rounded-xl shadow-xl overflow-hidden">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-theme-background transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-theme-primary pr-4">
                          {item.question}
                        </h3>
                        {openItems.includes(item.id) ? (
                          <ChevronUp className="w-5 h-5 text-theme-secondary flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-theme-secondary flex-shrink-0" />
                        )}
                      </button>
                      
                      {openItems.includes(item.id) && (
                        <div className="px-6 pb-6">
                          <div className="border-t border-theme-border-primary pt-4">
                            <p className="text-theme-secondary leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Contato */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8 mt-12 text-center">
                <h2 className="text-3xl font-bold text-theme-primary mb-6">
                  Não encontrou o que procurava?
                </h2>
                <p className="text-theme-secondary mb-6 max-w-2xl mx-auto">
                  Se sua dúvida não foi respondida aqui, nossa equipe está pronta para ajudar. 
                  Entre em contato conosco e responderemos o mais breve possível.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/contact"
                    className="inline-flex items-center space-x-2 bg-accent-red hover:bg-accent-red-hover text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    <MessageCircle size={20} />
                    <span>Entrar em Contato</span>
                  </a>
                  <a 
                    href="/support"
                    className="inline-flex items-center space-x-2 border border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    <span>Central de Suporte</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
} 