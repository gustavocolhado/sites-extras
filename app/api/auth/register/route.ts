import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      password, 
      name, 
      source = 'website',
      planId,
      pixId,
      referralData
    } = await request.json()

    // Validação básica
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, senha e nome são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Verificar se há pagamento PIX aprovado
    let isPremium = false
    if (pixId) {
      try {
        const { MercadoPagoConfig, Payment } = await import('mercadopago')
        const mercadopago = new MercadoPagoConfig({
          accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
        })
        
        const paymentClient = new Payment(mercadopago)
        const payment = await paymentClient.get({ id: pixId })
        
        if (payment.status === 'approved') {
          isPremium = true
          console.log('✅ Usuário registrado com premium ativo via PIX:', { email, pixId })
        }
      } catch (error) {
        console.error('❌ Erro ao verificar pagamento PIX:', error)
      }
    }

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        signupSource: source,
        premium: isPremium,
        emailVerified: new Date(),
      }
    })

    // Registrar conversão da campanha se houver dados
    if (referralData && isPremium) {
      try {
        await prisma.campaignConversion.create({
          data: {
            userId: user.id,
            source: referralData.source || 'landing_page',
            campaign: referralData.campaign || 'direct',
            planId: planId || null,
            amount: 0, // Será atualizado pelo webhook
            convertedAt: new Date()
          }
        })
        console.log('✅ Conversão registrada para usuário:', { userId: user.id, source: referralData.source })
      } catch (error) {
        console.error('❌ Erro ao registrar conversão:', error)
      }
    }

    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          premium: user.premium
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erro ao registrar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 