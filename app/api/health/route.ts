import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Verificar conexão com banco (usando uma consulta simples para MongoDB)
    await prisma.video.findFirst()
    
    // Verificar estatísticas básicas
    const videoCount = await prisma.video.count()
    const creatorCount = await prisma.creator.count()
    const userCount = await prisma.user.count()
    
    // Verificar sitemap
    const sitemapUrl = `${process.env.NEXTAUTH_URL || 'https://cornosbrasil.com'}/sitemap.xml`
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        videos: videoCount,
        creators: creatorCount,
        users: userCount
      },
      sitemap: {
        url: sitemapUrl,
        status: 'available'
      },
      environment: {
        node: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        status: 'disconnected'
      }
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
} 