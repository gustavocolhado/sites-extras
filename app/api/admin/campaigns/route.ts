import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user || session.user.access !== 1) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const source = searchParams.get('source');
    const campaign = searchParams.get('campaign');

    const skip = (page - 1) * limit;

    // --- Filtros para a Agregação ---
    const trackingMatch: any = {};
    if (source) trackingMatch.source = { $regex: source, $options: 'i' };
    if (campaign) trackingMatch.campaign = { $regex: campaign, $options: 'i' };
    if (startDate || endDate) {
      trackingMatch.createdAt = {};
      if (startDate) trackingMatch.createdAt.$gte = new Date(startDate);
      if (endDate) trackingMatch.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const conversionDateMatch: any = {};
    if (startDate || endDate) {
        conversionDateMatch.convertedAt = {};
        if (startDate) conversionDateMatch.convertedAt.$gte = new Date(startDate);
        if (endDate) conversionDateMatch.convertedAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    // --- Pipeline de Agregação Principal ---
    const aggregationPipeline: any[] = [
      { $match: trackingMatch },
      {
        $group: {
          _id: { source: '$source', campaign: '$campaign' },
          visits: { $sum: '$visitCount' }
        }
      },
      {
        $lookup: {
          from: 'campaign_conversions',
          let: { source: '$_id.source', campaign: '$_id.campaign' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$source', '$$source'] },
                    { $eq: ['$campaign', '$$campaign'] }
                  ]
                },
                ...conversionDateMatch
              }
            },
            {
              $group: {
                _id: null,
                conversions: { $sum: 1 },
                revenue: { $sum: '$amount' }
              }
            }
          ],
          as: 'conversionData'
        }
      },
      {
        $unwind: {
          path: '$conversionData',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          source: '$_id.source',
          campaign: '$_id.campaign',
          visits: '$visits',
          conversions: { $ifNull: ['$conversionData.conversions', 0] },
          revenue: { $ifNull: ['$conversionData.revenue', 0] }
        }
      }
    ];

    // --- Execução das Consultas ---
    const [campaignStatsResult, totalResult] = await Promise.all([
      prisma.campaignTracking.aggregateRaw({
        pipeline: [
          ...aggregationPipeline,
          { $sort: { source: 1, campaign: 1 } },
          { $skip: skip },
          { $limit: limit },
        ],
      }),
      prisma.campaignTracking.aggregateRaw({
        pipeline: [...aggregationPipeline, { $count: 'total' }],
      }),
    ]);

    const campaignStats = campaignStatsResult as unknown as any[];
    const total = (totalResult as unknown as any[])[0]?.total || 0;

    // --- Calcular Totais para os Cards ---
    const totalVisitsResult = await prisma.campaignTracking.aggregate({
      where: {
        ...(source ? { source: { contains: source, mode: 'insensitive' } } : {}),
        ...(campaign ? { campaign: { contains: campaign, mode: 'insensitive' } } : {}),
        ...((startDate || endDate) ? { 
            createdAt: {
                ...(startDate ? { gte: new Date(startDate) } : {}),
                ...(endDate ? { lte: new Date(endDate + 'T23:59:59.999Z') } : {})
            }
        } : {})
      },
      _sum: { visitCount: true }
    });

    const totalConversionsAndRevenue = await prisma.campaignConversion.aggregate({
      where: {
        ...(source ? { source: { contains: source, mode: 'insensitive' } } : {}),
        ...(campaign ? { campaign: { contains: campaign, mode: 'insensitive' } } : {}),
        ...((startDate || endDate) ? { 
            convertedAt: {
                ...(startDate ? { gte: new Date(startDate) } : {}),
                ...(endDate ? { lte: new Date(endDate + 'T23:59:59.999Z') } : {})
            }
        } : {})
      },
      _count: { id: true },
      _sum: { amount: true }
    });

    const totalVisitsCount = totalVisitsResult._sum.visitCount || 0;
    const totalConversionsCount = totalConversionsAndRevenue._count.id || 0;
    const conversionRate = totalVisitsCount > 0 ? (totalConversionsCount / totalVisitsCount) * 100 : 0;

    // Definir conversionWhere aqui para estar no escopo correto
    const conversionWhere: any = {};
    if (source) conversionWhere.source = { contains: source, mode: 'insensitive' };
    if (campaign) conversionWhere.campaign = { contains: campaign, mode: 'insensitive' };
    if (startDate || endDate) {
      conversionWhere.convertedAt = {};
      if (startDate) conversionWhere.convertedAt.gte = new Date(startDate);
      if (endDate) conversionWhere.convertedAt.lte = new Date(endDate + 'T23:59:59.999Z');
    }

    // Buscar a lista detalhada de conversões para a nova tabela
    const [detailedConversions, totalDetailedConversions] = await Promise.all([
      prisma.campaignConversion.findMany({
        where: conversionWhere,
        skip,
        take: limit,
        orderBy: { convertedAt: 'desc' },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.campaignConversion.count({ where: conversionWhere }),
    ]);

    return NextResponse.json({
      campaignStats,
      detailedConversions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      conversionsPagination: {
        page,
        limit,
        total: totalDetailedConversions,
        pages: Math.ceil(totalDetailedConversions / limit),
      },
      stats: {
        totalVisits: totalVisitsCount,
        totalConversions: totalConversionsCount,
        conversionRate: Math.round(conversionRate * 100) / 100,
        totalRevenue: totalConversionsAndRevenue._sum.amount || 0,
      },
    });

  } catch (error) {
    console.error('Erro ao buscar dados de campanhas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
