const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPaymentStatus() {
  try {
    console.log('🧪 Testando sistema de verificação de status de pagamento...')
    
    // 1. Verificar PaymentSessions recentes
    console.log('\n📋 PaymentSessions recentes:')
    const recentSessions = await prisma.paymentSession.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    })
    
    recentSessions.forEach(session => {
      console.log(`- ID: ${session.id}`)
      console.log(`  PaymentID: ${session.paymentId}`)
      console.log(`  Status: ${session.status}`)
      console.log(`  Plano: ${session.plan}`)
      console.log(`  Valor: R$ ${session.amount / 100}`)
      console.log(`  Usuário: ${session.user?.email || 'N/A'}`)
      console.log(`  Premium: ${session.user?.premium}`)
      console.log(`  Expira: ${session.user?.expireDate}`)
      console.log('')
    })
    
    // 2. Verificar usuários premium
    console.log('👑 Usuários Premium:')
    const premiumUsers = await prisma.user.findMany({
      where: { premium: true },
      take: 5,
      orderBy: { updatedAt: 'desc' }
    })
    
    premiumUsers.forEach(user => {
      const isActive = user.expireDate && new Date(user.expireDate) > new Date()
      console.log(`- Email: ${user.email}`)
      console.log(`  Premium: ${user.premium}`)
      console.log(`  Expira: ${user.expireDate}`)
      console.log(`  Ativo: ${isActive}`)
      console.log('')
    })
    
    // 3. Verificar pagamentos
    console.log('💳 Pagamentos recentes:')
    const recentPayments = await prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
    
    recentPayments.forEach(payment => {
      console.log(`- ID: ${payment.id}`)
      console.log(`  PaymentID: ${payment.paymentId}`)
      console.log(`  Status: ${payment.status}`)
      console.log(`  Plano: ${payment.plan}`)
      console.log(`  Valor: R$ ${payment.amount / 100}`)
      console.log(`  Usuário: ${payment.userEmail}`)
      console.log('')
    })
    
    console.log('✅ Teste concluído!')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPaymentStatus()
