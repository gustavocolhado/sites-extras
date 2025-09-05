import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    // Preparar lista de duplicados que serão removidos
    const duplicatesToRemove: any[] = []
    const originalsToKeep: any[] = []

    duplicatesMap.forEach((duplicates) => {
      // Ordenar por data de transação (mais antigo primeiro)
      const sortedDuplicates = duplicates.sort((a: any, b: any) => 
        new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
      )
      
      // O primeiro é o original (será mantido)
      const original = sortedDuplicates[0]
      originalsToKeep.push(original)
      
      // Os demais são duplicados (serão removidos)
      for (let i = 1; i < sortedDuplicates.length; i++) {
        duplicatesToRemove.push({
          ...sortedDuplicates[i],
          originalId: original.id,
          originalDate: original.transactionDate,
          groupKey: `${original.paymentId}_${original.userId}_${original.amount}_${original.plan}`
        })
      }
    })

    return NextResponse.json({
      duplicatesToRemove,
      originalsToKeep,
      totalDuplicates: duplicatesToRemove.length,
      totalGroups: duplicatesMap.size
    })
  } catch (error) {
    console.error('Erro ao listar duplicados:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
