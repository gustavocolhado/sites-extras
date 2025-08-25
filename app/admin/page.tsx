'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Video, 
  Eye, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Play,
  Heart,
  Share2,
  UserPlus,
  CreditCard,
  ThumbsUp,
  Bookmark,
  Clock
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalVideos: number
  totalViews: number
  totalRevenue: number
  activeUsers: number
  totalLikes: number
  totalShares: number
  totalPlays: number
  // Estatísticas do dia
  usersRegisteredToday: number
  revenueToday: number
  activeUsersToday: number
  viewsToday: number
}

interface RecentActivity {
  id: string
  type: 'user_registered' | 'payment_completed' | 'video_liked' | 'video_favorited' | 'video_watched'
  title: string
  description: string
  timestamp: string
  user?: {
    id: string
    name: string
    email: string
  }
  metadata?: any
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalVideos: 0,
    totalViews: 0,
    totalRevenue: 0,
    activeUsers: 0,
    totalLikes: 0,
    totalShares: 0,
    totalPlays: 0,
    // Estatísticas do dia
    usersRegisteredToday: 0,
    revenueToday: 0,
    activeUsersToday: 0,
    viewsToday: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, activitiesResponse] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/recent-activity?limit=8')
        ])

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          console.log('📊 Dados recebidos da API:', statsData)
          setStats(statsData)
        } else {
          console.error('❌ Erro na resposta da API:', statsResponse.status, statsResponse.statusText)
        }

        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json()
          setRecentActivities(activitiesData.activities)
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <UserPlus className="w-4 h-4 text-emerald-600" />
      case 'payment_completed':
        return <CreditCard className="w-4 h-4 text-blue-600" />
      case 'video_liked':
        return <ThumbsUp className="w-4 h-4 text-rose-600" />
      case 'video_favorited':
        return <Bookmark className="w-4 h-4 text-purple-600" />
      case 'video_watched':
        return <Play className="w-4 h-4 text-indigo-600" />
      default:
        return <Activity className="w-4 h-4 text-slate-600" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registered':
        return 'bg-emerald-100 text-emerald-800'
      case 'payment_completed':
        return 'bg-blue-100 text-blue-800'
      case 'video_liked':
        return 'bg-rose-100 text-rose-800'
      case 'video_favorited':
        return 'bg-purple-100 text-purple-800'
      case 'video_watched':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return 'Agora mesmo'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}h atrás`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days}d atrás`
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
          Dashboard Administrativo
        </h1>
        <p className="text-slate-600 mt-2">Visão geral do sistema</p>
      </div>

      {/* Estatísticas do Dia - Destaque */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">📊 Estatísticas de Hoje</h2>
          <div className="text-sm opacity-90">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Usuários Cadastrados</p>
                <p className="text-2xl font-bold">{stats.usersRegisteredToday}</p>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <UserPlus className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Receita do Dia</p>
                <p className="text-2xl font-bold">R$ {(stats.revenueToday || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Usuários Ativos</p>
                <p className="text-2xl font-bold">{stats.activeUsersToday}</p>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Visualizações</p>
                <p className="text-2xl font-bold">{stats.viewsToday.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <Eye className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">📈 Estatísticas Gerais</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total de Usuários</CardTitle>
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-slate-500">
              +20.1% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total de Vídeos</CardTitle>
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <Video className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalVideos.toLocaleString()}</div>
            <p className="text-xs text-slate-500">
              +12.5% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total de Visualizações</CardTitle>
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg">
              <Eye className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-slate-500">
              +8.2% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Receita Total</CardTitle>
            <div className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
                         <div className="text-2xl font-bold text-slate-900">R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-slate-500">
              +15.3% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Usuários Ativos</CardTitle>
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-slate-500">
              +5.7% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total de Likes</CardTitle>
            <div className="p-2 bg-gradient-to-r from-rose-500 to-rose-600 rounded-lg">
              <Heart className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalLikes.toLocaleString()}</div>
            <p className="text-xs text-slate-500">
              +12.8% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total de Compartilhamentos</CardTitle>
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg">
              <Share2 className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalShares.toLocaleString()}</div>
            <p className="text-xs text-slate-500">
              +3.2% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total de Reproduções</CardTitle>
            <div className="p-2 bg-gradient-to-r from-violet-500 to-violet-600 rounded-lg">
              <Play className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalPlays.toLocaleString()}</div>
            <p className="text-xs text-slate-500">
              +10.1% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Atividade Recente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50/50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {activity.title}
                        </p>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate">
                        {activity.description}
                      </p>
                      {activity.user && (
                        <div className="flex items-center mt-1">
                          <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                            <span className="text-white text-xs font-medium">
                              {activity.user.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {activity.user.name || activity.user.email || 'Usuário'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Vídeos Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Vídeo #1</p>
                  <p className="text-xs text-slate-500">1.2k visualizações</p>
                </div>
                <span className="text-sm font-medium text-emerald-600">98%</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Vídeo #2</p>
                  <p className="text-xs text-slate-500">856 visualizações</p>
                </div>
                <span className="text-sm font-medium text-blue-600">87%</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">Vídeo #3</p>
                  <p className="text-xs text-slate-500">654 visualizações</p>
                </div>
                <span className="text-sm font-medium text-amber-600">76%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
