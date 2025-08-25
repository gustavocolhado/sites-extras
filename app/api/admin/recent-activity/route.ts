import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

interface Activity {
  id: string
  type: 'user_registered' | 'payment_completed' | 'video_liked' | 'video_favorited' | 'video_watched'
  title: string
  description: string
  timestamp: Date
  user?: {
    id: string
    name: string
    email: string
  }
  metadata?: any
}

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
    const limit = parseInt(searchParams.get('limit') || '10')

    // Buscar atividades recentes
    const activities: Activity[] = []

    // 1. Usuários recentes (últimos 7 dias)
    const recentUsers = await prisma.user.findMany({
      take: limit,
      where: {
        created_at: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
        }
      },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        premium: true
      }
    })

    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user_registered',
        title: user.name ? `${user.name} se cadastrou` : 'Novo usuário se cadastrou',
        description: user.email || 'Sem email',
        timestamp: user.created_at || new Date(),
        user: {
          id: user.id,
          name: user.name || 'Usuário',
          email: user.email || 'sem-email@exemplo.com'
        },
        metadata: {
          premium: user.premium
        }
      })
    })

    // 2. Pagamentos recentes (últimos 7 dias)
    const recentPayments = await prisma.payment.findMany({
      take: limit,
      where: {
        transactionDate: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
        }
      },
      orderBy: { transactionDate: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    recentPayments.forEach(payment => {
      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment_completed',
        title: `${payment.user?.name || 'Usuário'} assinou o plano ${payment.plan}`,
        description: `R$ ${payment.amount.toLocaleString()}`,
        timestamp: payment.transactionDate,
        user: payment.user ? {
          id: payment.user.id,
          name: payment.user.name || 'Usuário',
          email: payment.user.email || 'sem-email@exemplo.com'
        } : undefined,
        metadata: {
          amount: payment.amount,
          plan: payment.plan,
          status: payment.status
        }
      })
    })

    // 3. Favoritos recentes (últimos 7 dias)
    const recentFavorites = await prisma.userFavorite.findMany({
      take: limit,
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        video: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    recentFavorites.forEach(favorite => {
      activities.push({
        id: `favorite-${favorite.id}`,
        type: 'video_favorited',
        title: `${favorite.user?.name || 'Usuário'} favoritou um vídeo`,
        description: favorite.video?.title || 'Vídeo sem título',
        timestamp: favorite.createdAt,
        user: favorite.user ? {
          id: favorite.user.id,
          name: favorite.user.name || 'Usuário',
          email: favorite.user.email || 'sem-email@exemplo.com'
        } : undefined,
        metadata: {
          videoId: favorite.videoId,
          videoTitle: favorite.video?.title
        }
      })
    })

    // 4. Histórico recente (últimos 7 dias)
    const recentHistory = await prisma.userHistory.findMany({
      take: limit,
      where: {
        watchedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
        }
      },
      orderBy: { watchedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        video: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    recentHistory.forEach(history => {
      activities.push({
        id: `history-${history.id}`,
        type: 'video_watched',
        title: `${history.user?.name || 'Usuário'} assistiu um vídeo`,
        description: history.video?.title || 'Vídeo sem título',
        timestamp: history.watchedAt,
        user: history.user ? {
          id: history.user.id,
          name: history.user.name || 'Usuário',
          email: history.user.email || 'sem-email@exemplo.com'
        } : undefined,
        metadata: {
          videoId: history.videoId,
          videoTitle: history.video?.title,
          watchDuration: history.watchDuration
        }
      })
    })

    // Ordenar todas as atividades por timestamp (mais recente primeiro)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Retornar apenas as atividades mais recentes
    const recentActivities = activities.slice(0, limit)

    return NextResponse.json({
      activities: recentActivities
    })
  } catch (error) {
    console.error('Erro ao buscar atividades recentes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
