const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const defaultCategories = [
  {
    name: 'VIP',
    slug: 'vip',
    qtd: 0,
    images: null
  },
  {
    name: 'VIP Amadores',
    slug: 'vip-amadores',
    qtd: 0,
    images: null
  },
  {
    name: 'Amador',
    slug: 'amador',
    qtd: 0,
    images: null
  },
  {
    name: 'Brasileiro',
    slug: 'brasileiro',
    qtd: 0,
    images: null
  },
  {
    name: 'Caseiro',
    slug: 'caseiro',
    qtd: 0,
    images: null
  },
  {
    name: 'Corno',
    slug: 'corno',
    qtd: 0,
    images: null
  },
  {
    name: 'Anal',
    slug: 'anal',
    qtd: 0,
    images: null
  },
  {
    name: 'Oral',
    slug: 'oral',
    qtd: 0,
    images: null
  },
  {
    name: 'Trio',
    slug: 'trio',
    qtd: 0,
    images: null
  },
  {
    name: 'Gangbang',
    slug: 'gangbang',
    qtd: 0,
    images: null
  },
  {
    name: 'Lesbico',
    slug: 'lesbico',
    qtd: 0,
    images: null
  },
  {
    name: 'Gay',
    slug: 'gay',
    qtd: 0,
    images: null
  },
  {
    name: 'Trans',
    slug: 'trans',
    qtd: 0,
    images: null
  },
  {
    name: 'Fetiche',
    slug: 'fetiche',
    qtd: 0,
    images: null
  },
  {
    name: 'BDSM',
    slug: 'bdsm',
    qtd: 0,
    images: null
  }
]

async function populateCategories() {
  try {
    console.log('🚀 Iniciando população de categorias...')
    
    let createdCount = 0
    let skippedCount = 0

    for (const categoryData of defaultCategories) {
      try {
        // Verificar se a categoria já existe
        const existingCategory = await prisma.category.findUnique({
          where: { name: categoryData.name }
        })

        if (existingCategory) {
          console.log(`⏭️  Categoria "${categoryData.name}" já existe, pulando...`)
          skippedCount++
          continue
        }

        // Criar nova categoria
        const category = await prisma.category.create({
          data: categoryData
        })

        console.log(`✅ Categoria "${category.name}" criada com sucesso`)
        createdCount++

      } catch (error) {
        console.error(`❌ Erro ao criar categoria "${categoryData.name}":`, error.message)
      }
    }

    // Atualizar contadores baseado nos vídeos existentes
    console.log('\n📊 Atualizando contadores de vídeos...')
    
    for (const categoryData of defaultCategories) {
      try {
        const videoCount = await prisma.video.count({
          where: {
            category: {
              has: categoryData.name
            }
          }
        })

        await prisma.category.updateMany({
          where: { name: categoryData.name },
          data: { qtd: videoCount }
        })

        console.log(`📈 Categoria "${categoryData.name}": ${videoCount} vídeos`)
      } catch (error) {
        console.error(`❌ Erro ao atualizar contador para "${categoryData.name}":`, error.message)
      }
    }

    console.log('\n📈 Resumo da operação:')
    console.log(`✅ Categorias criadas: ${createdCount}`)
    console.log(`⏭️  Categorias já existentes: ${skippedCount}`)
    console.log(`📊 Total de categorias processadas: ${defaultCategories.length}`)

    // Listar todas as categorias
    const allCategories = await prisma.category.findMany({
      orderBy: { qtd: 'desc' }
    })

    console.log('\n📋 Categorias disponíveis:')
    allCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} - ${category.qtd} vídeos`)
    })

  } catch (error) {
    console.error('❌ Erro durante a população:', error)
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Conexão com o banco de dados fechada')
  }
}

// Executar o script
populateCategories()
  .then(() => {
    console.log('🎉 População de categorias concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })
