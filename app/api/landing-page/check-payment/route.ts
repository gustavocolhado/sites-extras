import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface CheckPaymentRequest {
  pixId: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckPaymentRequest = await request.json()
    const { pixId } = body

    if (!pixId) {
      return NextResponse.json(
        { error: 'ID do PIX é obrigatório' },
        { status: 400 }
      )
    }

    console.log('🔍 Verificando status do pagamento:', pixId)
    
    // Tentar converter para número
    const paymentIdInt = parseInt(pixId)
    console.log('🔍 PaymentId convertido para int:', paymentIdInt)

    // Buscar pagamento no banco de dados pelo paymentId
    let payment = await prisma.payment.findFirst({
      where: {
        paymentId: paymentIdInt,
      },
    })

    // Se não encontrou, tentar buscar como string também
    if (!payment) {
      console.log('🔍 Tentando buscar como string...')
      payment = await prisma.payment.findFirst({
        where: {
          paymentId: paymentIdInt as any,
        },
      })
    }

    if (!payment) {
      console.log('❌ Pagamento não encontrado:', paymentIdInt)
      
      // Vou tentar buscar todos os pagamentos para debug
      const allPayments = await prisma.payment.findMany({
        take: 5,
        orderBy: { transactionDate: 'desc' }
      })
      console.log('🔍 Últimos 5 pagamentos:', allPayments.map(p => ({ id: p.paymentId, status: p.status, plan: p.plan })))
      
      return NextResponse.json({
        status: 'pending',
        message: 'Nenhum pagamento encontrado',
        paid: false
      })
    }

    console.log('✅ Pagamento encontrado:', {
      id: payment.paymentId,
      status: payment.status,
      plan: payment.plan,
      amount: payment.amount
    })

    // Verificar se o pagamento foi aprovado
    const isPaid = payment.status === 'approved' || payment.status === 'paid'
    
    console.log('🔍 Status do pagamento:', {
      status: payment.status,
      isPaid: isPaid
    })

    // Retornar o status atual do pagamento no banco
    return NextResponse.json({
      id: payment.paymentId,
      status: payment.status || 'pending',
      paid: isPaid, // Agora retorna true se foi aprovado
      amount: payment.amount,
      planId: payment.plan,
      message: isPaid ? 'Pagamento confirmado!' : 'Pagamento ainda não foi confirmado'
    })

  } catch (error) {
    console.error('❌ Erro ao verificar status do PIX:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status do pagamento' },
      { status: 500 }
    )
  }
} 