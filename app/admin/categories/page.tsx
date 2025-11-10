'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FolderOpen, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Image,
  Users
} from 'lucide-react'

interface Category {
  id: string
  name: string
  qtd?: number
  images?: string
  slug?: string
  created_at?: string
  updated_at?: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    images: '',
    slug: ''
  })

  // Estado de verificação/sincronização de categorias
  const [syncOpen, setSyncOpen] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncStats, setSyncStats] = useState<{
    totalCategories: number
    totalVideos: number
    outOfSyncCategories: number
    syncStatus: string
  } | null>(null)
  const [outOfSyncCategories, setOutOfSyncCategories] = useState<Array<{
    id: string
    name: string
    storedCount: number
    actualCount: number
  }>>([])
  const [zeroCategories, setZeroCategories] = useState<Array<{ id: string; name: string }>>([])
  const [missingCategories, setMissingCategories] = useState<Array<{ name: string; count: number }>>([])
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<string[]>([])

  const fetchCategories = async (page = 1, search = '') => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search
      })
      
      const response = await fetch(`/api/admin/categories?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories(1, searchTerm)
  }, [])

  const handleSearch = () => {
    fetchCategories(1, searchTerm)
  }

  const handlePageChange = (newPage: number) => {
    fetchCategories(newPage, searchTerm)
  }

  const handleCreate = () => {
    setEditingCategory(null)
    setFormData({ name: '', images: '', slug: '' })
    setShowModal(true)
  }

  // Abrir modal de verificação/sincronização
  const openSyncModal = async () => {
    setSyncLoading(true)
    setSyncError(null)
    try {
      const res = await fetch('/api/admin/sync-category-counts')
      if (!res.ok) throw new Error('Falha ao verificar sincronização')
      const data = await res.json()
      setSyncStats(data.stats)
      setOutOfSyncCategories(data.outOfSyncCategories || [])
      setZeroCategories(data.categoriesWithoutVideos || [])
      setMissingCategories(data.missingCategories || [])
      setSelectedDeleteIds((data.categoriesWithoutVideos || []).map((c: any) => c.id))
      setSyncOpen(true)
    } catch (err: any) {
      setSyncError(err.message || 'Erro desconhecido')
    } finally {
      setSyncLoading(false)
    }
  }

  const toggleSelectAllZero = () => {
    if (selectedDeleteIds.length === zeroCategories.length) {
      setSelectedDeleteIds([])
    } else {
      setSelectedDeleteIds(zeroCategories.map(c => c.id))
    }
  }

  const toggleSelectOneZero = (id: string) => {
    setSelectedDeleteIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const performSync = async (withDeletion: boolean) => {
    setSyncLoading(true)
    setSyncError(null)
    try {
      const res = await fetch('/api/admin/sync-category-counts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deleteZero: withDeletion && selectedDeleteIds.length === zeroCategories.length,
          deleteIds: withDeletion ? selectedDeleteIds : []
        })
      })
      if (!res.ok) throw new Error('Falha ao sincronizar')
      const data = await res.json()
      setSyncStats(data.stats)
      setSyncOpen(false)
      // Recarregar lista para refletir mudanças
      fetchCategories(pagination.page, searchTerm)
    } catch (err: any) {
      setSyncError(err.message || 'Erro desconhecido')
    } finally {
      setSyncLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      images: category.images || '',
      slug: category.slug || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchCategories(pagination.page, searchTerm)
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao excluir categoria')
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setShowModal(false)
        fetchCategories(pagination.page, searchTerm)
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao salvar categoria')
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    })
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
            Gerenciar Categorias
          </h1>
          <p className="text-slate-600 mt-2">Gerencie as categorias de vídeos da plataforma</p>
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
            <span>Nova Categoria</span>
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
                placeholder="Buscar categorias..."
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

      {/* Lista de Categorias */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">
            Categorias ({pagination.total} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Nome</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Slug</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Vídeos</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Imagem</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Criado em</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{category.name}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {category.slug || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {category.qtd || 0} vídeos
                    </td>
                    <td className="py-3 px-4">
                      {category.images ? (
                        <img
                          src={category.images}
                          alt={category.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center">
                          <Image className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {category.created_at 
                        ? new Date(category.created_at).toLocaleDateString('pt-BR')
                        : 'N/A'
                      }
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
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
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} categorias
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
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  URL da Imagem
                </label>
                <input
                  type="url"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingCategory ? 'Atualizar' : 'Criar'}
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
            <h2 className="text-xl font-bold text-black mb-4">Verificação de categorias</h2>
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
                    <div className="text-xs text-black">Categorias</div>
                    <div className="text-lg font-semibold">{syncStats.totalCategories}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded">
                    <div className="text-xs text-black">Vídeos</div>
                    <div className="text-lg font-semibold">{syncStats.totalVideos}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded">
                    <div className="text-xs text-black">Desatualizadas</div>
                    <div className="text-lg font-semibold">{syncStats.outOfSyncCategories}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded">
                    <div className="text-xs text-black">Ausentes (serão criadas)</div>
                    <div className="text-lg font-semibold">{(syncStats as any).missingCategories || 0}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded">
                    <div className="text-xs text-black">Selecionadas p/ exclusão</div>
                    <div className="text-lg font-semibold">{selectedDeleteIds.length}</div>
                  </div>
                </div>

                {outOfSyncCategories.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-black mb-2">Categorias desatualizadas</h3>
                    <div className="max-h-40 overflow-auto border rounded">
                      {outOfSyncCategories.map(c => (
                        <div key={c.id} className="flex items-center justify-between px-3 py-2 text-sm">
                          <span className="truncate">{c.name}</span>
                          <span className="text-black">{c.storedCount} → {c.actualCount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-black mb-2">Categorias sem vídeos</h3>
                  {zeroCategories.length === 0 ? (
                    <div className="text-sm text-black">Nenhuma categoria sem vídeos</div>
                  ) : (
                    <div>
                      <button
                        onClick={toggleSelectAllZero}
                        className="text-xs text-black px-2 py-1 bg-slate-100 rounded mr-2"
                      >
                        {selectedDeleteIds.length === zeroCategories.length ? 'Desmarcar todas' : 'Selecionar todas'}
                      </button>
                      <div className="max-h-40 overflow-auto border rounded mt-2">
                        {zeroCategories.map(c => (
                          <label key={c.id} className="flex items-center justify-between px-3 py-2 text-sm">
                            <span className="truncate">{c.name}</span>
                            <input
                              type="checkbox"
                              checked={selectedDeleteIds.includes(c.id)}
                              onChange={() => toggleSelectOneZero(c.id)}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {missingCategories.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-black mb-2">Categorias ausentes</h3>
                    <div className="max-h-40 overflow-auto border rounded">
                      {missingCategories.map(c => (
                        <div key={c.name} className="flex items-center justify-between px-3 py-2 text-sm">
                          <span className="truncate">{c.name}</span>
                          <span className="text-black">{c.count} vídeos</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSyncOpen(false)}
                    className="px-3 py-2 text-black bg-slate-100 rounded hover:bg-slate-200"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => performSync(false)}
                    className="px-3 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
                  >
                    Sincronizar
                  </button>
                  <button
                    onClick={() => performSync(true)}
                    className="px-3 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                  >
                    Sincronizar e excluir selecionadas
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
