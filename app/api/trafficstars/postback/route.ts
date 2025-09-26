import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parâmetros do TrafficStars
    const value = searchParams.get('value')
    const clickid = searchParams.get('clickid')
    const key = searchParams.get('key')
    const goalid = searchParams.get('goalid')
    const leadCode = searchParams.get('lead_code')
    const allowDuplicates = searchParams.get('allow_duplicates')
    const price = searchParams.get('price')

    // Validar parâmetros obrigatórios
    if (!clickid || !key) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Validar chave de segurança (substitua pela sua chave real)
    const VALID_KEY = 'GODOiGyqwq6r1PxUDZTPjkyoyTeocItpUE7K'
    if (key !== VALID_KEY) {
      console.log('❌ Chave inválida recebida:', key)
      return NextResponse.json(
        { error: 'Chave inválida' },
        { status: 401 }
      )
    }

    // Verificar se já existe uma conversão para este clickid
    const existingConversion = await prisma.trafficStarsConversion.findFirst({
      where: {
        clickId: clickid,
        leadCode: leadCode || null
      }
    })

    if (existingConversion && allowDuplicates !== '1') {
      console.log('⚠️ Conversão duplicada ignorada:', { clickid, leadCode })
      return NextResponse.json({
        success: true,
        message: 'Conversão duplicada ignorada',
        conversionId: existingConversion.id
      })
    }

    // Criar registro de conversão
    const conversion = await prisma.trafficStarsConversion.create({
      data: {
        clickId: clickid,
        value: value ? parseFloat(value) : null,
        price: price ? parseFloat(price) : null,
        goalId: goalid ? parseInt(goalid) : 0,
        leadCode: leadCode || null,
        allowDuplicates: allowDuplicates === '1',
        convertedAt: new Date()
      }
    })

    console.log('🎯 POSTBACK TRAFFICSTARS RECEBIDO:', {
      conversionId: conversion.id,
      clickId: clickid,
      value,
      price,
      goalId: goalid,
      leadCode,
      allowDuplicates
    })

    return NextResponse.json({
      success: true,
      message: 'Postback processado com sucesso',
      conversionId: conversion.id,
      clickId: clickid,
      value,
      price
    })

  } catch (error) {
    console.error('❌ Erro ao processar postback TrafficStars:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Também aceitar POST requests para compatibilidade
  return GET(request)
}
