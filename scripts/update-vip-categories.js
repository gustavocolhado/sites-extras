const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateVipCategories() {
  try {
    console.log('🚀 Iniciando atualização de categorias VIP...')
    
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

    // Verificar se a categoria "VIP Amadores" existe, se não, criar
    let vipAmadoresCategory = await prisma.category.findUnique({
      where: { name: 'VIP Amadores' }
    })

    if (!vipAmadoresCategory) {
      console.log('📝 Criando categoria "VIP Amadores"...')
      vipAmadoresCategory = await prisma.category.create({
        data: {
          name: 'VIP Amadores',
          slug: 'vip-amadores',
          qtd: 0
        }
      })
      console.log('✅ Categoria "VIP Amadores" criada com sucesso')
    }

    let updatedCount = 0
    let errorCount = 0

    // Atualizar cada vídeo
    for (const video of videosToUpdate) {
      try {
        // Remover "VIP" da categoria e adicionar "VIP Amadores"
        const updatedCategories = video.category.filter(cat => cat !== 'VIP')
        updatedCategories.push('VIP Amadores')

        await prisma.video.update({
          where: { id: video.id },
          data: {
            category: updatedCategories
          }
        })

        console.log(`✅ Vídeo "${video.title}" atualizado: VIP → VIP Amadores (${video.duration}s)`)
        updatedCount++

      } catch (error) {
        console.error(`❌ Erro ao atualizar vídeo ${video.id}:`, error.message)
        errorCount++
      }
    }

    // Atualizar contadores das categorias
    console.log('📊 Atualizando contadores das categorias...')
    
    // Contar vídeos na categoria VIP
    const vipCount = await prisma.video.count({
      where: {
        category: {
          has: 'VIP'
        }
      }
    })

    // Contar vídeos na categoria VIP Amadores
    const vipAmadoresCount = await prisma.video.count({
      where: {
        category: {
          has: 'VIP Amadores'
        }
      }
    })

    // Atualizar contadores
    await prisma.category.updateMany({
      where: { name: 'VIP' },
      data: { qtd: vipCount }
    })

    await prisma.category.updateMany({
      where: { name: 'VIP Amadores' },
      data: { qtd: vipAmadoresCount }
    })

    console.log('\n📈 Resumo da operação:')
    console.log(`✅ Vídeos atualizados com sucesso: ${updatedCount}`)
    console.log(`❌ Erros encontrados: ${errorCount}`)
    console.log(`📊 Total de vídeos na categoria VIP: ${vipCount}`)
    console.log(`📊 Total de vídeos na categoria VIP Amadores: ${vipAmadoresCount}`)

  } catch (error) {
    console.error('❌ Erro durante a execução:', error)
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Conexão com o banco de dados fechada')
  }
}

// Executar o script
updateVipCategories()
  .then(() => {
    console.log('🎉 Script executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })
