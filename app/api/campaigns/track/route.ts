import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      source,
      campaign,
      timestamp,
      userAgent,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      clickId,
      goalId,
      value,
      price,
      leadCode,
      trackingId,
      pageUrl,
      ipAddress
    } = body

    // Validar dados obrigatórios
    if (!source || !campaign) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Salvar dados da campanha no banco
    const campaignData = await prisma.campaignTracking.create({
      data: {
        source,
        campaign,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        userAgent: userAgent || '',
        referrer: referrer || '',
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_term: utm_term || null,
        utm_content: utm_content || null,
        ipAddress: ipAddress || request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        pageUrl: pageUrl || request.headers.get('referer') || 'unknown',
        clickId: clickId || null,
        goalId: goalId || null,
        value: value || null,
        price: price || null,
        leadCode: leadCode || null
      }
    })

    console.log('📊 Campanha registrada:', {
      id: campaignData.id,
      source,
      campaign,
      timestamp: campaignData.timestamp
    })

    return NextResponse.json({
      success: true,
      message: 'Dados da campanha salvos com sucesso',
      campaignId: campaignData.id
    })

  } catch (error) {
    console.error('❌ Erro ao salvar dados da campanha:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Buscar estatísticas das campanhas
    const stats = await prisma.campaignTracking.groupBy({
      by: ['source', 'campaign'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 