import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Construir condições de busca
    const where: any = {}
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    // Buscar categorias
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      prisma.category.count({ where })
    ])

    return NextResponse.json({
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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

    // Verificar se o usuário tem access: 1
    if (session.user.access !== 1) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { name, images, slug } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    // Gerar slug se não for fornecido
    const categorySlug = slug || name.toLowerCase().replace(/\s+/g, '-')

    // Verificar se já existe uma categoria com este nome ou slug
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { slug: { equals: categorySlug, mode: 'insensitive' } }
        ]
      }
    })

    if (existingCategory) {
      if (existingCategory.name.toLowerCase() === name.toLowerCase()) {
        return NextResponse.json({ error: 'Já existe uma categoria com este nome' }, { status: 400 })
      }
      // O slug é gerado a partir do nome, então se o nome for igual, o slug também será.
      // Se o slug for fornecido explicitamente e for diferente, mas o nome for o mesmo,
      // a verificação acima já teria pego.
      // Se o slug for diferente e o nome também, então é uma categoria diferente.
      // Apenas verificamos se o slug existente é igual ao categorySlug gerado/fornecido.
      if (existingCategory.slug && existingCategory.slug.toLowerCase() === categorySlug.toLowerCase()) {
        return NextResponse.json({ error: 'Já existe uma categoria com este slug' }, { status: 400 })
      }
    }

    // Criar nova categoria
    const category = await prisma.category.create({
      data: {
        name,
        images,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        qtd: 0
      }
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
