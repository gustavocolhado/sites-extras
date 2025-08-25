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

    const tagId = params.id
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    // Verificar se a tag existe
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId }
    })

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag não encontrada' }, { status: 404 })
    }

    // Verificar se já existe outra tag com este nome
    const duplicateTag = await prisma.tag.findFirst({
      where: {
        name,
        id: { not: tagId }
      }
    })

    if (duplicateTag) {
      return NextResponse.json({ error: 'Já existe uma tag com este nome' }, { status: 400 })
    }

    // Atualizar tag
    const tag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        name,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ tag })
  } catch (error) {
    console.error('Erro ao atualizar tag:', error)
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

    const tagId = params.id

    // Verificar se a tag existe
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId }
    })

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag não encontrada' }, { status: 404 })
    }

    // Verificar se há vídeos associados a esta tag
    const videosCount = await prisma.videoTag.count({
      where: {
        tagId: tagId
      }
    })

    if (videosCount > 0) {
      return NextResponse.json({ 
        error: `Não é possível excluir esta tag. Existem ${videosCount} vídeo(s) associado(s).` 
      }, { status: 400 })
    }

    // Excluir tag
    await prisma.tag.delete({
      where: { id: tagId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir tag:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
