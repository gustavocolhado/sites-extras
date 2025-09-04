import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    const faviconPath = join(process.cwd(), 'public', 'favicon.png')
    const faviconBuffer = await readFile(faviconPath)
    
    return new NextResponse(faviconBuffer as any, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Erro ao servir favicon:', error)
    return new NextResponse('Favicon não encontrado', { status: 404 })
  }
}
