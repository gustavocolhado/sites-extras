import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário tem access: 1
    if (session.user.access !== 1) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const creatorId = params.id
    const body = await request.json()
    const { name, description, image } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    // Verificar se o criador existe
    const existingCreator = await prisma.creator.findUnique({
      where: { id: creatorId }
    })

    if (!existingCreator) {
      return NextResponse.json({ error: 'Criador não encontrado' }, { status: 404 })
    }

    // Verificar se já existe outro criador com este nome
    const duplicateCreator = await prisma.creator.findFirst({
      where: {
        name,
        id: { not: creatorId }
      }
    })

    if (duplicateCreator) {
      return NextResponse.json({ error: 'Já existe um criador com este nome' }, { status: 400 })
    }

    // Atualizar criador
    const creator = await prisma.creator.update({
      where: { id: creatorId },
      data: {
        name,
        description,
        image,
        update_at: new Date()
      }
    })

    return NextResponse.json({ creator })
  } catch (error) {
    console.error('Erro ao atualizar criador:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário tem access: 1
    if (session.user.access !== 1) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const creatorId = params.id

    // Verificar se o criador existe
    const existingCreator = await prisma.creator.findUnique({
      where: { id: creatorId }
    })

    if (!existingCreator) {
      return NextResponse.json({ error: 'Criador não encontrado' }, { status: 404 })
    }

    // Verificar se há vídeos associados a este criador
    const videosCount = await prisma.video.count({
      where: { creator: existingCreator.name }
    })

    if (videosCount > 0) {
      return NextResponse.json({ 
        error: `Não é possível excluir este criador. Existem ${videosCount} vídeo(s) associado(s).` 
      }, { status: 400 })
    }

    // Excluir criador
    await prisma.creator.delete({
      where: { id: creatorId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir criador:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
