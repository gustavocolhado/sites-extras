import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

// Construir URL completa para mídias
function buildMediaUrl(url: string | null): string | null {
  if (!url) return null

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL
  if (!mediaUrl) {
    console.warn('NEXT_PUBLIC_MEDIA_URL não está configurada')
    return url
  }

  const cleanMediaUrl = mediaUrl.endsWith('/') ? mediaUrl.slice(0, -1) : mediaUrl
  const cleanUrl = url.startsWith('/') ? url : `/${url}`

  return `${cleanMediaUrl}${cleanUrl}`
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const slug = searchParams.get('slug') || ''

    const skip = (page - 1) * limit

    // Construir condições de busca
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (slug) {
      where.slug = slug
    }

    // Buscar categorias
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { qtd: 'desc' }, // Ordenar por quantidade de vídeos
        select: {
          id: true,
          name: true,
          qtd: true,
          slug: true,
          images: true,
          created_at: true
        }
      }),
      prisma.category.count({ where })
    ])

    // Para cada categoria, usar a thumb do vídeo mais recente como imagem
    const categoriesWithThumbs = await Promise.all(
      categories.map(async (category) => {
        const recentVideo = await prisma.video.findFirst({
          where: { category: { has: category.name } },
          select: { thumbnailUrl: true },
          orderBy: { created_at: 'desc' }
        })

        const thumbUrl = buildMediaUrl(recentVideo?.thumbnailUrl || null)
        return {
          ...category,
          images: thumbUrl || category.images || null
        }
      })
    )

    return NextResponse.json({
      categories: categoriesWithThumbs,
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
