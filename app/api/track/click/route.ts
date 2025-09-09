import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { trackingId, userAgent, referrer } = await request.json()

    if (!trackingId) {
      return NextResponse.json(
        { error: 'ID de rastreamento é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar o link rastreável
    const trackingLink = await prisma.emailCampaignLink.findUnique({
      where: { trackingId },
      include: {
        campaign: true,
        user: true
      }
    })

    if (!trackingLink) {
      return NextResponse.json(
        { error: 'Link não encontrado' },
        { status: 404 }
      )
    }

    // Obter IP do usuário
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Registrar o clique
    await prisma.emailCampaignClick.create({
      data: {
        linkId: trackingLink.id,
        campaignId: trackingLink.campaignId,
        userId: trackingLink.userId,
        ipAddress,
        userAgent: userAgent || 'unknown',
        referrer: referrer || null,
      }
    })

    // Atualizar contador de cliques no link
    await prisma.emailCampaignLink.update({
      where: { id: trackingLink.id },
      data: {
        clicks: {
          increment: 1
        }
      }
    })

    // Atualizar contador de cliques na campanha
    await prisma.emailCampaign.update({
      where: { id: trackingLink.campaignId },
      data: {
        emailsClicked: {
          increment: 1
        }
      }
    })

    console.log(`✅ Clique rastreado: ${trackingLink.user.email} clicou em ${trackingLink.linkType} da campanha ${trackingLink.campaign.name}`)

    return NextResponse.json({
      success: true,
      redirectUrl: trackingLink.originalUrl,
      linkType: trackingLink.linkType,
      campaignName: trackingLink.campaign.name
    })

  } catch (error) {
    console.error('Erro ao rastrear clique:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
