import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Buscar vídeos favoritos do usuário
    const favoriteVideos = await prisma.userFavorite.findMany({
      where: { userId: user.id },
      include: {
        video: {
          select: {
            id: true,
            title: true,
            description: true,
            url: true,
            thumbnailUrl: true,
            viewCount: true,
            likesCount: true,
            duration: true,
            premium: true,
            creator: true,
            created_at: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Mais recentes primeiro
      }
    })

    // Extrair apenas os vídeos da resposta
    const videos = favoriteVideos.map(favorite => favorite.video)

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Erro ao buscar vídeos favoritos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 