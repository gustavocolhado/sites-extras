const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testRevenueSimple() {
  try {
    console.log('💰 Teste Simples de Receita...\n')

    // Obter data de hoje
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)

    console.log('📅 Período:', startOfDay.toISOString(), 'até', endOfDay.toISOString())

    // Testar receita de hoje
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

    console.log('📊 Receita de hoje:', todayRevenue._sum.amount || 0)

    // Verificar se há pagamentos
    const totalPayments = await prisma.payment.count()
    console.log('📊 Total de pagamentos no banco:', totalPayments)

    if (totalPayments === 0) {
      console.log('💡 Dica: Execute "npm run populate-test-revenue" para criar dados de teste')
    }

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRevenueSimple()
