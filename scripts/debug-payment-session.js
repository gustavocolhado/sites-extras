const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugPaymentSession() {
  try {
    console.log('🔍 Debugando PaymentSession específica...')
    
    // ID do PaymentSession dos logs mais recentes
    const paymentSessionId = '68afc16e52de58fce2aeb6c2'
    const pixId = '9FBD2E88-6692-4CCC-9204-E74D751C1017'
    
    console.log('\n📋 Buscando PaymentSession por ID:', paymentSessionId)
    const sessionById = await prisma.paymentSession.findUnique({
      where: { id: paymentSessionId },
      include: { user: true }
    })
    
    if (sessionById) {
      console.log('✅ PaymentSession encontrada por ID:')
      console.log(`- ID: ${sessionById.id}`)
      console.log(`- PaymentID: ${sessionById.paymentId}`)
      console.log(`- PreferenceID: ${sessionById.preferenceId}`)
      console.log(`- Status: ${sessionById.status}`)
      console.log(`- Plano: ${sessionById.plan}`)
      console.log(`- Valor: R$ ${sessionById.amount}`)
      console.log(`- Usuário: ${sessionById.user?.email || 'N/A'}`)
      console.log(`- Criado: ${sessionById.createdAt}`)
      console.log(`- Atualizado: ${sessionById.updatedAt}`)
    } else {
      console.log('❌ PaymentSession não encontrada por ID')
    }
    
    console.log('\n🔍 Buscando PaymentSession por PIX ID:', pixId)
    const sessionByPixId = await prisma.paymentSession.findFirst({
      where: {
        OR: [
          { paymentId: parseInt(pixId) },
          { preferenceId: pixId },
          { preferenceId: { contains: pixId } }
        ]
      },
      include: { user: true }
    })
    
    if (sessionByPixId) {
      console.log('✅ PaymentSession encontrada por PIX ID:')
      console.log(`- ID: ${sessionByPixId.id}`)
      console.log(`- PaymentID: ${sessionByPixId.paymentId}`)
      console.log(`- PreferenceID: ${sessionByPixId.preferenceId}`)
      console.log(`- Status: ${sessionByPixId.status}`)
      console.log(`- Plano: ${sessionByPixId.plan}`)
      console.log(`- Valor: R$ ${sessionByPixId.amount}`)
      console.log(`- Usuário: ${sessionByPixId.user?.email || 'N/A'}`)
      console.log(`- Criado: ${sessionByPixId.createdAt}`)
      console.log(`- Atualizado: ${sessionByPixId.updatedAt}`)
    } else {
      console.log('❌ PaymentSession não encontrada por PIX ID')
    }
    
    console.log('\n🔍 Buscando todas as PaymentSessions recentes:')
    const recentSessions = await prisma.paymentSession.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: { user: true }
    })
    
    recentSessions.forEach(session => {
      console.log(`- ID: ${session.id}`)
      console.log(`  PaymentID: ${session.paymentId}`)
      console.log(`  PreferenceID: ${session.preferenceId}`)
      console.log(`  Status: ${session.status}`)
      console.log(`  Plano: ${session.plan}`)
      console.log(`  Valor: R$ ${session.amount}`)
      console.log(`  Usuário: ${session.user?.email || 'N/A'}`)
      console.log(`  Atualizado: ${session.updatedAt}`)
      console.log('')
    })
    
    console.log('\n🔍 Verificando pagamentos recentes:')
    const recentPayments = await prisma.payment.findMany({
      take: 5,
      orderBy: { transactionDate: 'desc' }
    })
    
    recentPayments.forEach(payment => {
      console.log(`- ID: ${payment.id}`)
      console.log(`  PaymentID: ${payment.paymentId}`)
      console.log(`  Status: ${payment.status}`)
      console.log(`  Plano: ${payment.plan}`)
      console.log(`  Valor: R$ ${payment.amount}`)
      console.log(`  Usuário: ${payment.userEmail}`)
      console.log(`  Data: ${payment.transactionDate}`)
      console.log('')
    })
    
    console.log('✅ Debug concluído!')
    
  } catch (error) {
    console.error('❌ Erro no debug:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugPaymentSession()
