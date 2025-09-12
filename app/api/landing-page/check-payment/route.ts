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
    
    // Verificar se é um UUID (PushinPay) ou número (Mercado Pago)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pixId)
    console.log('🔍 É UUID?', isUUID)

    let payment = null

    if (isUUID) {
      // Para PushinPay (UUID), buscar pela PaymentSession primeiro
      console.log('🔍 Buscando PaymentSession para UUID do PushinPay...')
      const paymentSession = await prisma.paymentSession.findFirst({
        where: {
          preferenceId: pixId // Só buscar pelo UUID como preferenceId
        },
        orderBy: { updatedAt: 'desc' }
      })

      if (paymentSession) {
        console.log('✅ PaymentSession encontrada:', {
          id: paymentSession.id,
          paymentId: paymentSession.paymentId,
          preferenceId: paymentSession.preferenceId,
          status: paymentSession.status
        })

        // Buscar pagamento relacionado à PaymentSession
        // Para PushinPay, só buscar pelo preferenceId (UUID), não pelo paymentId
        payment = await prisma.payment.findFirst({
          where: {
            preferenceId: paymentSession.preferenceId // Só buscar pelo UUID
          }
        })
      }
    } else {
      // Para Mercado Pago (número), buscar diretamente
      const paymentIdInt = parseInt(pixId)
      console.log('🔍 PaymentId convertido para int:', paymentIdInt)

      payment = await prisma.payment.findFirst({
        where: {
          paymentId: paymentIdInt,
        },
      })
    }

    if (!payment) {
      console.log('❌ Pagamento não encontrado para PIX ID:', pixId)
      
      // Para UUIDs (PushinPay), verificar se a PaymentSession existe mas ainda não foi processada
      if (isUUID) {
        const paymentSession = await prisma.paymentSession.findFirst({
          where: {
            preferenceId: pixId // Só buscar pelo UUID
          },
          orderBy: { updatedAt: 'desc' }
        })

        if (paymentSession) {
          console.log('✅ PaymentSession encontrada, mas pagamento ainda não processado:', {
            id: paymentSession.id,
            status: paymentSession.status,
            createdAt: paymentSession.createdAt,
            preferenceId: paymentSession.preferenceId
          })

          return NextResponse.json({
            status: paymentSession.status || 'pending',
            message: 'Pagamento ainda não foi processado',
            paid: false,
            paymentSessionStatus: paymentSession.status
          })
        }
      }
      
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
    
    // Verificar se o pagamento foi criado há pelo menos 30 segundos (evita confirmações prematuras)
    const paymentAge = Date.now() - payment.transactionDate.getTime()
    const isRecentPayment = paymentAge < 30000 // 30 segundos
    
    console.log('🔍 Status do pagamento:', {
      status: payment.status,
      isPaid: isPaid,
      paymentAge: paymentAge,
      isRecentPayment: isRecentPayment,
      transactionDate: payment.transactionDate
    })

    // Se o pagamento é muito recente, não considerar como pago ainda
    const finalIsPaid = isPaid && !isRecentPayment

    // Retornar o status atual do pagamento no banco
    return NextResponse.json({
      id: payment.paymentId,
      status: payment.status || 'pending',
      paid: finalIsPaid, // Só retorna true se foi aprovado E não é muito recente
      amount: payment.amount,
      planId: payment.plan,
      message: finalIsPaid ? 'Pagamento confirmado!' : isRecentPayment ? 'Aguardando confirmação...' : 'Pagamento ainda não foi confirmado'
    })

  } catch (error) {
    console.error('❌ Erro ao verificar status do PIX:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status do pagamento' },
      { status: 500 }
    )
  }
} 