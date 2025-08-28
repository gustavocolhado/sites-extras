import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPaymentSettings } from '@/lib/payment-provider'

interface CreatePixRequest {
  value: number // Valor em centavos
  email: string
  planId: string
  webhookUrl?: string
  splitRules?: Array<{
    value: number
    accountId: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePixRequest = await request.json()
    const { value, email, planId, webhookUrl, splitRules } = body

    // Validar valor mínimo (50 centavos)
    if (value < 50) {
      return NextResponse.json(
        { error: 'Valor mínimo deve ser 50 centavos' },
        { status: 400 }
      )
    }

    // Buscar configurações de pagamento
    const paymentSettings = await getPaymentSettings()
    
    if (!paymentSettings.pushinpay.enabled || !paymentSettings.pushinpay.accessToken) {
      return NextResponse.json(
        { error: 'Pushin Pay não está configurado ou habilitado' },
        { status: 500 }
      )
    }

    // Buscar ou criar usuário
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Nome temporário baseado no email
          access: 0,
          premium: false
        }
      })
    }

    // Criar PaymentSession
    const paymentSession = await prisma.paymentSession.create({
      data: {
        plan: planId,
        amount: value / 100, // Converter de centavos para reais
        userId: user.id,
        status: 'pending',
        paymentMethod: 'pushinpay',
        userEmail: email
      }
    })

    // Preparar dados para o Pushin Pay
    const pixData: any = {
      value: value, // Valor em centavos
      webhook_url: webhookUrl || paymentSettings.pushinpay.webhookUrl
    }

    // Adicionar split rules se fornecidas
    if (splitRules && splitRules.length > 0) {
      pixData.split_rules = splitRules
    }

    // Fazer requisição para o Pushin Pay
    const response = await fetch('https://api.pushinpay.com.br/api/pix/cashIn', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paymentSettings.pushinpay.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pixData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Erro na API do Pushin Pay:', errorData)
      
      return NextResponse.json(
        { error: `Erro ao criar PIX: ${errorData.message || 'Erro desconhecido'}` },
        { status: response.status }
      )
    }

    const pixResponse = await response.json()

    // Atualizar PaymentSession com o ID do PIX
    await prisma.paymentSession.update({
      where: { id: paymentSession.id },
      data: {
        paymentId: parseInt(pixResponse.id),
        preferenceId: pixResponse.id
      }
    })

    console.log('✅ PIX Pushin Pay criado:', {
      id: pixResponse.id,
      value: pixResponse.value,
      status: pixResponse.status,
      paymentSessionId: paymentSession.id
    })

    return NextResponse.json({
      id: pixResponse.id,
      qrCode: pixResponse.qr_code,
      qrCodeBase64: pixResponse.qr_code_base64,
      status: pixResponse.status,
      value: pixResponse.value,
      paymentSessionId: paymentSession.id
    })

  } catch (error) {
    console.error('Erro ao criar PIX Pushin Pay:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
