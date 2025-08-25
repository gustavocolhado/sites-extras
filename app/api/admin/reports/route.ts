import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.access !== 1) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const reportType = searchParams.get('reportType') || 'monthly'

    // Parse dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    // Fetch basic statistics
    const [
      totalUsers,
      totalVideos,
      totalRevenue,
      totalViews,
      userGrowth,
      videoViews,
      revenueData,
      topVideos,
      topCategories
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total videos
      prisma.video.count(),
      
      // Total revenue
      prisma.payment.aggregate({
        where: {
          transactionDate: {
            gte: start,
            lte: end
          },
          status: 'completed'
        },
        _sum: {
          amount: true
        }
      }),
      
      // Total views
      prisma.video.aggregate({
        _sum: {
          viewCount: true
        }
      }),
      
      // User growth data
      prisma.user.groupBy({
        by: ['created_at'],
        where: {
          created_at: {
            gte: start,
            lte: end
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          created_at: 'asc'
        }
      }),
      
      // Video views data
      prisma.userHistory.groupBy({
        by: ['watchedAt'],
        where: {
          watchedAt: {
            gte: start,
            lte: end
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          watchedAt: 'asc'
        }
      }),
      
      // Revenue data
      prisma.payment.groupBy({
        by: ['transactionDate'],
        where: {
          transactionDate: {
            gte: start,
            lte: end
          },
          status: 'completed'
        },
        _sum: {
          amount: true
        },
        orderBy: {
          transactionDate: 'asc'
        }
      }),
      
      // Top videos
      prisma.video.findMany({
        select: {
          id: true,
          title: true,
          viewCount: true,
          likesCount: true
        },
        orderBy: {
          viewCount: 'desc'
        },
        take: 10
      }),
      
      // Top categories
      prisma.category.findMany({
        select: {
          name: true,
          qtd: true
        },
        orderBy: {
          qtd: 'desc'
        },
        take: 10
      })
    ])

    // Process user growth data
    const processedUserGrowth = userGrowth.map(item => ({
      date: item.created_at?.toISOString().split('T')[0] || '',
      count: item._count.id
    }))

    // Process video views data
    const processedVideoViews = videoViews.map(item => ({
      date: item.watchedAt.toISOString().split('T')[0],
      views: item._count.id
    }))

    // Process revenue data
    const processedRevenueData = revenueData.map(item => ({
      date: item.transactionDate.toISOString().split('T')[0],
      revenue: item._sum.amount || 0
    }))

    // Process top categories
    const processedTopCategories = topCategories.map(category => ({
      name: category.name,
      videoCount: category.qtd || 0,
      totalViews: 0 // Since we don't have direct relationship, we'll set to 0 for now
    }))

    return NextResponse.json({
      totalUsers,
      totalVideos,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalViews: totalViews._sum.viewCount || 0,
      userGrowth: processedUserGrowth,
      videoViews: processedVideoViews,
      revenueData: processedRevenueData,
      topVideos: topVideos.map(video => ({
        id: video.id,
        title: video.title || 'Sem título',
        views: video.viewCount || 0,
        likes: video.likesCount || 0
      })),
      topCategories: processedTopCategories
    })

  } catch (error) {
    console.error('Erro ao gerar relatórios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
