'use client'

import { useState, useEffect } from 'react'
import { Shield, Mail, Clock, CheckCircle, XCircle, Eye, Calendar, Phone, MapPin, User, FileText } from 'lucide-react'

interface RemovalRequest {
  id: string
  urls: string
  category: string
  motivation: string
  requesterName: string
  requesterEmail: string
  requesterAddress?: string
  requesterPhone: string
  requestDate: string
  signature: string
  status: string
  adminNotes?: string
  processedAt?: string
  createdAt: string
}

export default function AdminRemocaoPage() {
  const [requests, setRequests] = useState<RemovalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<RemovalRequest | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/admin/remocao')
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests)
      }
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/admin/remocao/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, adminNotes: notes }),
      })

      if (response.ok) {
        fetchRequests()
        setShowModal(false)
        setSelectedRequest(null)
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500'
      case 'APPROVED':
        return 'bg-green-500'
      case 'REJECTED':
        return 'bg-red-500'
      case 'COMPLETED':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente'
      case 'APPROVED':
        return 'Aprovado'
      case 'REJECTED':
        return 'Rejeitado'
      case 'COMPLETED':
        return 'Concluído'
      default:
        return status
    }
  }

  const filteredRequests = requests.filter(request => 
    statusFilter === 'all' || request.status === statusFilter
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-theme-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-theme-primary mb-2 flex items-center">
              <Shield className="w-8 h-8 mr-3" />
              Solicitações de Remoção
            </h1>
            <p className="text-theme-secondary">
              Gerencie as solicitações de remoção de conteúdo
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-theme-card border border-theme-border-primary rounded-lg text-theme-primary"
            >
              <option value="all">Todos os Status</option>
              <option value="PENDING">Pendente</option>
              <option value="APPROVED">Aprovado</option>
              <option value="REJECTED">Rejeitado</option>
              <option value="COMPLETED">Concluído</option>
            </select>
          </div>

          {/* Requests List */}
          <div className="bg-theme-card rounded-xl shadow-lg border border-theme-border-primary overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-theme-primary/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-theme-primary font-semibold">Solicitante</th>
                    <th className="px-6 py-4 text-left text-theme-primary font-semibold">Categoria</th>
                    <th className="px-6 py-4 text-left text-theme-primary font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-theme-primary font-semibold">Data</th>
                    <th className="px-6 py-4 text-left text-theme-primary font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border-primary">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-theme-primary/5">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-theme-primary">{request.requesterName}</div>
                          <div className="text-sm text-theme-secondary">{request.requesterEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-theme-secondary">
                        {request.category}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-theme-secondary">
                        {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedRequest(request)
                            setShowModal(true)
                          }}
                          className="inline-flex items-center px-3 py-1 bg-theme-primary text-white rounded-lg hover:bg-theme-primary/90 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-theme-secondary mx-auto mb-4" />
                <p className="text-theme-secondary">Nenhuma solicitação encontrada</p>
              </div>
            )}
          </div>

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-theme-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-theme-border-primary">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-theme-primary">
                  Detalhes da Solicitação
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedRequest(null)
                  }}
                  className="text-theme-secondary hover:text-theme-primary"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Requester Info */}
              <div>
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Informações do Solicitante
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Nome</label>
                    <p className="text-theme-primary">{selectedRequest.requesterName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Email</label>
                    <p className="text-theme-primary">{selectedRequest.requesterEmail}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Telefone</label>
                    <p className="text-theme-primary">{selectedRequest.requesterPhone}</p>
                  </div>
                  {selectedRequest.requesterAddress && (
                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-1">Endereço</label>
                      <p className="text-theme-primary">{selectedRequest.requesterAddress}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Request Details */}
              <div>
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Detalhes da Solicitação
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Categoria</label>
                    <p className="text-theme-primary">{selectedRequest.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">URLs do Conteúdo</label>
                    <div className="bg-theme-background p-3 rounded-lg">
                      <pre className="text-sm text-theme-primary whitespace-pre-wrap">{selectedRequest.urls}</pre>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Motivação</label>
                    <div className="bg-theme-background p-3 rounded-lg">
                      <p className="text-sm text-theme-primary">{selectedRequest.motivation}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-1">Assinatura</label>
                    <p className="text-theme-primary">{selectedRequest.signature}</p>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="border-t border-theme-border-primary pt-6">
                <h3 className="text-lg font-semibold text-theme-primary mb-4">Atualizar Status</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => updateStatus(selectedRequest.id, 'APPROVED')}
                    className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar
                  </button>
                  <button
                    onClick={() => updateStatus(selectedRequest.id, 'REJECTED')}
                    className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar
                  </button>
                  <button
                    onClick={() => updateStatus(selectedRequest.id, 'COMPLETED')}
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como Concluído
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
