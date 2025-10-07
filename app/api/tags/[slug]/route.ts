import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;

  try {
    const tag = await prisma.tag.findUnique({
      where: { slug },
      include: {
        videoTags: {
          include: {
            video: true,
          },
        },
      },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag não encontrada' }, { status: 404 });
    }

    const videos = tag.videoTags.map((vt) => vt.video);

    return NextResponse.json({ tag, videos });
  } catch (error) {
    console.error('Erro ao buscar vídeos da tag:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar vídeos da tag' },
      { status: 500 }
    );
  }
}
