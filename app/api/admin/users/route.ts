import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário tem access: 1
    if (session.user.access !== 1) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const filter = searchParams.get('filter') || 'all'

    const skip = (page - 1) * limit

    // Construir condições de busca
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (filter === 'premium') {
      where.premium = true
    } else if (filter === 'active') {
      where.access = { gt: 0 }
    } else if (filter === 'inactive') {
      where.access = 0
    }

    // Buscar usuários
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          premium: true,
          created_at: true,
          update_at: true,
          access: true,
          expireDate: true,
          acceptPromotionalEmails: true
        }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário tem access: 1
    if (session.user.access !== 1) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, name, email, premium, access, expireDate, newPassword } = body

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Preparar dados para atualização
    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (email !== undefined) {
      // Verificar se o email já existe em outro usuário
      if (email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email }
        })
        if (emailExists) {
          return NextResponse.json({ error: 'Email já está em uso' }, { status: 400 })
        }
        updateData.email = email
      }
    }
    if (premium !== undefined) updateData.premium = premium
    if (access !== undefined) updateData.access = access
    if (expireDate !== undefined) {
      updateData.expireDate = expireDate ? new Date(expireDate) : null
      // Se definir uma data de expiração, ativar premium
      if (expireDate) {
        updateData.premium = true
      }
    }
    if (newPassword !== undefined && newPassword.trim()) {
      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      updateData.password = hashedPassword
      updateData.tempPassword = true // Marcar como senha temporária
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        premium: true,
        access: true,
        expireDate: true,
        created_at: true,
        update_at: true,
        acceptPromotionalEmails: true
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Usuário atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
