import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    // Tentar servir o favicon.png como favicon.ico
    const faviconPath = join(process.cwd(), 'public', 'favicon.png')
    const faviconBuffer = await readFile(faviconPath)
    
    return new NextResponse(faviconBuffer as any, {
      headers: {
        'Content-Type': 'image/png', // Manter como PNG mesmo na rota .ico
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Erro ao servir favicon.ico:', error)
    return new NextResponse('Favicon não encontrado', { status: 404 })
  }
}
