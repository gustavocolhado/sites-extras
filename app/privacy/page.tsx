'use client'

import Layout from '@/components/Layout'
import Header from '@/components/Header'
import SEOHead from '@/components/SEOHead'
import { Eye, Shield, Database, Cookie, Users, Lock } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <>
      <SEOHead 
        title="Política de Privacidade - CORNOS BRASIL | Proteção de Dados"
        description="Política de privacidade do CORNOS BRASIL. Saiba como coletamos, usamos e protegemos suas informações pessoais."
        keywords={['privacidade', 'proteção de dados', 'lgpd', 'informações pessoais', 'cornos brasil']}
      />
      
      <Layout>
        <Header />
        
        <div className="min-h-screen bg-gradient-to-br from-theme-background to-theme-card">
          <div className="container-content py-16">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-theme-primary mb-4">
                Política de Privacidade
              </h1>
              <p className="text-xl text-theme-secondary max-w-3xl mx-auto">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
              {/* Introdução */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6">
                  Introdução
                </h2>
                <div className="prose prose-lg text-theme-secondary">
                  <p className="mb-4">
                    O <strong>CORNOS BRASIL</strong> está comprometido em proteger sua privacidade. 
                    Esta política descreve como coletamos, usamos e protegemos suas informações pessoais.
                  </p>
                  <p>
                    Ao usar nossos serviços, você concorda com a coleta e uso de informações conforme 
                    descrito nesta política. Sua privacidade é fundamental para nós.
                  </p>
                </div>
              </div>

              {/* Informações que Coletamos */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6 flex items-center">
                  <Database className="w-8 h-8 mr-3" />
                  Informações que Coletamos
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-theme-primary mb-4">
                      Informações Pessoais
                    </h3>
                    <ul className="space-y-3 text-theme-secondary">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Nome e email:</strong> Para criar sua conta</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Informações de pagamento:</strong> Para serviços Premium</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Dados de uso:</strong> Como você interage com nosso site</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span><strong>Informações técnicas:</strong> IP, navegador, dispositivo</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-theme-primary mb-4">
                      Informações Automáticas
                    </h3>
                    <ul className="space-y-3 text-theme-secondary">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Logs de acesso e uso do site</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Cookies e tecnologias similares</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Dados de analytics e métricas</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Como Usamos as Informações */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6 flex items-center">
                  <Users className="w-8 h-8 mr-3" />
                  Como Usamos as Informações
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4 text-theme-secondary">
                    <div>
                      <h3 className="font-semibold text-theme-primary mb-2">Fornecer Serviços</h3>
                      <p className="text-sm">Para criar e gerenciar sua conta, processar pagamentos e fornecer suporte.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-theme-primary mb-2">Melhorar Experiência</h3>
                      <p className="text-sm">Para personalizar conteúdo, melhorar funcionalidades e otimizar o site.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-theme-primary mb-2">Comunicação</h3>
                      <p className="text-sm">Para enviar notificações importantes, atualizações e responder dúvidas.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 text-theme-secondary">
                    <div>
                      <h3 className="font-semibold text-theme-primary mb-2">Segurança</h3>
                      <p className="text-sm">Para detectar e prevenir fraudes, abusos e atividades ilegais.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-theme-primary mb-2">Analytics</h3>
                      <p className="text-sm">Para entender como o site é usado e melhorar nossos serviços.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-theme-primary mb-2">Conformidade Legal</h3>
                      <p className="text-sm">Para cumprir obrigações legais e regulamentares aplicáveis.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compartilhamento de Dados */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6 flex items-center">
                  <Shield className="w-8 h-8 mr-3" />
                  Compartilhamento de Dados
                </h2>
                
                <div className="prose prose-lg text-theme-secondary">
                  <p className="mb-4">
                    <strong>Não vendemos, alugamos ou compartilhamos suas informações pessoais</strong> 
                    com terceiros, exceto nas seguintes circunstâncias:
                  </p>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Provedores de serviços:</strong> Processadores de pagamento, hospedagem, analytics</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Obrigação legal:</strong> Quando exigido por lei ou processo legal</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Proteção de direitos:</strong> Para proteger nossos direitos e segurança</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Consentimento:</strong> Quando você autorizar explicitamente</span>
                    </li>
                  </ul>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-theme-primary mb-4">
                      🔒 Proteção de Dados
                    </h3>
                    <p>
                      Todos os provedores de serviços com quem compartilhamos dados são obrigados 
                      a manter a confidencialidade e usar as informações apenas para os fins especificados.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cookies */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6 flex items-center">
                  <Cookie className="w-8 h-8 mr-3" />
                  Cookies e Tecnologias Similares
                </h2>
                
                <div className="space-y-6 text-theme-secondary">
                  <div>
                    <h3 className="text-xl font-semibold text-theme-primary mb-3">O que são Cookies?</h3>
                    <p>
                      Cookies são pequenos arquivos de texto armazenados no seu dispositivo que nos 
                      ajudam a melhorar sua experiência no site.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <h4 className="font-semibold text-theme-primary mb-2">Essenciais</h4>
                      <p className="text-sm">Necessários para o funcionamento básico do site</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <h4 className="font-semibold text-theme-primary mb-2">Funcionais</h4>
                      <p className="text-sm">Melhoram a funcionalidade e personalização</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <h4 className="font-semibold text-theme-primary mb-2">Analytics</h4>
                      <p className="text-sm">Nos ajudam a entender como o site é usado</p>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-theme-primary mb-4">
                      Gerenciar Cookies
                    </h3>
                    <p className="mb-4">
                      Você pode controlar cookies através das configurações do seu navegador. 
                      Note que desabilitar alguns cookies pode afetar a funcionalidade do site.
                    </p>
                    <p className="text-sm">
                      Para mais informações sobre como gerenciar cookies, consulte a ajuda do seu navegador.
                    </p>
                  </div>
                </div>
              </div>

              {/* Segurança */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6 flex items-center">
                  <Lock className="w-8 h-8 mr-3" />
                  Segurança dos Dados
                </h2>
                
                <div className="space-y-6 text-theme-secondary">
                  <div>
                    <h3 className="text-xl font-semibold text-theme-primary mb-3">Medidas de Segurança</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Criptografia SSL/TLS para transmissão de dados</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Senhas criptografadas com bcrypt</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Monitoramento contínuo de segurança</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Backups regulares e seguros</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-theme-primary mb-4">
                      ⚠️ Limitação de Responsabilidade
                    </h3>
                    <p>
                      Embora implementemos medidas de segurança robustas, nenhum sistema é 100% seguro. 
                      Não podemos garantir a segurança absoluta das informações transmitidas online.
                    </p>
                  </div>
                </div>
              </div>

              {/* Seus Direitos */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6">
                  Seus Direitos (LGPD)
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4 text-theme-secondary">
                    <div>
                      <h3 className="font-semibold text-theme-primary mb-2">Acesso</h3>
                      <p className="text-sm">Solicitar informações sobre quais dados temos sobre você</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-theme-primary mb-2">Correção</h3>
                      <p className="text-sm">Solicitar correção de dados incorretos ou incompletos</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-theme-primary mb-2">Exclusão</h3>
                      <p className="text-sm">Solicitar a exclusão de seus dados pessoais</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 text-theme-secondary">
                    <div>
                      <h3 className="font-semibold text-theme-primary mb-2">Portabilidade</h3>
                      <p className="text-sm">Receber seus dados em formato estruturado</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-theme-primary mb-2">Revogação</h3>
                      <p className="text-sm">Revogar consentimento a qualquer momento</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-theme-primary mb-2">Oposição</h3>
                      <p className="text-sm">Opor-se ao tratamento de seus dados</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-theme-primary mb-4">
                    Como Exercer Seus Direitos
                  </h3>
                  <p className="text-theme-secondary mb-4">
                    Para exercer qualquer um desses direitos, entre em contato conosco através de:
                  </p>
                  <div className="text-center">
                    <a 
                      href="mailto:privacy@cornosbrasil.com?subject=LGPD - Exercício de Direitos"
                      className="inline-flex items-center space-x-2 bg-accent-red hover:bg-accent-red-hover text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      <span>privacy@cornosbrasil.com</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Retenção de Dados */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6">
                  Retenção de Dados
                </h2>
                
                <div className="prose prose-lg text-theme-secondary">
                  <p className="mb-4">
                    Mantemos suas informações pessoais apenas pelo tempo necessário para:
                  </p>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Fornecer nossos serviços</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Cumprir obrigações legais</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Resolver disputas</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Fazer cumprir nossos acordos</span>
                    </li>
                  </ul>

                  <p>
                    Quando não precisarmos mais de suas informações, elas serão excluídas de forma 
                    segura ou anonimizadas.
                  </p>
                </div>
              </div>

              {/* Alterações na Política */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6">
                  Alterações na Política
                </h2>
                
                <div className="prose prose-lg text-theme-secondary">
                  <p className="mb-4">
                    Podemos atualizar esta política periodicamente. Alterações significativas serão 
                    comunicadas através de:
                  </p>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Notificação no site</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Email para usuários registrados</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Atualização da data de "última atualização"</span>
                    </li>
                  </ul>

                  <p>
                    O uso continuado de nossos serviços após as alterações constitui aceitação 
                    da nova política.
                  </p>
                </div>
              </div>

              {/* Contato */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8 text-center">
                <h2 className="text-3xl font-bold text-theme-primary mb-6">
                  Dúvidas sobre Privacidade?
                </h2>
                <p className="text-theme-secondary mb-6 max-w-2xl mx-auto">
                  Se você tem dúvidas sobre esta política de privacidade ou sobre como tratamos 
                  suas informações, entre em contato conosco.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="mailto:privacy@cornosbrasil.com"
                    className="inline-flex items-center space-x-2 bg-accent-red hover:bg-accent-red-hover text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    <span>Email de Privacidade</span>
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