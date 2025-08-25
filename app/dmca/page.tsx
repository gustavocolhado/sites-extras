'use client'

import Layout from '@/components/Layout'
import Header from '@/components/Header'
import SEOHead from '@/components/SEOHead'
import { Mail, AlertTriangle, FileText, Clock, Shield } from 'lucide-react'

export default function DMCAPage() {
  return (
    <>
      <SEOHead 
        title="DMCA - CORNOS BRASIL | Política de Direitos Autorais"
        description="Política DMCA do CORNOS BRASIL. Informações sobre direitos autorais, como reportar violações e procedimentos de remoção de conteúdo."
        keywords={['dmca', 'direitos autorais', 'copyright', 'violação', 'remoção', 'cornos brasil']}
      />
      
      <Layout>
        <Header />
        
        <div className="min-h-screen bg-gradient-to-br from-theme-background to-theme-card">
          <div className="container-content py-16">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-theme-primary mb-4">
                Política DMCA
              </h1>
              <p className="text-xl text-theme-secondary max-w-3xl mx-auto">
                O CORNOS BRASIL respeita os direitos autorais e está comprometido em 
                responder adequadamente a notificações de violação de direitos autorais.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
              {/* O que é DMCA */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6 flex items-center">
                  <FileText className="w-8 h-8 mr-3" />
                  O que é DMCA?
                </h2>
                <div className="prose prose-lg text-theme-secondary">
                  <p className="mb-4">
                    O <strong>Digital Millennium Copyright Act (DMCA)</strong> é uma lei dos Estados Unidos 
                    que protege os direitos autorais de obras digitais. Esta lei estabelece procedimentos 
                    para que detentores de direitos autorais possam solicitar a remoção de conteúdo que 
                    viole seus direitos.
                  </p>
                  <p>
                    O CORNOS BRASIL está comprometido em cumprir esta legislação e responder adequadamente 
                    a todas as notificações de violação de direitos autorais.
                  </p>
                </div>
              </div>

              {/* Como Reportar */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6 flex items-center">
                  <Mail className="w-8 h-8 mr-3" />
                  Como Reportar uma Violação
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-theme-primary mb-4">
                      Informações Necessárias
                    </h3>
                    <ul className="space-y-3 text-theme-secondary">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Identificação do trabalho protegido:</strong> Descrição detalhada da obra original</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Localização do conteúdo:</strong> URL específica onde o conteúdo está localizado</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Informações de contato:</strong> Nome, email e telefone do detentor dos direitos</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Declaração de boa fé:</strong> Afirmação de que a notificação é feita de boa fé</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Autorização:</strong> Declaração de que você tem autorização para agir em nome do detentor</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-theme-primary mb-4">
                      Enviar Notificação
                    </h3>
                    <p className="text-theme-secondary mb-4">
                      Para reportar uma violação de direitos autorais, envie um email para:
                    </p>
                    <div className="text-center">
                      <a 
                        href="mailto:dmca@cornosbrasil.com?subject=DMCA Notice - Violação de Direitos Autorais"
                        className="inline-flex items-center space-x-2 bg-accent-red hover:bg-accent-red-hover text-white font-bold py-3 px-6 rounded-lg transition-colors"
                      >
                        <Mail size={20} />
                        <span>dmca@cornosbrasil.com</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processo de Remoção */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6 flex items-center">
                  <Clock className="w-8 h-8 mr-3" />
                  Processo de Remoção
                </h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">1</span>
                    </div>
                    <h3 className="font-semibold text-theme-primary mb-2">Recebimento</h3>
                    <p className="text-theme-secondary text-sm">
                      Recebemos sua notificação DMCA e iniciamos a análise em até 24 horas
                    </p>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">2</span>
                    </div>
                    <h3 className="font-semibold text-theme-primary mb-2">Análise</h3>
                    <p className="text-theme-secondary text-sm">
                      Nossa equipe analisa a notificação e verifica a validade da reclamação
                    </p>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">3</span>
                    </div>
                    <h3 className="font-semibold text-theme-primary mb-2">Ação</h3>
                    <p className="text-theme-secondary text-sm">
                      Se válida, removemos o conteúdo em até 48 horas e notificamos as partes
                    </p>
                  </div>
                </div>
              </div>

              {/* Contra-Notificação */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6 flex items-center">
                  <Shield className="w-8 h-8 mr-3" />
                  Contra-Notificação
                </h2>
                
                <div className="prose prose-lg text-theme-secondary">
                  <p className="mb-4">
                    Se você acredita que seu conteúdo foi removido incorretamente, você pode enviar 
                    uma <strong>contra-notificação</strong> que deve incluir:
                  </p>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Identificação do conteúdo removido</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Declaração sob pena de perjúrio de que você tem boa fé</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Consentimento para a jurisdição do tribunal federal</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Informações de contato completas</span>
                    </li>
                  </ul>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-theme-primary mb-4">
                      ⚠️ Aviso Importante
                    </h3>
                    <p className="text-theme-secondary">
                      Enviar uma contra-notificação falsa pode resultar em responsabilidade legal. 
                      Certifique-se de que você tem o direito de usar o conteúdo antes de enviar 
                      uma contra-notificação.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8 text-center">
                <h2 className="text-3xl font-bold text-theme-primary mb-6">
                  Precisa de Ajuda?
                </h2>
                <p className="text-theme-secondary mb-6 max-w-2xl mx-auto">
                  Se você tem dúvidas sobre nossa política DMCA ou precisa de assistência 
                  com uma notificação, entre em contato conosco.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="mailto:dmca@cornosbrasil.com"
                    className="inline-flex items-center space-x-2 bg-accent-red hover:bg-accent-red-hover text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    <Mail size={20} />
                    <span>Enviar Email</span>
                  </a>
                  <a 
                    href="/contact"
                    className="inline-flex items-center space-x-2 border border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    <span>Página de Contato</span>
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