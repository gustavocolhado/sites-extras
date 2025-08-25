const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testRevenue() {
  try {
    console.log('💰 Testando Receita do Dia...\n')

    // Obter data de hoje (início e fim do dia)
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)

    console.log('📅 Período de teste:')
    console.log(`   Início: ${startOfDay.toISOString()}`)
    console.log(`   Fim: ${endOfDay.toISOString()}\n`)

    // 1. Verificar todos os pagamentos
    console.log('🔍 Verificando todos os pagamentos...')
    const allPayments = await prisma.payment.findMany({
      select: {
        id: true,
        amount: true,
        status: true,
        transactionDate: true,
        plan: true,
        userEmail: true
      },
      orderBy: {
        transactionDate: 'desc'
      },
      take: 10
    })

    console.log(`📊 Total de pagamentos no banco: ${allPayments.length}`)
    console.log('📋 Últimos 10 pagamentos:')
    allPayments.forEach((payment, index) => {
      console.log(`   ${index + 1}. R$ ${payment.amount} - ${payment.status} - ${payment.transactionDate.toISOString()} - ${payment.plan}`)
    })

    // 2. Verificar pagamentos completados
    console.log('\n✅ Verificando pagamentos completados...')
    const completedPayments = await prisma.payment.findMany({
      where: {
        status: 'completed'
      },
      select: {
        id: true,
        amount: true,
        transactionDate: true,
        plan: true
      },
      orderBy: {
        transactionDate: 'desc'
      }
    })

    console.log(`📊 Total de pagamentos completados: ${completedPayments.length}`)
    
    // 3. Verificar pagamentos de hoje
    console.log('\n📅 Verificando pagamentos de hoje...')
    const todayPayments = await prisma.payment.findMany({
      where: {
        status: 'completed',
        transactionDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      select: {
        id: true,
        amount: true,
        transactionDate: true,
        plan: true,
        userEmail: true
      },
      orderBy: {
        transactionDate: 'desc'
      }
    })

    console.log(`📊 Pagamentos completados hoje: ${todayPayments.length}`)
    if (todayPayments.length > 0) {
      console.log('📋 Pagamentos de hoje:')
      todayPayments.forEach((payment, index) => {
        console.log(`   ${index + 1}. R$ ${payment.amount} - ${payment.transactionDate.toISOString()} - ${payment.plan} - ${payment.userEmail}`)
      })
    } else {
      console.log('   ❌ Nenhum pagamento encontrado para hoje')
    }

    // 4. Calcular receita total
    console.log('\n💰 Calculando receita total...')
    const totalRevenue = await prisma.payment.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: 'completed'
      }
    })

    console.log(`📊 Receita total: R$ ${totalRevenue._sum.amount || 0}`)

    // 5. Calcular receita de hoje
    console.log('\n💰 Calculando receita de hoje...')
    const todayRevenue = await prisma.payment.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: 'completed',
        transactionDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    console.log(`📊 Receita de hoje: R$ ${todayRevenue._sum.amount || 0}`)

    // 6. Verificar diferentes status
    console.log('\n📊 Verificando diferentes status de pagamento...')
    const statusCounts = await prisma.payment.groupBy({
      by: ['status'],
      _count: {
        status: true
      },
      _sum: {
        amount: true
      }
    })

    statusCounts.forEach(status => {
      console.log(`   ${status.status}: ${status._count.status} pagamentos - R$ ${status._sum.amount || 0}`)
    })

    // 7. Verificar se há pagamentos com status diferentes de 'completed'
    console.log('\n🔍 Verificando pagamentos não completados...')
    const nonCompletedPayments = await prisma.payment.findMany({
      where: {
        status: {
          not: 'completed'
        }
      },
      select: {
        id: true,
        amount: true,
        status: true,
        transactionDate: true,
        plan: true
      },
      orderBy: {
        transactionDate: 'desc'
      },
      take: 5
    })

    console.log(`📊 Pagamentos não completados: ${nonCompletedPayments.length}`)
    if (nonCompletedPayments.length > 0) {
      console.log('📋 Exemplos de pagamentos não completados:')
      nonCompletedPayments.forEach((payment, index) => {
        console.log(`   ${index + 1}. R$ ${payment.amount} - ${payment.status} - ${payment.transactionDate.toISOString()} - ${payment.plan}`)
      })
    }

    console.log('\n🎉 Teste de receita concluído!')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRevenue()
