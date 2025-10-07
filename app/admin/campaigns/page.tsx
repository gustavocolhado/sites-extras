'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Users, TrendingUp, DollarSign, Target } from 'lucide-react'

const formatCurrency = (value: number) => {
  // Se o valor for um número inteiro e maior que 100 (assumindo que valores menores que 100 são reais, e maiores são centavos)
  if (Number.isInteger(value) && value >= 100) {
    return (value / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' });
  }
  // Caso contrário, assume que já está em reais
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' });
};

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface Stats {
  totalVisits: number
  totalConversions: number
  conversionRate: number
  totalRevenue: number
}

interface CampaignStats {
  source: string;
  campaign: string;
  visits: number;
  conversions: number;
  revenue: number;
}

interface DetailedConversion {
  id: string;
  source: string;
  campaign: string;
  amount: number;
  convertedAt: string;
  User: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminCampaigns() {
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [stats, setStats] = useState<Stats>({
    totalVisits: 0,
    totalConversions: 0,
    conversionRate: 0,
    totalRevenue: 0,
  })
  const [campaignStats, setCampaignStats] = useState<CampaignStats[]>([])
  const [detailedConversions, setDetailedConversions] = useState<DetailedConversion[]>([]);
  const [conversionsPagination, setConversionsPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    source: '',
    campaign: ''
  })

  const fetchCampaigns = async (page = 1, startDate = '', endDate = '', source = '', campaign = '') => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        startDate,
        endDate,
        source,
        campaign
      })
      
      const response = await fetch(`/api/admin/campaigns?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPagination(data.pagination)
        setStats(data.stats)
        setCampaignStats(data.campaignStats || [])
        setDetailedConversions(data.detailedConversions || [])
        setConversionsPagination(data.conversionsPagination || {})
      }
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns(1, filters.startDate, filters.endDate, filters.source, filters.campaign)
  }, [])

  const handleFilterChange = () => {
    fetchCampaigns(1, filters.startDate, filters.endDate, filters.source, filters.campaign)
  }

  const handlePageChange = (newPage: number) => {
    fetchCampaigns(newPage, filters.startDate, filters.endDate, filters.source, filters.campaign)
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
          Campanhas e Conversões
        </h1>
        <p className="text-slate-600 mt-2">Analise o desempenho das campanhas e conversões</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total de Visitas</CardTitle>
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalVisits.toLocaleString()}</div>
            <p className="text-xs text-slate-500">
              Visitas totais
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Conversões</CardTitle>
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg">
              <Target className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalConversions.toLocaleString()}</div>
            <p className="text-xs text-slate-500">
              Conversões totais
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Taxa de Conversão</CardTitle>
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.conversionRate}%</div>
            <p className="text-xs text-slate-500">
              Taxa média
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Receita Total</CardTitle>
            <div className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-slate-500">
              Receita gerada
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Fonte</label>
              <input
                type="text"
                placeholder="Filtrar por fonte..."
                value={filters.source}
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Campanha</label>
              <input
                type="text"
                placeholder="Filtrar por campanha..."
                value={filters.campaign}
                onChange={(e) => setFilters({ ...filters, campaign: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleFilterChange}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Filtrar
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas por Campanha */}
      {campaignStats.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Estatísticas por Campanha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Fonte</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Campanha</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Visitas</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Conversões</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Taxa de Conversão</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignStats.map((stat, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">{stat.source}</td>
                      <td className="py-3 px-4 text-slate-600">{stat.campaign}</td>
                      <td className="py-3 px-4 text-slate-600">{(stat.visits || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-600">{(stat.conversions || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                          {(stat.visits || 0) > 0 ? Math.round(((stat.conversions || 0) / (stat.visits || 1)) * 100 * 100) / 100 : 0}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {formatCurrency(stat.revenue || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paginação */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-slate-600">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} registros
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
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
              disabled={pagination.page >= pagination.pages}
              className="flex items-center px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Tabela de Conversões Detalhadas */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">
            Conversões Detalhadas ({conversionsPagination.total} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Usuário</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Fonte</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Campanha</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Valor</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Data</th>
                </tr>
              </thead>
              <tbody>
                {detailedConversions.map((conv) => (
                  <tr key={conv.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-slate-900">{conv.User.name || 'Sem nome'}</div>
                        <div className="text-sm text-slate-500">{conv.User.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{conv.source}</td>
                    <td className="py-3 px-4 text-slate-600">{conv.campaign}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {formatCurrency(conv.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(conv.convertedAt).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {conversionsPagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-slate-600">
                Mostrando {((conversionsPagination.page - 1) * conversionsPagination.limit) + 1} a {Math.min(conversionsPagination.page * conversionsPagination.limit, conversionsPagination.total)} de {conversionsPagination.total} registros
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(conversionsPagination.page - 1)}
                  disabled={conversionsPagination.page <= 1}
                  className="flex items-center px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(conversionsPagination.page + 1)}
                  disabled={conversionsPagination.page >= conversionsPagination.pages}
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
    </div>
  )
}
