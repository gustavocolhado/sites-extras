const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkVipAmadoresCategory() {
  try {
    console.log('🔍 Verificando categoria VIP Amadores...')
    
    // Verificar se a categoria existe
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { name: 'VIP Amadores' },
          { slug: 'vip-amadores' }
        ]
      }
    })
    
    if (category) {
      console.log('✅ Categoria encontrada:')
      console.log(`   Nome: ${category.name}`)
      console.log(`   Slug: ${category.slug}`)
      console.log(`   ID: ${category.id}`)
      console.log(`   Quantidade de vídeos: ${category.qtd}`)
    } else {
      console.log('❌ Categoria VIP Amadores não encontrada!')
      console.log('💡 Execute: npm run populate-categories')
    }
    
    // Verificar vídeos na categoria
    const videoCount = await prisma.video.count({
      where: {
        category: {
          has: 'VIP Amadores'
        }
      }
    })
    
    console.log(`📊 Vídeos na categoria VIP Amadores: ${videoCount}`)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkVipAmadoresCategory()
  .then(() => {
    console.log('✅ Verificação concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })
