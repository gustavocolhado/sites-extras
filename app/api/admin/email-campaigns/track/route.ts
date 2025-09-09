import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session?.user || session.user.access !== 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { 
      campaignId, 
      userId, 
      linkType, 
      originalUrl 
    } = await request.json()

    // Validação
    if (!campaignId || !userId || !linkType || !originalUrl) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Gerar ID único para rastreamento
    const trackingId = crypto.randomBytes(16).toString('hex')

    // Criar link rastreável
    const trackingLink = await prisma.emailCampaignLink.create({
      data: {
        campaignId,
        userId,
        linkType,
        originalUrl,
        trackingId,
      }
    })

    // URL de rastreamento
    const trackingUrl = `${process.env.NEXTAUTH_URL}/track/${trackingId}`

    return NextResponse.json({
      success: true,
      trackingLink: {
        id: trackingLink.id,
        trackingId: trackingLink.trackingId,
        trackingUrl,
        originalUrl: trackingLink.originalUrl,
        linkType: trackingLink.linkType
      }
    })

  } catch (error) {
    console.error('Erro ao criar link rastreável:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET - Listar links rastreáveis de uma campanha
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session?.user || session.user.access !== 1) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json(
        { error: 'ID da campanha é obrigatório' },
        { status: 400 }
      )
    }

    const links = await prisma.emailCampaignLink.findMany({
      where: { campaignId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        clickEvents: {
          orderBy: { clickedAt: 'desc' },
          take: 10
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ links })

  } catch (error) {
    console.error('Erro ao buscar links rastreáveis:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
