'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CreditCard, 
  Settings, 
  Save, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface PaymentSettings {
  activeProvider: 'mercadopago' | 'pushinpay'
  mercadopago: {
    enabled: boolean
    accessToken: string
    webhookUrl: string
  }
  pushinpay: {
    enabled: boolean
    accessToken: string
    webhookUrl: string
  }
}

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>({
    activeProvider: 'mercadopago',
    mercadopago: {
      enabled: true,
      accessToken: '',
      webhookUrl: ''
    },
    pushinpay: {
      enabled: false,
      accessToken: '',
      webhookUrl: ''
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/payment-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Erro ao salvar configurações' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleProviderChange = (provider: 'mercadopago' | 'pushinpay') => {
    setSettings(prev => ({
      ...prev,
      activeProvider: provider,
      mercadopago: {
        ...prev.mercadopago,
        enabled: provider === 'mercadopago'
      },
      pushinpay: {
        ...prev.pushinpay,
        enabled: provider === 'pushinpay'
      }
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações de Pagamento</h1>
          <p className="text-gray-600 mt-2">
            Configure os provedores de pagamento PIX para sua plataforma
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-6 h-6" />
            <span>Provedor Ativo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="provider"
                  value="mercadopago"
                  checked={settings.activeProvider === 'mercadopago'}
                  onChange={() => handleProviderChange('mercadopago')}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="font-medium">Mercado Pago</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="provider"
                  value="pushinpay"
                  checked={settings.activeProvider === 'pushinpay'}
                  onChange={() => handleProviderChange('pushinpay')}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="font-medium">Pushin Pay</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações do Mercado Pago */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Mercado Pago</span>
              {settings.activeProvider === 'mercadopago' && (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Ativo
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Token
              </label>
              <input
                type="password"
                value={settings.mercadopago.accessToken}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  mercadopago: { ...prev.mercadopago, accessToken: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Digite o access token do Mercado Pago"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook URL
              </label>
              <input
                type="url"
                value={settings.mercadopago.webhookUrl}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  mercadopago: { ...prev.mercadopago, webhookUrl: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://seudominio.com/api/mercado-pago/webhook"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações do Pushin Pay */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Pushin Pay</span>
              {settings.activeProvider === 'pushinpay' && (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Ativo
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Token
              </label>
              <input
                type="password"
                value={settings.pushinpay.accessToken}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  pushinpay: { ...prev.pushinpay, accessToken: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Digite o access token do Pushin Pay"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook URL
              </label>
              <input
                type="url"
                value={settings.pushinpay.webhookUrl}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  pushinpay: { ...prev.pushinpay, webhookUrl: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://seudominio.com/api/pushin-pay/webhook"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 text-yellow-500" />
              <p>
                <strong>Pushin Pay:</strong> Para utilizar o ambiente SANDBOX, faça o cadastro primeiro no ambiente de produção em{' '}
                <a href="https://app.pushinpay.com.br/register" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  https://app.pushinpay.com.br/register
                </a>
                {' '}e depois solicite a liberação do ambiente SANDBOX no suporte.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 text-yellow-500" />
              <p>
                <strong>Valores:</strong> Todos os valores devem ser enviados em centavos. Valor mínimo de 50 centavos.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 text-yellow-500" />
              <p>
                <strong>Aviso Obrigatório:</strong> É necessário informar que "A PUSHIN PAY atua exclusivamente como processadora de pagamentos e não possui qualquer responsabilidade pela entrega, suporte, conteúdo, qualidade ou cumprimento das obrigações relacionadas aos produtos ou serviços oferecidos pelo vendedor."
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'Salvando...' : 'Salvar Configurações'}</span>
        </button>
      </div>
    </div>
  )
}
