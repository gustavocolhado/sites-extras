'use client'

import { useState, useEffect } from 'react'
import { Send, Mail, Users, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'

interface CampaignLog {
  id: string
  subject: string
  targetAudience: string
  totalRecipients: number
  emailsSent: number
  emailsFailed: number
  errors?: string
  sentAt: string
}

interface CampaignStats {
  totalCampaigns: number
  totalEmailsSent: number
  totalRecipients: number
  successRate: number
}

interface AudienceStats {
  targetAudience: string
  userCount: number
  totalUsers: number
  premiumUsers: number
  nonPremiumUsers: number
  usersAcceptingEmails: number
  breakdown: {
    'non-premium': number
    'premium': number
    'all': number
  }
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignLog[]>([])
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [audienceStats, setAudienceStats] = useState<AudienceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    htmlBody: '',
    textBody: '',
    targetAudience: 'non-premium',
    limit: 1000,
    sendType: 'campaign', // 'campaign' ou 'specific-user'
    specificUserEmail: '',
    specificUser: null as any
  })

  useEffect(() => {
    fetchCampaigns()
    fetchAudienceStats()
  }, [])

  useEffect(() => {
    // Atualizar estatísticas quando o público-alvo mudar
    fetchAudienceStats()
  }, [formData.targetAudience])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/campaigns/send')
      const data = await response.json()
      
      if (response.ok) {
        setCampaigns(data.campaigns || [])
        calculateStats(data.campaigns || [])
      }
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAudienceStats = async () => {
    try {
      const response = await fetch(`/api/admin/campaigns/audience-count?audience=${formData.targetAudience}`)
      const data = await response.json()
      
      if (response.ok) {
        setAudienceStats(data.data)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de audiência:', error)
    }
  }

  const searchUser = async (email: string) => {
    if (!email || email.length < 3) {
      setFormData(prev => ({ ...prev, specificUser: null }))
      return
    }

    try {
      const response = await fetch(`/api/admin/users?search=${encodeURIComponent(email)}&limit=1`)
      const data = await response.json()
      
      if (response.ok && data.users && data.users.length > 0) {
        const user = data.users[0]
        setFormData(prev => ({ ...prev, specificUser: user }))
      } else {
        setFormData(prev => ({ ...prev, specificUser: null }))
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
      setFormData(prev => ({ ...prev, specificUser: null }))
    }
  }

  const calculateStats = (campaigns: CampaignLog[]) => {
    const totalCampaigns = campaigns.length
    const totalEmailsSent = campaigns.reduce((sum, c) => sum + c.emailsSent, 0)
    const totalRecipients = campaigns.reduce((sum, c) => sum + c.totalRecipients, 0)
    const successRate = totalRecipients > 0 ? (totalEmailsSent / totalRecipients) * 100 : 0

    setStats({
      totalCampaigns,
      totalEmailsSent,
      totalRecipients,
      successRate
    })
  }

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)

    try {
      // Validação para usuário específico
      if (formData.sendType === 'specific-user') {
        if (!formData.specificUser) {
          alert('Por favor, selecione um usuário válido')
          setIsSending(false)
          return
        }
        if (!formData.specificUser.acceptPromotionalEmails) {
          alert('Este usuário não aceita receber emails promocionais. Verifique as configurações do usuário.')
          setIsSending(false)
          return
        }
      }

      const response = await fetch('/api/admin/campaigns/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        if (formData.sendType === 'specific-user') {
          alert(`Email enviado com sucesso para ${formData.specificUser.name && formData.specificUser.name !== 'null' ? formData.specificUser.name : formData.specificUser.email}!`)
        } else {
          alert(`Campanha enviada com sucesso!\n\nEstatísticas:\n- Destinatários: ${data.stats.totalRecipients}\n- Enviados: ${data.stats.emailsSent}\n- Taxa de sucesso: ${data.stats.successRate}`)
        }
        setShowForm(false)
        setFormData({
          subject: '',
          htmlBody: '',
          textBody: '',
          targetAudience: 'non-premium',
          limit: 1000,
          sendType: 'campaign',
          specificUserEmail: '',
          specificUser: null
        })
        fetchCampaigns()
      } else {
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      alert('Erro ao enviar email')
      console.error('Erro:', error)
    } finally {
      setIsSending(false)
    }
  }

  const loadTemplate = (type: string) => {
    // Templates pré-definidos com oferta de desconto
    const templates = {
      'premium-upgrade': {
        subject: '🔥 OFERTA ESPECIAL: R$ 19,90 por apenas R$ 9,90!',
        htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Oferta Especial Premium</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #ff6b6b, #ff8e8e); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .cta-button { display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .features { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .feature { margin: 10px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .unsubscribe { color: #999; font-size: 11px; }
    .price-highlight { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .old-price { text-decoration: line-through; color: #999; font-size: 18px; }
    .new-price { color: #28a745; font-size: 24px; font-weight: bold; }
    .discount-badge { background: #dc3545; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 OFERTA ESPECIAL para {{name}}!</h1>
      <p>De R$ 19,90 por apenas R$ 9,90!</p>
    </div>
    
    <div class="content">
      <h2>Olá {{name}}!</h2>
      
      <p>Você está perdendo conteúdo exclusivo! Temos uma oferta especial apenas para você:</p>
      
      <div class="price-highlight">
        <div class="discount-badge">50% DE DESCONTO</div>
        <div style="margin: 10px 0;">
          <span class="old-price">De R$ 19,90</span>
          <br>
          <span class="new-price">Por apenas R$ 9,90</span>
        </div>
        <p style="margin: 0; font-size: 14px; color: #666;">Oferta válida apenas por 24 horas!</p>
      </div>
      
      <div class="features">
        <h3>🚀 Com o Premium você tem acesso a:</h3>
        <div class="feature">✅ Milhares de vídeos exclusivos</div>
        <div class="feature">✅ Qualidade HD sem anúncios</div>
        <div class="feature">✅ Download de vídeos</div>
        <div class="feature">✅ Conteúdo novo toda semana</div>
        <div class="feature">✅ Suporte prioritário</div>
      </div>
      
      <div style="text-align: center;">
        <a href="{{premiumUrl}}" class="cta-button">
          🔥 GARANTIR R$ 9,90 AGORA
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666; text-align: center;">
        Não perca esta oportunidade única! Milhares de usuários já aproveitaram.
      </p>
    </div>
    
    <div class="footer">
      <p>Esta oferta é exclusiva para você e expira em 24 horas.</p>
      <p class="unsubscribe">
        Não quer mais receber nossos emails? 
        <a href="{{unsubscribeUrl}}" style="color: #999;">Clique aqui para cancelar</a>
      </p>
    </div>
  </div>
</body>
</html>`,
        textBody: `OFERTA ESPECIAL: R$ 19,90 por apenas R$ 9,90!

Olá {{name}}!

Você está perdendo conteúdo exclusivo! Temos uma oferta especial apenas para você:

🎉 OFERTA ESPECIAL:
De R$ 19,90 por apenas R$ 9,90!
50% DE DESCONTO

Oferta válida apenas por 24 horas!

🚀 Com o Premium você tem acesso a:
✅ Milhares de vídeos exclusivos
✅ Qualidade HD sem anúncios
✅ Download de vídeos
✅ Conteúdo novo toda semana
✅ Suporte prioritário

Acesse: {{premiumUrl}}

Não perca esta oportunidade única! Milhares de usuários já aproveitaram.

---
Não quer mais receber nossos emails? Acesse: {{unsubscribeUrl}}`
      },
      'reactivation': {
        subject: '👋 Sentimos sua falta! Volte e ganhe 30% OFF',
        htmlBody: '<h1>Volte e Ganhe Desconto</h1><p>Olá {{name}}! Sentimos sua falta...</p>',
        textBody: 'Volte e Ganhe Desconto\n\nOlá {{name}}! Sentimos sua falta...'
      }
    }

    const template = templates[type as keyof typeof templates]
    if (template) {
      setFormData(prev => ({
        ...prev,
        subject: template.subject,
        htmlBody: template.htmlBody,
        textBody: template.textBody
      }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-red"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          📧 Campanhas de Email
        </h1>
        <p className="text-gray-300">
          Gerencie campanhas de email para usuários não premium
        </p>
      </div>

      {/* Audience Stats */}
      {audienceStats && (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">📊 Estatísticas de Audiência</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Usuários Atuais</p>
                  <p className="text-2xl font-bold text-white">{audienceStats.userCount.toLocaleString()}</p>
                  <p className="text-xs text-gray-300">
                    {formData.targetAudience === 'non-premium' && 'Não Premium'}
                    {formData.targetAudience === 'premium' && 'Premium'}
                    {formData.targetAudience === 'all' && 'Todos os Usuários'}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total de Usuários</p>
                  <p className="text-2xl font-bold text-white">{audienceStats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-gray-300">
                    {audienceStats.usersAcceptingEmails.toLocaleString()} aceitam emails
                  </p>
                </div>
                <Mail className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Distribuição</p>
                  <p className="text-lg font-bold text-white">
                    {audienceStats.nonPremiumUsers.toLocaleString()} / {audienceStats.premiumUsers.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-300">
                    Não Premium / Premium
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">📈 Breakdown por Público-Alvo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">{audienceStats.breakdown['non-premium'].toLocaleString()}</p>
                <p className="text-sm text-gray-300">Não Premium</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{audienceStats.breakdown['premium'].toLocaleString()}</p>
                <p className="text-sm text-gray-300">Premium</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-500">{audienceStats.breakdown['all'].toLocaleString()}</p>
                <p className="text-sm text-gray-300">Todos</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-yellow-500 font-medium">
                  ⏰ Intervalo de 15 dias: Apenas usuários que não receberam email nos últimos 15 dias
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Campanhas</p>
                <p className="text-2xl font-bold text-white">{stats.totalCampaigns}</p>
              </div>
              <Send className="w-8 h-8 text-accent-red" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Emails Enviados</p>
                <p className="text-2xl font-bold text-white">{stats.totalEmailsSent.toLocaleString()}</p>
              </div>
              <Mail className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Destinatários</p>
                <p className="text-2xl font-bold text-white">{stats.totalRecipients.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-white">{stats.successRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mb-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent-red hover:bg-accent-red-hover text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Send className="w-5 h-5" />
          <span>Nova Campanha</span>
        </button>
      </div>

      {/* Campaign Form */}
      {showForm && (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Criar Nova Campanha</h2>
          
          <form onSubmit={handleSendCampaign} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Tipo de Envio:
              </label>
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="campaign"
                    checked={formData.sendType === 'campaign'}
                    onChange={(e) => setFormData(prev => ({ ...prev, sendType: e.target.value }))}
                    className="mr-2"
                  />
                  <span className="text-white">Campanha em Massa</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="specific-user"
                    checked={formData.sendType === 'specific-user'}
                    onChange={(e) => setFormData(prev => ({ ...prev, sendType: e.target.value }))}
                    className="mr-2"
                  />
                  <span className="text-white">Usuário Específico</span>
                </label>
              </div>

              {formData.sendType === 'campaign' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Público-Alvo:
                    </label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                      className="w-full px-4 py-2 theme-input rounded-lg"
                    >
                      <option value="non-premium">Usuários Não Premium</option>
                      <option value="premium">Usuários Premium</option>
                      <option value="all">Todos os Usuários</option>
                    </select>
                    {audienceStats && (
                      <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-blue-500 font-medium">
                            {audienceStats.userCount.toLocaleString()} usuários receberão este email
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 mt-1">
                          {audienceStats.userCount > formData.limit 
                            ? `Limitado a ${formData.limit.toLocaleString()} emails` 
                            : 'Todos os usuários elegíveis (intervalo de 15 dias)'
                          }
                        </p>
                        <div className="mt-2 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-yellow-500">
                            Apenas usuários que não receberam email nos últimos 15 dias
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Limite de Emails:
                    </label>
                <input
                  type="number"
                  value={formData.limit}
                  onChange={(e) => setFormData(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 theme-input rounded-lg"
                  min="1"
                  max="10000"
                />
                    <p className="text-xs text-gray-300 mt-1">
                      Máximo de emails a serem enviados (para controle de custos)
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Email do Usuário:
                  </label>
                  <input
                    type="email"
                    value={formData.specificUserEmail}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, specificUserEmail: e.target.value }))
                      searchUser(e.target.value)
                    }}
                    className="w-full px-4 py-2 theme-input rounded-lg"
                    placeholder="Digite o email do usuário"
                  />
                  
                  {formData.specificUser ? (
                    <div className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-500 font-medium">
                          Usuário encontrado: {formData.specificUser.name && formData.specificUser.name !== 'null' ? formData.specificUser.name : 'Sem nome'} ({formData.specificUser.email})
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 mt-1">
                        Premium: {formData.specificUser.premium ? 'Sim' : 'Não'} | 
                        Aceita emails: {formData.specificUser.acceptPromotionalEmails ? 'Sim' : 'Não'}
                      </p>
                    </div>
                  ) : formData.specificUserEmail && formData.specificUserEmail.length >= 3 ? (
                    <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-500 font-medium">
                          Usuário não encontrado
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Templates Rápidos:
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => loadTemplate('premium-upgrade')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                >
                  R$ 19,90 → R$ 9,90
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate('reactivation')}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
                >
                  Reativação
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Assunto:
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-4 py-2 theme-input rounded-lg"
                placeholder="Digite o assunto do email"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                HTML Body:
              </label>
              <textarea
                value={formData.htmlBody}
                onChange={(e) => setFormData(prev => ({ ...prev, htmlBody: e.target.value }))}
                className="w-full px-4 py-2 theme-input rounded-lg h-32"
                placeholder="Digite o HTML do email (use {{name}} para personalizar)"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Text Body:
              </label>
              <textarea
                value={formData.textBody}
                onChange={(e) => setFormData(prev => ({ ...prev, textBody: e.target.value }))}
                className="w-full px-4 py-2 theme-input rounded-lg h-32"
                placeholder="Digite o texto do email (use {{name}} para personalizar)"
                required
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSending}
                className="bg-accent-red hover:bg-accent-red-hover disabled:bg-accent-red/50 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{formData.sendType === 'specific-user' ? 'Enviar Email' : 'Enviar Campanha'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Campaigns List */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Histórico de Campanhas</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Assunto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Público
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Destinatários
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Enviados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Taxa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {campaign.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {campaign.targetAudience}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {campaign.totalRecipients.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{campaign.emailsSent.toLocaleString()}</span>
                    </div>
                    {campaign.emailsFailed > 0 && (
                      <div className="flex items-center space-x-2 text-red-500">
                        <XCircle className="w-4 h-4" />
                        <span className="text-xs">{campaign.emailsFailed} falharam</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {((campaign.emailsSent / campaign.totalRecipients) * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(campaign.sentAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {campaigns.length === 0 && (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-300">Nenhuma campanha enviada ainda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}