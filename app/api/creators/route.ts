import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

// Função para construir URLs completas
function buildMediaUrl(url: string | null): string | null {
  if (!url) return null
  
  // Se já é uma URL completa, retornar como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL
  if (!mediaUrl) {
    console.warn('NEXT_PUBLIC_MEDIA_URL não está configurada')
    return url
  }
  
  // Remove barra dupla se existir
  const cleanMediaUrl = mediaUrl.endsWith('/') ? mediaUrl.slice(0, -1) : mediaUrl
  const cleanUrl = url.startsWith('/') ? url : `/${url}`
  
  return `${cleanMediaUrl}${cleanUrl}`
}

// Embaralhamento determinístico baseado em seed
function shuffleArray<T>(array: T[], seed: number): T[] {
  const result = [...array]
  let currentIndex = result.length
  let randomSeed = seed || Date.now()

  function pseudoRandom() {
    let t = (randomSeed += 0x6D2B79F5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(pseudoRandom() * currentIndex)
    currentIndex--
    ;[result[currentIndex], result[randomIndex]] = [result[randomIndex], result[currentIndex]]
  }

  return result
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit
    const timestampParam = searchParams.get('timestamp')
    const search = (searchParams.get('search') || '').trim()

    // Se houver timestamp, embaralhar determinísticamente usando seed
    if (timestampParam) {
      const seed = parseInt(timestampParam)
      // Buscar todos os criadores com campos essenciais
      const allCreators = await prisma.creator.findMany({
        select: {
          id: true,
          name: true,
          qtd: true,
          description: true,
          image: true,
          created_at: true,
          update_at: true
        },
        where: search ? {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        } : undefined
      })

      const totalCreators = allCreators.length

      // Embaralhar com seed e aplicar paginação
      const shuffled = shuffleArray(allCreators, isNaN(seed) ? Date.now() : seed)
      const paged = shuffled.slice(skip, skip + limit)

      // Processar imagem e contagem real apenas para os selecionados
      const creatorsWithImages = await Promise.all(
        paged.map(async (creator) => {
          const actualVideoCount = await prisma.video.count({
            where: { creator: creator.name }
          })

          // Sempre usar a thumb do vídeo mais recente como imagem do criador
          const recentVideo = await prisma.video.findFirst({
            where: { creator: creator.name },
            select: { thumbnailUrl: true },
            orderBy: { created_at: 'desc' }
          })

          return {
            ...creator,
            qtd: actualVideoCount,
            image: buildMediaUrl(recentVideo?.thumbnailUrl || null)
          }
        })
      )

      return NextResponse.json({
        creators: creatorsWithImages,
        pagination: {
          page,
          limit,
          total: totalCreators,
          totalPages: Math.ceil(totalCreators / limit),
          hasMore: page * limit < totalCreators
        }
      })
    }

    // Busca criadores (ordenados por popularidade) quando não há aleatoriedade por timestamp
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
      },
      where: search ? {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      } : undefined
    })

    // Para cada creator, processar imagem, contar vídeos e buscar fallback se necessário
    const creatorsWithImages = await Promise.all(
      creators.map(async (creator) => {
        // Contar vídeos em tempo real
        const actualVideoCount = await prisma.video.count({
          where: {
            creator: creator.name
          }
        })

        // Sempre usar a thumb do vídeo mais recente como imagem do criador
        const recentVideo = await prisma.video.findFirst({
          where: {
            creator: creator.name
          },
          select: {
            thumbnailUrl: true
          },
          orderBy: {
            created_at: 'desc'
          }
        })

        return {
          ...creator,
          qtd: actualVideoCount,
          image: buildMediaUrl(recentVideo?.thumbnailUrl || null)
        }
      })
    )

    // Conta total de criadores
    const totalCreators = await prisma.creator.count({
      where: search ? {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      } : undefined
    })

    // Se não houver criadores no banco, retorna array vazio
    if (creatorsWithImages.length === 0) {
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
      creators: creatorsWithImages,
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