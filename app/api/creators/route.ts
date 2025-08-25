import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Busca criadores com contagem de vídeos
    const creators = await prisma.creator.findMany({
      orderBy: {
        qtd: 'desc'
      },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        qtd: true,
        description: true,
        image: true,
        created_at: true,
        update_at: true
      }
    })

    // Conta total de criadores
    const totalCreators = await prisma.creator.count()

    // Se não houver criadores no banco, retorna array vazio
    if (creators.length === 0) {
      return NextResponse.json({
        creators: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasMore: false
        }
      })
    }

    return NextResponse.json({
      creators,
      pagination: {
        page,
        limit,
        total: totalCreators,
        totalPages: Math.ceil(totalCreators / limit),
        hasMore: page * limit < totalCreators
      }
    })
  } catch (error) {
    console.error('Erro ao buscar criadores:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 