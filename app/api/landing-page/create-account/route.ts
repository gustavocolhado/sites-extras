import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, referralData } = await request.json()

    // Validação básica
    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
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

    // Gerar senha temporária aleatória
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    // Criar usuário com senha temporária
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: email.split('@')[0], // Usar parte do email como nome
        signupSource: 'landing_page',
        premium: false, // Será ativado após pagamento
        emailVerified: new Date(),
        tempPassword: true, // Marcar como senha temporária
      }
    })

    // Registrar tracking da campanha se houver dados
    if (referralData) {
      try {
        await prisma.campaignTracking.create({
          data: {
            source: referralData.source || 'landing_page',
            campaign: referralData.campaign || 'direct',
            timestamp: new Date(),
            userAgent: 'landing_page',
            referrer: referralData.referrer || 'direct',
            utm_source: referralData.utm_source || null,
            utm_medium: referralData.utm_medium || null,
            utm_campaign: referralData.utm_campaign || null,
            utm_term: referralData.utm_term || null,
            utm_content: referralData.utm_content || null,
            ipAddress: 'landing_page',
            pageUrl: 'landing_page',
            userId: user.id, // Vincular ao usuário criado
          }
        })
        console.log('✅ Tracking registrado para usuário:', { userId: user.id, source: referralData.source })
      } catch (error) {
        console.error('❌ Erro ao registrar tracking:', error)
      }
    }

    console.log('✅ Conta criada na LandingPage:', { 
      userId: user.id, 
      email, 
      source: referralData?.source || 'landing_page' 
    })

    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso',
      userId: user.id,
      email: user.email,
      tempPassword: true
    })

  } catch (error) {
    console.error('❌ Erro ao criar conta na LandingPage:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 