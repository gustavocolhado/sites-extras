const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testVipAmadores() {
  try {
    console.log('🔍 Testando vídeos da categoria VIP Amadores...')
    
    // Contar vídeos na categoria VIP Amadores
    const vipAmadoresCount = await prisma.video.count({
      where: {
        category: {
          has: 'VIP Amadores'
        }
      }
    })

    console.log(`📊 Total de vídeos na categoria VIP Amadores: ${vipAmadoresCount}`)

    if (vipAmadoresCount === 0) {
      console.log('⚠️  Nenhum vídeo encontrado na categoria VIP Amadores!')
      console.log('💡 Execute o script de atualização de categorias primeiro:')
      console.log('   npm run update-vip-categories-dry-run')
      return
    }

    // Contar vídeos premium na categoria VIP Amadores
    const vipAmadoresPremiumCount = await prisma.video.count({
      where: {
        premium: true,
        category: {
          has: 'VIP Amadores'
        }
      }
    })

    console.log(`📊 Total de vídeos premium na categoria VIP Amadores: ${vipAmadoresPremiumCount}`)

    // Buscar alguns exemplos de vídeos VIP Amadores
    const sampleVideos = await prisma.video.findMany({
      where: {
        category: {
          has: 'VIP Amadores'
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

    console.log('\n📋 Exemplos de vídeos VIP Amadores:')
    console.log('=' .repeat(60))
    
    sampleVideos.forEach((video, index) => {
      console.log(`${index + 1}. "${video.title}"`)
      console.log(`   ID: ${video.id}`)
      console.log(`   Duração: ${video.duration}s`)
      console.log(`   Categorias: ${video.category.join(', ')}`)
      console.log(`   Premium: ${video.premium}`)
      console.log('')
    })

    // Verificar se há vídeos VIP Amadores com duração menor que 2 minutos
    const shortVipAmadoresVideos = await prisma.video.count({
      where: {
        category: {
          has: 'VIP Amadores'
        },
        duration: {
          lt: 120
        }
      }
    })

    console.log(`📊 Vídeos VIP Amadores com duração < 2min: ${shortVipAmadoresVideos}`)

    // Verificar se há vídeos VIP Amadores com duração >= 2 minutos
    const longVipAmadoresVideos = await prisma.video.count({
      where: {
        category: {
          has: 'VIP Amadores'
        },
        duration: {
          gte: 120
        }
      }
    })

    console.log(`📊 Vídeos VIP Amadores com duração >= 2min: ${longVipAmadoresVideos}`)

    // Comparar com categoria VIP
    const vipCount = await prisma.video.count({
      where: {
        category: {
          has: 'VIP'
        }
      }
    })

    const vipPremiumCount = await prisma.video.count({
      where: {
        premium: true,
        category: {
          has: 'VIP'
        }
      }
    })

    console.log('\n📈 Comparação entre categorias:')
    console.log(`📊 Total de vídeos na categoria VIP: ${vipCount}`)
    console.log(`📊 Total de vídeos premium na categoria VIP: ${vipPremiumCount}`)
    console.log(`📊 Total de vídeos na categoria VIP Amadores: ${vipAmadoresCount}`)
    console.log(`📊 Total de vídeos premium na categoria VIP Amadores: ${vipAmadoresPremiumCount}`)

    console.log('\n✅ Teste concluído!')
    console.log('💡 Agora usuários premium podem escolher entre VIP e VIP Amadores.')

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Conexão com o banco de dados fechada')
  }
}

// Executar o script
testVipAmadores()
  .then(() => {
    console.log('🎉 Teste executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })
