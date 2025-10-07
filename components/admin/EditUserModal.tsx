'use client'

import { useState, useEffect } from 'react'
import { X, Save, Eye, EyeOff, Calendar, User as UserIcon, Mail, Shield, Crown, ChevronDown } from 'lucide-react' // Renomear User para UserIcon
import { useTheme } from '@/contexts/ThemeContext'
import { User } from '@/types/common' // Importar a interface User de types/common

interface EditUserModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedUser: User) => void
}

export default function EditUserModal({ user, isOpen, onClose, onSave }: EditUserModalProps) {
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    premium: false,
    access: 0,
    expireDate: '',
    newPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        premium: Boolean(user.premium),
        access: Number(user.access) || 0,
        expireDate: user.expireDate ? new Date(user.expireDate).toISOString().split('T')[0] : '',
        newPassword: ''
      })
      setError('')
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          name: formData.name,
          email: formData.email,
          premium: formData.premium,
          access: formData.access,
          expireDate: formData.expireDate || null,
          newPassword: formData.newPassword || undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        onSave(data.user)
        onClose()
      } else {
        setError(data.error || 'Erro ao atualizar usuário')
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Editar Usuário</h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Modifique as informações do usuário</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'} rounded-lg transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Nome */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
              Nome
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`pl-10 pr-4 py-2 border ${theme === 'dark' ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-300 bg-white text-slate-900'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full`}
                placeholder="Nome do usuário"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`pl-10 pr-4 py-2 border ${theme === 'dark' ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-300 bg-white text-slate-900'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full`}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          {/* Nova Senha */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
              Nova Senha (deixe em branco para não alterar)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className={`pl-4 pr-12 py-2 border ${theme === 'dark' ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-300 bg-white text-slate-900'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full`}
                placeholder="Nova senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Nível de Acesso */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
              Nível de Acesso
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={formData.access}
                onChange={(e) => handleInputChange('access', parseInt(e.target.value))}
                className={`pl-10 pr-10 py-2 border ${theme === 'dark' ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-300 bg-white text-slate-900'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full appearance-none cursor-pointer`}
              >
                <option value={0}>Usuário Normal</option>
                <option value={1}>Administrador</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* Premium */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.premium}
                onChange={(e) => handleInputChange('premium', e.target.checked)}
                className={`w-4 h-4 text-indigo-600 ${theme === 'dark' ? 'border-slate-600 bg-slate-700' : 'border-slate-300 bg-white'} rounded focus:ring-indigo-500`}
              />
              <Crown className="w-4 h-4 text-purple-500" />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Usuário Premium</span>
            </label>
          </div>

          {/* Data de Expiração */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
              Data de Expiração do Premium
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="date"
                value={formData.expireDate}
                onChange={(e) => handleInputChange('expireDate', e.target.value)}
                className={`pl-10 pr-4 py-2 border ${theme === 'dark' ? 'border-slate-600 bg-slate-700 text-white' : 'border-slate-300 bg-white text-slate-900'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full`}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
              Deixe em branco para premium sem expiração
            </p>
          </div>

          {/* Botões */}
          <div className={`flex items-center justify-end space-x-3 pt-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800'} transition-colors`}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
