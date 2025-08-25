const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function populateTestRevenue() {
  try {
    console.log('💰 Populando dados de teste de receita...\n')

    // Verificar se existem usuários
    const users = await prisma.user.findMany({
      take: 5
    })

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado. Crie usuários primeiro.')
      return
    }

    console.log(`📊 Encontrados ${users.length} usuários para usar nos testes`)

    // Criar pagamentos de teste para hoje
    const today = new Date()
    const testPayments = [
      {
        userId: users[0].id,
        plan: 'monthly',
        amount: 29.90,
        transactionDate: today,
        userEmail: users[0].email || 'teste1@example.com',
        status: 'completed'
      },
      {
        userId: users[1]?.id || users[0].id,
        plan: 'annual',
        amount: 199.90,
        transactionDate: today,
        userEmail: users[1]?.email || 'teste2@example.com',
        status: 'completed'
      },
      {
        userId: users[2]?.id || users[0].id,
        plan: 'monthly',
        amount: 29.90,
        transactionDate: today,
        userEmail: users[2]?.email || 'teste3@example.com',
        status: 'completed'
      }
    ]

    console.log('📝 Criando pagamentos de teste...')

    for (const payment of testPayments) {
      try {
        const createdPayment = await prisma.payment.create({
          data: payment
        })
        console.log(`✅ Pagamento criado: R$ ${payment.amount} - ${payment.plan} - ${payment.status}`)
      } catch (error) {
        console.log(`❌ Erro ao criar pagamento: ${error.message}`)
      }
    }

    // Criar um pagamento pendente para teste
    try {
      await prisma.payment.create({
        data: {
          userId: users[0].id,
          plan: 'monthly',
          amount: 29.90,
          transactionDate: today,
          userEmail: users[0].email || 'teste4@example.com',
          status: 'pending'
        }
      })
      console.log('✅ Pagamento pendente criado para teste')
    } catch (error) {
      console.log(`❌ Erro ao criar pagamento pendente: ${error.message}`)
    }

    // Verificar total de pagamentos
    const totalPayments = await prisma.payment.count()
    const completedPayments = await prisma.payment.count({
      where: {
        status: 'completed'
      }
    })

    console.log(`\n📊 Resumo:`)
    console.log(`   Total de pagamentos: ${totalPayments}`)
    console.log(`   Pagamentos completados: ${completedPayments}`)

    // Calcular receita total
    const totalRevenue = await prisma.payment.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: 'completed'
      }
    })

    console.log(`   Receita total: R$ ${totalRevenue._sum.amount || 0}`)

    // Calcular receita de hoje
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)

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

    console.log(`   Receita de hoje: R$ ${todayRevenue._sum.amount || 0}`)

    console.log('\n🎉 Dados de teste populados com sucesso!')
    console.log('💡 Agora você pode testar o dashboard em /admin')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

populateTestRevenue()
