import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  console.log('🚨 Requisição POST para /api/campaigns/track recebida no servidor.');
  try {
    const { source, campaign } = await request.json();

    console.log('API /api/campaigns/track recebida:', { source, campaign });

    if (!source || !campaign) {
      console.error('Erro 400: Parâmetros "source" e "campaign" são obrigatórios.');
      return NextResponse.json(
        { error: 'Os parâmetros "source" e "campaign" são obrigatórios.' },
        { status: 400 }
      );
    }

    try {
      let trackingResult;
      const existingTracking = await prisma.campaignTracking.findUnique({
        where: {
          source_campaign: {
            source: source,
            campaign: campaign,
          },
        },
      });

      if (existingTracking) {
        trackingResult = await prisma.campaignTracking.update({
          where: {
            id: existingTracking.id,
          },
          data: {
            visitCount: existingTracking.visitCount + 1,
            updatedAt: new Date(),
          },
        });
      } else {
        trackingResult = await prisma.campaignTracking.create({
          data: {
            source: source,
            campaign: campaign,
            visitCount: 1,
          },
        });
      }

      console.log('✅ Tracking de campanha atualizado/criado com sucesso:', trackingResult);
      return NextResponse.json({ success: true, data: trackingResult });
    } catch (prismaError: any) {
      console.error('❌ Erro no Prisma ao rastrear visita de campanha:', prismaError);
      return NextResponse.json(
        { error: 'Erro no banco de dados ao rastrear visita de campanha', details: prismaError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('❌ Erro geral ao processar requisição de rastreamento de campanha:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao processar requisição de rastreamento de campanha', details: error.message },
      { status: 500 }
    );
  }
}
