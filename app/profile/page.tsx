'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  User, 
  Edit, 
  Heart, 
  Clock, 
  Settings, 
  LogOut, 
  Crown,
  Eye,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Save,
  X,
  Plus,
  Trash2,
  Play,
  Star
} from 'lucide-react'
import Header from '@/components/Header'
import VideoCard from '@/components/VideoCard'
import Footer from '@/components/Footer'
import { formatDuration } from '@/utils/formatDuration'

interface UserProfile {
  id: string
  name: string
  email: string
  username: string
  image: string
  premium: boolean
  created_at: string
  expireDate?: string
  paymentDate?: string
}

interface Video {
  id: string
  title: string
  description: string
  url: string
  videoUrl: string
  thumbnailUrl: string
  viewCount: number

  duration: number
  premium: boolean
  creator: string
  created_at: string
  trailerUrl?: string
  iframe?: boolean
  category?: string[]
}

interface TabData {
  id: string
  label: string
  icon: any
  count?: number
}

const tabs: TabData[] = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'liked', label: 'Curtidos', icon: Heart },
  { id: 'favorites', label: 'Favoritos', icon: Star },
  { id: 'history', label: 'Histórico', icon: Clock },
  { id: 'settings', label: 'Configurações', icon: Settings }
]

function ProfileContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('profile')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [likedVideos, setLikedVideos] = useState<Video[]>([])
  const [favoriteVideos, setFavoriteVideos] = useState<Video[]>([])
  const [historyVideos, setHistoryVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    email: ''
  })

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin')
    }
  }, [status, router])

  // Definir tab ativa baseada na URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Carregar dados do usuário
  useEffect(() => {
    if (session?.user) {
      loadUserData()
    }
  }, [session])

  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // Carregar perfil do usuário
      const profileResponse = await fetch('/api/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setUserProfile(profileData)
        setEditForm({
          name: profileData.name || '',
          username: profileData.username || '',
          email: profileData.email || ''
        })
      }

      // Carregar vídeos curtidos
      const likedResponse = await fetch('/api/profile/liked-videos')
      if (likedResponse.ok) {
        const likedData = await likedResponse.json()
        setLikedVideos(likedData)
      }

      // Carregar vídeos favoritos
      const favoritesResponse = await fetch('/api/profile/favorite-videos')
      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json()
        setFavoriteVideos(favoritesData)
      }

      // Carregar histórico
      const historyResponse = await fetch('/api/profile/history')
      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        setHistoryVideos(historyData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setUserProfile(updatedProfile)
        setEditing(false)
        // Recarregar dados
        loadUserData()
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
    }
  }

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getTabCount = (tabId: string) => {
    switch (tabId) {
      case 'liked':
        return likedVideos.length
      case 'favorites':
        return favoriteVideos.length
      case 'history':
        return historyVideos.length
      default:
        return undefined
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
          <p className="text-theme-secondary">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-theme-primary">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20">
        {/* Header do Perfil */}
        <div className="bg-theme-card rounded-2xl p-8 mb-8 border border-theme-border-primary">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-accent-red to-red-700 rounded-full flex items-center justify-center">
                {userProfile?.image ? (
                  <img 
                    src={userProfile.image} 
                    alt={userProfile.name || 'Avatar'} 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              {userProfile?.premium && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Informações do Usuário */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-3xl font-bold text-theme-primary">
                  {userProfile?.name || 'Usuário'}
                </h1>
                {userProfile?.premium && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Premium
                  </span>
                )}
              </div>
              
              <p className="text-theme-secondary mb-2">
                @{userProfile?.username || 'username'}
              </p>
              
              <p className="text-theme-secondary text-sm">
                Membro desde {userProfile?.created_at ? formatDate(userProfile.created_at) : 'recentemente'}
              </p>

              {userProfile?.premium && userProfile?.expireDate && (
                <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                  Premium até {formatDate(userProfile.expireDate)}
                </p>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex space-x-3">
              <button
                onClick={() => setEditing(!editing)}
                className="bg-theme-hover hover:bg-theme-border-primary text-theme-primary px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
              
              <button
                onClick={handleSignOut}
                className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs de Navegação */}
        <div className="bg-theme-card rounded-2xl p-2 mb-8 border border-theme-border-primary">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const count = getTabCount(tab.id)
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    // Atualizar URL sem recarregar a página
                    const url = new URL(window.location.href)
                    url.searchParams.set('tab', tab.id)
                    window.history.pushState({}, '', url.toString())
                  }}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-accent-red text-white'
                      : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-hover'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {count !== undefined && count > 0 && (
                    <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs">
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="bg-theme-card rounded-2xl p-8 border border-theme-border-primary">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-theme-primary mb-6">
                Informações do Perfil
              </h2>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-3 border border-theme-border-primary rounded-xl bg-theme-primary text-theme-primary focus:ring-2 focus:ring-accent-red focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Nome de Usuário
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="w-full px-4 py-3 border border-theme-border-primary rounded-xl bg-theme-primary text-theme-primary focus:ring-2 focus:ring-accent-red focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-4 py-3 border border-theme-border-primary rounded-xl bg-theme-primary text-theme-primary focus:ring-2 focus:ring-accent-red focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveProfile}
                      className="bg-accent-red hover:bg-accent-red-hover text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salvar</span>
                    </button>
                    
                    <button
                      onClick={() => setEditing(false)}
                      className="bg-theme-hover hover:bg-theme-border-primary text-theme-primary px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3 p-4 bg-theme-hover rounded-xl">
                    <User className="w-5 h-5 text-accent-red" />
                    <div>
                      <p className="text-sm text-theme-secondary">Nome</p>
                      <p className="font-medium text-theme-primary">{userProfile?.name || 'Não informado'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-theme-hover rounded-xl">
                    <User className="w-5 h-5 text-accent-red" />
                    <div>
                      <p className="text-sm text-theme-secondary">Usuário</p>
                      <p className="font-medium text-theme-primary">@{userProfile?.username || 'username'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-theme-hover rounded-xl">
                    <Mail className="w-5 h-5 text-accent-red" />
                    <div>
                      <p className="text-sm text-theme-secondary">Email</p>
                      <p className="font-medium text-theme-primary">{userProfile?.email || 'Não informado'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-theme-hover rounded-xl">
                    <Calendar className="w-5 h-5 text-accent-red" />
                    <div>
                      <p className="text-sm text-theme-secondary">Membro desde</p>
                      <p className="font-medium text-theme-primary">
                        {userProfile?.created_at ? formatDate(userProfile.created_at) : 'Não informado'}
                      </p>
                    </div>
                  </div>

                  {userProfile?.premium && (
                    <>
                      <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
                        <Crown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <div>
                          <p className="text-sm text-theme-secondary">Status Premium</p>
                          <p className="font-medium text-yellow-600 dark:text-yellow-400">Ativo</p>
                        </div>
                      </div>

                      {userProfile?.expireDate && (
                        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                          <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="text-sm text-theme-secondary">Expira em</p>
                            <p className="font-medium text-green-600 dark:text-green-400">
                              {formatDate(userProfile.expireDate)}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'liked' && (
            <div>
              <h2 className="text-2xl font-bold text-theme-primary mb-6">
                Vídeos Curtidos ({likedVideos.length})
              </h2>
              
              {likedVideos.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-theme-muted mx-auto mb-4" />
                  <p className="text-theme-secondary text-lg">Você ainda não curtiu nenhum vídeo</p>
                  <button
                    onClick={() => router.push('/videos')}
                    className="mt-4 bg-accent-red hover:bg-accent-red-hover text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 mx-auto"
                  >
                    <Play className="w-4 h-4" />
                    <span>Explorar Vídeos</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {likedVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      id={video.id}
                      title={video.title}
                      duration={formatDuration(video.duration)}
                      thumbnailUrl={video.thumbnailUrl}
                      videoUrl={video.videoUrl}
                      trailerUrl={video.trailerUrl || undefined}
                      isIframe={video.iframe}
                      premium={video.premium}
                      viewCount={video.viewCount}
                      category={video.category}
                      creator={video.creator || undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-2xl font-bold text-theme-primary mb-6">
                Vídeos Favoritos ({favoriteVideos.length})
              </h2>
              
              {favoriteVideos.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-theme-muted mx-auto mb-4" />
                  <p className="text-theme-secondary text-lg">Você ainda não adicionou vídeos aos favoritos</p>
                  <button
                    onClick={() => router.push('/videos')}
                    className="mt-4 bg-accent-red hover:bg-accent-red-hover text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 mx-auto"
                  >
                    <Play className="w-4 h-4" />
                    <span>Explorar Vídeos</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {favoriteVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      id={video.id}
                      title={video.title}
                      duration={formatDuration(video.duration)}
                      thumbnailUrl={video.thumbnailUrl}
                      videoUrl={video.videoUrl}
                      trailerUrl={video.trailerUrl || undefined}
                      isIframe={video.iframe}
                      premium={video.premium}
                      viewCount={video.viewCount}
                      category={video.category}
                      creator={video.creator || undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="text-2xl font-bold text-theme-primary mb-6">
                Histórico de Visualização ({historyVideos.length})
              </h2>
              
              {historyVideos.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-theme-muted mx-auto mb-4" />
                  <p className="text-theme-secondary text-lg">Seu histórico de visualização aparecerá aqui</p>
                  <button
                    onClick={() => router.push('/videos')}
                    className="mt-4 bg-accent-red hover:bg-accent-red-hover text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 mx-auto"
                  >
                    <Play className="w-4 h-4" />
                    <span>Começar a Assistir</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {historyVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      id={video.id}
                      title={video.title}
                      duration={formatDuration(video.duration)}
                      thumbnailUrl={video.thumbnailUrl}
                      videoUrl={video.videoUrl}
                      trailerUrl={video.trailerUrl || undefined}
                      isIframe={video.iframe}
                      premium={video.premium}
                      viewCount={video.viewCount}
                      category={video.category}
                      creator={video.creator || undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-theme-primary mb-6">
                Configurações
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-theme-hover rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-theme-primary mb-4">Privacidade</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded text-accent-red focus:ring-accent-red" />
                      <span className="text-theme-secondary">Perfil público</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded text-accent-red focus:ring-accent-red" />
                      <span className="text-theme-secondary">Mostrar histórico</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded text-accent-red focus:ring-accent-red" />
                      <span className="text-theme-secondary">Permitir comentários</span>
                    </label>
                  </div>
                </div>

                <div className="bg-theme-hover rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-theme-primary mb-4">Notificações</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded text-accent-red focus:ring-accent-red" />
                      <span className="text-theme-secondary">Novos vídeos</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded text-accent-red focus:ring-accent-red" />
                      <span className="text-theme-secondary">Comentários</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded text-accent-red focus:ring-accent-red" />
                      <span className="text-theme-secondary">Promoções</span>
                    </label>
                  </div>
                </div>

                <div className="bg-theme-hover rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-theme-primary mb-4">Conta</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left text-theme-secondary hover:text-theme-primary transition-colors">
                      Alterar senha
                    </button>
                    <button className="w-full text-left text-theme-secondary hover:text-theme-primary transition-colors">
                      Excluir conta
                    </button>
                    <button className="w-full text-left text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                      Sair de todos os dispositivos
                    </button>
                  </div>
                </div>

                <div className="bg-theme-hover rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-theme-primary mb-4">Premium</h3>
                  <div className="space-y-3">
                    {userProfile?.premium ? (
                      <>
                        <p className="text-green-600 dark:text-green-400 text-sm">
                          Status: Ativo
                        </p>
                        <button
                          onClick={() => router.push('/premium/cancel')}
                          className="w-full text-left text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                        >
                          Cancelar assinatura
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => router.push('/premium')}
                        className="w-full bg-accent-red hover:bg-accent-red-hover text-white py-2 px-4 rounded-lg font-medium transition-all duration-300"
                      >
                        Tornar-se Premium
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
          <p className="text-theme-secondary">Carregando perfil...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  )
} 