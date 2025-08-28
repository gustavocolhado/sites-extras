import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'

interface CheckPaymentStatusRequest {
  preferenceId: string
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

    const body: CheckPaymentStatusRequest = await request.json()
    const { preferenceId } = body

    if (!preferenceId) {
      return NextResponse.json(
        { error: 'ID da preferência não fornecido' },
        { status: 400 }
      )
    }

    // Buscar PaymentSession no banco de dados pelo preferenceId
    const paymentSession = await prisma.paymentSession.findFirst({
      where: {
        OR: [
          { paymentId: parseInt(preferenceId) },
          { preferenceId: preferenceId }
        ]
      },
    })

    if (!paymentSession) {
      return NextResponse.json({
        status: 'pending',
        message: 'Nenhum pagamento encontrado',
      })
    }

    // Verificar se o usuário tem acesso premium ativo
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { premium: true, expireDate: true }
    })

    // Se o usuário tem premium ativo, considerar como aprovado
    if (user?.premium && user?.expireDate && new Date(user.expireDate) > new Date()) {
      return NextResponse.json({
        status: 'approved',
        payment_id: paymentSession.paymentId,
        amount: paymentSession.amount,
        plan: paymentSession.plan,
        message: 'Pagamento aprovado e premium ativo',
        is_verification_only: true
      })
    }

    // Retornar o status atual do PaymentSession
    return NextResponse.json({
      status: paymentSession.status || 'pending',
      payment_id: paymentSession.paymentId,
      amount: paymentSession.amount,
      plan: paymentSession.plan,
      message: paymentSession.status === 'paid' ? 'Pagamento confirmado' : 'Aguardando pagamento',
      is_verification_only: true
    })

  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status do pagamento' },
      { status: 500 }
    )
  }
} 