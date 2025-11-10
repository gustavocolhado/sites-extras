import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/auth'

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    if (session.user.access !== 1) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { deleteZero = false, deleteIds = [] } = await request.json().catch(() => ({ deleteZero: false, deleteIds: [] }))
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

    // Criar creators ausentes com base nos vídeos
    const videoCreators = await prisma.video.findMany({
      select: { creator: true },
      distinct: ['creator']
    })
    const existingNames = new Set(creators.map(c => c.name))
    const missingNames = videoCreators
      .map(vc => vc.creator)
      .filter((name): name is string => !!name && !existingNames.has(name))

    let createdCreators: { id: string; name: string }[] = []
    for (const name of missingNames) {
      try {
        const count = await prisma.video.count({ where: { creator: name } })
        const created = await prisma.creator.create({
          data: {
            name,
            qtd: count,
            created_at: new Date(),
            update_at: new Date()
          },
          select: { id: true, name: true }
        })
        createdCreators.push(created)
        console.log(`➕ Criado creator ausente: ${name} (${count} vídeos)`) 
      } catch (err) {
        console.error(`Erro ao criar creator '${name}':`, err)
      }
    }
    
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
    const creatorsWithoutVideos: { id: string; name: string }[] = []
    for (const creator of creators) {
      const videoCount = await prisma.video.count({
        where: { creator: creator.name }
      })
      if (videoCount === 0) {
        creatorsWithoutVideos.push({ id: creator.id, name: creator.name })
      }
    }
    
    console.log('\n📈 Resumo da sincronização:')
    console.log(`   • Creators atualizados: ${updatedCount}`)
    console.log(`   • Total de vídeos: ${totalVideos}`)
    console.log(`   • Creators verificados: ${creators.length}`)
    console.log(`   • Creators criados: ${createdCreators.length}`)
    
    let deletedCreators: { id: string; name: string }[] = []
    if (deleteZero || (Array.isArray(deleteIds) && deleteIds.length > 0)) {
      const toDelete = deleteZero
        ? creatorsWithoutVideos
        : creatorsWithoutVideos.filter(c => deleteIds.includes(c.id))

      for (const c of toDelete) {
        try {
          // Segurança: verificar novamente zero vídeos antes de deletar
          const videoCount = await prisma.video.count({ where: { creator: c.name } })
          if (videoCount === 0) {
            await prisma.creator.delete({ where: { id: c.id } })
            deletedCreators.push(c)
            console.log(`🗑️ Excluído creator sem vídeos: ${c.name}`)
          }
        } catch (err) {
          console.error(`Erro ao excluir creator ${c.name}:`, err)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sincronização concluída com sucesso',
      stats: {
        totalCreators: creators.length,
        updatedCreators: updatedCount,
        totalVideos: totalVideos,
        creatorsWithoutVideos: creatorsWithoutVideos.length,
        deletedCreators: deletedCreators.length,
        createdCreators: createdCreators.length
      },
      updates: updates,
      creatorsWithoutVideos: creatorsWithoutVideos,
      deletedCreators: deletedCreators,
      createdCreators: createdCreators
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
    const session = await getAuthSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    if (session.user.access !== 1) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
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
    const outOfSyncCreators: { id: string; name: string; storedCount: number; actualCount: number }[] = []
    const creatorsWithoutVideos: { id: string; name: string }[] = []
    const missingCreators: { name: string; count: number }[] = []
    
    // Verificar quais creators estão desatualizados
    for (const creator of creators) {
      const actualVideoCount = await prisma.video.count({
        where: { creator: creator.name }
      })
      
      totalVideos += actualVideoCount
      
      if (creator.qtd !== actualVideoCount) {
        outOfSyncCount++
        outOfSyncCreators.push({
          id: creator.id,
          name: creator.name,
          storedCount: creator.qtd || 0,
          actualCount: actualVideoCount
        })
      }
      if (actualVideoCount === 0) {
        creatorsWithoutVideos.push({ id: creator.id, name: creator.name })
      }
    }

    // Identificar nomes de criadores presentes em vídeos mas ausentes na tabela creator
    const existingNames = new Set(creators.map(c => c.name))
    const videoCreators = await prisma.video.findMany({
      select: { creator: true },
      distinct: ['creator']
    })
    for (const vc of videoCreators) {
      const name = vc.creator
      if (name && !existingNames.has(name)) {
        const count = await prisma.video.count({ where: { creator: name } })
        missingCreators.push({ name, count })
      }
    }
    
    return NextResponse.json({
      success: true,
      stats: {
        totalCreators: creators.length,
        totalVideos: totalVideos,
        outOfSyncCreators: outOfSyncCount,
        syncStatus: outOfSyncCount === 0 ? 'synchronized' : 'out_of_sync',
        missingCreators: missingCreators.length
      },
      outOfSyncCreators: outOfSyncCreators,
      creatorsWithoutVideos: creatorsWithoutVideos,
      missingCreators: missingCreators
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
