const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAdminStats() {
  try {
    console.log('🧪 Testando API de Estatísticas Administrativas...\n')

    // Obter data de hoje (início e fim do dia)
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)

    console.log('📅 Período de teste:')
    console.log(`   Início: ${startOfDay.toISOString()}`)
    console.log(`   Fim: ${endOfDay.toISOString()}\n`)

    // Testar cada consulta individualmente
    console.log('🔍 Testando consultas individuais...\n')

    // 1. Usuários cadastrados hoje
    try {
      const usersRegisteredToday = await prisma.user.count({
        where: {
          created_at: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      })
      console.log(`✅ Usuários cadastrados hoje: ${usersRegisteredToday}`)
    } catch (error) {
      console.log(`❌ Erro ao buscar usuários cadastrados hoje: ${error.message}`)
    }

    // 2. Receita de assinaturas hoje
    try {
      const revenueToday = await prisma.payment.aggregate({
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
      console.log(`✅ Receita de assinaturas hoje: R$ ${revenueToday._sum.amount || 0}`)
    } catch (error) {
      console.log(`❌ Erro ao buscar receita hoje: ${error.message}`)
    }

    // 3. Usuários ativos que acessaram o site hoje
    try {
      const activeUsersToday = await prisma.user.count({
        where: {
          update_at: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      })
      console.log(`✅ Usuários ativos hoje: ${activeUsersToday}`)
    } catch (error) {
      console.log(`❌ Erro ao buscar usuários ativos hoje: ${error.message}`)
    }

    // 4. Visualizações de vídeos hoje
    try {
      const viewsToday = await prisma.video.aggregate({
        _sum: {
          viewCount: true
        },
        where: {
          updated_at: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      })
      console.log(`✅ Visualizações de vídeos hoje: ${viewsToday._sum.viewCount || 0}`)
    } catch (error) {
      console.log(`❌ Erro ao buscar visualizações hoje: ${error.message}`)
    }

    // Testar consultas gerais
    console.log('\n📊 Testando estatísticas gerais...\n')

    try {
      const totalUsers = await prisma.user.count()
      console.log(`✅ Total de usuários: ${totalUsers}`)
    } catch (error) {
      console.log(`❌ Erro ao buscar total de usuários: ${error.message}`)
    }

    try {
      const totalVideos = await prisma.video.count()
      console.log(`✅ Total de vídeos: ${totalVideos}`)
    } catch (error) {
      console.log(`❌ Erro ao buscar total de vídeos: ${error.message}`)
    }

    try {
      const totalViews = await prisma.video.aggregate({
        _sum: {
          viewCount: true
        }
      })
      console.log(`✅ Total de visualizações: ${totalViews._sum.viewCount || 0}`)
    } catch (error) {
      console.log(`❌ Erro ao buscar total de visualizações: ${error.message}`)
    }

    try {
      const totalRevenue = await prisma.payment.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'completed'
        }
      })
      console.log(`✅ Receita total: R$ ${totalRevenue._sum.amount || 0}`)
    } catch (error) {
      console.log(`❌ Erro ao buscar receita total: ${error.message}`)
    }

    try {
      const totalLikes = await prisma.userLike.count()
      console.log(`✅ Total de likes: ${totalLikes}`)
    } catch (error) {
      console.log(`❌ Erro ao buscar total de likes: ${error.message}`)
    }

    console.log('\n🎉 Teste concluído!')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminStats()
