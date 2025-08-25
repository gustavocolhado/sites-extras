'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3, 
  Users, 
  Video, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  Filter
} from 'lucide-react'

interface ReportData {
  totalUsers: number
  totalVideos: number
  totalRevenue: number
  totalViews: number
  userGrowth: {
    date: string
    count: number
  }[]
  videoViews: {
    date: string
    views: number
  }[]
  revenueData: {
    date: string
    revenue: number
  }[]
  topVideos: {
    id: string
    title: string
    views: number
    likes: number
  }[]
  topCategories: {
    name: string
    videoCount: number
    totalViews: number
  }[]
}

interface Filters {
  startDate: string
  endDate: string
  reportType: 'daily' | 'weekly' | 'monthly'
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reportType: 'monthly'
  })

  useEffect(() => {
    fetchReportData()
  }, [filters])

  const fetchReportData = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        reportType: filters.reportType
      })
      
      const response = await fetch(`/api/admin/reports?${params}`)
      if (!response.ok) throw new Error('Falha ao carregar relatórios')
      
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (type: 'csv' | 'pdf') => {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        reportType: filters.reportType,
        format: type
      })
      
      const response = await fetch(`/api/admin/reports/export?${params}`)
      if (!response.ok) throw new Error('Falha ao exportar relatório')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${filters.reportType}-${filters.startDate}-${filters.endDate}.${type}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Relatórios
          </h1>
          <p className="text-slate-600 mt-2">
            Análise detalhada de dados e métricas da plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-md shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tipo de Relatório
              </label>
              <select
                value={filters.reportType}
                onChange={(e) => setFilters({ ...filters, reportType: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchReportData}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Atualizar
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {reportData?.totalUsers?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-blue-700">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total de Vídeos</CardTitle>
            <Video className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {reportData?.totalVideos?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-green-700">
              +8% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              R$ {reportData?.totalRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-purple-700">
              +15% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Total de Visualizações</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {reportData?.totalViews?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-orange-700">
              +22% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="bg-white/80 backdrop-blur-md shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800">Crescimento de Usuários</CardTitle>
            <CardDescription>
              Evolução do número de usuários registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                <p>Gráfico de crescimento de usuários</p>
                <p className="text-sm">Dados: {reportData?.userGrowth?.length || 0} pontos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Views Chart */}
        <Card className="bg-white/80 backdrop-blur-md shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800">Visualizações de Vídeos</CardTitle>
            <CardDescription>
              Tendência de visualizações ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                <p>Gráfico de visualizações</p>
                <p className="text-sm">Dados: {reportData?.videoViews?.length || 0} pontos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Videos */}
        <Card className="bg-white/80 backdrop-blur-md shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800">Vídeos Mais Populares</CardTitle>
            <CardDescription>
              Top 10 vídeos com mais visualizações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData?.topVideos?.slice(0, 5).map((video, index) => (
                <div key={video.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{video.title}</p>
                      <p className="text-sm text-slate-500">{video.views.toLocaleString()} visualizações</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-600">{video.likes} curtidas</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="bg-white/80 backdrop-blur-md shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800">Categorias Mais Populares</CardTitle>
            <CardDescription>
              Categorias com mais vídeos e visualizações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData?.topCategories?.slice(0, 5).map((category, index) => (
                <div key={category.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{category.name}</p>
                      <p className="text-sm text-slate-500">{category.videoCount} vídeos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-600">
                      {category.totalViews.toLocaleString()} visualizações
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
