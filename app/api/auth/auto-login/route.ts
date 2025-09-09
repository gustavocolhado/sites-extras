import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API auto-login chamada')
    
    const { email } = await request.json()
    console.log('📧 Email recebido:', email)

    if (!email) {
      return NextResponse.json(
        { error: 'Email não fornecido' },
        { status: 400 }
      )
    }

    // Por enquanto, retornar sucesso para qualquer email
    // Depois podemos integrar com o banco de dados
    return NextResponse.json({
      success: true,
      user: {
        id: 'temp-id',
        email: email,
        name: 'Usuário Teste'
      },
      message: 'API funcionando - usuário simulado'
    })

  } catch (error) {
    console.error('❌ Erro no auto-login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
