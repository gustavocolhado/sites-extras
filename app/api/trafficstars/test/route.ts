import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de teste
    const clickId = searchParams.get('clickid') || 'test-click-123'
    const value = searchParams.get('value') || '29.90'
    const goalId = searchParams.get('goalid') || '0'
    const key = 'GODOiGyqwq6r1PxUDZTPjkyoyTeocItpUE7K'

    // Construir URL do postback
    const postbackUrl = new URL('https://tsyndicate.com/api/v1/cpa/action')
    postbackUrl.searchParams.set('value', value)
    postbackUrl.searchParams.set('clickid', clickId)
    postbackUrl.searchParams.set('key', key)
    postbackUrl.searchParams.set('goalid', goalId)

    console.log('🧪 TESTE POSTBACK TRAFFICSTARS:', postbackUrl.toString())

    // Enviar postback de teste
    const response = await fetch(postbackUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'CPA-Tracking-Test/1.0'
      }
    })

    const responseText = await response.text()

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      url: postbackUrl.toString(),
      response: responseText,
      message: response.ok ? 'Postback enviado com sucesso' : 'Erro ao enviar postback'
    })

  } catch (error) {
    console.error('❌ Erro no teste de postback:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
