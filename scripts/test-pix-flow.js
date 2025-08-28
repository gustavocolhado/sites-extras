const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPixFlow() {
  try {
    console.log('🧪 Testando fluxo completo do PIX...')
    
    // 1. Verificar PaymentSessions pendentes
    console.log('\n📋 PaymentSessions pendentes:')
    const pendingSessions = await prisma.paymentSession.findMany({
      where: { status: 'pending' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    })
    
    pendingSessions.forEach(session => {
      console.log(`- ID: ${session.id}`)
      console.log(`  PaymentID: ${session.paymentId}`)
      console.log(`  Status: ${session.status}`)
      console.log(`  Plano: ${session.plan}`)
      console.log(`  Valor: R$ ${session.amount}`)
      console.log(`  Usuário: ${session.user?.email || 'N/A'}`)
      console.log(`  Criado: ${session.createdAt}`)
      console.log('')
    })
    
    // 2. Verificar PaymentSessions pagas
    console.log('✅ PaymentSessions pagas:')
    const paidSessions = await prisma.paymentSession.findMany({
      where: { status: 'paid' },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: { user: true }
    })
    
    paidSessions.forEach(session => {
      console.log(`- ID: ${session.id}`)
      console.log(`  PaymentID: ${session.paymentId}`)
      console.log(`  Status: ${session.status}`)
      console.log(`  Plano: ${session.plan}`)
      console.log(`  Valor: R$ ${session.amount}`)
      console.log(`  Usuário: ${session.user?.email || 'N/A'}`)
      console.log(`  Pago em: ${session.updatedAt}`)
      console.log('')
    })
    
    // 3. Verificar usuários com pagamentos recentes
    console.log('👤 Usuários com pagamentos recentes:')
    const recentPayments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
        }
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    })
    
    recentPayments.forEach(payment => {
      console.log(`- ID: ${payment.id}`)
      console.log(`  PaymentID: ${payment.paymentId}`)
      console.log(`  Status: ${payment.status}`)
      console.log(`  Plano: ${payment.plan}`)
      console.log(`  Valor: R$ ${payment.amount}`)
      console.log(`  Usuário: ${payment.userEmail}`)
      console.log(`  Criado: ${payment.createdAt}`)
      console.log('')
    })
    
    // 4. Verificar configurações de pagamento
    console.log('⚙️ Configurações de pagamento:')
    const paymentSettings = await prisma.paymentSettings.findFirst()
    if (paymentSettings) {
      console.log(`- Provedor ativo: ${paymentSettings.activeProvider}`)
      console.log(`- Mercado Pago habilitado: ${paymentSettings.mercadopagoEnabled}`)
      console.log(`- Pushin Pay habilitado: ${paymentSettings.pushinpayEnabled}`)
      console.log(`- Token Mercado Pago: ${paymentSettings.mercadopagoAccessToken ? 'Configurado' : 'Não configurado'}`)
      console.log(`- Token Pushin Pay: ${paymentSettings.pushinpayAccessToken ? 'Configurado' : 'Não configurado'}`)
    } else {
      console.log('- Nenhuma configuração encontrada')
    }
    
    console.log('\n✅ Teste do fluxo PIX concluído!')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPixFlow()
