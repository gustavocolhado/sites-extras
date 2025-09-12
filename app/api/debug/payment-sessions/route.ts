import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pixId = searchParams.get('pixId')

    if (pixId) {
      // Buscar PaymentSession específica
      const paymentSession = await prisma.paymentSession.findFirst({
        where: {
          OR: [
            { preferenceId: pixId },
            { preferenceId: pixId.toUpperCase() },
            { preferenceId: pixId.toLowerCase() }
          ]
        },
        include: { user: true }
      })

      if (paymentSession) {
        return NextResponse.json({
          found: true,
          paymentSession: {
            id: paymentSession.id,
            preferenceId: paymentSession.preferenceId,
            paymentId: paymentSession.paymentId,
            status: paymentSession.status,
            plan: paymentSession.plan,
            amount: paymentSession.amount,
            userId: paymentSession.userId,
            userEmail: paymentSession.userEmail,
            createdAt: paymentSession.createdAt,
            updatedAt: paymentSession.updatedAt,
            user: paymentSession.user ? {
              id: paymentSession.user.id,
              email: paymentSession.user.email,
              premium: paymentSession.user.premium,
              expireDate: paymentSession.user.expireDate
            } : null
          }
        })
      } else {
        return NextResponse.json({
          found: false,
          message: 'PaymentSession não encontrada',
          searchedPixId: pixId
        })
      }
    } else {
      // Listar todas as PaymentSessions recentes
      const paymentSessions = await prisma.paymentSession.findMany({
        take: 20,
        orderBy: { updatedAt: 'desc' },
        include: { user: true }
      })

      return NextResponse.json({
        total: paymentSessions.length,
        paymentSessions: paymentSessions.map(session => ({
          id: session.id,
          preferenceId: session.preferenceId,
          paymentId: session.paymentId,
          status: session.status,
          plan: session.plan,
          amount: session.amount,
          userId: session.userId,
          userEmail: session.userEmail,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          user: session.user ? {
            id: session.user.id,
            email: session.user.email,
            premium: session.user.premium,
            expireDate: session.user.expireDate
          } : null
        }))
      })
    }
  } catch (error) {
    console.error('Erro ao buscar PaymentSessions:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
