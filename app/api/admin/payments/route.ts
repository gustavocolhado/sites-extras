import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const status = searchParams.get('status') || 'all'
    const plan = searchParams.get('plan') || 'all'
    const showDuplicates = searchParams.get('showDuplicates') === 'true'

    const skip = (page - 1) * limit

    // Construir condições de busca
    const where: any = {}
    
    // Filtro por data
    if (startDate || endDate) {
      where.transactionDate = {}
      if (startDate) {
        where.transactionDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.transactionDate.lte = new Date(endDate + 'T23:59:59.999Z')
      }
    }

    // Filtro por status
    if (status !== 'all') {
      where.status = status
    }

    // Filtro por plano
    if (plan !== 'all') {
      where.plan = plan
    }

    // Buscar pagamentos
    const [allPayments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
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
      }).catch(async () => {
        // Se houver erro com o relacionamento, buscar sem include e depois buscar usuários separadamente
        const paymentsWithoutUser = await prisma.payment.findMany({
          where,
          orderBy: { transactionDate: 'desc' }
        })
        
        // Buscar usuários separadamente
        const userIds = Array.from(new Set(paymentsWithoutUser.map(p => p.userId).filter(Boolean)))
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true }
        })
        
        const userMap = new Map(users.map(u => [u.id, u]))
        
        return paymentsWithoutUser.map(payment => ({
          ...payment,
          user: userMap.get(payment.userId) || null
        }))
      }),
      prisma.payment.count({ where })
    ])

    let payments: any[]
    let uniquePaymentsList: any[]

    if (showDuplicates) {
      // Mostrar apenas duplicados
      const duplicatesMap = new Map()
      const uniqueMap = new Map()
      
      allPayments.forEach(payment => {
        const key = `${payment.paymentId}_${payment.userId}_${payment.amount}_${payment.plan}`
        if (uniqueMap.has(key)) {
          // É um duplicado
          if (!duplicatesMap.has(key)) {
            duplicatesMap.set(key, [uniqueMap.get(key)])
          }
          duplicatesMap.get(key).push(payment)
        } else {
          uniqueMap.set(key, payment)
        }
      })

      // Flatten dos duplicados
      const allDuplicates = Array.from(duplicatesMap.values()).flat()
      payments = allDuplicates.slice(skip, skip + limit)
      uniquePaymentsList = allDuplicates
    } else {
      // Remover duplicados baseado em paymentId, userId e amount
      const uniquePayments = allPayments.reduce((acc, payment) => {
        const key = `${payment.paymentId}_${payment.userId}_${payment.amount}_${payment.plan}`
        if (!acc.has(key)) {
          acc.set(key, payment)
        }
        return acc
      }, new Map())

      payments = Array.from(uniquePayments.values())
        .slice(skip, skip + limit)
      uniquePaymentsList = Array.from(uniquePayments.values())
    }

    // Calcular estatísticas baseadas nos pagamentos únicos
    const stats = {
      totalAmount: uniquePaymentsList.reduce((sum, payment) => sum + payment.amount, 0),
      totalCount: uniquePaymentsList.length
    }

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total: uniquePaymentsList.length,
        pages: Math.ceil(uniquePaymentsList.length / limit),
        hasNext: page < Math.ceil(uniquePaymentsList.length / limit),
        hasPrev: page > 1
      },
      stats: {
        totalAmount: stats.totalAmount,
        totalCount: stats.totalCount
      }
    })
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
