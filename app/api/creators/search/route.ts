import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')

    if (!name) {
      return NextResponse.json(
        { error: 'Nome do criador é obrigatório' },
        { status: 400 }
      )
    }

    const creator = await prisma.creator.findFirst({
      where: { name },
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

    if (!creator) {
      return NextResponse.json(
        { error: 'Criador não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(creator)
  } catch (error) {
    console.error('Erro ao buscar criador:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
