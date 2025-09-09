import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetAudience = searchParams.get('audience') || 'non-premium'

    // Calcular data limite (15 dias atrás)
    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)

    // Buscar usuários baseado no público-alvo
    // No MongoDB, campos que não existem são tratados como undefined
    let whereClause: any = {
      acceptPromotionalEmails: true, // Apenas usuários que aceitam emails promocionais
      lastEmailSent: undefined // Usuários que nunca receberam email (campo não existe)
    }

    if (targetAudience === 'non-premium') {
      whereClause.premium = false
    } else if (targetAudience === 'premium') {
      whereClause.premium = true
    }
    // Se 'all', não adiciona filtro de premium

    // Contar usuários
    const userCount = await prisma.user.count({
      where: whereClause,
    })

    // Buscar estatísticas adicionais
    const totalUsers = await prisma.user.count()
    const premiumUsers = await prisma.user.count({
      where: { premium: true }
    })
    const nonPremiumUsers = await prisma.user.count({
      where: { premium: false }
    })
    const usersAcceptingEmails = await prisma.user.count({
      where: { acceptPromotionalEmails: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        targetAudience,
        userCount,
        totalUsers,
        premiumUsers,
        nonPremiumUsers,
        usersAcceptingEmails,
        breakdown: {
          'non-premium': await prisma.user.count({
            where: { 
              premium: false,
              acceptPromotionalEmails: true,
              lastEmailSent: undefined
            }
          }),
          'premium': await prisma.user.count({
            where: { 
              premium: true,
              acceptPromotionalEmails: true,
              lastEmailSent: undefined
            }
          }),
          'all': await prisma.user.count({
            where: { 
              acceptPromotionalEmails: true,
              lastEmailSent: undefined
            }
          })
        }
      }
    })

  } catch (error) {
    console.error('Erro ao buscar contagem de usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
