'use client'

import { useState, useEffect } from 'react'
import { QrCode, Copy, Check, Clock, AlertCircle } from 'lucide-react'
import QRCode from 'react-qr-code'; // Importa a biblioteca react-qr-code

interface PixPaymentProps {
  userId?: string // Tornar opcional se preferenceId for fornecido
  amount?: number // Tornar opcional se preferenceId for fornecido
  payerEmail?: string // Tornar opcional se preferenceId for fornecido
  paymentType?: string // Tornar opcional se preferenceId for fornecido
  payerCpf?: string // Tornar opcional se preferenceId for fornecido
  payerName?: string // Tornar opcional se preferenceId for fornecido
  paymentProvider?: 'mercadopago' | 'efipay' // Tornar opcional se preferenceId for fornecido
  preferenceId?: string // Adicionar preferenceId
  paymentId?: string; // Adicionar paymentId para verificação manual
  onSuccess: () => void
  onCancel: () => void
}

interface PixData {
  qr_code?: string // Mercado Pago
  qr_code_base64?: string // Mercado Pago
  expires_at?: string // Mercado Pago
  payment_id?: string // Mercado Pago
  pixCopiaECola?: string // Efí
  txid?: string // Efí
  qrCodeUrl?: string // Efí (URL para o QR Code)
  status?: string // Efí
  loc?: { id: number; location: string; tipoCob: string; } // Efí (para o ID do location do QR Code)
  provider: 'mercadopago' | 'efipay'
}

export default function PixPayment({
  userId,
  amount,
  payerEmail,
  paymentType,
  payerCpf,
  payerName,
  paymentProvider,
  preferenceId, // Adicionado preferenceId
  onSuccess,
  onCancel,
  paymentId // Receber paymentId como prop
}: PixPaymentProps) {
  const [pixData, setPixData] = useState<PixData | null>(null)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [checkingPayment, setCheckingPayment] = useState(false); // Estado para o botão "Já fiz o pagamento"
  const [paymentCheckMessage, setPaymentCheckMessage] = useState<string | null>(null); // Mensagem de status da verificação

  // Buscar dados do PIX
  useEffect(() => {
    const fetchPixData = async () => {
      try {
        let response;
        let data;
        let currentPaymentProvider: 'mercadopago' | 'efipay' | undefined = paymentProvider;

        if (preferenceId) {
          console.log('🎯 PixPayment - Buscando detalhes da preferência do Mercado Pago:', preferenceId)
          response = await fetch(`/api/mercado-pago/preference-details?preferenceId=${preferenceId}`)
          if (!response.ok) {
            throw new Error('Erro ao buscar detalhes da preferência do Mercado Pago')
          }
          data = await response.json()
          currentPaymentProvider = 'mercadopago'; // Assumimos Mercado Pago se preferenceId for usado
          console.log('📊 Detalhes da preferência recebidos:', data)

          // Extrair dados do PIX do objeto de preferência
          const pixPayment = data.payments?.find((p: any) => p.payment_type === 'pix')
          if (pixPayment) {
            setPixData({
              qr_code: pixPayment.point_of_interaction?.transaction_data?.qr_code,
              qr_code_base64: pixPayment.point_of_interaction?.transaction_data?.qr_code_base64,
              expires_at: pixPayment.date_of_expiration,
              payment_id: pixPayment.id,
              provider: 'mercadopago'
            })
            // Calcular tempo restante
            if (pixPayment.date_of_expiration) {
              const expiresAt = new Date(pixPayment.date_of_expiration).getTime()
              const now = Date.now()
              const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000))
              setTimeLeft(remaining)
            }
          } else {
            throw new Error('Nenhum pagamento PIX encontrado na preferência.')
          }

        } else if (userId && amount && payerEmail && paymentType && payerCpf && payerName && paymentProvider) {
          console.log('🎯 PixPayment - Iniciando busca de dados PIX para provider:', paymentProvider)
          if (paymentProvider === 'mercadopago') {
            response = await fetch('/api/mercado-pago', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, amount, payerEmail, paymentType, payerCpf, payerName }),
            })
          } else if (paymentProvider === 'efipay') {
            response = await fetch('/api/efi-pay', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, amount, payerEmail, paymentType, payerCpf, payerName }),
            })
          } else {
            throw new Error('Provedor de pagamento não suportado.')
          }

          if (!response.ok) {
            throw new Error('Erro ao gerar PIX')
          }

          data = await response.json()
          console.log('📊 Dados PIX recebidos:', data)
          
          data.provider = currentPaymentProvider;
          setPixData(data)
          
          if (currentPaymentProvider === 'mercadopago' && data.expires_at) {
            const expiresAt = new Date(data.expires_at).getTime()
            const now = Date.now()
            const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000))
            setTimeLeft(remaining)
          } else if (currentPaymentProvider === 'efipay') {
            setTimeLeft(3600); 
          }
        } else {
          throw new Error('Dados insuficientes para gerar ou buscar PIX. Forneça preferenceId ou todos os dados de pagamento.')
        }

      } catch (err) {
        console.error('❌ Erro ao buscar dados PIX:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchPixData()
  }, [userId, amount, payerEmail, paymentType, payerCpf, payerName, paymentProvider, preferenceId])


  // Reagir a mudanças no paymentStatus para redirecionar
  useEffect(() => {
    if (paymentStatus === 'approved') {
      console.log('✅ Pagamento aprovado! Redirecionando...')
      // O redirecionamento agora deve ser acionado pelo webhook, não pelo polling do frontend.
      // Este useEffect pode ser removido ou adaptado para reagir a um estado global/contexto
      // que seria atualizado pelo webhook. Por enquanto, vamos manter o redirecionamento
      // para a página de sucesso, que deve verificar o status final.
      setTimeout(() => {
        window.location.href = `/premium/success?payment_id=${pixData?.payment_id || pixData?.txid}`
      }, 2000)
    } else if (paymentStatus === 'rejected') {
      console.log('❌ Pagamento rejeitado')
      // Não redireciona, apenas exibe a mensagem de rejeição
    }
  }, [paymentStatus, pixData])

  // Polling para verificar o status do pagamento
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;

    const startPolling = () => {
      pollingInterval = setInterval(async () => {
        const currentPaymentId = paymentId || pixData?.payment_id || pixData?.txid;
        if (currentPaymentId && paymentStatus === 'pending') {
          try {
            const response = await fetch('/api/mercado-pago/check-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId: currentPaymentId }),
            });
            const data = await response.json();

            if (response.ok && (data.status === 'approved' || data.status === 'paid')) {
              console.log('✅ Polling: Pagamento aprovado via webhook!');
              setPaymentStatus('approved');
              onSuccess(); // Redireciona para a página de sucesso
              clearInterval(pollingInterval);
            } else {
              console.log(`ℹ️ Polling: Pagamento ainda ${data.status}. Aguardando...`);
            }
          } catch (err) {
            console.error('❌ Erro no polling de pagamento:', err);
            // Não define erro no UI para não interromper a experiência do usuário
          }
        } else if (paymentStatus !== 'pending') {
          clearInterval(pollingInterval); // Para o polling se o pagamento não estiver mais pendente
        }
      }, 5000); // Verifica a cada 5 segundos
    };

    if (pixData && paymentStatus === 'pending') {
      startPolling();
    }

    return () => {
      clearInterval(pollingInterval);
    };
  }, [pixData, paymentStatus, paymentId, onSuccess]);


  // Atualizar contador regressivo
  useEffect(() => {
    if (timeLeft <= 0 || paymentStatus !== 'pending') return // Parar timer se pagamento não estiver pendente

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleCheckPayment = async () => {
    const currentPaymentId = paymentId || pixData?.payment_id || pixData?.txid;
    if (!currentPaymentId) {
      setError('Não foi possível encontrar o ID do pagamento para verificar.');
      return;
    }

    setCheckingPayment(true);
    setError(null);

    try {
      const response = await fetch('/api/mercado-pago/check-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: currentPaymentId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao verificar o pagamento.');
      }

      if (data.status === 'approved' || data.status === 'paid') {
        setPaymentStatus('approved'); // Atualiza o estado local para mostrar a mensagem de sucesso
        onSuccess(); // Chama a função onSuccess da página pai para redirecionar
      } else {
        setPaymentCheckMessage(`Pagamento ainda está ${data.status}. Aguardando confirmação...`);
        // Não define error aqui, pois não é um erro, mas um status pendente
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao verificar pagamento.');
      setPaymentCheckMessage(null); // Limpa a mensagem se houver um erro real
    } finally {
      setCheckingPayment(false);
    }
  };

  const copyPixCode = async () => {
    const codeToCopy = pixData?.provider === 'efipay' ? pixData.pixCopiaECola : pixData?.qr_code;
    if (!codeToCopy) return

    try {
      await navigator.clipboard.writeText(codeToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red"></div>
          <div className="absolute inset-0 rounded-full border-2 border-accent-red/20"></div>
        </div>
        <h3 className="text-lg font-semibold text-theme-primary mb-2">Gerando PIX...</h3>
        <p className="text-theme-secondary text-center">Preparando seu pagamento seguro</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-theme-primary mb-3">Erro ao gerar PIX</h3>
        <p className="text-theme-secondary mb-6 max-w-sm mx-auto">{error}</p>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (paymentStatus === 'approved') {
    return (
      <div className="text-center p-8">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-theme-primary mb-3">Pagamento Aprovado!</h3>
        <p className="text-theme-secondary mb-4">Seu pagamento foi processado com sucesso</p>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
          <p className="text-green-700 dark:text-green-300 font-medium">Redirecionando para a página de sucesso...</p>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'rejected') {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-theme-primary mb-3">Pagamento Rejeitado</h3>
        <p className="text-theme-secondary mb-6 max-w-sm mx-auto">O pagamento não foi aprovado. Verifique os dados e tente novamente.</p>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!pixData) {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h3 className="text-xl font-bold text-theme-primary mb-3">Dados PIX não encontrados</h3>
        <p className="text-theme-secondary mb-6">Não foi possível gerar os dados do PIX. Tente novamente.</p>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
        >
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-theme-card rounded-2xl shadow-xl border border-theme-border-primary">
      <div className="text-center mb-8">
        <div className="relative inline-block mb-6">
          <QrCode className="w-20 h-20 text-green-600 dark:text-green-400 mx-auto" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-theme-primary mb-3">Pagamento PIX</h3>
        <p className="text-theme-secondary text-lg">Escaneie o QR Code ou copie o código PIX</p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-lg">
          {(() => {
            console.log('🎨 Renderizando QR Code:', {
              provider: pixData.provider,
              hasQRCodeBase64: !!pixData.qr_code_base64,
              hasQrCodeUrl: !!pixData.qrCodeUrl,
              qrCodeBase64Length: pixData.qr_code_base64?.length,
              qrCodeUrlLength: pixData.qrCodeUrl?.length,
              pixCopiaEColaLength: pixData.pixCopiaECola?.length, // Adicionado para depuração
            })

            // Para Mercado Pago, usa o base64
            if (pixData.provider === 'mercadopago' && pixData.qr_code_base64) {
              const imgSrc = pixData.qr_code_base64.startsWith('data:image/png;base64,')
                ? pixData.qr_code_base64
                : `data:image/png;base64,${pixData.qr_code_base64}`;
              return (
                <img
                  src={imgSrc}
                  alt="QR Code PIX Mercado Pago"
                  className="w-56 h-56"
                  onLoad={() => console.log('✅ QR Code Mercado Pago carregado com sucesso')}
                  onError={(e) => {
                    console.error('❌ Erro ao carregar QR Code Mercado Pago:', e)
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )
            } 
            // Para Efí, gera o QR Code a partir do pixCopiaECola
            else if (pixData.provider === 'efipay' && pixData.pixCopiaECola) {
              console.log('🎨 Gerando QR Code Efí a partir de pixCopiaECola:', pixData.pixCopiaECola);
              return (
                <QRCode
                  value={pixData.pixCopiaECola}
                  size={224} // Tamanho do QR Code (224px para 56x56 Tailwind)
                  level="H" // Nível de correção de erro (H = High)
                  bgColor="#FFFFFF" // Cor de fundo (branco)
                  fgColor="#000000" // Cor do QR Code (preto)
                  className="w-56 h-56" // Classes Tailwind para o tamanho
                />
              )
            }
            // Se nenhum QR Code estiver disponível
            else {
              console.log('❌ QR Code não disponível para o provedor:', pixData.provider)
              return (
                <div className="w-56 h-56 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    QR Code não disponível
                  </p>
                </div>
              )
            }
          })()}
        </div>
      </div>

      {/* Código PIX */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-theme-primary mb-3">
          Código PIX
        </label>
        <div className="flex">
          <input
            type="text"
            value={pixData.provider === 'efipay' ? (pixData.pixCopiaECola || 'Código PIX não disponível') : (pixData.qr_code || 'Código PIX não disponível')}
            readOnly
            className="flex-1 px-4 py-3 border border-theme-border-primary rounded-l-xl bg-theme-hover text-sm font-mono text-theme-primary"
          />
          <button
            onClick={copyPixCode}
            disabled={!(pixData.provider === 'efipay' ? pixData.pixCopiaECola : pixData.qr_code)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-r-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
        {copied && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm mt-2">
            <Check className="w-4 h-4" />
            <span className="font-medium">Código copiado!</span>
          </div>
        )}
        {!(pixData.provider === 'efipay' ? pixData.pixCopiaECola : pixData.qr_code) && (
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm mt-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Código PIX não foi gerado</span>
          </div>
        )}
      </div>

      {/* Timer */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-center space-x-3 text-orange-600 dark:text-orange-400 mb-2">
            <Clock className="w-6 h-6" />
            <span className="font-mono text-2xl font-bold">
              {formatTime(timeLeft)}
            </span>
          </div>
          <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
            Tempo restante para pagamento
          </p>
        </div>
      </div>

      {/* Botão "Já fiz o pagamento" */}
      <div className="mt-6 text-center">
        <button
          onClick={handleCheckPayment}
          disabled={checkingPayment || !paymentId}
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-bold text-md transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto"
        >
          {checkingPayment ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Verificando...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Já fiz o pagamento</span>
            </>
          )}
        </button>
        {paymentCheckMessage && (
          <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-4">
            {paymentCheckMessage}
          </p>
        )}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>

      {/* Botão cancelar */}
      <div className="text-center mt-4">
        <button
          onClick={onCancel}
          className="px-6 py-3 text-theme-secondary hover:text-theme-primary transition-colors font-medium hover:bg-theme-hover rounded-xl"
        >
          Cancelar pagamento
        </button>
      </div>
    </div>
  )
}
