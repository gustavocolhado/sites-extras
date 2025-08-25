const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testVipPremium() {
  try {
    console.log('🔍 Testando vídeos premium da categoria VIP...')
    
    // Contar vídeos premium na categoria VIP
    const vipPremiumCount = await prisma.video.count({
      where: {
        premium: true,
        category: {
          has: 'VIP'
        }
      }
    })

    console.log(`📊 Total de vídeos premium na categoria VIP: ${vipPremiumCount}`)

    if (vipPremiumCount === 0) {
      console.log('⚠️  Nenhum vídeo premium encontrado na categoria VIP!')
      console.log('💡 Execute o script de atualização de categorias primeiro:')
      console.log('   npm run update-vip-categories-dry-run')
      return
    }

    // Buscar alguns exemplos de vídeos VIP premium
    const sampleVideos = await prisma.video.findMany({
      where: {
        premium: true,
        category: {
          has: 'VIP'
        }
      },
      select: {
        id: true,
        title: true,
        duration: true,
        category: true,
        premium: true
      },
      take: 5
    })

    console.log('\n📋 Exemplos de vídeos VIP premium:')
    console.log('=' .repeat(60))
    
    sampleVideos.forEach((video, index) => {
      console.log(`${index + 1}. "${video.title}"`)
      console.log(`   ID: ${video.id}`)
      console.log(`   Duração: ${video.duration}s`)
      console.log(`   Categorias: ${video.category.join(', ')}`)
      console.log(`   Premium: ${video.premium}`)
      console.log('')
    })

    // Verificar se há vídeos VIP com duração menor que 2 minutos
    const shortVipVideos = await prisma.video.count({
      where: {
        premium: true,
        category: {
          has: 'VIP'
        },
        duration: {
          lt: 120
        }
      }
    })

    console.log(`📊 Vídeos VIP premium com duração < 2min: ${shortVipVideos}`)

    // Verificar se há vídeos VIP com duração >= 2 minutos
    const longVipVideos = await prisma.video.count({
      where: {
        premium: true,
        category: {
          has: 'VIP'
        },
        duration: {
          gte: 120
        }
      }
    })

    console.log(`📊 Vídeos VIP premium com duração >= 2min: ${longVipVideos}`)

    console.log('\n✅ Teste concluído!')
    console.log('💡 Se houver vídeos suficientes, a funcionalidade premium deve funcionar corretamente.')

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Conexão com o banco de dados fechada')
  }
}

// Executar o script
testVipPremium()
  .then(() => {
    console.log('🎉 Teste executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })
