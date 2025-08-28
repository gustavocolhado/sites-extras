import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface WebhookPayload {
  id: string
  status: string
  value: number
  end_to_end_id?: string
  payer_name?: string
  payer_national_registration?: string
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

// Função para ativar o acesso premium via webhook
async function activatePremiumAccessViaWebhook(pixId: string, statusData: WebhookPayload) {
  try {
    // Buscar o PaymentSession mais recente no banco pelo PIX ID normalizado
    console.log('🔍 Buscando PaymentSession mais recente com PIX ID:', pixId)
    
    const paymentSession = await prisma.paymentSession.findFirst({
      where: {
        OR: [
          { paymentId: parseInt(pixId) },
          { preferenceId: pixId } // Agora o preferenceId já está em maiúsculo
        ]
      },
      orderBy: { updatedAt: 'desc' }, // Buscar a mais recente
      include: { user: true }
    })

    if (!paymentSession) {
      console.error('PaymentSession não encontrada no webhook:', pixId)
      
      // Debug: buscar todas as PaymentSessions recentes para entender o problema
      const recentSessions = await prisma.paymentSession.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { user: true }
      })
      
      console.log('🔍 PaymentSessions recentes para debug:')
      recentSessions.forEach(session => {
        console.log(`- ID: ${session.id}`)
        console.log(`  PaymentID: ${session.paymentId}`)
        console.log(`  PreferenceID: ${session.preferenceId}`)
        console.log(`  Status: ${session.status}`)
        console.log(`  Usuário: ${session.user?.email}`)
        console.log('')
      })
      
      return false
    }

    // Debug: mostrar todas as PaymentSessions que correspondem ao PIX ID
    const allMatchingSessions = await prisma.paymentSession.findMany({
      where: {
        OR: [
          { paymentId: parseInt(pixId) },
          { preferenceId: pixId }
        ]
      },
      orderBy: { updatedAt: 'desc' },
      include: { user: true }
    })

    console.log(`🔍 Encontradas ${allMatchingSessions.length} PaymentSessions com PIX ID ${pixId}:`)
    allMatchingSessions.forEach((session, index) => {
      console.log(`${index + 1}. ID: ${session.id}`)
      console.log(`   PaymentID: ${session.paymentId}`)
      console.log(`   PreferenceID: ${session.preferenceId}`)
      console.log(`   Status: ${session.status}`)
      console.log(`   Usuário: ${session.user?.email}`)
      console.log(`   Atualizado: ${session.updatedAt}`)
      console.log('')
    })
    
    console.log('✅ PaymentSession encontrada no webhook:', {
      id: paymentSession.id,
      paymentId: paymentSession.paymentId,
      preferenceId: paymentSession.preferenceId,
      status: paymentSession.status,
      userId: paymentSession.userId,
      userEmail: paymentSession.userEmail
    })

    // Verificar se já foi processado
    if (paymentSession.status === 'paid') {
      console.log('Pagamento já foi processado via webhook:', pixId)
      return true
    }

    // Calcular data de expiração da assinatura
    const expireDate = calculateExpirationDate(paymentSession.plan)

    // Atualizar o PaymentSession
    await prisma.paymentSession.update({
      where: { id: paymentSession.id },
      data: {
        status: 'paid',
        updatedAt: new Date()
      }
    })

    // Verificar se userId existe
    if (!paymentSession.userId) {
      console.error('userId não encontrado para o PaymentSession no webhook:', pixId)
      return false
    }

    // Atualizar o usuário para premium
    await prisma.user.update({
      where: { id: paymentSession.userId },
      data: {
        premium: true,
        expireDate: expireDate,
        paymentStatus: 'paid',
        paymentDate: new Date()
      }
    })

    // Criar registro no modelo Payment para histórico
    await prisma.payment.create({
      data: {
        userId: paymentSession.userId,
        plan: paymentSession.plan,
        amount: paymentSession.amount,
        userEmail: paymentSession.userEmail || '',
        status: 'paid',
        paymentId: parseInt(pixId),
        duration: getPlanDurationInDays(paymentSession.plan)
      }
    })

    console.log('Acesso premium ativado via webhook:', {
      userId: paymentSession.userId,
      email: paymentSession.userEmail,
      plan: paymentSession.plan,
      expireDate: expireDate,
      pixId: pixId
    })

    return true
  } catch (error) {
    console.error('Erro ao ativar acesso premium via webhook:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Log the raw request details for debugging
    console.log('🔔 Webhook Pushin Pay recebido')
    console.log('📋 Headers:', Object.fromEntries(request.headers.entries()))
    console.log('📋 Method:', request.method)
    
    // Get the raw body as text first
    const rawBody = await request.text()
    console.log('📋 Raw webhook body:', rawBody)
    
    let body: WebhookPayload
    
    // Try to parse as JSON
    try {
      body = JSON.parse(rawBody)
    } catch (parseError) {
      console.error('❌ Failed to parse webhook body as JSON:', parseError)
      console.error('❌ Raw body that failed to parse:', rawBody)
      
      // Try to handle different content types
      const contentType = request.headers.get('content-type')
      console.log('📋 Content-Type header:', contentType)
      
      // If it's form data, try to parse it
      if (contentType?.includes('application/x-www-form-urlencoded')) {
        const urlParams = new URLSearchParams(rawBody)
        body = {
          id: urlParams.get('id') || '',
          status: urlParams.get('status') || '',
          value: parseInt(urlParams.get('value') || '0'),
          end_to_end_id: urlParams.get('end_to_end_id') || undefined,
          payer_name: urlParams.get('payer_name') || undefined,
          payer_national_registration: urlParams.get('payer_national_registration') || undefined,
        }
      } else {
        // Return error for unparseable data
        return NextResponse.json(
          { error: 'Invalid webhook payload format' },
          { status: 400 }
        )
      }
    }

    const { id, status, value, end_to_end_id, payer_name, payer_national_registration } = body

    // Normalizar o PIX ID para maiúsculo
    const normalizedPixId = id.toUpperCase()

    console.log('📊 Webhook Pushin Pay processado:', {
      pixId: normalizedPixId,
      originalPixId: id,
      status,
      value,
      endToEndId: end_to_end_id,
      payerName: payer_name,
      payerDocument: payer_national_registration
    })

    // Verificar se o pagamento foi confirmado
    if (status === 'paid') {
      console.log('✅ Pagamento confirmado via webhook Pushin Pay:', normalizedPixId)
      
      // Ativar acesso premium
      const activated = await activatePremiumAccessViaWebhook(normalizedPixId, {
        id: normalizedPixId,
        status,
        value,
        end_to_end_id,
        payer_name,
        payer_national_registration
      })

      if (!activated) {
        console.error('❌ Falha ao ativar acesso premium via webhook:', id)
        return NextResponse.json(
          { error: 'Erro ao processar pagamento' },
          { status: 500 }
        )
      }

      console.log('🎉 Acesso premium ativado com sucesso via webhook Pushin Pay:', normalizedPixId)
    } else {
      console.log('ℹ️ Status do pagamento não é "paid":', status)
    }

    // Retornar sucesso para a PushinPay
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Erro ao processar webhook Pushin Pay:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
