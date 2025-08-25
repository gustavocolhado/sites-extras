import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const videoId = params.id
    const body = await request.json()
    const { watchDuration } = body

    // Verificar se o vídeo existe
    const video = await prisma.video.findUnique({
      where: { id: videoId }
    })

    if (!video) {
      return NextResponse.json({ error: 'Vídeo não encontrado' }, { status: 404 })
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Incrementar contador de visualizações
    await prisma.video.update({
      where: { id: videoId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })

    // Registrar no histórico (upsert - atualiza se existir, cria se não existir)
    await prisma.userHistory.upsert({
      where: {
        userId_videoId: {
          userId: user.id,
          videoId: videoId
        }
      },
      update: {
        watchedAt: new Date(),
        watchDuration: watchDuration || null
      },
      create: {
        userId: user.id,
        videoId: videoId,
        watchDuration: watchDuration || null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao registrar visualização:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 