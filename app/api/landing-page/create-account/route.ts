import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { normalizeEmail } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { email, referralData, acceptPromotionalEmails = true, acceptTermsOfUse = false } = await request.json()

    // Normalizar email para minúsculas
    const normalizedEmail = normalizeEmail(email)

    // Validação básica
    if (!normalizedEmail) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
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
        email: normalizedEmail,
        password: hashedPassword,
        name: normalizedEmail.split('@')[0], // Usar parte do email como nome
        signupSource: 'landing_page',
        premium: false, // Será ativado após pagamento
        emailVerified: new Date(),
        acceptPromotionalEmails,
        acceptTermsOfUse,
        tempPassword: true, // Marcar como senha temporária
      }
    })

    // Registrar tracking da campanha se houver dados
    if (referralData && referralData.source && referralData.campaign) {
      try {
        await prisma.campaignTracking.upsert({
          where: {
            source_campaign: {
              source: referralData.source,
              campaign: referralData.campaign,
            },
          },
          update: {
            visitCount: {
              increment: 1,
            },
          },
          create: {
            source: referralData.source,
            campaign: referralData.campaign,
            visitCount: 1,
          },
        });
        console.log('📈 Visita de Landing Page registrada:', { 
          source: referralData.source,
          campaign: referralData.campaign
        });
      } catch (error) {
        console.error('❌ Erro ao registrar tracking da Landing Page:', error);
      }
    }

    console.log('✅ Conta criada na LandingPage:', { 
      userId: user.id, 
      email: normalizedEmail, 
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
