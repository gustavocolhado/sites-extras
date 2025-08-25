import { NextRequest, NextResponse } from 'next/server'
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
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('🔍 Buscando vídeo com ID:', id)

    // Buscar vídeo no banco de dados (versão simplificada)
    const video = await prisma.video.findUnique({
      where: { id }
    })

    console.log('🔍 Resultado da busca:', video ? 'Vídeo encontrado' : 'Vídeo não encontrado')

    if (!video) {
      console.log('❌ Vídeo não encontrado para ID:', id)
      return NextResponse.json(
        { error: 'Vídeo não encontrado' },
        { status: 404 }
      )
    }

    console.log('✅ Vídeo encontrado:', video.title)

    // Formatar dados para a resposta (versão simplificada)
    const formattedVideo = {
      id: video.id,
      url: video.url,
      title: video.title,
      duration: video.duration ? `${Math.floor(video.duration / 60)}:${Math.floor(video.duration % 60).toString().padStart(2, '0')}` : '0:00',
      thumbnailUrl: buildMediaUrl(video.thumbnailUrl),
      videoUrl: buildMediaUrl(video.videoUrl),
      trailerUrl: buildMediaUrl(video.trailerUrl),
      isIframe: video.iframe,
      premium: video.premium,
      viewCount: video.viewCount,
      likesCount: video.likesCount,
      dislikesCount: 0,
      category: video.category || [],
      creator: video.creator || 'Desconhecido',
      uploader: null,
      uploadTime: video.created_at ? new Date(video.created_at).toLocaleDateString('pt-BR') : 'Data desconhecida',
      description: video.description || '',
      tags: []
    }

    return NextResponse.json(formattedVideo)
  } catch (error) {
    console.error('Erro ao buscar vídeo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 