'use client'

import Link from 'next/link'
import { 
  Play, 
  Users, 
  Crown, 
  User, 
  Shield, 
  Mail, 
  Lock, 
  FileText,
  Heart,
  Star
} from 'lucide-react'
import { useDomainContext } from '@/contexts/DomainContext'

export default function Footer() {
  const { domainConfig, isLoading } = useDomainContext()

  // Fallback para quando o domínio ainda não foi carregado
  const siteName = isLoading || !domainConfig ? 'Cornos Brasil' : domainConfig.siteName
  const siteDescription = isLoading || !domainConfig 
    ? 'A melhor plataforma de vídeos amadores do Brasil. Conteúdo exclusivo e de qualidade para você.'
    : domainConfig.description

  return (
    <footer className="relative bg-gradient-to-br from-theme-card via-theme-card to-theme-primary/10 border-t border-theme-border-primary mt-auto overflow-hidden py-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-theme-primary rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-theme-primary rounded-full translate-x-12 translate-y-12"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-theme-primary rounded-full"></div>
      </div>

      <div className="container-content mx-auto relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Section */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-theme-primary to-theme-primary/70 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-theme-primary rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-theme-primary font-bold text-xl ml-3">{siteName}</h3>
            </div>
            <p className="text-theme-secondary text-sm leading-relaxed">
              {siteDescription}
            </p>
            <div className="flex items-center justify-center lg:justify-start mt-4 space-x-2">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-theme-secondary text-xs ml-2">5.0</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center lg:text-left">
            <h4 className="text-theme-primary font-semibold mb-6 flex items-center justify-center lg:justify-start">
              <Play className="w-4 h-4 mr-2" />
              Navegação
            </h4>
            <div className="space-y-3">
              <Link href="/videos" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <div className="w-1 h-1 bg-theme-primary rounded-full mr-3 group-hover:w-2 transition-all duration-300"></div>
                Todos os Vídeos
              </Link>
              <Link href="/creators" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <div className="w-1 h-1 bg-theme-primary rounded-full mr-3 group-hover:w-2 transition-all duration-300"></div>
                Criadores
              </Link>
              <Link href="/premium" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <div className="w-1 h-1 bg-theme-primary rounded-full mr-3 group-hover:w-2 transition-all duration-300"></div>
                Premium
              </Link>
              <Link href="/profile" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <div className="w-1 h-1 bg-theme-primary rounded-full mr-3 group-hover:w-2 transition-all duration-300"></div>
                Meu Perfil
              </Link>
            </div>
          </div>

          {/* Support Links */}
          <div className="text-center lg:text-left">
            <h4 className="text-theme-primary font-semibold mb-6 flex items-center justify-center lg:justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Suporte
            </h4>
            <div className="space-y-3">
              <Link href="/contato" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <Mail className="w-3 h-3 mr-3" />
                Contato
              </Link>
              <Link href="/ajuda" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <Users className="w-3 h-3 mr-3" />
                Central de Ajuda
              </Link>
              <Link href="/faq" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <FileText className="w-3 h-3 mr-3" />
                FAQ
              </Link>
              <Link href="/enviar" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <Crown className="w-3 h-3 mr-3" />
                Enviar Conteúdo
              </Link>
            </div>
          </div>

          {/* Legal Links */}
          <div className="text-center lg:text-left">
            <h4 className="text-theme-primary font-semibold mb-6 flex items-center justify-center lg:justify-start">
              <Lock className="w-4 h-4 mr-2" />
              Legal
            </h4>
            <div className="space-y-3">
              <Link href="/privacy" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <Shield className="w-3 h-3 mr-3" />
                Privacidade
              </Link>
              <Link href="/termos" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <FileText className="w-3 h-3 mr-3" />
                Termos de Uso
              </Link>
              <Link href="/remocao" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <Shield className="w-3 h-3 mr-3" />
                Remoção de Conteúdo
              </Link>
              <Link href="/dmca" className="flex items-center justify-center lg:justify-start text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:translate-x-1 group">
                <FileText className="w-3 h-3 mr-3" />
                DMCA
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-theme-border-primary/50 pt-8">
          <div className="text-center space-y-4">
            <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-theme-secondary">
              <span className="flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                Conteúdo Verificado
              </span>
              <span className="flex items-center">
                <Lock className="w-3 h-3 mr-1" />
                Privacidade Garantida
              </span>
              <span className="flex items-center">
                <Crown className="w-3 h-3 mr-1" />
                Premium Quality
              </span>
            </div>
            
            <div className="space-y-2">
              <p className="text-theme-secondary text-xs leading-relaxed max-w-3xl mx-auto">
                Todas as pessoas aqui descritas tinham pelo menos 18 anos de idade: 18 USC 2257 Declarações de conformidade de requisitos de manutenção de registros
              </p>
              
              {/* RTA and ASACP Logos */}
              <div className="flex justify-center items-center space-x-6 mt-4">
                <div className="css-rta-logo">
                  <svg version="1.1" id="Camada_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 34 20" enableBackground="new 0 0 34 20" xmlSpace="preserve" className="w-8 h-5">
                    <path fill="#FFFFFF" d="M29.3,3.8H0v12.4h3.8v-5c1.4-0.2,1.8,0.7,1.8,0.7l2.3,4.3h4.4c0,0-0.8-1.6-1.5-2.8c-0.4-0.9-1-1.7-1.7-2.3 c-0.2-0.2-0.5-0.3-0.8-0.4c3.5-0.8,3-3.8,3-3.8h3.9v9.4h3.7V6.8h5.3l-3.6,9.4h3.9l0.6-2.1h4.4l0.6,2.1h4L29.3,3.8z M5.7,8.9H3.8V6.3 h1.8c0,0,1.7-0.1,1.7,1.3S5.7,8.9,5.7,8.9z M25.8,11.5L27.2,7l1.4,4.4H25.8z"></path>
                  </svg>
                </div>
                <a className="rta" href="http://www.asacp.org/index.php?content=aboutus" rel="nofollow noopener" aria-label="Association of Sites Advocating Child Protection" title="Association of Sites Advocating Child Protection" target="_blank">
                  <div className="css-asacp-logo">
                    <svg version="1.1" id="Camada_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 34 20" enableBackground="new 0 0 34 20" xmlSpace="preserve" className="w-8 h-5">
                      <path fill="#FFFFFF" d="M32.2,6.5h-9.1c-1.8,0-2.6,2.2-2.6,3.4c0,0.8,0.2,1.5,0.5,2.2h-0.8L18,6.5H9c-1.1,0-1.8,1-1.8,2.2	s2.1,1.7,2.6,1.8c0.5,0.1,1.4,0.2,1.4,1s-0.9,0.7-0.9,0.7H7.1L5,6.5H2.7l-2.7,7h2.2l0.4-1.2H5l0.4,1.2h5.7c0.9-0.2,1.6-0.8,1.9-1.6 c0.1-0.5,0.1-1.1-0.1-1.6c-0.3-1-2.5-1.3-2.8-1.4C9.8,8.7,9.2,8.7,9.2,8.2c0-0.5,0.6-0.5,0.6-0.5h5.6l-2.3,5.8h2.2l0.4-1.2h2.4 l0.4,1.2h6.4c1.8,0,2.3-2.2,2.3-2.2l-1.7-0.6c0,0-0.4,1.3-1.6,1.3s-1.3-0.8-1.3-2.3S23.8,8,23.8,8h4.4v5.5h2.1v-2.7H32 c1.1,0,2-1,2-2.1c0,0,0,0,0-0.1C34,6.7,32.2,6.5,32.2,6.5z M3,10.8l0.8-2.6l0.8,2.6H3z M16,10.8l0.8-2.6l0.8,2.6H16z M31.2,9.5h-1 V7.9h1.1C31.7,8,32,8.3,32,8.7C32,9.1,31.7,9.5,31.2,9.5z"></path>
                    </svg>
                  </div>
                </a>
              </div>
              
              <p className="text-theme-secondary text-xs">
                © 2025 {siteName}. Todos os direitos reservados.
              </p>
            </div>
            

          </div>
        </div>
      </div>
    </footer>
  )
} 