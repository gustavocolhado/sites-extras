const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testNavigation() {
  try {
    console.log('🧪 Testando navegação para VIP Amadores...')
    
    // 1. Verificar se a categoria existe
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { name: 'VIP Amadores' },
          { slug: 'vip-amadores' }
        ]
      }
    })
    
    if (!category) {
      console.log('❌ Categoria VIP Amadores não existe!')
      console.log('💡 Execute: npm run populate-categories')
      return
    }
    
    console.log('✅ Categoria encontrada:', {
      name: category.name,
      slug: category.slug,
      qtd: category.qtd
    })
    
    // 2. Verificar se há vídeos na categoria
    const videoCount = await prisma.video.count({
      where: {
        category: {
          has: 'VIP Amadores'
        }
      }
    })
    
    console.log(`📊 Vídeos na categoria: ${videoCount}`)
    
    if (videoCount === 0) {
      console.log('⚠️  Nenhum vídeo encontrado na categoria VIP Amadores')
      console.log('💡 Execute: npm run update-vip-categories para mover vídeos curtos para VIP Amadores')
    } else {
      console.log('✅ Categoria tem vídeos - navegação deve funcionar!')
    }
    
    // 3. Testar URL da categoria
    const categoryUrl = `/categories/${category.slug}`
    console.log(`🔗 URL da categoria: ${categoryUrl}`)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testNavigation()
  .then(() => {
    console.log('✅ Teste concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })
