import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'

// Função helper para obter duração do plano em dias
function getPlanDuration(planId: string): number {
  const durations = {
    monthly: 30,
    quarterly: 90,
    semiannual: 180,
    yearly: 365,
    lifetime: 36500 // 100 anos para vitalício
  }
  return durations[planId as keyof typeof durations] || 30
}

export async function POST(request: NextRequest) {
  try {
    let { email, password, confirmPassword, planId, paymentId, amount, source, campaign } = await request.json()

    // Validação básica
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Email, senha e confirmação são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se as senhas coincidem
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'As senhas não coincidem' },
        { status: 400 }
      )
    }

    // Verificar se a senha tem pelo menos 6 caracteres
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário tem senha temporária
    if (!user.tempPassword) {
      return NextResponse.json(
        { error: 'Este usuário já possui senha definida' },
        { status: 400 }
      )
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 12)

         // Buscar pagamentos pendentes do usuário
     const pendingPayments = await prisma.payment.findMany({
       where: {
         userId: user.id,
         status: 'pending'
       },
       orderBy: {
         transactionDate: 'desc'
       }
     })

    const paymentDate = new Date()
    let expireDate: Date

    // Se há pagamentos pendentes, processar o mais recente
    if (pendingPayments.length > 0) {
      const latestPayment = pendingPayments[0]
      planId = latestPayment.plan
      amount = latestPayment.amount * 100 // Converter para centavos

      // Atualizar pagamento para aprovado
      await prisma.payment.update({
        where: { id: latestPayment.id },
        data: { status: 'paid' }
      })

      console.log('✅ Pagamento pendente processado:', latestPayment.id)
    }

    // Definir data de expiração baseada no plano
    if (planId) {
      switch (planId) {
        case 'monthly':
          expireDate = new Date(paymentDate)
          expireDate.setDate(paymentDate.getDate() + 30)
          break
        case 'quarterly':
          expireDate = new Date(paymentDate)
          expireDate.setMonth(paymentDate.getMonth() + 3)
          break
        case 'semiannual':
          expireDate = new Date(paymentDate)
          expireDate.setMonth(paymentDate.getMonth() + 6)
          break
        case 'yearly':
          expireDate = new Date(paymentDate)
          expireDate.setFullYear(paymentDate.getFullYear() + 1)
          break
        case 'lifetime':
          expireDate = new Date(paymentDate)
          expireDate.setFullYear(paymentDate.getFullYear() + 100)
          break
        default:
          expireDate = new Date(paymentDate)
          break
      }
    } else {
      expireDate = new Date(paymentDate)
    }

    // Atualizar senha e ativar premium
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        tempPassword: false,
        premium: true, // Ativar premium após definir senha
        expireDate: expireDate,
        paymentDate: paymentDate,
        paymentStatus: 'paid',
      }
    })

    // Criar registro na tabela Payment se não existir
    if (planId && amount && pendingPayments.length === 0) {
      try {
        const payment = await prisma.payment.create({
          data: {
            userId: user.id,
            plan: planId,
            amount: amount / 100, // Converter de centavos para reais
            userEmail: email,
            status: 'paid',
            paymentId: paymentId || null,
            duration: getPlanDuration(planId),
            preferenceId: `landing_page_${Date.now()}`,
            campaignId: source && campaign ? `${source}_${campaign}` : null, // Vincular campanha
          }
        })
        console.log('✅ Payment registrado:', {
          id: payment.id,
          plan: payment.plan,
          amount: payment.amount,
          userId: payment.userId,
          campaignId: payment.campaignId
        })
      } catch (error) {
        console.error('❌ Erro ao criar payment:', error)
      }
    }

    // Registrar conversão da campanha
    try {
      const campaignTracking = await prisma.campaignTracking.findFirst({
        where: { userId: user.id },
        orderBy: { timestamp: 'desc' }
      })

      if (campaignTracking) {
        await prisma.campaignConversion.create({
          data: {
            userId: user.id,
            source: campaignTracking.source,
            campaign: campaignTracking.campaign,
            planId: planId || null,
            amount: amount ? amount / 100 : 0,
            convertedAt: new Date()
          }
        })

        // Marcar tracking como convertido
        await prisma.campaignTracking.update({
          where: { id: campaignTracking.id },
          data: {
            converted: true,
            convertedAt: new Date()
          }
        })

        console.log('✅ Conversão registrada para usuário:', { 
          userId: user.id, 
          source: campaignTracking.source,
          campaign: campaignTracking.campaign
        })
      }
    } catch (error) {
      console.error('❌ Erro ao registrar conversão:', error)
    }

    console.log('✅ Senha atualizada e premium ativado:', { 
      userId: user.id, 
      email,
      expireDate
    })

    return NextResponse.json({
      success: true,
      message: 'Senha atualizada e conta ativada com sucesso',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        premium: updatedUser.premium
      }
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 