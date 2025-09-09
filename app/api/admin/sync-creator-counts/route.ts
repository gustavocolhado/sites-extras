import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando sincronização de contagem de vídeos dos creators...')
    
    // Buscar todos os creators
    const creators = await prisma.creator.findMany({
      select: {
        id: true,
        name: true,
        qtd: true
      }
    })
    
    console.log(`📊 Encontrados ${creators.length} creators para sincronizar`)
    
    let updatedCount = 0
    let totalVideos = 0
    const updates = []
    
    // Para cada creator, contar os vídeos reais
    for (const creator of creators) {
      try {
        // Contar vídeos do creator
        const videoCount = await prisma.video.count({
          where: {
            creator: creator.name
          }
        })
        
        // Atualizar a contagem se for diferente
        if (creator.qtd !== videoCount) {
          await prisma.creator.update({
            where: { id: creator.id },
            data: { 
              qtd: videoCount,
              update_at: new Date()
            }
          })
          
          updates.push({
            name: creator.name,
            oldCount: creator.qtd || 0,
            newCount: videoCount
          })
          
          console.log(`✅ ${creator.name}: ${creator.qtd || 0} → ${videoCount} vídeos`)
          updatedCount++
        }
        
        totalVideos += videoCount
      } catch (error) {
        console.error(`❌ Erro ao sincronizar ${creator.name}:`, error instanceof Error ? error.message : 'Erro desconhecido')
      }
    }
    
    // Verificar creators órfãos (sem vídeos)
    const creatorsWithoutVideos = []
    for (const creator of creators) {
      const videoCount = await prisma.video.count({
        where: { creator: creator.name }
      })
      if (videoCount === 0) {
        creatorsWithoutVideos.push(creator.name)
      }
    }
    
    console.log('\n📈 Resumo da sincronização:')
    console.log(`   • Creators atualizados: ${updatedCount}`)
    console.log(`   • Total de vídeos: ${totalVideos}`)
    console.log(`   • Creators verificados: ${creators.length}`)
    
    return NextResponse.json({
      success: true,
      message: 'Sincronização concluída com sucesso',
      stats: {
        totalCreators: creators.length,
        updatedCreators: updatedCount,
        totalVideos: totalVideos,
        creatorsWithoutVideos: creatorsWithoutVideos.length
      },
      updates: updates,
      creatorsWithoutVideos: creatorsWithoutVideos
    })
    
  } catch (error) {
    console.error('❌ Erro durante a sincronização:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Buscar estatísticas atuais
    const creators = await prisma.creator.findMany({
      select: {
        id: true,
        name: true,
        qtd: true
      },
      orderBy: {
        qtd: 'desc'
      }
    })
    
    let totalVideos = 0
    let outOfSyncCount = 0
    const outOfSyncCreators = []
    
    // Verificar quais creators estão desatualizados
    for (const creator of creators) {
      const actualVideoCount = await prisma.video.count({
        where: { creator: creator.name }
      })
      
      totalVideos += actualVideoCount
      
      if (creator.qtd !== actualVideoCount) {
        outOfSyncCount++
        outOfSyncCreators.push({
          name: creator.name,
          storedCount: creator.qtd || 0,
          actualCount: actualVideoCount
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      stats: {
        totalCreators: creators.length,
        totalVideos: totalVideos,
        outOfSyncCreators: outOfSyncCount,
        syncStatus: outOfSyncCount === 0 ? 'synchronized' : 'out_of_sync'
      },
      outOfSyncCreators: outOfSyncCreators
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar status de sincronização:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
