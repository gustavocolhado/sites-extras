import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Erro ao buscar tags:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tags' },
      { status: 500 }
    );
  }
}
