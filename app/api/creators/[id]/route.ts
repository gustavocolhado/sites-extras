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

    // Contar vídeos em tempo real
    const actualVideoCount = await prisma.video.count({
      where: {
        creator: creator.name
      }
    })

    // Processar imagem do creator
    let creatorWithImage = creator
    
    if (creator.image) {
      // Se já tem imagem, processar a URL
      creatorWithImage = {
        ...creator,
        qtd: actualVideoCount, // Usar contagem em tempo real
        image: buildMediaUrl(creator.image)
      }
    } else {
      // Se não tiver imagem, buscar uma imagem aleatória de um vídeo do creator
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

      creatorWithImage = {
        ...creator,
        qtd: actualVideoCount, // Usar contagem em tempo real
        image: buildMediaUrl(randomVideo?.thumbnailUrl || null)
      }
    }

    return NextResponse.json(creatorWithImage)
  } catch (error) {
    console.error('Erro ao buscar criador:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 