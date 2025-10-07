import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const commentsCount = await prisma.comment.count({ where: { userId: id } });
    const likesCount = await prisma.userLike.count({ where: { userId: id } });
    const favoritesCount = await prisma.userFavorite.count({ where: { userId: id } });
    const historyCount = await prisma.userHistory.count({ where: { userId: id } });
    const paymentsCount = await prisma.payment.count({ where: { userId: id } });
    const affiliateSalesCount = await prisma.affiliate.count({ where: { userId: id } });
    const affiliateReferredCount = await prisma.affiliate.count({ where: { affiliateId: id } });
    const withdrawalRequestsCount = await prisma.withdrawalRequest.count({ where: { affiliateId: id } });
    const campaignConversionsCount = await prisma.campaignConversion.count({ where: { userId: id } });
    const paymentSessionsCount = await prisma.paymentSession.count({ where: { userId: id } });
    const emailLinksCount = await prisma.emailCampaignLink.count({ where: { userId: id } });
    const emailClicksCount = await prisma.emailCampaignClick.count({ where: { userId: id } });
    const emailConversionsCount = await prisma.emailCampaignConversion.count({ where: { userId: id } });

    const summary = {
      comments: commentsCount,
      likes: likesCount,
      favorites: favoritesCount,
      history: historyCount,
      payments: paymentsCount,
      affiliateSales: affiliateSalesCount,
      affiliateReferred: affiliateReferredCount,
      withdrawalRequests: withdrawalRequestsCount,
      campaignConversions: campaignConversionsCount,
      paymentSessions: paymentSessionsCount,
      emailLinks: emailLinksCount,
      emailClicks: emailClicksCount,
      emailConversions: emailConversionsCount,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Erro ao buscar resumo de exclusão do usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar resumo de exclusão do usuário' },
      { status: 500 }
    );
  }
}
