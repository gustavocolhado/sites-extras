import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário tem access: 1
    if (session.user.access !== 1) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar todos os pagamentos
    const allPayments = await prisma.payment.findMany({
      orderBy: { transactionDate: 'desc' }
    }).catch(async () => {
      // Fallback se houver problema com relacionamento
      return await prisma.payment.findMany({
        orderBy: { transactionDate: 'desc' }
      })
    })

    // Identificar duplicados
    const duplicatesMap = new Map()
    const uniqueMap = new Map()
    
    allPayments.forEach(payment => {
      const key = `${payment.paymentId}_${payment.userId}_${payment.amount}_${payment.plan}`
      if (uniqueMap.has(key)) {
        // É um duplicado
        if (!duplicatesMap.has(key)) {
          duplicatesMap.set(key, [uniqueMap.get(key)])
        }
        duplicatesMap.get(key).push(payment)
      } else {
        uniqueMap.set(key, payment)
      }
    })

    // Preparar lista de IDs para exclusão (manter apenas o original de cada grupo)
    const idsToDelete: string[] = []
    let duplicatesCount = 0
    const duplicatesToShow: any[] = []

    duplicatesMap.forEach((duplicates) => {
      // Ordenar por data de transação (mais antigo primeiro)
      const sortedDuplicates = duplicates.sort((a: any, b: any) => 
        new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
      )
      
      // Manter o primeiro (mais antigo - original) e excluir os demais (duplicados)
      for (let i = 1; i < sortedDuplicates.length; i++) {
        idsToDelete.push(sortedDuplicates[i].id)
        duplicatesCount++
        duplicatesToShow.push({
          ...sortedDuplicates[i],
          originalId: sortedDuplicates[0].id,
          originalDate: sortedDuplicates[0].transactionDate
        })
      }
    })

    // Excluir duplicados
    if (idsToDelete.length > 0) {
      await prisma.payment.deleteMany({
        where: {
          id: {
            in: idsToDelete
          }
        }
      })
    }

    return NextResponse.json({
      message: `${duplicatesCount} pagamentos duplicados foram removidos`,
      removedCount: duplicatesCount,
      removedIds: idsToDelete,
      duplicatesRemoved: duplicatesToShow
    })
  } catch (error) {
    console.error('Erro ao remover duplicados:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
