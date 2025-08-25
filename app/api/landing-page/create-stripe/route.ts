import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

// Configuração do Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-10-28.acacia',
    })
  : null

interface CreateStripeRequest {
  planId: string
  email: string
  referralData?: any
}

// Mapeamento de preços e informações por plano
const planData = {
  monthly: {
    name: 'Premium Mensal',
    price: 1990, // R$ 19,90 em centavos
    description: 'Acesso completo por 1 mês'
  },
  quarterly: {
    name: 'Premium Trimestral',
    price: 3290, // R$ 32,90 em centavos
    description: 'Acesso completo por 3 meses'
  },
  semiannual: {
    name: 'Premium Semestral',
    price: 5790, // R$ 57,90 em centavos
    description: 'Acesso completo por 6 meses'
  },
  yearly: {
    name: 'Premium Anual',
    price: 9990, // R$ 99,90 em centavos
    description: 'Acesso completo por 12 meses'
  },
  lifetime: {
    name: 'Premium Vitalício',
    price: 49990, // R$ 499,90 em centavos
    description: 'Acesso vitalício ao conteúdo'
  }
}

// Função para garantir URL válida
function ensureValidUrl(baseUrl: string | undefined, path: string): string {
  if (!baseUrl) {
    // Fallback para desenvolvimento local
    return `http://localhost:3000${path}`
  }
  
  // Se a URL não tem protocolo, adiciona http://
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `http://${baseUrl}`
  }
  
  // Remove barra final se existir
  baseUrl = baseUrl.replace(/\/$/, '')
  
  return `${baseUrl}${path}`
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se o Stripe está configurado
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe não está configurado' },
        { status: 500 }
      )
    }

    const body: CreateStripeRequest = await request.json()
    const { planId, email, referralData } = body

    // Validação básica
    if (!planId || !email) {
      return NextResponse.json(
        { error: 'ID do plano e email são obrigatórios' },
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
      return NextResponse.json(
        { error: 'Usuário não encontrado. Crie uma conta primeiro.' },
        { status: 404 }
      )
    }

    // Garantir URLs válidas
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    const successUrl = ensureValidUrl(baseUrl, '/c?success=true&session_id={CHECKOUT_SESSION_ID}')
    const cancelUrl = ensureValidUrl(baseUrl, '/c?canceled=true')
    
    console.log('URLs do Stripe para LandingPage:', { successUrl, cancelUrl })

    // Criar sessão de checkout do Stripe
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
      customer_email: email,
      metadata: {
        userId: user.id, // ✅ Incluir userId nos metadados
        planId,
        email,
        source: referralData?.source || 'landing_page',
        campaign: referralData?.campaign || 'direct',
        amount: (plan.price / 100).toString(), // Valor em reais
      },
    })

    console.log('📊 Checkout Stripe criado para LandingPage:', {
      sessionId: session.id,
      planId,
      email,
      userId: user.id,
      value: plan.price / 100,
      source: referralData?.source || 'landing_page'
    })

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('❌ Erro ao criar checkout Stripe para LandingPage:', error)
    return NextResponse.json(
      { error: 'Erro ao processar pagamento com Stripe' },
      { status: 500 }
    )
  }
} 