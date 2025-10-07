import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    // Iniciar uma transação para garantir a atomicidade da operação
    await prisma.$transaction(async (prisma: Prisma.TransactionClient) => {
      // Deletar todos os dados relacionados ao usuário
      await prisma.comment.deleteMany({ where: { userId: id } });
      await prisma.userLike.deleteMany({ where: { userId: id } });
      await prisma.userFavorite.deleteMany({ where: { userId: id } });
      await prisma.userHistory.deleteMany({ where: { userId: id } });
      await prisma.payment.deleteMany({ where: { userId: id } });
      await prisma.affiliate.deleteMany({
        where: { OR: [{ userId: id }, { affiliateId: id }] },
      });
      await prisma.withdrawalRequest.deleteMany({ where: { affiliateId: id } });
      await prisma.campaignConversion.deleteMany({ where: { userId: id } });
      await prisma.paymentSession.deleteMany({ where: { userId: id } });
      await prisma.emailCampaignLink.deleteMany({ where: { userId: id } });
      await prisma.emailCampaignClick.deleteMany({ where: { userId: id } });
      await prisma.emailCampaignConversion.deleteMany({ where: { userId: id } });

      // Desassociar o usuário de outros registros
      await prisma.video.updateMany({
        where: { userId: id },
        data: { userId: null },
      });
      await prisma.category.updateMany({
        where: { userId: id },
        data: { userId: null },
      });
      await prisma.creator.updateMany({
        where: { userId: id },
        data: { userId: null },
      });
      await prisma.promotion.updateMany({
        where: { userId: id },
        data: { userId: null },
      });

      // Finalmente, deletar o usuário
      await prisma.user.delete({ where: { id } });
    });

    return NextResponse.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar usuário' },
      { status: 500 }
    );
  }
}
