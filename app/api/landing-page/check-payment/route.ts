import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface CheckPaymentRequest {
  pixId: string
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
      // Para PushinPay (UUID), consultar diretamente a API da PushinPay
      console.log('🔍 Consultando status PIX diretamente na PushinPay...')
      
      try {
        // Fazer requisição para o endpoint de status da PushinPay
        // Usar URL absoluta para requisições internas no servidor
        const baseUrl = process.env.HOST_URL || 'http://localhost:3000'
        const pushinPayResponse = await fetch(`${baseUrl}/api/pushin-pay/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pixId })
        })

        if (pushinPayResponse.ok) {
          const pushinPayData = await pushinPayResponse.json()
          console.log('✅ Status PIX PushinPay:', pushinPayData)
          
          // Se o pagamento foi confirmado pela API da PushinPay
          if (pushinPayData.status === 'paid') {
            // Buscar PaymentSession para obter dados do usuário e do plano
            const paymentSession = await prisma.paymentSession.findFirst({
              where: {
                OR: [
                  { preferenceId: pixId },
                  { preferenceId: pixId.toUpperCase() },
                  { preferenceId: pixId.toLowerCase() }
                ]
              },
              orderBy: { updatedAt: 'desc' }
            })

            if (paymentSession) {
              // Verificar se já existe um registro de pagamento para evitar duplicatas
              const existingPayment = await prisma.payment.findFirst({
                where: { preferenceId: paymentSession.preferenceId }
              })

              if (!existingPayment) {
                // Lógica para ativar o premium e criar o registro de pagamento
                const expireDate = new Date()
                expireDate.setDate(expireDate.getDate() + getPlanDurationInDays(paymentSession.plan))

                await prisma.paymentSession.update({
                  where: { id: paymentSession.id },
                  data: { status: 'paid', updatedAt: new Date() }
                })

                await prisma.user.update({
                  where: { id: paymentSession.userId },
                  data: {
                    premium: true,
                    expireDate: expireDate,
                    paymentStatus: 'paid',
                    paymentDate: new Date()
                  }
                })

                await prisma.payment.create({
                  data: {
                    userId: paymentSession.userId,
                    plan: paymentSession.plan,
                    amount: paymentSession.amount,
                    userEmail: paymentSession.userEmail || '',
                    status: 'paid',
                    paymentId: null,
                    preferenceId: pixId,
                    duration: getPlanDurationInDays(paymentSession.plan)
                  }
                })
                console.log('✅ Premium ativado e Payment criado via confirmação da API PushinPay.')
              }
            }
            // Retorna sucesso imediatamente
            return NextResponse.json({ paid: true, status: 'paid', message: 'Pagamento confirmado!' })
          } else {
            // Se o status não for 'paid' (ex: 'created'), significa que o PIX existe mas aguarda pagamento.
            console.log('⏳ PIX encontrado, mas aguardando pagamento (status:', pushinPayData.status, ')')
            return NextResponse.json({ paid: false, status: pushinPayData.status, message: 'Aguardando pagamento.' })
          }
        } else if (pushinPayResponse.status === 404) {
          console.log('❌ PIX não encontrado na PushinPay:', pixId)
          // Continua para o fallback
        } else {
          console.error('❌ Erro ao consultar PushinPay:', pushinPayResponse.status)
          // Continua para o fallback
        }
      } catch (error) {
        console.error('❌ Erro ao consultar PushinPay:', error)
      }

      // Fallback: buscar pela PaymentSession se não conseguiu consultar a API
      if (!payment) {
        console.log('🔍 Fallback: Buscando PaymentSession para UUID do PushinPay...')
        
        // Buscar PaymentSession com mais opções
        const paymentSession = await prisma.paymentSession.findFirst({
          where: {
            OR: [
              { preferenceId: pixId },
              { preferenceId: pixId.toUpperCase() },
              { preferenceId: pixId.toLowerCase() }
            ]
          },
          orderBy: { updatedAt: 'desc' },
          include: { user: true }
        })

        if (paymentSession) {
          console.log('✅ PaymentSession encontrada:', {
            id: paymentSession.id,
            paymentId: paymentSession.paymentId,
            preferenceId: paymentSession.preferenceId,
            status: paymentSession.status,
            userId: paymentSession.userId,
            userEmail: paymentSession.userEmail,
            plan: paymentSession.plan,
            amount: paymentSession.amount
          })

          // Se a PaymentSession está como 'paid', considerar como pagamento confirmado
          if (paymentSession.status === 'paid') {
            console.log('✅ PaymentSession já está marcada como paga, criando registro de pagamento...')
            
            // Criar registro de pagamento se não existir
            payment = await prisma.payment.findFirst({
              where: {
                preferenceId: paymentSession.preferenceId
              }
            })

            if (!payment) {
              payment = await prisma.payment.create({
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
              console.log('✅ Payment criado via PaymentSession')
            }
          } else {
            // Buscar pagamento relacionado à PaymentSession
            payment = await prisma.payment.findFirst({
              where: {
                preferenceId: paymentSession.preferenceId
              }
            })
          }
        } else {
          console.log('❌ PaymentSession não encontrada para UUID:', pixId)
          
          // Debug: listar todas as PaymentSessions recentes
          const recentSessions = await prisma.paymentSession.findMany({
            take: 10,
            orderBy: { updatedAt: 'desc' },
            select: {
              id: true,
              preferenceId: true,
              status: true,
              plan: true,
              amount: true,
              userEmail: true,
              createdAt: true
            }
          })
          
          console.log('🔍 PaymentSessions recentes para debug:')
          recentSessions.forEach((session, index) => {
            console.log(`${index + 1}. ID: ${session.id}, PreferenceID: ${session.preferenceId}, Status: ${session.status}, Plan: ${session.plan}`)
          })
        }
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
    
    // Verificar se o pagamento foi criado há pelo menos 10 segundos (evita confirmações prematuras)
    const paymentAge = Date.now() - payment.transactionDate.getTime()
    const isRecentPayment = paymentAge < 10000 // 10 segundos
    
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
