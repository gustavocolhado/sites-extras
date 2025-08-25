const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testSitemap() {
  try {
    console.log('🔍 Testando conexão com banco de dados...')
    
    // Testar conexão
    await prisma.$connect()
    console.log('✅ Conexão com banco estabelecida')
    
         // Contar vídeos
     const videoCount = await prisma.video.count({
       where: {
         premium: false
       }
     })
    console.log(`📊 Total de vídeos não premium: ${videoCount}`)
    
    // Contar criadores
    const creatorCount = await prisma.creator.count()
    console.log(`📊 Total de criadores: ${creatorCount}`)
    
         // Buscar alguns vídeos de exemplo
     const sampleVideos = await prisma.video.findMany({
       select: {
         id: true,
         title: true,
         url: true,
         premium: true
       },
       where: {
         premium: false
       },
       take: 10
     })
    
    console.log('📹 Vídeos de exemplo:')
    sampleVideos.forEach(video => {
      console.log(`  - ${video.title} (${video.url})`)
    })
    
         // Buscar categorias
     const videoCategories = await prisma.video.findMany({
       select: {
         category: true
       },
       where: {
         category: {
           isEmpty: false
         }
       }
       // Removido take: 10 para ver todas as categorias
     })
    
    const uniqueCategories = Array.from(new Set(
      videoCategories.flatMap(video => video.category || [])
    )).filter(Boolean)
    
    console.log(`📂 Categorias encontradas: ${uniqueCategories.length}`)
    console.log('📂 Categorias de exemplo:', uniqueCategories.slice(0, 5))
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSitemap()
