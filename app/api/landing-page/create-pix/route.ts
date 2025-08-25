import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

interface CreatePixRequest {
  value: number
  email: string
  planId: string
  referralData?: any
}

// Mapeamento de planos para a LandingPage
const planData = {
  monthly: {
    name: 'Premium Mensal',
    description: 'Acesso completo por 1 mês'
  },
  quarterly: {
    name: 'Premium Trimestral',
    description: 'Acesso completo por 3 meses'
  },
  semiannual: {
    name: 'Premium Semestral',
    description: 'Acesso completo por 6 meses'
  },
  yearly: {
    name: 'Premium Anual',
    description: 'Acesso completo por 12 meses'
  },
  lifetime: {
    name: 'Premium Vitalício',
    description: 'Acesso vitalício ao conteúdo'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePixRequest = await request.json()
    const { value, email, planId, referralData } = body

    // Validação básica
    if (!value || !email || !planId) {
      return NextResponse.json(
        { error: 'Valor, email e ID do plano são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o plano existe
    const plan = planData[planId as keyof typeof planData]
    if (!plan) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Buscar ou criar usuário
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Se o usuário não existe, criar um temporário
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      const hashedPassword = await bcrypt.hash(tempPassword, 12)
      
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: email.split('@')[0],
          signupSource: 'landing_page',
          premium: false,
          emailVerified: new Date(),
          tempPassword: true,
        }
      })
      
      console.log('✅ Usuário temporário criado para PIX:', { userId: user.id, email })
    }

    // Criar PaymentSession primeiro
    const paymentSession = await prisma.paymentSession.create({
      data: {
        plan: planId,
        amount: value / 100, // Converter de centavos para reais
        userId: user.id,
        status: 'pending',
      },
    })

    console.log('✅ PaymentSession criada para PIX:', {
      id: paymentSession.id,
      plan: paymentSession.plan,
      amount: paymentSession.amount,
      userId: paymentSession.userId,
      status: paymentSession.status
    })

    // Configurar webhook URL apenas para produção
    let webhookUrl: string | undefined = undefined
    
    if (process.env.NODE_ENV === 'production') {
      const baseUrl = process.env.HOST_URL || 'https://cornosbrasil.com'
      webhookUrl = `${baseUrl}/api/mercado-pago/webhook`
      console.log('🔗 Webhook configurado para PIX da Landing Page (produção):', webhookUrl)
    } else {
      console.log('ℹ️ Webhook não configurado para desenvolvimento local')
    }

    // Criar pagamento PIX
    const payment: any = {
      transaction_amount: value / 100, // Converter de centavos para reais
      description: `${plan.name} - ${plan.description}`,
      payment_method_id: 'pix',
      payer: {
        email: email,
      },
      external_reference: `${user.id}_${planId}_${paymentSession.id}`, // Formato igual ao premium: userId_plan_paymentSessionId
      metadata: {
        planId,
        email,
        source: referralData?.source || 'landing_page',
        campaign: referralData?.campaign || 'direct',
        paymentSessionId: paymentSession.id
      }
    }

    // Adicionar webhook apenas se estiver em produção
    if (webhookUrl) {
      payment.notification_url = webhookUrl
    }

    const paymentClient = new Payment(mercadopago)
    const response = await paymentClient.create({ body: payment })

    console.log('🔍 Resposta completa do MercadoPago:', {
      id: response.id,
      status: response.status,
      point_of_interaction: response.point_of_interaction ? 'Presente' : 'Ausente',
      transaction_data: response.point_of_interaction?.transaction_data ? 'Presente' : 'Ausente',
      qr_code: response.point_of_interaction?.transaction_data?.qr_code ? 'Presente' : 'Ausente',
      qr_code_base64: response.point_of_interaction?.transaction_data?.qr_code_base64 ? 'Presente' : 'Ausente'
    })

    if (!response.point_of_interaction?.transaction_data?.qr_code) {
      throw new Error('QR Code PIX não gerado')
    }

    // Atualizar PaymentSession com o paymentId
    if (response.id) {
      await prisma.paymentSession.update({
        where: { id: paymentSession.id },
        data: { 
          paymentId: response.id,
          preferenceId: response.id.toString()
        },
      })
    }

    // Log para debug
    console.log('🔍 Dados do PIX recebidos:', {
      qr_code: response.point_of_interaction.transaction_data.qr_code ? 'Presente' : 'Ausente',
      qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64 ? 'Presente' : 'Ausente',
      qr_code_base64_length: response.point_of_interaction.transaction_data.qr_code_base64?.length || 0
    })

    // Verificar se o QR code base64 está presente
    let qrCodeBase64: string | null = response.point_of_interaction.transaction_data.qr_code_base64 || null
    if (!qrCodeBase64 && response.point_of_interaction.transaction_data.qr_code) {
      console.log('⚠️ QR code base64 não retornado pelo MercadoPago, será gerado localmente')
      // Se não tiver o QR code base64, vamos gerar localmente
      try {
        const qrCodeDataURL = await QRCode.toDataURL(response.point_of_interaction.transaction_data.qr_code, {
          width: 192,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        // Remover o prefixo data:image/png;base64, para manter consistência
        qrCodeBase64 = qrCodeDataURL.replace('data:image/png;base64,', '')
        console.log('✅ QR code base64 gerado localmente, tamanho:', qrCodeBase64.length)
      } catch (error) {
        console.error('❌ Erro ao gerar QR code base64 localmente:', error)
        qrCodeBase64 = null
      }
    } else if (qrCodeBase64) {
      console.log('✅ QR code base64 retornado pelo MercadoPago, tamanho:', qrCodeBase64.length)
    }

    const pixData = {
      id: response.id,
      qr_code: response.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: qrCodeBase64,
      status: response.status,
      value: value,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
    }

    console.log('📊 PIX criado para LandingPage:', {
      id: response.id,
      planId,
      email,
      value: value / 100,
      source: referralData?.source || 'landing_page',
      paymentSessionId: paymentSession.id
    })

    return NextResponse.json(pixData)
  } catch (error) {
    console.error('❌ Erro ao criar PIX para LandingPage:', error)
    return NextResponse.json(
      { error: 'Erro ao processar pagamento PIX' },
      { status: 500 }
    )
  }
} 