import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/auth'

/**
 * GET - Listar conversões de campanhas de email
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session?.user || session.user.access !== 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    if (campaignId) {
      where.campaignId = campaignId
    }

    // Buscar conversões
    const [conversions, total] = await Promise.all([
      prisma.emailCampaignConversion.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          campaign: {
            select: {
              id: true,
              name: true,
              subject: true
            }
          }
        },
        orderBy: { convertedAt: 'desc' }
      }),
      prisma.emailCampaignConversion.count({ where })
    ])

    // Calcular estatísticas
    const stats = await prisma.emailCampaignConversion.aggregate({
      where,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      conversions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        totalConversions: stats._count.id,
        totalRevenue: stats._sum.amount || 0,
        averageOrderValue: stats._count.id > 0 ? (stats._sum.amount || 0) / stats._count.id : 0
      }
    })

  } catch (error) {
    console.error('Erro ao buscar conversões:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST - Registrar nova conversão
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      campaignId, 
      planType, 
      amount, 
      paymentId 
    } = await request.json()

    if (!userId || !campaignId || !planType || !amount) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Verificar se já existe uma conversão para este usuário nesta campanha
    const existingConversion = await prisma.emailCampaignConversion.findFirst({
      where: {
        userId,
        campaignId
      }
    })

    if (existingConversion) {
      return NextResponse.json({
        success: true,
        message: 'Conversão já registrada',
        conversion: existingConversion
      })
    }

    // Criar registro de conversão
    const conversion = await prisma.emailCampaignConversion.create({
      data: {
        campaignId,
        userId,
        planType,
        amount,
        paymentId: paymentId || null,
      },
      include: {
        campaign: {
          select: {
            name: true,
            subject: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Atualizar contador de conversões na campanha
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        conversions: {
          increment: 1
        }
      }
    })

    console.log(`🎉 CONVERSÃO REGISTRADA: ${conversion.user.email} assinou ${planType} por R$ ${amount} via campanha "${conversion.campaign.name}"`)

    return NextResponse.json({
      success: true,
      message: 'Conversão registrada com sucesso',
      conversion: {
        id: conversion.id,
        planType: conversion.planType,
        amount: conversion.amount,
        convertedAt: conversion.convertedAt,
        campaignName: conversion.campaign.name,
        userName: conversion.user.name,
        userEmail: conversion.user.email
      }
    })

  } catch (error) {
    console.error('Erro ao registrar conversão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
