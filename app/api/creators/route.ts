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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Busca criadores
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

    // Para cada creator, processar imagem, contar vídeos e buscar fallback se necessário
    const creatorsWithImages = await Promise.all(
      creators.map(async (creator) => {
        // Contar vídeos em tempo real
        const actualVideoCount = await prisma.video.count({
          where: {
            creator: creator.name
          }
        })

        // Se já tem imagem, processar a URL
        if (creator.image) {
          return {
            ...creator,
            qtd: actualVideoCount, // Usar contagem em tempo real
            image: buildMediaUrl(creator.image)
          }
        }

        // Buscar um vídeo aleatório do creator para usar como imagem
        const randomVideo = await prisma.video.findFirst({
          where: {
            creator: creator.name
          },
          select: {
            thumbnailUrl: true
          },
          orderBy: {
            created_at: 'desc' // Pegar o mais recente primeiro
          }
        })

        return {
          ...creator,
          qtd: actualVideoCount, // Usar contagem em tempo real
          image: buildMediaUrl(randomVideo?.thumbnailUrl || null)
        }
      })
    )

    // Conta total de criadores
    const totalCreators = await prisma.creator.count()

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