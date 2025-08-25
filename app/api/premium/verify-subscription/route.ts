import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-10-28.acacia',
    })
  : null

interface VerifySubscriptionRequest {
  sessionId: string
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

    const body: VerifySubscriptionRequest = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID da sessão não fornecido' },
        { status: 400 }
      )
    }

    // Buscar a sessão do Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o pagamento foi bem-sucedido
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Pagamento não foi concluído' },
        { status: 400 }
      )
    }

    // Buscar a assinatura
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )

    // Buscar o produto/preço para obter informações do plano
    const price = await stripe.prices.retrieve(
      subscription.items.data[0].price.id
    )

    // Formatar dados da resposta
    const subscriptionData = {
      id: subscription.id,
      status: subscription.status,
      planName: price.nickname || 'Premium',
      amount: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format((subscription.items.data[0].price.unit_amount || 0) / 100),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      customerId: subscription.customer,
      planId: session.metadata?.planId || 'unknown'
    }

    // Aqui você pode atualizar o status do usuário no banco de dados
    // await updateUserPremiumStatus(session.metadata?.userId, true)

    return NextResponse.json(subscriptionData)
  } catch (error) {
    console.error('Erro ao verificar assinatura:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 