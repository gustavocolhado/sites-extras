import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    if (session.user.access !== 1) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const categories = await prisma.category.findMany({
      select: { id: true, name: true, qtd: true },
      orderBy: { qtd: 'desc' }
    })

    let totalVideos = 0
    let outOfSyncCount = 0
    const outOfSyncCategories: { id: string; name: string; storedCount: number; actualCount: number }[] = []
    const categoriesWithoutVideos: { id: string; name: string }[] = []

    for (const cat of categories) {
      const actualCount = await prisma.video.count({
        where: { category: { has: cat.name } }
      })
      totalVideos += actualCount
      if ((cat.qtd || 0) !== actualCount) {
        outOfSyncCount++
        outOfSyncCategories.push({
          id: cat.id,
          name: cat.name,
          storedCount: cat.qtd || 0,
          actualCount
        })
      }
      if (actualCount === 0) {
        categoriesWithoutVideos.push({ id: cat.id, name: cat.name })
      }
    }

    // Detectar categorias presentes nos vídeos mas ausentes na tabela category
    const existingNames = new Set(categories.map(c => c.name))
    const videoRows = await prisma.video.findMany({ select: { category: true }, where: { category: { isEmpty: false } } })
    const missingCategories: { name: string; count: number }[] = []
    const candidateNames = new Set<string>()
    for (const row of videoRows) {
      for (const name of (row.category || [])) {
        if (name && !existingNames.has(name)) {
          candidateNames.add(name)
        }
      }
    }
    {
      const namesArr = Array.from(candidateNames)
      for (let i = 0; i < namesArr.length; i++) {
        const name = namesArr[i]
        const count = await prisma.video.count({ where: { category: { has: name } } })
        missingCategories.push({ name, count })
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalCategories: categories.length,
        totalVideos,
        outOfSyncCategories: outOfSyncCount,
        syncStatus: outOfSyncCount === 0 ? 'synchronized' : 'out_of_sync',
        missingCategories: missingCategories.length
      },
      outOfSyncCategories,
      categoriesWithoutVideos,
      missingCategories
    })
  } catch (error) {
    console.error('Erro ao verificar sincronização de categorias:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', message: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    if (session.user.access !== 1) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { deleteZero = false, deleteIds = [] } = await request.json().catch(() => ({ deleteZero: false, deleteIds: [] }))

    const categories = await prisma.category.findMany({ select: { id: true, name: true, qtd: true } })

    // Criar categorias ausentes com base nos vídeos
    const existingNames = new Set(categories.map(c => c.name))
    const videoRows = await prisma.video.findMany({ select: { category: true } })
    const candidateNames = new Set<string>()
    for (const row of videoRows) {
      for (const name of (row.category || [])) {
        if (name && !existingNames.has(name)) {
          candidateNames.add(name)
        }
      }
    }

    const createdCategories: { id: string; name: string }[] = []
    {
      const namesArr = Array.from(candidateNames)
      for (let i = 0; i < namesArr.length; i++) {
        const name = namesArr[i]
        try {
          const count = await prisma.video.count({ where: { category: { has: name } } })
          const created = await prisma.category.create({
            data: {
              name,
              slug: slugify(name),
              qtd: count,
              created_at: new Date(),
              updated_at: new Date()
            },
            select: { id: true, name: true }
          })
          createdCategories.push(created)
        } catch (err) {
          console.error(`Erro ao criar categoria '${name}':`, err)
        }
      }
    }

    let updatedCount = 0
    let totalVideos = 0
    const updates: Array<{ name: string; oldCount: number; newCount: number }> = []

    for (const cat of categories) {
      try {
        const actualCount = await prisma.video.count({ where: { category: { has: cat.name } } })
        totalVideos += actualCount
        if ((cat.qtd || 0) !== actualCount) {
          await prisma.category.update({
            where: { id: cat.id },
            data: { qtd: actualCount, updated_at: new Date() }
          })
          updates.push({ name: cat.name, oldCount: cat.qtd || 0, newCount: actualCount })
          updatedCount++
        }
      } catch (err) {
        console.error(`Erro ao sincronizar categoria ${cat.name}:`, err)
      }
    }

    const categoriesWithoutVideos: { id: string; name: string }[] = []
    for (const cat of categories) {
      const count = await prisma.video.count({ where: { category: { has: cat.name } } })
      if (count === 0) {
        categoriesWithoutVideos.push({ id: cat.id, name: cat.name })
      }
    }

    let deletedCategories: { id: string; name: string }[] = []
    if (deleteZero || (Array.isArray(deleteIds) && deleteIds.length > 0)) {
      const toDelete = deleteZero ? categoriesWithoutVideos : categoriesWithoutVideos.filter(c => deleteIds.includes(c.id))
      for (const c of toDelete) {
        try {
          const count = await prisma.video.count({ where: { category: { has: c.name } } })
          if (count === 0) {
            await prisma.category.delete({ where: { id: c.id } })
            deletedCategories.push(c)
          }
        } catch (err) {
          console.error(`Erro ao excluir categoria ${c.name}:`, err)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sincronização de categorias concluída com sucesso',
      stats: {
        totalCategories: categories.length,
        updatedCategories: updatedCount,
        totalVideos,
        categoriesWithoutVideos: categoriesWithoutVideos.length,
        deletedCategories: deletedCategories.length,
        createdCategories: createdCategories.length
      },
      updates,
      categoriesWithoutVideos,
      deletedCategories,
      createdCategories
    })
  } catch (error) {
    console.error('Erro durante a sincronização de categorias:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', message: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}