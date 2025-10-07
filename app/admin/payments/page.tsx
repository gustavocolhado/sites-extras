'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, ChevronLeft, ChevronRight, Calendar, DollarSign, Users } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  status: string
  plan: string
  transactionDate: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

interface Stats {
  totalAmount: number
  totalCount: number
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [stats, setStats] = useState<Stats>({
    totalAmount: 0,
    totalCount: 0
  })
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    plan: 'all'
  })
  const [showDuplicates, setShowDuplicates] = useState(false)
  const [isRemovingDuplicates, setIsRemovingDuplicates] = useState(false)
  const [duplicatesPreview, setDuplicatesPreview] = useState<any[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const fetchPayments = async (page = 1, startDate = '', endDate = '', status = 'all', plan = 'all', duplicates = false) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        startDate,
        endDate,
        status,
        plan,
        showDuplicates: duplicates.toString()
      })
      
      const response = await fetch(`/api/admin/payments?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments)
        setPagination(data.pagination)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments(1, filters.startDate, filters.endDate, filters.status, filters.plan, showDuplicates)
  }, [showDuplicates])

  const handleFilterChange = () => {
    fetchPayments(1, filters.startDate, filters.endDate, filters.status, filters.plan, showDuplicates)
  }

  const handlePageChange = (newPage: number) => {
    fetchPayments(newPage, filters.startDate, filters.endDate, filters.status, filters.plan, showDuplicates)
  }

  const handleToggleDuplicates = () => {
    setShowDuplicates(!showDuplicates)
  }

  const handleRemoveDuplicates = async () => {
    // Primeiro, buscar a lista de duplicados que serão removidos
    try {
      const response = await fetch('/api/admin/payments/list-duplicates')
      if (response.ok) {
        const data = await response.json()
        setDuplicatesPreview(data.duplicatesToRemove)
        setShowConfirmDialog(true)
      } else {
        alert('Erro ao carregar lista de duplicados')
      }
    } catch (error) {
      console.error('Erro ao carregar duplicados:', error)
      alert('Erro ao carregar lista de duplicados')
    }
  }

  const confirmRemoveDuplicates = async () => {
    setShowConfirmDialog(false)
    setIsRemovingDuplicates(true)
    
    try {
      const response = await fetch('/api/admin/payments/remove-duplicates', {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        alert(`${data.removedCount} pagamentos duplicados foram removidos com sucesso!`)
        // Recarregar a lista
        fetchPayments(1, filters.startDate, filters.endDate, filters.status, filters.plan, showDuplicates)
      } else {
        alert('Erro ao remover duplicados')
      }
    } catch (error) {
      console.error('Erro ao remover duplicados:', error)
      alert('Erro ao remover duplicados')
    } finally {
      setIsRemovingDuplicates(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-emerald-100 text-emerald-800'
      case 'pending':
        return 'bg-amber-100 text-amber-800'
      case 'failed':
      case 'error':
        return 'bg-rose-100 text-rose-800'
      case 'cancelled':
      case 'canceled':
        return 'bg-slate-100 text-slate-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'Concluído'
      case 'pending':
        return 'Pendente'
      case 'failed':
      case 'error':
        return 'Falhou'
      case 'cancelled':
      case 'canceled':
        return 'Cancelado'
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Gerenciar Pagamentos
        </h1>
        <p className="text-slate-600 mt-2">Visualize e gerencie todos os pagamentos do sistema</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total de Pagamentos</CardTitle>
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalCount.toLocaleString()}</div>
            <p className="text-xs text-slate-500">
              Pagamentos processados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Valor Total</CardTitle>
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">R$ {stats.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-slate-500">
              Valor total processado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Inicial</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Final</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              >
                <option value="all">Todos os status</option>
                <option value="completed">Concluído</option>
                <option value="paid">Pago</option>
                <option value="pending">Pendente</option>
                <option value="failed">Falhou</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Plano</label>
              <select
                value={filters.plan}
                onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              >
                <option value="all">Todos os planos</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semiannual">Semiannual</option>
                <option value="yearly">Yearly</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={handleFilterChange}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Filtrar
              </button>
            </div>
          </div>
          
          {/* Botões de Duplicados */}
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleToggleDuplicates}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showDuplicates 
                  ? 'bg-orange-600 text-white hover:bg-orange-700' 
                  : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
              }`}
            >
              {showDuplicates ? 'Ocultar Duplicados' : 'Exibir Duplicados'}
            </button>
            
            <button
              onClick={handleRemoveDuplicates}
              disabled={isRemovingDuplicates}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRemovingDuplicates ? 'Removendo...' : 'Excluir Duplicados'}
            </button>
          </div>
          
          {showDuplicates && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Modo Duplicados:</strong> Exibindo apenas pagamentos duplicados. 
                Use o botão "Excluir Duplicados" para remover automaticamente os registros duplicados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Pagamentos */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">
            {showDuplicates ? 'Pagamentos Duplicados' : 'Pagamentos'} ({pagination.total} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Usuário</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Valor</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Plano</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Data</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                    showDuplicates ? 'bg-orange-50/50' : ''
                  }`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-medium">
                            {payment.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{payment.user?.name || 'Usuário não encontrado'}</div>
                          <div className="text-sm text-slate-500">{payment.user?.email || 'Email não disponível'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-900">
                        R$ {payment.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {payment.plan || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {payment.transactionDate 
                        ? new Date(payment.transactionDate).toLocaleDateString('pt-BR')
                        : 'N/A'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-slate-600">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} pagamentos
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="flex items-center px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const pageNum = i + 1
                    if (pagination.pages <= 5) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg ${
                            pageNum === pagination.page
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-500 bg-white border border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    }
                    return null
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="flex items-center px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Confirmação */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Confirmar Remoção de Duplicados
            </h3>
            
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Atenção:</strong> Os pagamentos originais (mais antigos) serão mantidos. 
                Apenas as cópias duplicadas serão removidas.
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-2">
                <strong>{duplicatesPreview.length}</strong> pagamentos duplicados serão removidos:
              </p>
              
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-slate-900">Usuário</th>
                      <th className="text-left py-2 px-3 font-medium text-slate-900">Valor</th>
                      <th className="text-left py-2 px-3 font-medium text-slate-900">Data</th>
                      <th className="text-left py-2 px-3 font-medium text-slate-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duplicatesPreview.map((duplicate, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-2 px-3">
                          <div className="font-medium text-slate-900">
                            {duplicate.userEmail || 'Email não disponível'}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          R$ {duplicate.amount.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {new Date(duplicate.transactionDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(duplicate.status)}`}>
                            {getStatusText(duplicate.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRemoveDuplicates}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirmar Remoção
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
