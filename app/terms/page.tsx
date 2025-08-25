'use client'

import Layout from '@/components/Layout'
import Header from '@/components/Header'
import SEOHead from '@/components/SEOHead'
import { FileText, Shield, AlertTriangle, Users, CreditCard, Eye } from 'lucide-react'

export default function TermsPage() {
  return (
    <>
      <SEOHead 
        title="Termos de Uso - CORNOS BRASIL | Condições de Serviço"
        description="Termos de uso e condições de serviço do CORNOS BRASIL. Leia atentamente antes de usar nossos serviços."
        keywords={['termos de uso', 'condições', 'serviço', 'acordo', 'cornos brasil']}
      />
      
      <Layout>
        <Header />
        
        <div className="min-h-screen bg-gradient-to-br from-theme-background to-theme-card">
          <div className="container-content py-16">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-blue-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-theme-primary mb-4">
                Termos de Uso
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
                    Bem-vindo ao <strong>CORNOS BRASIL</strong>. Ao acessar e usar este site, você aceita 
                    e concorda em cumprir estes Termos de Uso. Se você não concordar com qualquer parte 
                    destes termos, não deve usar nossos serviços.
                  </p>
                  <p>
                    Estes termos constituem um acordo legal entre você e o CORNOS BRASIL. Recomendamos 
                    que você leia atentamente todos os termos antes de usar nossos serviços.
                  </p>
                </div>
              </div>

              {/* Definições */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6">
                  Definições
                </h2>
                <div className="space-y-4 text-theme-secondary">
                  <div>
                    <strong className="text-theme-primary">"Serviço"</strong> - Refere-se ao site CORNOS BRASIL e todos os seus conteúdos e funcionalidades.
                  </div>
                  <div>
                    <strong className="text-theme-primary">"Usuário"</strong> - Qualquer pessoa que acesse ou use o Serviço.
                  </div>
                  <div>
                    <strong className="text-theme-primary">"Conta"</strong> - O registro criado pelo usuário para acessar funcionalidades específicas.
                  </div>
                  <div>
                    <strong className="text-theme-primary">"Conteúdo"</strong> - Todos os textos, imagens, vídeos e outros materiais disponíveis no Serviço.
                  </div>
                  <div>
                    <strong className="text-theme-primary">"Premium"</strong> - Serviços pagos que oferecem funcionalidades adicionais.
                  </div>
                </div>
              </div>

              {/* Uso Aceitável */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6 flex items-center">
                  <Shield className="w-8 h-8 mr-3" />
                  Uso Aceitável
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-theme-primary mb-4">
                      ✅ O que é Permitido
                    </h3>
                    <ul className="space-y-3 text-theme-secondary">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Acessar e visualizar conteúdo público</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Criar uma conta pessoal</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Usar funcionalidades Premium (mediante pagamento)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Entrar em contato conosco para suporte</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-theme-primary mb-4">
                      ❌ O que é Proibido
                    </h3>
                    <ul className="space-y-3 text-theme-secondary">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Usar o serviço para atividades ilegais</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Compartilhar credenciais de acesso</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Tentar acessar áreas restritas sem autorização</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Usar bots ou scripts automatizados</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Violar direitos autorais ou propriedade intelectual</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contas de Usuário */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6 flex items-center">
                  <Users className="w-8 h-8 mr-3" />
                  Contas de Usuário
                </h2>
                
                <div className="space-y-6 text-theme-secondary">
                  <div>
                    <h3 className="text-xl font-semibold text-theme-primary mb-3">Criação de Conta</h3>
                    <p>
                      Para acessar certas funcionalidades, você deve criar uma conta fornecendo informações 
                      verdadeiras e precisas. Você é responsável por manter a confidencialidade de suas 
                      credenciais de acesso.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-theme-primary mb-3">Responsabilidade da Conta</h3>
                    <p>
                      Você é responsável por todas as atividades que ocorrem em sua conta. Notifique-nos 
                      imediatamente se suspeitar de uso não autorizado.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-theme-primary mb-3">Encerramento de Conta</h3>
                    <p>
                      Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos 
                      ou que sejam usadas de forma inadequada.
                    </p>
                  </div>
                </div>
              </div>

              {/* Serviços Premium */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6 flex items-center">
                  <CreditCard className="w-8 h-8 mr-3" />
                  Serviços Premium
                </h2>
                
                <div className="space-y-6 text-theme-secondary">
                  <div>
                    <h3 className="text-xl font-semibold text-theme-primary mb-3">Pagamentos</h3>
                    <p>
                      Os serviços Premium são oferecidos mediante pagamento. Todos os preços são 
                      exibidos em reais (BRL) e incluem impostos aplicáveis.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-theme-primary mb-3">Renovação Automática</h3>
                    <p>
                      Assinaturas Premium são renovadas automaticamente até que sejam canceladas. 
                      Você pode cancelar a qualquer momento através de sua conta.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-theme-primary mb-3">Reembolsos</h3>
                    <p>
                      Reembolsos são avaliados caso a caso. Entre em contato conosco dentro de 7 dias 
                      da compra para solicitar um reembolso.
                    </p>
                  </div>
                </div>
              </div>

              {/* Privacidade */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6 flex items-center">
                  <Eye className="w-8 h-8 mr-3" />
                  Privacidade
                </h2>
                
                <div className="prose prose-lg text-theme-secondary">
                  <p className="mb-4">
                    Sua privacidade é importante para nós. Nossa coleta e uso de informações pessoais 
                    são regidos por nossa <a href="/privacy" className="text-accent-red hover:underline">Política de Privacidade</a>.
                  </p>
                  <p>
                    Ao usar nossos serviços, você concorda com a coleta e uso de informações conforme 
                    descrito em nossa política de privacidade.
                  </p>
                </div>
              </div>

              {/* Limitação de Responsabilidade */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6 flex items-center">
                  <AlertTriangle className="w-8 h-8 mr-3" />
                  Limitação de Responsabilidade
                </h2>
                
                <div className="prose prose-lg text-theme-secondary">
                  <p className="mb-4">
                    O CORNOS BRASIL fornece este serviço "como está" e "conforme disponível". 
                    Não garantimos que o serviço será ininterrupto ou livre de erros.
                  </p>
                  <p className="mb-4">
                    Em nenhuma circunstância seremos responsáveis por danos indiretos, incidentais, 
                    especiais ou consequenciais decorrentes do uso de nossos serviços.
                  </p>
                  <p>
                    Nossa responsabilidade total em qualquer caso não excederá o valor pago por você 
                    pelos serviços nos últimos 12 meses.
                  </p>
                </div>
              </div>

              {/* Modificações */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-theme-primary mb-6">
                  Modificações dos Termos
                </h2>
                
                <div className="prose prose-lg text-theme-secondary">
                  <p className="mb-4">
                    Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                    Alterações significativas serão comunicadas através do site ou por email.
                  </p>
                  <p>
                    O uso continuado do serviço após as modificações constitui aceitação dos novos termos.
                  </p>
                </div>
              </div>

              {/* Contato */}
              <div className="bg-theme-card rounded-xl shadow-xl p-8 text-center">
                <h2 className="text-3xl font-bold text-theme-primary mb-6">
                  Dúvidas sobre os Termos?
                </h2>
                <p className="text-theme-secondary mb-6 max-w-2xl mx-auto">
                  Se você tem dúvidas sobre estes termos de uso, entre em contato conosco. 
                  Estamos aqui para ajudar.
                </p>
                <a 
                  href="/contact"
                  className="inline-flex items-center space-x-2 bg-accent-red hover:bg-accent-red-hover text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  <span>Entrar em Contato</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
} 