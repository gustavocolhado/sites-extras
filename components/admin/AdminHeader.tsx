'use client'

import { useSession, signOut } from 'next-auth/react'
import { Bell, Search, User } from 'lucide-react'

export default function AdminHeader() {
  const { data: session } = useSession()

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            CORNOS BRASIL
          </h1>
          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Administração
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Barra de Pesquisa */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            />
          </div>

          {/* Notificações */}
          <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Perfil do Usuário */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {session?.user?.name || 'Administrador'}
              </p>
              <p className="text-xs text-slate-500">
                {session?.user?.email || 'admin@cornosbrasil.com'}
              </p>
            </div>
            <div className="relative">
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </button>
            </div>
          </div>

          {/* Botão Sair */}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
