import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      campaignId, 
      planType, 
      amount, 
      paymentId 
    } = await request.json()

    if (!userId || !campaignId || !planType || !amount) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Verificar se já existe uma conversão para este usuário nesta campanha
    const existingConversion = await prisma.emailCampaignConversion.findFirst({
      where: {
        userId,
        campaignId
      }
    })

    if (existingConversion) {
      return NextResponse.json({
        success: true,
        message: 'Conversão já registrada',
        conversion: existingConversion
      })
    }

    // Criar registro de conversão
    const conversion = await prisma.emailCampaignConversion.create({
      data: {
        campaignId,
        userId,
        planType,
        amount,
        paymentId: paymentId || null,
      },
      include: {
        campaign: {
          select: {
            name: true,
            subject: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Atualizar contador de conversões na campanha
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        conversions: {
          increment: 1
        }
      }
    })

    console.log(`🎉 CONVERSÃO REGISTRADA: ${conversion.user.email} assinou ${planType} por R$ ${amount} via campanha "${conversion.campaign.name}"`)

    return NextResponse.json({
      success: true,
      message: 'Conversão registrada com sucesso',
      conversion: {
        id: conversion.id,
        planType: conversion.planType,
        amount: conversion.amount,
        convertedAt: conversion.convertedAt,
        campaignName: conversion.campaign.name,
        userName: conversion.user.name,
        userEmail: conversion.user.email
      }
    })

  } catch (error) {
    console.error('Erro ao registrar conversão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET - Listar conversões de uma campanha
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json(
        { error: 'ID da campanha é obrigatório' },
        { status: 400 }
      )
    }

    const conversions = await prisma.emailCampaignConversion.findMany({
      where: { campaignId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        campaign: {
          select: {
            name: true,
            subject: true
          }
        }
      },
      orderBy: { convertedAt: 'desc' }
    })

    return NextResponse.json({ conversions })

  } catch (error) {
    console.error('Erro ao buscar conversões:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
