const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateVipCategoriesDryRun() {
  try {
    console.log('🔍 MODO SIMULAÇÃO - Nenhuma alteração será feita no banco de dados')
    console.log('🚀 Iniciando simulação de atualização de categorias VIP...')
    
    // Buscar todos os vídeos premium que têm "VIP" na categoria e duração menor que 2 minutos (120 segundos)
    const videosToUpdate = await prisma.video.findMany({
      where: {
        premium: true,
        category: {
          has: 'VIP'
        },
        duration: {
          lt: 120 // Menor que 2 minutos (120 segundos)
        }
      },
      select: {
        id: true,
        title: true,
        category: true,
        duration: true
      }
    })

    console.log(`📊 Encontrados ${videosToUpdate.length} vídeos VIP com duração menor que 2 minutos`)

    if (videosToUpdate.length === 0) {
      console.log('✅ Nenhum vídeo encontrado para atualização')
      return
    }

    // Verificar se a categoria "VIP Amadores" existe
    const vipAmadoresCategory = await prisma.category.findUnique({
      where: { name: 'VIP Amadores' }
    })

    if (!vipAmadoresCategory) {
      console.log('📝 A categoria "VIP Amadores" seria criada automaticamente')
    } else {
      console.log('✅ A categoria "VIP Amadores" já existe')
    }

    console.log('\n📋 Vídeos que seriam atualizados:')
    console.log('=' .repeat(80))

    // Simular as atualizações
    videosToUpdate.forEach((video, index) => {
      const updatedCategories = video.category.filter(cat => cat !== 'VIP')
      updatedCategories.push('VIP Amadores')
      
      console.log(`${index + 1}. "${video.title}"`)
      console.log(`   Duração: ${video.duration}s`)
      console.log(`   Categorias atuais: ${video.category.join(', ')}`)
      console.log(`   Categorias após atualização: ${updatedCategories.join(', ')}`)
      console.log('')
    })

    // Contar vídeos nas categorias
    const currentVipCount = await prisma.video.count({
      where: {
        category: {
          has: 'VIP'
        }
      }
    })

    const currentVipAmadoresCount = await prisma.video.count({
      where: {
        category: {
          has: 'VIP Amadores'
        }
      }
    })

    console.log('📈 Resumo da simulação:')
    console.log(`📊 Vídeos que seriam movidos: ${videosToUpdate.length}`)
    console.log(`📊 Total atual de vídeos na categoria VIP: ${currentVipCount}`)
    console.log(`📊 Total atual de vídeos na categoria VIP Amadores: ${currentVipAmadoresCount}`)
    console.log(`📊 Total estimado de vídeos na categoria VIP após atualização: ${currentVipCount - videosToUpdate.length}`)
    console.log(`📊 Total estimado de vídeos na categoria VIP Amadores após atualização: ${currentVipAmadoresCount + videosToUpdate.length}`)

    console.log('\n💡 Para executar as alterações reais, use: npm run update-vip-categories')

  } catch (error) {
    console.error('❌ Erro durante a simulação:', error)
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Conexão com o banco de dados fechada')
  }
}

// Executar o script
updateVipCategoriesDryRun()
  .then(() => {
    console.log('🎉 Simulação concluída com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })
