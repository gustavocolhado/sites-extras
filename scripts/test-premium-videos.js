const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Função para construir URLs completas (igual à API)
function buildMediaUrl(url) {
  if (!url) return null
  
  // Se já é uma URL completa, retornar como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL
  if (!mediaUrl) {
    console.warn('NEXT_PUBLIC_MEDIA_URL não está configurada')
    return url
  }
  
  // Remove barra dupla se existir
  const cleanMediaUrl = mediaUrl.endsWith('/') ? mediaUrl.slice(0, -1) : mediaUrl
  const cleanUrl = url.startsWith('/') ? url : `/${url}`
  
  const fullUrl = `${cleanMediaUrl}${cleanUrl}`
  console.log('🔗 buildMediaUrl:', { original: url, mediaUrl, fullUrl })
  
  return fullUrl
}

async function testPremiumVideos() {
  try {
    console.log('🔍 Testando vídeos premium...\n')

    // Carregar variáveis de ambiente
    require('dotenv').config()
    
    console.log('📊 NEXT_PUBLIC_MEDIA_URL:', process.env.NEXT_PUBLIC_MEDIA_URL)
    console.log('📊 Existe:', !!process.env.NEXT_PUBLIC_MEDIA_URL)

    // Buscar alguns vídeos premium
    const premiumVideos = await prisma.video.findMany({
      where: {
        premium: true
      },
      take: 5,
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        videoUrl: true,
        trailerUrl: true,
        iframe: true,
        premium: true,
        category: true
      }
    })

    console.log(`📊 Encontrados ${premiumVideos.length} vídeos premium\n`)

    if (premiumVideos.length === 0) {
      console.log('❌ Nenhum vídeo premium encontrado no banco de dados')
      return
    }

    // Testar cada vídeo
    premiumVideos.forEach((video, index) => {
      console.log(`🎬 Vídeo ${index + 1}: ${video.title}`)
      console.log(`   ID: ${video.id}`)
      console.log(`   Premium: ${video.premium}`)
      console.log(`   Iframe: ${video.iframe}`)
      console.log(`   Categorias: ${video.category.join(', ')}`)
      console.log(`   Thumbnail original: ${video.thumbnailUrl}`)
      console.log(`   Thumbnail processada: ${buildMediaUrl(video.thumbnailUrl)}`)
      console.log(`   Video URL original: ${video.videoUrl}`)
      console.log(`   Video URL processada: ${buildMediaUrl(video.videoUrl)}`)
      console.log(`   Trailer URL original: ${video.trailerUrl}`)
      console.log(`   Trailer URL processada: ${buildMediaUrl(video.trailerUrl)}`)
      console.log('')
    })

    // Testar vídeos VIP especificamente
    console.log('🎯 Testando vídeos VIP...')
    const vipVideos = await prisma.video.findMany({
      where: {
        premium: true,
        category: {
          has: 'VIP'
        }
      },
      take: 3,
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        iframe: true
      }
    })

    console.log(`📊 Encontrados ${vipVideos.length} vídeos VIP\n`)

    vipVideos.forEach((video, index) => {
      console.log(`💎 Vídeo VIP ${index + 1}: ${video.title}`)
      console.log(`   Thumbnail original: ${video.thumbnailUrl}`)
      console.log(`   Thumbnail processada: ${buildMediaUrl(video.thumbnailUrl)}`)
      console.log(`   Iframe: ${video.iframe}`)
      console.log('')
    })

    // Testar vídeos VIP Amadores
    console.log('🎯 Testando vídeos VIP Amadores...')
    const vipAmadoresVideos = await prisma.video.findMany({
      where: {
        premium: true,
        category: {
          has: 'VIP Amadores'
        }
      },
      take: 3,
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        iframe: true
      }
    })

    console.log(`📊 Encontrados ${vipAmadoresVideos.length} vídeos VIP Amadores\n`)

    vipAmadoresVideos.forEach((video, index) => {
      console.log(`🎭 Vídeo VIP Amadores ${index + 1}: ${video.title}`)
      console.log(`   Thumbnail original: ${video.thumbnailUrl}`)
      console.log(`   Thumbnail processada: ${buildMediaUrl(video.thumbnailUrl)}`)
      console.log(`   Iframe: ${video.iframe}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPremiumVideos()
