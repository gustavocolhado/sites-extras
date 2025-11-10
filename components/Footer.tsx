'use client'

import Link from 'next/link'
import { 
  ChevronRight,
  Crown,
  FileText,
  Heart,
  Lock,        // sempre visível
  Mail,
  Play,
  Shield,
  Star,
  Users
} from 'lucide-react'
import { useDomainContext } from '@/contexts/DomainContext'

const footerLinks = {
  navigation: [
    { href: '/videos', label: 'Todos os Vídeos', icon: Play },
    { href: '/creators', label: 'Criadores', icon: Users },
    { href: '/premium', label: 'Premium', icon: Crown },
    { href: '/profile', label: 'Meu Perfil', icon: Shield },
  ],
  support: [
    { href: '/contato', label: 'Contato', icon: Mail },
    { href: '/ajuda', label: 'Central de Ajuda', icon: Users },
    { href: '/faq', label: 'FAQ', icon: FileText },
    { href: '/regras', label: 'Regras da Comunidade', icon: Shield },
  ],
  legal: [
    { href: '/privacy', label: 'Política de Privacidade', icon: Shield },
    { href: '/termos', label: 'Termos de Uso', icon: FileText },
    { href: '/remocao', label: 'Remoção de Conteúdo', icon: Shield },
    { href: '/dmca', label: 'DMCA', icon: FileText },
  ],
}

const trustBadges = [
  { icon: Shield, text: 'Conteúdo Verificado' },
  { icon: Lock, text: 'Privacidade Garantida' },
  { icon: Crown, text: 'Qualidade Premium' },
]

export default function Footer() {
  const { domainConfig, isLoading } = useDomainContext()

  const siteName = isLoading || !domainConfig ? 'Cornos Brasil' : domainConfig.siteName
  const siteDescription = isLoading || !domainConfig 
    ? 'A melhor plataforma de vídeos amadores do Brasil. Conteúdo exclusivo e de qualidade para você.'
    : domainConfig.description

  return (
    <footer className="relative bg-[#0a0a0a] border-t border-white/10 mt-auto overflow-hidden">
  {/* Background sutil */}
  <div className="absolute inset-0 opacity-5 pointer-events-none">
    <div className="absolute top-0 left-0 w-40 h-40 bg-theme-primary/30 rounded-full blur-3xl -translate-x-20 -translate-y-20"></div>
    <div className="absolute bottom-0 right-0 w-32 h-32 bg-theme-primary/20 rounded-full blur-3xl translate-x-16 translate-y-16"></div>
    <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-theme-primary/10 rounded-full blur-xl"></div>
  </div>

  <div className="container-content mx-auto relative z-10 px-4 py-12 md:py-16 text-gray-300">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-12">
          {/* Brand Column */}
          <div className="space-y-5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 pt-4">
              <div className="relative group">
              </div>
                <img
                  src="/imgs/logo.png"
                  alt={siteName}
                  className="w-48 object-contain"
                />
            </div>

            <p className="text-theme-secondary text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              {siteDescription}
            </p>

            <div className="flex items-center justify-center md:justify-start gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
              ))}
              <span className="ml-2 text-xs text-theme-secondary font-medium">5.0 (12k+ avaliações)</span>
            </div>
          </div>

          {/* Navigation Links */}
          {Object.entries(footerLinks).map(([key, links]) => (
            <div key={key} className="space-y-5 text-center md:text-left">
              <h4 className="font-semibold text-theme-primary flex items-center justify-center md:justify-start gap-2">
                {key === 'navigation' && <Play className="w-4 h-4" />}
                {key === 'support' && <Shield className="w-4 h-4" />}
                {key === 'legal' && <Lock className="w-4 h-4" />}
                {key === 'navigation' ? 'Navegação' : key === 'support' ? 'Suporte' : 'Legal'}
              </h4>
              <ul className="space-y-2.5">
                {links.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group flex items-center justify-center md:justify-start gap-2 text-theme-secondary hover:text-theme-primary transition-all duration-300 text-sm font-medium"
                    >
                      <Icon className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span className="relative">
                        {label}
                        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-theme-primary transition-all duration-300 group-hover:w-full"></span>
                      </span>
                      <ChevronRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="text-center space-y-6">
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 text-xs text-theme-secondary">
              {trustBadges.map(({ icon: Icon, text }, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-theme-card/50 px-3 py-1.5 rounded-full border border-theme-border-primary/20">
                  <Icon className="w-3.5 h-3.5" />
                  {text}
                </span>
              ))}
            </div>

            {/* Compliance & Logos */}
            <div className="space-y-4">
              <p className="text-theme-secondary text-xs max-w-4xl mx-auto leading-relaxed">
                Todas as pessoas aqui descritas tinham pelo menos 18 anos de idade. 
                <br className="hidden sm:inline" />
                <strong>18 U.S.C. 2257</strong> — Declarações de conformidade de manutenção de registros.
              </p>

              <div className="flex justify-center items-center gap-6">
                {/* RTA Logo */}
                <a
                  href="https://www.rtalabel.org/"
                  target="_blank"
                  rel="nofollow noopener"
                  aria-label="Restricted To Adults"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                >
                  <svg className="w-9 h-6" viewBox="0 0 34 20" fill="currentColor">
                    <path d="M29.3,3.8H0v12.4h3.8v-5c1.4-0.2,1.8,0.7,1.8,0.7l2.3,4.3h4.4c0,0-0.8-1.6-1.5-2.8c-0.4-0.9-1-1.7-1.7-2.3 c-0.2-0.2-0.5-0.3-0.8-0.4c3.5-0.8,3-3.8,3-3.8h3.9v9.4h3.7V6.8h5.3l-3.6,9.4h3.9l0.6-2.1h4.4l0.6,2.1h4L29.3,3.8z M5.7,8.9H3.8V6.3 h1.8c0,0,1.7-0.1,1.7,1.3S5.7,8.9,5.7,8.9z M25.8,11.5L27.2,7l1.4,4.4H25.8z"></path>
                  </svg>
                </a>

                {/* ASACP Logo */}
                <a
                  href="http://www.asacp.org"
                  target="_blank"
                  rel="nofollow noopener"
                  aria-label="ASACP Member"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                >
                  <svg className="w-9 h-6" viewBox="0 0 34 20" fill="currentColor">
                    <path d="M32.2,6.5h-9.1c-1.8,0-2.6,2.2-2.6,3.4c0,0.8,0.2,1.5,0.5,2.2h-0.8L18,6.5H9c-1.1,0-1.8,1-1.8,2.2 s2.1,1.7,2.6,1.8c0.5,0.1,1.4,0.2,1.4,1s-0.9,0.7-0.9,0.7H7.1L5,6.5H2.7l-2.7,7h2.2l0.4-1.2H5l0.4,1.2h5.7c0.9-0.2,1.6-0.8,1.9-1.6 c0.1-0.5,0.1-1.1-0.1-1.6c-0.3-1-2.5-1.3-2.8-1.4C9.8,8.7,9.2,8.7,9.2,8.2c0-0.5,0.6-0.5,0.6-0.5h5.6l-2.3,5.8h2.2l0.4-1.2h2.4 l0.4,1.2h6.4c1.8,0,2.3-2.2,2.3-2.2l-1.7-0.6c0,0-0.4,1.3-1.6,1.3s-1.3-0.8-1.3-2.3S23.8,8,23.8,8h4.4v5.5h2.1v-2.7H32 c1.1,0,2-1,2-2.1c0,0,0,0,0-0.1C34,6.7,32.2,6.5,32.2,6.5z M3,10.8l0.8-2.6l0.8,2.6H3z M16,10.8l0.8-2.6l0.8,2.6H16z M31.2,9.5h-1 V7.9h1.1C31.7,8,32,8.3,32,8.7C32,9.1,31.7,9.5,31.2,9.5z"></path>
                  </svg>
                </a>
              </div>

              <p className="text-theme-secondary text-xs font-medium">
                © {new Date().getFullYear()} {siteName}. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}