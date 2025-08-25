const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugVipCategories() {
  try {
    console.log('🔍 Debugando categorias VIP...')
    
    // Verificar vídeos VIP
    const vipVideos = await prisma.video.findMany({
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
        category: true
      },
      take: 5
    })
    
    const vipCount = await prisma.video.count({
      where: {
        premium: true,
        category: {
          has: 'VIP'
        }
      }
    })
    
    // Verificar vídeos VIP Amadores
    const vipAmadoresVideos = await prisma.video.findMany({
      where: {
        premium: true,
        category: {
          has: 'VIP Amadores'
        }
      },
      select: {
        id: true,
        title: true,
        duration: true,
        category: true
      },
      take: 5
    })
    
    const vipAmadoresCount = await prisma.video.count({
      where: {
        premium: true,
        category: {
          has: 'VIP Amadores'
        }
      }
    })
    
    console.log('\n📊 Estatísticas:')
    console.log(`VIP: ${vipCount} vídeos`)
    console.log(`VIP Amadores: ${vipAmadoresCount} vídeos`)
    
    console.log('\n📋 Exemplos VIP:')
    vipVideos.forEach((video, index) => {
      console.log(`${index + 1}. "${video.title}" - ${video.duration}s - ${video.category.join(', ')}`)
    })
    
    console.log('\n📋 Exemplos VIP Amadores:')
    vipAmadoresVideos.forEach((video, index) => {
      console.log(`${index + 1}. "${video.title}" - ${video.duration}s - ${video.category.join(', ')}`)
    })
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugVipCategories()
  .then(() => {
    console.log('✅ Debug concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })
