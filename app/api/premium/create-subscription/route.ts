import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import Stripe from 'stripe'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { prisma } from '@/lib/prisma'

// Configuração do Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-10-28.acacia',
    })
  : null

// Configuração do Mercado Pago
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

interface CreateSubscriptionRequest {
  planId: string
  paymentMethod: 'stripe' | 'mercadopago'
}

// Mapeamento de preços e informações por plano
const planData = {
  monthly: {
    name: 'Premium Mensal',
    price: 1990, // R$ 29,90 em centavos
    description: 'Acesso completo por 1 mês'
  },
  quarterly: {
    name: 'Premium Trimestral',
    price: 3290, // R$ 69,90 em centavos
    description: 'Acesso completo por 3 meses'
  },
  semestral: {
    name: 'Premium Semestral',
    price: 5790, // R$ 99,90 em centavos
    description: 'Acesso completo por 6 meses'
  },
  yearly: {
    name: 'Premium Anual',
    price: 9990, // R$ 149,90 em centavos
    description: 'Acesso completo por 12 meses'
  },
  lifetime: {
    name: 'Premium Vitalício',
    price: 49990, // R$ 999,90 em centavos
    description: 'Acesso vitalício ao conteúdo'
  }
}

// Função para garantir URL válida
function ensureValidUrl(baseUrl: string | undefined, path: string): string {
  if (!baseUrl) {
    // Fallback para desenvolvimento local
    return `http://localhost:3000${path}`
  }
  
  // Se a URL não tem protocolo, adiciona https:// para produção
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`
  }
  
  // Remove barra final se existir
  baseUrl = baseUrl.replace(/\/$/, '')
  
  // Garantir que a URL seja válida
  try {
    new URL(`${baseUrl}${path}`)
    return `${baseUrl}${path}`
  } catch (error) {
    console.warn('URL inválida, usando fallback:', `${baseUrl}${path}`)
    return `https://cornosbrasil.com${path}`
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const body: CreateSubscriptionRequest = await request.json()
    const { planId, paymentMethod } = body

    // Validar dados
    if (!planId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
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

    // Obter dados do usuário autenticado
    const userId = session.user.id || session.user.email || 'unknown'
    const userEmail = session.user.email || 'user@example.com'

    // Criar PaymentSession primeiro
    const paymentSession = await prisma.paymentSession.create({
      data: {
        plan: planId,
        amount: plan.price / 100, // Converter de centavos para reais
        userId: userId,
        status: 'pending',
      },
    })

    console.log('✅ PaymentSession criada:', {
      id: paymentSession.id,
      plan: paymentSession.plan,
      amount: paymentSession.amount,
      userId: paymentSession.userId,
      status: paymentSession.status
    })

    if (paymentMethod === 'stripe') {
      return await handleStripeSubscription(plan, userEmail, userId, paymentSession.id)
    } else {
      return await handleMercadoPagoSubscription(plan, userEmail, userId, paymentSession.id)
    }
  } catch (error) {
    console.error('Erro ao criar assinatura:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function handleStripeSubscription(
  plan: { name: string; price: number; description: string },
  userEmail: string,
  userId: string,
  paymentSessionId: string
) {
  try {
    // Verificar se o Stripe está configurado
    if (!stripe) {
      throw new Error('Stripe não está configurado')
    }

    // Garantir URLs válidas
    const baseUrl = process.env.HOST_URL
    const successUrl = ensureValidUrl(baseUrl, `/premium/success?session_id={CHECKOUT_SESSION_ID}&paymentSessionId=${paymentSessionId}`)
    const cancelUrl = ensureValidUrl(baseUrl, `/premium/cancel`)
    
    console.log('URLs do Stripe:', { successUrl, cancelUrl })

    // Criar sessão de checkout do Stripe com dados dinâmicos
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: plan.price, // Valor em centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // Modo de pagamento único
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      metadata: {
        userId,
        planId: plan.name.toLowerCase().replace(/\s+/g, '_'),
        amount: (plan.price / 100).toString(), // Valor em reais
        paymentSessionId: paymentSessionId,
      },
    })

    // Atualizar PaymentSession com o preferenceId
    await prisma.paymentSession.update({
      where: { id: paymentSessionId },
      data: { preferenceId: session.id },
    })

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
      paymentSessionId: paymentSessionId,
    })
  } catch (error) {
    console.error('Erro ao criar sessão Stripe:', error)
    return NextResponse.json(
      { error: 'Erro ao processar pagamento com Stripe' },
      { status: 500 }
    )
  }
}

async function handleMercadoPagoSubscription(
  plan: { name: string; price: number; description: string },
  userEmail: string,
  userId: string,
  paymentSessionId: string
) {
  try {
    // Garantir URLs válidas
    const baseUrl = process.env.HOST_URL
    const successUrl = ensureValidUrl(baseUrl, `/premium/success?paymentSessionId=${paymentSessionId}`)
    const failureUrl = ensureValidUrl(baseUrl, `/premium/cancel`)
    const pendingUrl = ensureValidUrl(baseUrl, `/premium/pending`)
    const webhookUrl = ensureValidUrl(baseUrl, `/api/mercado-pago/webhook`)
    
    console.log('URLs do Mercado Pago:', { 
      successUrl, 
      failureUrl, 
      pendingUrl, 
      webhookUrl,
      baseUrl: process.env.HOST_URL 
    })

    // Criar preferência de pagamento do Mercado Pago
    const preference = {
      items: [
        {
          id: `premium_${plan.name.toLowerCase().replace(/\s+/g, '_')}`,
          title: plan.name,
          unit_price: plan.price / 100, // Mercado Pago usa valor em reais
          quantity: 1,
          currency_id: 'BRL',
        },
      ],
      payer: {
        email: userEmail,
      },
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
      external_reference: `${userId}_${plan.name.toLowerCase().replace(/\s+/g, '_')}_${paymentSessionId}`,
      notification_url: webhookUrl,
      expires: true,
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
    }

    const preferenceClient = new Preference(mercadopago)
    const response = await preferenceClient.create({ body: preference })

    // Atualizar PaymentSession com o preferenceId do Mercado Pago
    await prisma.paymentSession.update({
      where: { id: paymentSessionId },
      data: { 
        preferenceId: response.id
      },
    })

    console.log('✅ Preferência Mercado Pago criada:', {
      preferenceId: response.id,
      external_reference: preference.external_reference,
      paymentSessionId: paymentSessionId
    })

    return NextResponse.json({
      initPoint: response.init_point,
      preferenceId: response.id,
      paymentSessionId: paymentSessionId,
      external_reference: preference.external_reference,
    })
  } catch (error) {
    console.error('Erro ao criar preferência Mercado Pago:', error)
    return NextResponse.json(
      { error: 'Erro ao processar pagamento com Mercado Pago' },
      { status: 500 }
    )
  }
} 

// Função auxiliar para calcular a duração em dias
function getDurationInDays(planId: string): number {
  switch (planId) {
    case 'monthly':
      return 30
    case 'quarterly':
      return 90
    case 'semestral':
      return 180
    case 'yearly':
      return 365
    case 'lifetime':
      return 36500 // 100 anos
    default:
      return 30
  }
} 