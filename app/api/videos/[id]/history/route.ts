import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'

// Rota para registrar a visualização de um vídeo e adicionar ao histórico do usuário.
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const videoId = params.id;
  if (!videoId) {
    return NextResponse.json({ error: 'ID do vídeo não fornecido' }, { status: 400 });
  }

  try {
    // 1. Encontrar o vídeo pelo ID
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true },
    });

    if (!video) {
      return NextResponse.json({ error: `Vídeo com ID '${videoId}' não encontrado no banco de dados.` }, { status: 404 });
    }

    // 2. Incrementar o contador de visualizações usando o ID do vídeo
    const updatedVideo = await prisma.video.update({
      where: { id: video.id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });

    // 3. Se o usuário estiver logado, registrar a visualização no histórico dele
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (user) {
        const { watchDuration } = await request.json().catch(() => ({}));
        await prisma.userHistory.upsert({
          where: { userId_videoId: { userId: user.id, videoId: video.id } },
          update: { watchedAt: new Date(), watchDuration: watchDuration || null },
          create: { userId: user.id, videoId: video.id, watchDuration: watchDuration || null },
        });
      }
    }

    return NextResponse.json({ success: true, viewCount: updatedVideo.viewCount });

  } catch (error) {
    console.error(`[ERRO AO REGISTRAR VIEW] ID: ${videoId}`, error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';
    return NextResponse.json({ error: 'Erro interno do servidor ao tentar registrar a visualização.', details: errorMessage }, { status: 500 });
  }
}
