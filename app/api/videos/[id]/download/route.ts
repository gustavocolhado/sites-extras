import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Faça login para baixar vídeos' },
        { status: 401 }
      )
    }

    // Verificar se o usuário é premium
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { premium: true }
    })

    if (!user?.premium) {
      return NextResponse.json(
        { error: 'Downloads estão disponíveis apenas para usuários Premium' },
        { status: 403 }
      )
    }

    // Buscar o vídeo
    const video = await prisma.video.findUnique({
      where: { url: params.id },
      select: { 
        id: true,
        title: true,
        videoUrl: true,
        premium: true
      }
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Vídeo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o vídeo é premium
    if (video.premium && !user.premium) {
      return NextResponse.json(
        { error: 'Este vídeo é exclusivo para usuários Premium' },
        { status: 403 }
      )
    }

    // Registrar o download
    await prisma.video.update({
      where: { id: video.id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })

    // Verificar se a URL é um arquivo direto
    const isDirectFile = video.videoUrl.match(/\.(mp4|avi|mov|mkv|webm)$/i)
    
    if (isDirectFile) {
      // É um arquivo direto, redirecionar para download
      const response = NextResponse.redirect(video.videoUrl)
      response.headers.set('Content-Disposition', `attachment; filename="${video.title || 'video'}.mp4"`)
      return response
    } else {
      // É uma URL externa (YouTube, Vimeo, etc.), retornar para visualização
      return NextResponse.json({
        success: true,
        downloadUrl: video.videoUrl,
        fileName: `${video.title || 'video'}.mp4`,
        isDirectFile: false,
        message: 'Este vídeo é de uma fonte externa. O download será iniciado em nova aba.'
      })
    }

  } catch (error) {
    console.error('Erro ao processar download:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
