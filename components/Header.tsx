'use client'

import { useState } from 'react'
import { ChevronDown, Video, Menu, User, Camera, LogOut, Crown, Settings, Heart, Star, Clock, Search, Send, MessageCircle, Flag } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import Logo from './Logo'
import MobileSidebar from './MobileSidebar'
import AuthModal from './AuthModal'
import UserStatus from './UserStatus'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { resetAgeConfirmation } from '@/utils/ageVerification'
export default function Header() {
  const { session, status, signOut, openAuthModal, closeAuthModal, isAuthModalOpen, isPremium } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  // Fechar menu quando clicar fora
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element
    if (!target.closest('.user-menu')) {
      setIsUserMenuOpen(false)
    }
  }

  // Adicionar listener para fechar menu
  if (typeof window !== 'undefined') {
    window.addEventListener('click', handleClickOutside)
  }

  return (
    <header className="theme-header container-full">
      <div className="container-content">
        {/* Mobile Header */}
        <div className="lg:hidden">
          {/* Top Row */}
          <div className="flex items-center justify-between py-3 px-2">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-theme-primary hover:text-accent-red transition-colors"
              >
                <Menu size={28} />
              </button>
              <button 
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="text-theme-primary hover:text-accent-red transition-colors"
              >
                <Search size={24} />
              </button>
            </div>
            
            <Logo />
            
            <div className="flex items-center space-x-4">
              <button className="text-theme-primary hover:text-accent-red transition-colors">
                <MessageCircle size={24} />
              </button>
              <button 
                onClick={status === 'authenticated' ? () => router.push('/profile') : () => openAuthModal()}
                className="text-theme-primary hover:text-accent-red transition-colors"
              >
                <User size={24} />
              </button>
              <button
                onClick={() => router.push('/profile?tab=settings')}
                className="text-theme-primary hover:text-accent-red transition-colors relative"
              >
                <Settings size={24} />
                <img src="https://hatscripts.github.io/circle-flags/flags/br.svg" width="14" className="absolute -top-0.5 -right-0.5" />
              </button>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex items-center justify-center space-x-6 py-2 border-t border-theme-input text-sm">
            <a
              href={isPremium ? '/' : '/premium'}
              className="flex items-center space-x-1.5 text-theme-primary font-semibold"
              aria-label={isPremium ? 'Premium' : 'Seja Premium'}
            >
              <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-sm">VIP</span>
              <span>{isPremium ? 'Premium' : 'Seja Premium'}</span>
            </a>
            <a href="https://t.me/cornosbrasill" target="blank" className="flex items-center space-x-1.5 text-theme-primary font-medium">
              <Send size={18} />
              <span>Telegram</span>
            </a>
            <a href="/creators" className="flex items-center space-x-1.5 text-theme-primary font-medium">
              <Heart size={18} />
              <span>Criadores</span>
            </a>
          </div>

          {/* Mobile Search Input */}
          {isMobileSearchOpen && (
            <div className="py-2 w-full">
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const searchTerm = formData.get('search') as string
                if (searchTerm.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
                  setIsMobileSearchOpen(false)
                }
              }} className="flex items-center bg-white dark:bg-black rounded-lg overflow-hidden border border-theme-input w-full">
                <input
                  name="search"
                  type="text"
                  placeholder="Pesquisar no Cornos Brasil..."
                  className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-theme-primary"
                  autoFocus
                />
                <button type="submit" className="px-4 text-gray-500">
                  <Search size={20} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          {/* Logo Section */}
          <div className="flex items-center justify-between">
            <Logo />
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const searchTerm = formData.get('search') as string
                if (searchTerm.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
                }
              }} className="flex items-center theme-input rounded-lg overflow-hidden">
                <div className="flex-1 flex items-center px-4">
                  <Search className="w-4 h-4 text-theme-secondary mr-2" />
                  <input
                    name="search"
                    type="text"
                    placeholder="Pesquisar videos amadores..."
                    className="flex-1 bg-transparent py-2 focus:outline-none text-theme-primary"
                  />
                </div>
                <button type="submit" className="theme-btn-primary px-6 py-2">
                  BUSCAR
                </button>
              </form>
            </div>

                         {/* User Options */}
             <div className="flex items-center space-x-4">
               <ThemeToggle />
               <button className="flex items-center space-x-1 text-theme-secondary hover:text-theme-primary transition-colors">
                 <span className="text-sm font-medium">PT</span>
                 <ChevronDown size={12} />
               </button>
               
                               {status === 'authenticated' ? (
                  <div className="flex items-center space-x-4">
                    <UserStatus />
                    
                    {/* User Menu */}
                    <div className="relative user-menu">
                      <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center space-x-2 text-theme-primary hover:text-accent-red transition-colors"
                      >
                        <div className="w-8 h-8 bg-accent-red rounded-full flex items-center justify-center">
                          {session?.user?.image ? (
                            <img 
                              src={session.user.image} 
                              alt={session.user.name || 'Avatar'} 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {session?.user?.name || session?.user?.email}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-theme-card border border-theme-border-primary rounded-xl shadow-xl z-50">
                          <div className="p-4 border-b border-theme-border-primary">
                            <p className="text-sm text-theme-secondary">Logado como</p>
                            <p className="font-medium text-theme-primary">
                              {session?.user?.name || session?.user?.email}
                            </p>
                          </div>
                          
                          <div className="p-2">
                            <button
                              onClick={() => {
                                router.push('/profile')
                                setIsUserMenuOpen(false)
                              }}
                              className="w-full flex items-center space-x-3 px-3 py-2 text-theme-primary hover:bg-theme-hover rounded-lg transition-colors"
                            >
                              <User className="w-4 h-4" />
                              <span>Meu Perfil</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                router.push('/profile?tab=liked')
                                setIsUserMenuOpen(false)
                              }}
                              className="w-full flex items-center space-x-3 px-3 py-2 text-theme-primary hover:bg-theme-hover rounded-lg transition-colors"
                            >
                              <Heart className="w-4 h-4" />
                              <span>Vídeos Curtidos</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                router.push('/profile?tab=favorites')
                                setIsUserMenuOpen(false)
                              }}
                              className="w-full flex items-center space-x-3 px-3 py-2 text-theme-primary hover:bg-theme-hover rounded-lg transition-colors"
                            >
                              <Star className="w-4 h-4" />
                              <span>Favoritos</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                router.push('/profile?tab=history')
                                setIsUserMenuOpen(false)
                              }}
                              className="w-full flex items-center space-x-3 px-3 py-2 text-theme-primary hover:bg-theme-hover rounded-lg transition-colors"
                            >
                              <Clock className="w-4 h-4" />
                              <span>Histórico</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                router.push('/profile?tab=settings')
                                setIsUserMenuOpen(false)
                              }}
                              className="w-full flex items-center space-x-3 px-3 py-2 text-theme-primary hover:bg-theme-hover rounded-lg transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              <span>Configurações</span>
                            </button>
                            
                            {/* Botão de teste para resetar verificação de idade */}
                            {process.env.NODE_ENV === 'development' && (
                              <button
                                onClick={() => {
                                  resetAgeConfirmation()
                                  window.location.reload()
                                  setIsUserMenuOpen(false)
                                }}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              >
                                <span className="text-sm">🧪 Reset Age Check</span>
                              </button>
                            )}
                          </div>
                          
                          <div className="p-2 border-t border-theme-border-primary">
                            <button 
                              onClick={() => {
                                signOut()
                                setIsUserMenuOpen(false)
                              }}
                              className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sair</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                 <div className="flex items-center space-x-4">
                   <button 
                     onClick={() => openAuthModal('login')}
                     className="theme-btn-primary px-4 py-2 rounded"
                   >
                     ENTRAR
                   </button>
                   
                   <button 
                     onClick={() => openAuthModal('signup')}
                     className="border border-theme-primary hover:border-theme-secondary px-4 py-2 rounded text-theme-primary transition-colors"
                   >
                     CRIAR UMA CONTA
                   </button>
                 </div>
               )}
             </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-6 py-2 border-t border-theme-input font-semibold overflow-x-auto">
            <a href="/" className="text-accent-red border-b-2 border-accent-red pb-1 text-sm font-medium whitespace-nowrap">Home</a>
            <a href="/videos" className="text-theme-secondary hover:text-theme-primary transition-colors text-sm whitespace-nowrap">Videos</a>
            <a href="/creators" className="text-theme-secondary hover:text-theme-primary transition-colors text-sm whitespace-nowrap">Criadores</a>
            {!isPremium && (
              <a href="/premium" className="flex items-center gap-1 text-yellow-500 hover:text-yellow-400 transition-colors text-sm font-medium whitespace-nowrap">
                <Crown className="w-4 h-4" />
                Premium
              </a>
            )}
            <a href="/categories" className="text-theme-secondary hover:text-theme-primary transition-colors text-sm whitespace-nowrap">Categorias</a>
            <a href="/tags" className="text-theme-secondary hover:text-theme-primary transition-colors text-sm whitespace-nowrap">Tags</a>
            <a href="/contact" className="text-theme-secondary hover:text-theme-primary transition-colors text-sm whitespace-nowrap">Contato</a>
            <a href="/support" className="text-theme-secondary hover:text-theme-primary transition-colors text-sm whitespace-nowrap">Suporte</a>
            <a 
              href="https://t.me/cornosbrasill" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-500 hover:text-blue-400 transition-colors text-sm font-medium whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4" />
              Telegram
            </a>
          </div>
        </div>

      </div>
      
      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={closeAuthModal}
      />
    </header>
  )
}
