import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getDomainConfig } from '@/config/domains'

// Middleware para detectar domínio e adicionar headers
function domainMiddleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const domain = hostname.replace(/:\d+$/, '').toLowerCase()
  
  // Verificar se o domínio está configurado
  const domainConfig = getDomainConfig(domain)
  
  // Adicionar headers com informações do domínio
  const response = NextResponse.next()
  response.headers.set('x-domain', domain)
  response.headers.set('x-site-name', domainConfig.siteName)
  response.headers.set('x-canonical-url', domainConfig.canonical)
  
  return response
}

// Middleware principal para detecção de domínio
export function middleware(request: NextRequest) {
  // Aplicar middleware de domínio
  return domainMiddleware(request)
}

export const config = {
  matcher: [
    // Todas as rotas exceto as que não precisam de processamento
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
} 