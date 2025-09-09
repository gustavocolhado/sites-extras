import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { sessionId } = params

    // Buscar sessão de pagamento
    const paymentSession = await prisma.paymentSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            premium: true,
            expireDate: true
          }
        }
      }
    })

    if (!paymentSession) {
      return NextResponse.json(
        { error: 'Sessão de pagamento não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário tem acesso a esta sessão
    if (paymentSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Buscar pagamento associado se existir
    const payment = await prisma.payment.findFirst({
      where: {
        userId: paymentSession.userId,
        plan: paymentSession.plan,
        amount: paymentSession.amount,
        status: 'paid'
      },
      orderBy: { transactionDate: 'desc' }
    })

    return NextResponse.json({
      success: true,
      payment: {
        id: payment?.id || paymentSession.id,
        amount: paymentSession.amount,
        plan: paymentSession.plan,
        status: paymentSession.status,
        expireDate: paymentSession.user?.expireDate,
        campaignId: paymentSession.campaignId,
        promotionCode: paymentSession.promotionCode
      },
      user: paymentSession.user
    })

  } catch (error) {
    console.error('Erro ao buscar sessão de pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
