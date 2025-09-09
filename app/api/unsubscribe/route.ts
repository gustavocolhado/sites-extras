import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token && !email) {
      return NextResponse.json(
        { error: 'Token ou email é obrigatório' },
        { status: 400 }
      )
    }

    let user

    if (token) {
      // Buscar usuário por token (implementação futura)
      // Por enquanto, vamos usar email
      return NextResponse.json(
        { error: 'Token não implementado ainda. Use o parâmetro email.' },
        { status: 400 }
      )
    }

    if (email) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true, email: true, name: true, acceptPromotionalEmails: true }
      })
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    if (!user.acceptPromotionalEmails) {
      return NextResponse.json({
        message: 'Você já não recebe emails promocionais',
        alreadyUnsubscribed: true
      })
    }

    // Desativar emails promocionais
    await prisma.user.update({
      where: { id: user.id },
      data: { acceptPromotionalEmails: false }
    })

    console.log(`✅ Usuário ${user.email} foi removido da lista de emails promocionais`)

    return NextResponse.json({
      message: 'Você foi removido da lista de emails promocionais com sucesso!',
      user: {
        email: user.email,
        name: user.name
      }
    })

  } catch (error) {
    console.error('Erro ao processar unsubscribe:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true, acceptPromotionalEmails: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    if (!user.acceptPromotionalEmails) {
      return NextResponse.json({
        message: 'Você já não recebe emails promocionais',
        alreadyUnsubscribed: true
      })
    }

    // Desativar emails promocionais
    await prisma.user.update({
      where: { id: user.id },
      data: { acceptPromotionalEmails: false }
    })

    console.log(`✅ Usuário ${user.email} foi removido da lista de emails promocionais`)

    return NextResponse.json({
      message: 'Você foi removido da lista de emails promocionais com sucesso!',
      user: {
        email: user.email,
        name: user.name
      }
    })

  } catch (error) {
    console.error('Erro ao processar unsubscribe:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
