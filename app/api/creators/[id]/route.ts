import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const creator = await prisma.creator.findUnique({
      where: { id },
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