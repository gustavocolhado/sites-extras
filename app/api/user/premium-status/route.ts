import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'
import { normalizeEmail } from '@/lib/utils'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

// ⚠️ DEPRECATED: Esta API não é mais necessária
// O status premium agora é verificado usando os dados da sessão do usuário
// Esta API pode ser removida após confirmar que não há outros usos

export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { isPremium: false, message: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Normalizar email para minúsculas
    const normalizedEmail = normalizeEmail(session.user.email)
    
    // Buscar usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        premium: true,
        expireDate: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { isPremium: false, message: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é premium e se a assinatura não expirou
    const isPremium = user.premium && (!user.expireDate || new Date() < user.expireDate)

    return NextResponse.json({
      isPremium,
      premiumExpiresAt: user.expireDate,
      message: isPremium ? 'Usuário premium ativo' : 'Usuário não premium'
    })
  } catch (error) {
    console.error('Erro ao verificar status premium:', error)
    return NextResponse.json(
      { isPremium: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 