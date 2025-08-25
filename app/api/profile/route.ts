import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        premium: true,
        created_at: true,
        expireDate: true,
        paymentDate: true,
        access: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, username, email } = body

    // Validações básicas
    if (name && name.trim().length < 2) {
      return NextResponse.json({ error: 'Nome deve ter pelo menos 2 caracteres' }, { status: 400 })
    }

    if (username && username.trim().length < 3) {
      return NextResponse.json({ error: 'Nome de usuário deve ter pelo menos 3 caracteres' }, { status: 400 })
    }

    if (email && !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // Verificar se username já existe (se foi alterado)
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: username,
          email: { not: session.user.email }
        }
      })

      if (existingUser) {
        return NextResponse.json({ error: 'Nome de usuário já está em uso' }, { status: 400 })
      }
    }

    // Verificar se email já existe (se foi alterado)
    if (email && email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email }
      })

      if (existingUser) {
        return NextResponse.json({ error: 'Email já está em uso' }, { status: 400 })
      }
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name || undefined,
        username: username || undefined,
        email: email || undefined,
        update_at: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        premium: true,
        created_at: true,
        expireDate: true,
        paymentDate: true,
        access: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 