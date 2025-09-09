import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Redirecionar para o favicon estático
    return NextResponse.redirect(new URL('/favicon.ico', request.url))
  } catch (error) {
    console.error('Erro ao servir favicon:', error)
    return new NextResponse('Favicon não encontrado', { status: 404 })
  }
}
