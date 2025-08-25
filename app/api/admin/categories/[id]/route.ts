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

    const categoryId = params.id
    const body = await request.json()
    const { name, images, slug } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    // Verificar se a categoria existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }

    // Verificar se já existe outra categoria com este nome
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name,
        id: { not: categoryId }
      }
    })

    if (duplicateCategory) {
      return NextResponse.json({ error: 'Já existe uma categoria com este nome' }, { status: 400 })
    }

    // Atualizar categoria
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        images,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        updated_at: new Date()
      }
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
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

    const categoryId = params.id

    // Verificar se a categoria existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }

    // Verificar se há vídeos associados a esta categoria
    const videosCount = await prisma.video.count({
      where: {
        category: {
          has: existingCategory.name
        }
      }
    })

    if (videosCount > 0) {
      return NextResponse.json({ 
        error: `Não é possível excluir esta categoria. Existem ${videosCount} vídeo(s) associado(s).` 
      }, { status: 400 })
    }

    // Excluir categoria
    await prisma.category.delete({
      where: { id: categoryId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
