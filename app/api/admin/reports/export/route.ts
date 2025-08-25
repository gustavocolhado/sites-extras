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
    const format = searchParams.get('format') || 'csv'

    // Parse dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    // Fetch data for export
    const [
      users,
      videos,
      payments,
      userHistory,
      categories
    ] = await Promise.all([
      // Users
      prisma.user.findMany({
        where: {
          created_at: {
            gte: start,
            lte: end
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          created_at: true,
          premium: true
        },
        orderBy: {
          created_at: 'desc'
        }
      }),
      
      // Videos
      prisma.video.findMany({
        where: {
          created_at: {
            gte: start,
            lte: end
          }
        },
        select: {
          id: true,
          title: true,
          viewCount: true,
          likesCount: true,
          created_at: true
        },
        orderBy: {
          created_at: 'desc'
        }
      }),
      
      // Payments
      prisma.payment.findMany({
        where: {
          transactionDate: {
            gte: start,
            lte: end
          }
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          transactionDate: 'desc'
        }
      }),
      
      // User History
      prisma.userHistory.findMany({
        where: {
          watchedAt: {
            gte: start,
            lte: end
          }
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          video: {
            select: {
              title: true
            }
          }
        },
        orderBy: {
          watchedAt: 'desc'
        }
      }),
      
      // Categories
      prisma.category.findMany({
        orderBy: {
          created_at: 'desc'
        }
      })
    ])

    if (format === 'csv') {
      // Generate CSV content
      const csvContent = generateCSV({
        users,
        videos,
        payments,
        userHistory,
        categories,
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        reportType
      })

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="relatorio-${reportType}-${start.toISOString().split('T')[0]}-${end.toISOString().split('T')[0]}.csv"`
        }
      })
    } else if (format === 'pdf') {
      // For PDF, we'll return a JSON response for now
      return NextResponse.json({
        message: 'Exportacao PDF em desenvolvimento',
        data: {
          users: users.length,
          videos: videos.length,
          payments: payments.length,
          userHistory: userHistory.length,
          categories: categories.length
        }
      })
    }

    return NextResponse.json({ error: 'Formato nao suportado' }, { status: 400 })

  } catch (error) {
    console.error('Erro ao exportar relatorio:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function generateCSV(data: any) {
  const { users, videos, payments, userHistory, categories, startDate, endDate, reportType } = data
  
  let csv = `Relatorio ${reportType} - ${startDate} a ${endDate}\n\n`
  
  // Users section
  csv += '=== USUARIOS ===\n'
  csv += 'ID,Nome,Email,Data de Criacao,Premium\n'
  users.forEach((user: any) => {
    const date = user.created_at.toISOString().split('T')[0]
    const premium = user.premium ? 'Sim' : 'Nao'
    csv += `${user.id},"${user.name || ''}","${user.email || ''}","${date}","${premium}"\n`
  })
  
  csv += '\n=== VIDEOS ===\n'
  csv += 'ID,Titulo,Visualizacoes,Curtidas,Data de Criacao\n'
  videos.forEach((video: any) => {
    const date = video.created_at.toISOString().split('T')[0]
    csv += `${video.id},"${video.title || ''}",${video.viewCount || 0},${video.likesCount || 0},"${date}"\n`
  })
  
  csv += '\n=== PAGAMENTOS ===\n'
  csv += 'ID,Usuario,Email,Valor,Status,Data da Transacao\n'
  payments.forEach((payment: any) => {
    const date = payment.transactionDate.toISOString().split('T')[0]
    csv += `${payment.id},"${payment.user?.name || ''}","${payment.user?.email || ''}",${payment.amount},${payment.status},"${date}"\n`
  })
  
  csv += '\n=== HISTORICO DE VISUALIZACOES ===\n'
  csv += 'ID,Usuario,Email,Video,Data de Visualizacao\n'
  userHistory.forEach((history: any) => {
    const date = history.watchedAt.toISOString().split('T')[0]
    csv += `${history.id},"${history.user?.name || ''}","${history.user?.email || ''}","${history.video?.title || ''}","${date}"\n`
  })
  
  csv += '\n=== CATEGORIAS ===\n'
  csv += 'Nome,Quantidade de Videos\n'
  categories.forEach((category: any) => {
    csv += `"${category.name}",${category.qtd || 0}\n`
  })
  
  return csv
}
