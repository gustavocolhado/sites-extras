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
    const source = searchParams.get('source') || ''
    const campaign = searchParams.get('campaign') || ''

    const skip = (page - 1) * limit

    // Construir condições de busca
    const where: any = {}
    
    // Filtro por data
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate + 'T23:59:59.999Z')
      }
    }

    // Filtro por fonte
    if (source) {
      where.source = { contains: source, mode: 'insensitive' }
    }

    // Filtro por campanha
    if (campaign) {
      where.campaign = { contains: campaign, mode: 'insensitive' }
    }

    // Buscar dados de tracking
    const [trackingData, total] = await Promise.all([
      prisma.campaignTracking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.campaignTracking.count({ where })
    ])

    // Calcular estatísticas agregadas
    const stats = await prisma.campaignTracking.aggregate({
      where,
      _count: {
        id: true
      }
    })

    // Calcular conversões
    const conversions = await prisma.campaignTracking.count({
      where: {
        ...where,
        converted: true
      }
    })

    // Calcular taxa de conversão
    const conversionRate = stats._count.id > 0 ? (conversions / stats._count.id) * 100 : 0

    // Buscar dados agregados por fonte/campanha
    const campaignStats = await prisma.campaignTracking.groupBy({
      by: ['source', 'campaign'],
      where,
      _count: {
        id: true
      }
    })

    // Calcular conversões por campanha
    const campaignConversions = await prisma.campaignTracking.groupBy({
      by: ['source', 'campaign'],
      where: {
        ...where,
        converted: true
      },
      _count: {
        id: true
      }
    })

    // Combinar estatísticas
    const combinedStats = campaignStats.map(stat => {
      const conversion = campaignConversions.find(
        conv => conv.source === stat.source && conv.campaign === stat.campaign
      )
      return {
        source: stat.source,
        campaign: stat.campaign,
        _count: {
          id: stat._count.id
        },
        _sum: {
          converted: conversion ? conversion._count.id : 0
        }
      }
    })

    // Buscar conversões monetárias
    const monetaryConversions = await prisma.campaignConversion.aggregate({
      where: {
        ...(startDate || endDate ? {
          convertedAt: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate + 'T23:59:59.999Z') })
          }
        } : {}),
        ...(source && { source: { contains: source, mode: 'insensitive' } }),
        ...(campaign && { campaign: { contains: campaign, mode: 'insensitive' } })
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      trackingData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      stats: {
        totalVisits: stats._count.id || 0,
        totalConversions: conversions,
        conversionRate: Math.round(conversionRate * 100) / 100,
        totalRevenue: monetaryConversions._sum.amount || 0,
        totalMonetaryConversions: monetaryConversions._count.id || 0
      },
      campaignStats: combinedStats
    })
  } catch (error) {
    console.error('Erro ao buscar dados de campanhas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
