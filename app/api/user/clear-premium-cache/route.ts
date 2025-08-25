import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'

// ⚠️ DEPRECATED: Esta API não é mais necessária
// O cache premium agora é gerenciado automaticamente pelos dados da sessão
// Esta API pode ser removida após confirmar que não há outros usos

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Como não podemos acessar o cache do cliente diretamente do servidor,
    // vamos retornar um timestamp que indica que o cache deve ser limpo
    const cacheClearTimestamp = Date.now()
    
    console.log('🗑️ Cache premium solicitado para limpeza por:', session.user?.email)
    
    return NextResponse.json({ 
      success: true, 
      cacheClearTimestamp,
      message: 'Cache deve ser limpo no cliente'
    })
    
  } catch (error) {
    console.error('Erro ao processar limpeza de cache:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
