'use client'

import { X, Home, Play, Users, Crown, Tag, FolderOpen, MessageCircle, HelpCircle, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useDomainContext } from '@/contexts/DomainContext'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { isPremium } = useAuth()
  const router = useRouter()
  const { domainConfig, isLoading } = useDomainContext()

  // Fallback para quando o domínio ainda não foi carregado
  const siteName = isLoading || !domainConfig ? 'CORNOS BRASIL' : domainConfig.siteName
  const siteDescription = isLoading || !domainConfig 
    ? 'Videos Porno de Sexo Amador'
    : domainConfig.description.substring(0, 50) + '...'
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-theme-card z-50 transform transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-input">
          <button 
            onClick={onClose}
            className="text-theme-primary hover:text-accent-red transition-colors mr-2"
          >
            <X size={24} />
          </button>
          
                           <div className="flex items-center space-x-2">
                   <div>
                     <h1 className="text-xl font-bold text-theme-primary">{siteName}</h1>
                     <p className="text-xs text-theme-secondary">{siteDescription}</p>
                   </div>
                 </div>
          
          <button className="text-theme-primary hover:text-accent-red transition-colors">
            <Users size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-theme-input">
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const searchTerm = formData.get('search') as string
            if (searchTerm.trim()) {
              router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
              onClose()
            }
          }} className="flex items-center theme-input rounded-lg overflow-hidden">
            <div className="flex-1 flex items-center px-3">
              <Search className="w-4 h-4 text-theme-secondary mr-2" />
              <input
                name="search"
                type="text"
                placeholder="Pesquisar videos..."
                className="flex-1 bg-transparent py-2 focus:outline-none text-theme-primary text-sm"
              />
            </div>
            <button type="submit" className="theme-btn-primary px-4 py-2 text-sm">
              BUSCAR
            </button>
          </form>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="py-2">
            <li>
              <a href="/" className="flex items-center space-x-3 px-4 py-3 text-accent-red font-medium hover:bg-theme-hover transition-colors">
                <Home size={20} className="text-accent-red" />
                <span className="flex-1">Home</span>
              </a>
              <div className="border-b border-theme-input mx-4" />
            </li>
            
            <li>
              <a href="/videos" className="flex items-center space-x-3 px-4 py-3 text-theme-primary hover:bg-theme-hover transition-colors">
                <Play size={20} className="text-accent-red" />
                <span className="flex-1">Videos</span>
              </a>
              <div className="border-b border-theme-input mx-4" />
            </li>
            
            <li>
              <a href="/creators" className="flex items-center space-x-3 px-4 py-3 text-theme-primary hover:bg-theme-hover transition-colors">
                <Users size={20} className="text-accent-red" />
                <span className="flex-1">Criadores</span>
              </a>
              <div className="border-b border-theme-input mx-4" />
            </li>
            
            {!isPremium && (
              <li>
                <a href="/premium" className="flex items-center space-x-3 px-4 py-3 text-yellow-500 hover:bg-theme-hover transition-colors">
                  <Crown size={20} className="text-yellow-500" />
                  <span className="flex-1">Premium</span>
                </a>
                <div className="border-b border-theme-input mx-4" />
              </li>
            )}
            
            <li>
              <a href="/categories" className="flex items-center space-x-3 px-4 py-3 text-theme-primary hover:bg-theme-hover transition-colors">
                <FolderOpen size={20} className="text-accent-red" />
                <span className="flex-1">Categorias</span>
              </a>
              <div className="border-b border-theme-input mx-4" />
            </li>
            
            <li>
              <a href="/tags" className="flex items-center space-x-3 px-4 py-3 text-theme-primary hover:bg-theme-hover transition-colors">
                <Tag size={20} className="text-accent-red" />
                <span className="flex-1">Tags</span>
              </a>
              <div className="border-b border-theme-input mx-4" />
            </li>
            
            <li>
              <a href="/contact" className="flex items-center space-x-3 px-4 py-3 text-theme-primary hover:bg-theme-hover transition-colors">
                <MessageCircle size={20} className="text-accent-red" />
                <span className="flex-1">Contato</span>
              </a>
              <div className="border-b border-theme-input mx-4" />
            </li>
            
            <li>
              <a href="/support" className="flex items-center space-x-3 px-4 py-3 text-theme-primary hover:bg-theme-hover transition-colors">
                <HelpCircle size={20} className="text-accent-red" />
                <span className="flex-1">Suporte</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  )
} 