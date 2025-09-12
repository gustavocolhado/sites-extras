import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ProcessPaymentRequest {
  pixId: string
  force?: boolean
}

// Função para calcular a data de expiração da assinatura
function calculateExpirationDate(plan: string): Date {
  const now = new Date()
  let daysToAdd = 30 // padrão 1 mês

  switch (plan) {
    case 'yearly':
      daysToAdd = 365 // 12 meses
      break
    case 'semiannual':
      daysToAdd = 180 // 6 meses
      break
    case 'quarterly':
      daysToAdd = 90 // 3 meses
      break
    case 'monthly':
      daysToAdd = 30 // 1 mês
      break
    case 'lifetime':
      daysToAdd = 36500 // 100 anos (vitalício)
      break
    default:
      daysToAdd = 30 // padrão 1 mês
  }

  return new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
}

// Função para obter duração do plano em dias
function getPlanDurationInDays(plan: string): number {
  switch (plan) {
    case 'yearly':
      return 365
    case 'semiannual':
      return 180
    case 'quarterly':
      return 90
    case 'monthly':
      return 30
    case 'lifetime':
      return 36500 // 100 anos
    default:
      return 30
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ProcessPaymentRequest = await request.json()
    const { pixId, force = false } = body

    if (!pixId) {
      return NextResponse.json(
        { error: 'ID do PIX é obrigatório' },
        { status: 400 }
      )
    }

    console.log('🔧 Processando pagamento manualmente:', pixId)

    // Buscar PaymentSession
    const paymentSession = await prisma.paymentSession.findFirst({
      where: {
        OR: [
          { preferenceId: pixId },
          { preferenceId: pixId.toUpperCase() },
          { preferenceId: pixId.toLowerCase() }
        ]
      },
      include: { user: true }
    })

    if (!paymentSession) {
      return NextResponse.json(
        { error: 'PaymentSession não encontrada' },
        { status: 404 }
      )
    }

    console.log('✅ PaymentSession encontrada:', {
      id: paymentSession.id,
      preferenceId: paymentSession.preferenceId,
      status: paymentSession.status,
      plan: paymentSession.plan,
      amount: paymentSession.amount,
      userId: paymentSession.userId,
      userEmail: paymentSession.userEmail
    })

    // Verificar se já foi processado
    if (paymentSession.status === 'paid' && !force) {
      return NextResponse.json({
        message: 'Pagamento já foi processado',
        paymentSession: {
          id: paymentSession.id,
          status: paymentSession.status,
          plan: paymentSession.plan,
          amount: paymentSession.amount
        }
      })
    }

    // Calcular data de expiração
    const expireDate = calculateExpirationDate(paymentSession.plan)

    // Atualizar PaymentSession
    await prisma.paymentSession.update({
      where: { id: paymentSession.id },
      data: {
        status: 'paid',
        updatedAt: new Date()
      }
    })

    // Ativar premium no usuário
    await prisma.user.update({
      where: { id: paymentSession.userId },
      data: {
        premium: true,
        expireDate: expireDate,
        paymentStatus: 'paid',
        paymentDate: new Date()
      }
    })

    // Verificar se já existe um pagamento com este preferenceId
    const existingPayment = await prisma.payment.findFirst({
      where: { preferenceId: paymentSession.preferenceId }
    })

    if (!existingPayment) {
      // Criar registro de pagamento
      await prisma.payment.create({
        data: {
          userId: paymentSession.userId,
          plan: paymentSession.plan,
          amount: paymentSession.amount,
          userEmail: paymentSession.userEmail || '',
          status: 'paid',
          paymentId: null,
          preferenceId: paymentSession.preferenceId,
          duration: getPlanDurationInDays(paymentSession.plan)
        }
      })
      console.log('✅ Payment criado')
    } else {
      console.log('ℹ️ Payment já existe:', existingPayment.id)
    }

    console.log('🎉 Pagamento processado com sucesso:', {
      paymentSessionId: paymentSession.id,
      userId: paymentSession.userId,
      plan: paymentSession.plan,
      expireDate: expireDate
    })

    return NextResponse.json({
      success: true,
      message: 'Pagamento processado com sucesso',
      data: {
        paymentSessionId: paymentSession.id,
        userId: paymentSession.userId,
        plan: paymentSession.plan,
        amount: paymentSession.amount,
        expireDate: expireDate,
        premiumActivated: true
      }
    })

  } catch (error) {
    console.error('❌ Erro ao processar pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
