import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { url: string } }
) {
  try {
    const { url } = params
    console.log('🔍 Buscando vídeo com URL:', url)

    // Buscar vídeo no banco de dados por URL
    const video = await prisma.video.findUnique({
      where: { url },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        videoTags: {
          include: {
            tag: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!video) {
      console.log('❌ Vídeo não encontrado para URL:', url)
      return NextResponse.json(
        { error: 'Vídeo não encontrado' },
        { status: 404 }
      )
    }

    console.log('✅ Vídeo encontrado:', video.title)

    // Formatar dados para a resposta
    const formattedVideo = {
      id: video.id,
      url: video.url,
      title: video.title,
      duration: video.duration ? `${Math.floor(video.duration / 60)}:${Math.floor(video.duration % 60).toString().padStart(2, '0')}` : '0:00',
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.videoUrl,
      trailerUrl: video.trailerUrl,
      isIframe: video.iframe,
      premium: video.premium,
      viewCount: video.viewCount,
      likesCount: video.likesCount,
      dislikesCount: 0, // Campo não existe no schema
      category: video.category, // Já é um array de strings
      creator: video.creator,
      uploader: video.User,
      uploadTime: video.created_at ? new Date(video.created_at).toLocaleDateString('pt-BR') : 'Data desconhecida',
      description: video.description,
      tags: video.videoTags.map(vt => vt.tag.name)
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