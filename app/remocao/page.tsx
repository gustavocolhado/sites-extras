'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Shield, Mail, AlertTriangle, FileText, User, Phone, MapPin, Calendar, CheckCircle } from 'lucide-react'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SEOHead from '@/components/SEOHead'

function RemocaoPageContent() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    urls: '',
    category: '',
    motivation: '',
    name: '',
    email: '',
    address: '',
    phone: '',
    date: '',
    signature: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Preencher formulário automaticamente se vier da página do vídeo
  useEffect(() => {
    const dataParam = searchParams.get('data')
    if (dataParam) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(dataParam))
        setFormData(prev => ({
          ...prev,
          urls: decodedData.urls || '',
          category: decodedData.category || '',
          motivation: decodedData.motivation || ''
        }))
      } catch (error) {
        console.error('Erro ao decodificar dados:', error)
      }
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/remocao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar solicitação')
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao enviar solicitação. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <>
        <SEOHead 
          title="Remoção de Conteúdo - Cornos Brasil"
          description="Solicite a remoção de conteúdo não autorizado. Respeitamos seus direitos e garantimos remoção em até 72 horas."
          keywords={['remoção de conteúdo', 'direitos autorais', 'privacidade', 'DMCA', 'Cornos Brasil']}
        />
        
        <Layout>
          <Header />
          
          <div className="min-h-screen bg-gradient-to-br from-theme-background via-theme-card to-theme-primary/5">
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-2xl mx-auto text-center">
                <div className="bg-theme-card rounded-2xl p-8 shadow-xl border border-theme-border-primary">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  
                  <h1 className="text-2xl font-bold text-theme-primary mb-4">
                    Relatório Enviado com Sucesso!
                  </h1>
                  
                  <p className="text-theme-secondary mb-6">
                    Recebemos sua solicitação de remoção de conteúdo. Analisaremos sua denúncia e entraremos em contato em breve.
                  </p>
                  
                  <div className="bg-theme-primary/10 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-theme-primary mb-2">Próximos Passos:</h3>
                    <ul className="text-sm text-theme-secondary space-y-1 text-left">
                      <li>• Você receberá um e-mail de confirmação</li>
                      <li>• Analisaremos sua denúncia em até 72 horas</li>
                      <li>• Entraremos em contato para esclarecimentos se necessário</li>
                      <li>• O conteúdo será removido se a denúncia for válida</li>
                    </ul>
                  </div>
                  
                  <a 
                    href="/"
                    className="inline-flex items-center px-6 py-3 bg-theme-primary text-white rounded-lg hover:bg-theme-primary/90 transition-colors"
                  >
                    Voltar ao Início
                  </a>
                </div>
              </div>
            </div>
          </div>
          
        </Layout>
      </>
    )
  }

  return (
    <>
      <SEOHead 
        title="Remoção de Conteúdo - Cornos Brasil"
        description="Solicite a remoção de conteúdo não autorizado. Respeitamos seus direitos e garantimos remoção em até 72 horas."
        keywords={['remoção de conteúdo', 'direitos autorais', 'privacidade', 'DMCA', 'Cornos Brasil']}
      />
      
      <Layout>
        <Header />
        
        <div className="min-h-screen bg-gradient-to-br from-theme-background via-theme-card to-theme-primary/5">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-red-500" />
              </div>
              
              <h1 className="text-4xl font-bold text-theme-primary mb-4">
                Remoção de Conteúdo
              </h1>
              
              <p className="text-theme-secondary text-lg max-w-3xl mx-auto">
                Todo o material presente em nosso site é adquirido de modelos e de sites que autorizam a compra e compartilhamento de conteúdos. 
                Além disso, também contratamos modelos para fornecer conteúdo exclusivo.
              </p>
            </div>

            {/* Information Section */}
            <div className="bg-theme-card rounded-2xl p-8 shadow-xl border border-theme-border-primary mb-8">
              <h2 className="text-2xl font-bold text-theme-primary mb-6 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-3 text-orange-500" />
                Nosso Compromisso
              </h2>
              
              <div className="space-y-4 text-theme-secondary">
                <p>
                  Nosso compromisso com a legalidade é absoluto, e respeitamos todas as leis vigentes relacionadas à remoção de conteúdo não autorizado. 
                  Caso seu conteúdo esteja aqui sem sua permissão, pedimos sinceras desculpas e solicitamos que entre em contato conosco através do nosso e-mail.
                </p>
                
                <p className="font-semibold text-theme-primary">
                  Comprometemo-nos a remover o conteúdo em um prazo de 72 horas, em estrita conformidade com as seguintes leis e regulamentos:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-theme-primary/5 rounded-lg p-4">
                    <h4 className="font-semibold text-theme-primary mb-2">1. Direitos Autorais</h4>
                    <p className="text-sm">Respeitamos o direito de propriedade intelectual de todos os criadores.</p>
                  </div>
                  
                  <div className="bg-theme-primary/5 rounded-lg p-4">
                    <h4 className="font-semibold text-theme-primary mb-2">2. Proteção de Dados</h4>
                    <p className="text-sm">Garantimos conformidade com as leis de privacidade e proteção de dados.</p>
                  </div>
                  
                  <div className="bg-theme-primary/5 rounded-lg p-4">
                    <h4 className="font-semibold text-theme-primary mb-2">3. Conteúdo Explícito</h4>
                    <p className="text-sm">Cumprimos as leis que regulam a exibição de conteúdo adulto.</p>
                  </div>
                  
                  <div className="bg-theme-primary/5 rounded-lg p-4">
                    <h4 className="font-semibold text-theme-primary mb-2">4. Privacidade e Consentimento</h4>
                    <p className="text-sm">Respeitamos o direito à privacidade e ao consentimento informado.</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <p className="text-sm">
                    <strong>E-mail de contato:</strong> contato@cornosbrasil.com
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-theme-card rounded-2xl p-8 shadow-xl border border-theme-border-primary">
              <h2 className="text-2xl font-bold text-theme-primary mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-3" />
                Formulário de Remoção
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* URLs */}
                <div>
                  <label className="block text-theme-primary font-semibold mb-2">
                    URL(s) do conteúdo (1 por linha):
                  </label>
                  <textarea
                    name="urls"
                    value={formData.urls}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-theme-background border border-theme-border-primary rounded-lg text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    placeholder="https://exemplo.com/video1&#10;https://exemplo.com/video2"
                  />
                  <p className="text-xs text-theme-secondary mt-1">
                    Forneça o(s) URL(s) do material que está denunciando. Não denuncie URLs de sites de terceiros.
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-theme-primary font-semibold mb-2">
                    Selecione uma categoria:
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-theme-background border border-theme-border-primary rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="privacidade">Privacidade</option>
                    <option value="marca-registrada">Marca Registrada</option>
                    <option value="menores">Indivíduos de Menores</option>
                    <option value="assedio">Assédio</option>
                    <option value="spam">Spam</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                {/* Motivation */}
                <div>
                  <label className="block text-theme-primary font-semibold mb-2">
                    Motivação da deleção dos conteúdos:
                  </label>
                  <textarea
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-theme-background border border-theme-border-primary rounded-lg text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    placeholder="Explique em detalhes por que está denunciando o conteúdo e os problemas com o conteúdo. Inclua uma referência a qualquer lei aplicável que você acredite ser relevante."
                  />
                </div>

                {/* Contact Information */}
                <div className="border-t border-theme-border-primary pt-6">
                  <h3 className="text-xl font-bold text-theme-primary mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Informações de Contato
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-theme-primary font-semibold mb-2">
                        Seu nome:
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-theme-background border border-theme-border-primary rounded-lg text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-theme-primary"
                        placeholder="Nome completo"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-theme-primary font-semibold mb-2">
                        Seu e-mail:
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-theme-background border border-theme-border-primary rounded-lg text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-theme-primary"
                        placeholder="seu@email.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-theme-primary font-semibold mb-2">
                        Seu endereço:
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-theme-background border border-theme-border-primary rounded-lg text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-theme-primary"
                        placeholder="Endereço completo"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-theme-primary font-semibold mb-2">
                        Seu telefone:
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-theme-background border border-theme-border-primary rounded-lg text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-theme-primary"
                        placeholder="+55 11 99999-9999"
                      />
                      <p className="text-xs text-theme-secondary mt-1">
                        *O telefone deve conter o código do país, o DDD do estado e em seguida o número
                      </p>
                    </div>
                  </div>
                </div>

                {/* Declaration */}
                <div className="bg-theme-primary/5 rounded-lg p-4">
                  <p className="text-sm text-theme-secondary mb-4">
                    Juro, sob pena de perjúrio, que as informações contidas nesta notificação são precisas e que, 
                    na medida em que minha denúncia envolva a suposta violação de um direito legal, sou o proprietário 
                    de tal direito ou estou autorizado a agir em nome do proprietário.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-theme-primary font-semibold mb-2">
                        Data atual:
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-theme-background border border-theme-border-primary rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-theme-primary font-semibold mb-2">
                        Sua assinatura:
                      </label>
                      <input
                        type="text"
                        name="signature"
                        value={formData.signature}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-theme-background border border-theme-border-primary rounded-lg text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-theme-primary"
                        placeholder="Digite seu nome completo como assinatura"
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-theme-secondary mt-2">
                    Você reconhece que sua assinatura digital é tão legalmente vinculante quanto uma assinatura física.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-8 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 mr-2" />
                        Enviar Solicitação de Remoção
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
                      </div>
          </div>
        </div>
        
        <Footer />
      </Layout>
    </>
  )
}

export default function RemocaoPage() {
  return (
    <Suspense fallback={
      <Layout>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-theme-background via-theme-card to-theme-primary/5 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-theme-primary">Carregando...</p>
          </div>
        </div>
        <Footer />
      </Layout>
    }>
      <RemocaoPageContent />
    </Suspense>
  )
}
