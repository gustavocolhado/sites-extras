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

    // Buscar pagamento no banco de dados pelo preferenceId
    const payment = await prisma.payment.findFirst({
      where: {
        preferenceId: preferenceId,
      },
    })

    if (!payment) {
      return NextResponse.json({
        status: 'pending',
        message: 'Nenhum pagamento encontrado',
      })
    }

    // Retornar o status atual do pagamento no banco
    return NextResponse.json({
      status: payment.status || 'pending',
      payment_id: payment.paymentId,
      amount: payment.amount,
      plan: payment.plan,
      // Flag para indicar que é apenas verificação
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