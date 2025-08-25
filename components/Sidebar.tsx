'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Home, Video, Star, Tag, Grid, Tv, Search, Users, Upload, ChevronDown } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter()
  const [activeItem, setActiveItem] = useState('Porno Amador')

  const menuItems = [
    { id: 'Porno Amador', icon: Home, isActive: true, path: '/' },
    { id: 'Videos', icon: Video, hasDropdown: true, path: '/videos' },
    { id: 'ThePornDude', icon: null, customIcon: '👤', path: '/creators' },
    { id: 'Estrelas Pornô', icon: Star, path: '/creators' },
    { id: 'Tags', icon: Tag, path: '/tags' },
    { id: 'Categorias', icon: Grid, path: '/categories' },
    { id: 'Canais', icon: Tv, path: '/channels' },
    { id: 'Termos Mais Buscados', icon: Search, hasDropdown: true, path: '/search' },
    { id: 'Comunidade', icon: Users, path: '/community' },
    { id: 'Upload', icon: Upload, path: '/upload' }
  ]

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
      <div className={`fixed top-0 left-0 h-full w-80 bg-dark-card z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:z-auto`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <button
            onClick={onClose}
            className="text-text-primary hover:text-accent-red transition-colors lg:hidden"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent-red rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">CNN</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary">AMADOR</h1>
              <p className="text-xs text-text-secondary">Videos Porno de Sexo Amador</p>
            </div>
          </div>
          
          <div className="w-8 h-8 bg-accent-red rounded-full flex items-center justify-center">
            <span className="text-white text-xs">★</span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            const isActive = activeItem === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveItem(item.id)
                  if (item.path) {
                    router.push(item.path)
                    onClose() // Fechar sidebar no mobile
                  }
                }}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-accent-red text-white' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-dark-hover'
                }`}
              >
                {item.customIcon ? (
                  <span className="text-lg">{item.customIcon}</span>
                ) : IconComponent ? (
                  <IconComponent size={20} />
                ) : null}
                
                <span className="flex-1 text-left">{item.id}</span>
                
                {item.hasDropdown && (
                  <ChevronDown size={16} />
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </>
  )
} 