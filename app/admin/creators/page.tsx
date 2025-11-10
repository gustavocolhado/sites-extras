'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Eye,
  FilePlus
} from 'lucide-react'

interface Creator {
  id: string
  name: string
  description?: string
  image?: string
  qtd?: number
  created_at?: string
  update_at?: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function AdminCreators() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCreator, setEditingCreator] = useState<Creator | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  })

  // Estado de verificação/sincronização de criadores
  const [syncOpen, setSyncOpen] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncStats, setSyncStats] = useState<{
    totalCreators: number
    totalVideos: number
    outOfSyncCreators: number
    syncStatus: string
  } | null>(null)
  const [outOfSyncCreators, setOutOfSyncCreators] = useState<Array<{
    id: string
    name: string
    storedCount: number
    actualCount: number
  }>>([])
  const [zeroCreators, setZeroCreators] = useState<Array<{ id: string; name: string }>>([])
  const [missingCreators, setMissingCreators] = useState<Array<{ name: string; count: number }>>([])
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<string[]>([])

  const fetchCreators = async (page = 1, search = '') => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search
      })
      
      const response = await fetch(`/api/admin/creators?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCreators(data.creators)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Erro ao carregar criadores:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCreators(1, searchTerm)
  }, [])

  const handleSearch = () => {
    fetchCreators(1, searchTerm)
  }

  const handlePageChange = (newPage: number) => {
    fetchCreators(newPage, searchTerm)
  }

  const handleCreate = () => {
    setEditingCreator(null)
    setFormData({ name: '', description: '', image: '' })
    setShowModal(true)
  }

  // Abrir modal de verificação/sincronização
  const openSyncModal = async () => {
    setSyncLoading(true)
    setSyncError(null)
    try {
      const res = await fetch('/api/admin/sync-creator-counts')
      if (!res.ok) throw new Error('Falha ao verificar sincronização')
      const data = await res.json()
      setSyncStats(data.stats)
      setOutOfSyncCreators(data.outOfSyncCreators || [])
      setZeroCreators(data.creatorsWithoutVideos || [])
      setMissingCreators(data.missingCreators || [])
      setSelectedDeleteIds((data.creatorsWithoutVideos || []).map((c: any) => c.id))
      setSyncOpen(true)
    } catch (err: any) {
      setSyncError(err.message || 'Erro desconhecido')
    } finally {
      setSyncLoading(false)
    }
  }

  const toggleSelectAllZero = () => {
    if (selectedDeleteIds.length === zeroCreators.length) {
      setSelectedDeleteIds([])
    } else {
      setSelectedDeleteIds(zeroCreators.map(c => c.id))
    }
  }

  const toggleSelectOneZero = (id: string) => {
    setSelectedDeleteIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const performSync = async (withDeletion: boolean) => {
    setSyncLoading(true)
    setSyncError(null)
    try {
      const res = await fetch('/api/admin/sync-creator-counts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deleteZero: withDeletion && selectedDeleteIds.length === zeroCreators.length,
          deleteIds: withDeletion ? selectedDeleteIds : []
        })
      })
      if (!res.ok) throw new Error('Falha ao sincronizar')
      const data = await res.json()
      setSyncStats(data.stats)
      setSyncOpen(false)
      // Recarregar lista para refletir mudanças
      fetchCreators(pagination.page, searchTerm)
    } catch (err: any) {
      setSyncError(err.message || 'Erro desconhecido')
    } finally {
      setSyncLoading(false)
    }
  }

  const handleEdit = (creator: Creator) => {
    setEditingCreator(creator)
    setFormData({
      name: creator.name,
      description: creator.description || '',
      image: creator.image || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este criador?')) return

    try {
      const response = await fetch(`/api/admin/creators/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchCreators(pagination.page, searchTerm)
      }
    } catch (error) {
      console.error('Erro ao excluir criador:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCreator 
        ? `/api/admin/creators/${editingCreator.id}`
        : '/api/admin/creators'
      
      const method = editingCreator ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setShowModal(false)
        fetchCreators(pagination.page, searchTerm)
      }
    } catch (error) {
      console.error('Erro ao salvar criador:', error)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Gerenciar Criadores
          </h1>
          <p className="text-slate-600 mt-2">Gerencie os criadores de conteúdo da plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openSyncModal}
            className="flex items-center space-x-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Verificar e sincronizar</span>
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Criador</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar criadores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Criadores */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">
            Criadores ({pagination.total} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Nome</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Descrição</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Vídeos</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Criado em</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {creators.map((creator) => (
                  <tr key={creator.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        {creator.image && (
                          <img
                            src={creator.image}
                            alt={creator.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-slate-900">{creator.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {creator.description || 'Sem descrição'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {creator.qtd || 0} vídeos
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {creator.created_at 
                        ? new Date(creator.created_at).toLocaleDateString('pt-BR')
                        : 'N/A'
                      }
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(creator)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(creator.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} criadores
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-black mb-4">
              {editingCreator ? 'Editar Criador' : 'Novo Criador'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  URL da Imagem
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-black bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingCreator ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de verificação/sincronização */}
      {syncOpen && (
        <div className="fixed inset-0 bg-black/50 text-black flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold text-black mb-4">Verificação de criadores</h2>
            {syncLoading && (
              <div className="text-black">Processando...</div>
            )}
            {syncError && (
              <div className="text-black mb-3">{syncError}</div>
            )}
            {syncStats && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-3 bg-slate-50 rounded">
                    <div className="text-xs text-black">Criadores</div>
                    <div className="text-lg font-semibold">{syncStats.totalCreators}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded">
                    <div className="text-xs text-black">Vídeos</div>
                    <div className="text-lg font-semibold">{syncStats.totalVideos}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded">
                    <div className="text-xs text-black">Desatualizados</div>
                    <div className="text-lg font-semibold">{syncStats.outOfSyncCreators}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded">
                    <div className="text-xs text-black">Ausentes (serão criados)</div>
                    <div className="text-lg font-semibold">{(syncStats as any).missingCreators || 0}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded">
                    <div className="text-xs text-black">Selecionados p/ exclusão</div>
                    <div className="text-lg font-semibold">{selectedDeleteIds.length}</div>
                  </div>
                </div>

                {outOfSyncCreators.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-black mb-2">Criadores desatualizados</h3>
                    <div className="max-h-40 overflow-auto border rounded">
                      {outOfSyncCreators.map(c => (
                        <div key={c.id} className="flex items-center justify-between px-3 py-2 text-sm">
                          <span className="truncate">{c.name}</span>
                          <span className="text-black">{c.storedCount} → {c.actualCount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-black mb-2">Criadores sem vídeos</h3>
                  {zeroCreators.length === 0 ? (
                    <div className="text-black text-sm">Nenhum criador sem vídeos encontrado.</div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-black">Selecionar todos</span>
                        <button onClick={toggleSelectAllZero} className="text-xs px-2 py-1 bg-slate-200 rounded hover:bg-slate-300">
                          {selectedDeleteIds.length === zeroCreators.length ? 'Desmarcar' : 'Marcar'}
                        </button>
                      </div>
                      <div className="text-xs text-black">Selecionados: {selectedDeleteIds.length} de {zeroCreators.length}</div>
                      <div className="max-h-40 overflow-auto border rounded">
                        {zeroCreators.map(c => (
                          <label key={c.id} className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer">
                            <span className="truncate">{c.name}</span>
                            <input
                              type="checkbox"
                              checked={selectedDeleteIds.includes(c.id)}
                              onChange={() => toggleSelectOneZero(c.id)}
                            />
                          </label>
                        ))}
                      </div>
                      <div className="text-xs text-black">Os criadores selecionados serão excluídos após confirmação.</div>
                    </div>
                  )}
                </div>

                {/* Criadores ausentes (serão criados) */}
                <div>
                  <h3 className="text-sm font-semibold text-black mb-2">Criadores ausentes (serão criados)</h3>
                  {missingCreators.length === 0 ? (
                    <div className="text-black text-sm">Nenhum criador ausente encontrado.</div>
                  ) : (
                    <div className="max-h-40 overflow-auto border rounded">
                      {missingCreators.map(c => (
                        <div key={c.name} className="flex items-center justify-between px-3 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <FilePlus className="w-4 h-4 text-green-600" />
                            <span className="truncate">{c.name}</span>
                          </div>
                          <span className="text-black">{c.count} vídeos</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-6">
              <button
                onClick={() => setSyncOpen(false)}
                className="px-4 py-2 text-black bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => performSync(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                disabled={syncLoading}
              >
                Sincronizar contagem
              </button>
              <button
                onClick={() => performSync(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={syncLoading || selectedDeleteIds.length === 0}
              >
                Sincronizar e excluir selecionados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
