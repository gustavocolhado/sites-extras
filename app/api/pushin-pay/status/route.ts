import { NextRequest, NextResponse } from 'next/server'
import { getPaymentSettings } from '@/lib/payment-provider'

interface CheckPixStatusRequest {
  pixId: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckPixStatusRequest = await request.json()
    const { pixId } = body

    if (!pixId) {
      return NextResponse.json(
        { error: 'ID do PIX é obrigatório' },
        { status: 400 }
      )
    }

    console.log('🔍 Consultando status PIX PushinPay:', pixId)

    // Buscar configurações de pagamento
    const paymentSettings = await getPaymentSettings()
    
    console.log('🔧 Configurações PushinPay:', {
      enabled: paymentSettings.pushinpay.enabled,
      hasAccessToken: !!paymentSettings.pushinpay.accessToken,
      accessTokenLength: paymentSettings.pushinpay.accessToken?.length || 0
    })
    
    if (!paymentSettings.pushinpay.enabled || !paymentSettings.pushinpay.accessToken) {
      console.error('❌ PushinPay não configurado:', {
        enabled: paymentSettings.pushinpay.enabled,
        hasAccessToken: !!paymentSettings.pushinpay.accessToken
      })
      return NextResponse.json(
        { error: 'Pushin Pay não está configurado ou habilitado' },
        { status: 500 }
      )
    }

    // Fazer requisição para a API da PushinPay para consultar o status
    console.log('📡 Fazendo requisição para PushinPay:', `https://api.pushinpay.com.br/api/pix/${pixId}`)
    
    const response = await fetch(`https://api.pushinpay.com.br/api/pix/${pixId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paymentSettings.pushinpay.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    console.log('📊 Resposta da PushinPay:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    })

    if (response.status === 404) {
      console.log('❌ PIX não encontrado na PushinPay:', pixId)
      return NextResponse.json(
        { error: 'PIX não encontrado', data: null },
        { status: 404 }
      )
    }

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (parseError) {
        errorData = { message: `Erro HTTP ${response.status}: ${response.statusText}` }
      }
      
      console.error('❌ Erro na API da PushinPay:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      })
      
      return NextResponse.json(
        { error: `Erro ao consultar PIX: ${errorData.message || 'Erro desconhecido'}` },
        { status: response.status }
      )
    }

    const pixData = await response.json()
    
    console.log('✅ Status PIX PushinPay consultado:', {
      id: pixData.id,
      status: pixData.status,
      value: pixData.value
    })

    return NextResponse.json({
      id: pixData.id,
      status: pixData.status,
      value: pixData.value,
      qr_code: pixData.qr_code,
      qr_code_base64: pixData.qr_code_base64,
      expires_at: pixData.expires_at,
      created_at: pixData.created_at,
      paid_at: pixData.paid_at,
      end_to_end_id: pixData.end_to_end_id,
      payer_name: pixData.payer_name,
      payer_national_registration: pixData.payer_national_registration
    })

  } catch (error) {
    console.error('Erro ao consultar status PIX PushinPay:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
