import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      userId, // Este pode ser email ou ObjectId
      source,
      campaign,
      planId,
      amount
    } = body

    // Validar dados obrigatórios
    if (!userId || !source || !campaign) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Se userId for um email, buscar o usuário pelo email
    let actualUserId = userId
    if (userId.includes('@')) {
      const user = await prisma.user.findUnique({
        where: { email: userId },
        select: { id: true }
      })
      
      if (!user) {
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        )
      }
      
      actualUserId = user.id
    }

    // Buscar o tracking da campanha mais recente para este usuário
    const campaignTracking = await prisma.campaignTracking.findFirst({
      where: {
        source,
        campaign,
        converted: false
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    if (campaignTracking) {
      // Marcar como convertido
      await prisma.campaignTracking.update({
        where: {
          id: campaignTracking.id
        },
        data: {
          converted: true,
          convertedAt: new Date(),
          userId: actualUserId
        }
      })

      console.log('🎯 Conversão registrada:', {
        campaignId: campaignTracking.id,
        userId: actualUserId,
        email: userId,
        source,
        campaign,
        planId,
        amount
      })
    }

    // Salvar dados da conversão em uma tabela separada se necessário
    const conversion = await prisma.campaignConversion.create({
      data: {
        userId: actualUserId,
        source,
        campaign,
        planId: planId || null,
        amount: amount || 0,
        convertedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Conversão registrada com sucesso',
      conversionId: conversion.id
    })

  } catch (error) {
    console.error('❌ Erro ao registrar conversão:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 