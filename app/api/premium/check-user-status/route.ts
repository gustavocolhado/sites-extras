import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Buscar usuário atualizado
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        premium: true, 
        expireDate: true,
        paymentStatus: true,
        paymentDate: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const now = new Date()
    const isPremiumActive = user.premium && user.expireDate && new Date(user.expireDate) > now

    return NextResponse.json({
      premium: isPremiumActive,
      expireDate: user.expireDate,
      paymentStatus: user.paymentStatus,
      paymentDate: user.paymentDate,
      isActive: isPremiumActive
    })

  } catch (error) {
    console.error('Erro ao verificar status do usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status do usuário' },
      { status: 500 }
    )
  }
}
