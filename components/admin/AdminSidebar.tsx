'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  Video, 
  Settings, 
  BarChart3, 
  DollarSign,
  FileText,
  Shield,
  LogOut,
  Target,
  UserPlus,
  Tag,
  FolderOpen,
  AlertTriangle
} from 'lucide-react'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Home
  },
  {
    title: 'Usuários',
    href: '/admin/users',
    icon: Users
  },
  {
    title: 'Pagamentos',
    href: '/admin/payments',
    icon: DollarSign
  },
  {
    title: 'Campanhas',
    href: '/admin/campaigns',
    icon: Target
  },
  {
    title: 'Criadores',
    href: '/admin/creators',
    icon: UserPlus
  },
  {
    title: 'Categorias',
    href: '/admin/categories',
    icon: FolderOpen
  },
  {
    title: 'Tags',
    href: '/admin/tags',
    icon: Tag
  },
  {
    title: 'Vídeos',
    href: '/admin/videos',
    icon: Video
  },
  {
    title: 'Relatórios',
    href: '/admin/reports',
    icon: BarChart3
  },
  {
    title: 'Conteúdo',
    href: '/admin/content',
    icon: FileText
  },
  {
    title: 'Configurações',
    href: '/admin/settings',
    icon: Settings
  },
  {
    title: 'Segurança',
    href: '/admin/security',
    icon: Shield
  },
  {
    title: 'Remoção de Conteúdo',
    href: '/admin/remocao',
    icon: AlertTriangle
  }
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={`bg-white/80 backdrop-blur-md shadow-lg ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 min-h-screen border-r border-slate-200`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Admin
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg
              className="w-4 h-4 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <nav className="mt-8">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-r-2 border-indigo-500 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  )
}
