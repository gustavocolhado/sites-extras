import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const clickId = searchParams.get('clickid')

    // Construir filtros
    const where: any = {}
    if (clickId) {
      where.clickId = clickId
    }

    // Buscar conversões
    const conversions = await prisma.trafficStarsConversion.findMany({
      where,
      orderBy: { convertedAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Contar total
    const total = await prisma.trafficStarsConversion.count({ where })

    // Calcular estatísticas
    const stats = await prisma.trafficStarsConversion.aggregate({
      where,
      _sum: {
        value: true,
        price: true
      },
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      conversions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      stats: {
        totalConversions: stats._count.id,
        totalValue: stats._sum.value || 0,
        totalPrice: stats._sum.price || 0
      }
    })

  } catch (error) {
    console.error('❌ Erro ao buscar conversões TrafficStars:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID da conversão é obrigatório' },
        { status: 400 }
      )
    }

    await prisma.trafficStarsConversion.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Conversão removida com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro ao remover conversão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
