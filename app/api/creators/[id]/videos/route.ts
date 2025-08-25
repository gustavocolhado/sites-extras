import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Primeiro, busca o criador para obter o nome
    const creator = await prisma.creator.findUnique({
      where: { id },
      select: { name: true }
    })

    if (!creator) {
      return NextResponse.json(
        { error: 'Criador não encontrado' },
        { status: 404 }
      )
    }

    // Busca vídeos do criador
    const videos = await prisma.video.findMany({
      where: {
        creator: creator.name
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        url: true,
        videoUrl: true,
        viewCount: true,
        likesCount: true,
        thumbnailUrl: true,
        duration: true,
        premium: true,
        iframe: true,
        trailerUrl: true,
        category: true,
        creator: true,
        created_at: true
      }
    })

    // Conta total de vídeos do criador
    const totalVideos = await prisma.video.count({
      where: {
        creator: creator.name
      }
    })

    // Processar vídeos para construir URLs completas
    const processedVideos = videos.map(video => ({
      ...video,
      thumbnailUrl: buildMediaUrl(video.thumbnailUrl),
      videoUrl: buildMediaUrl(video.videoUrl),
      trailerUrl: buildMediaUrl(video.trailerUrl)
    }))

    return NextResponse.json({
      videos: processedVideos,
      pagination: {
        page,
        limit,
        total: totalVideos,
        totalPages: Math.ceil(totalVideos / limit)
      },
      creator: {
        name: creator.name
      }
    })
  } catch (error) {
    console.error('Erro ao buscar vídeos do criador:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 