import { NextRequest, NextResponse } from 'next/server'

// Cache simples em memória para evitar múltiplas requisições
const videoCache = new Map<string, { buffer: ArrayBuffer, contentType: string, timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 horas

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoUrl = searchParams.get('url')
    const range = request.headers.get('range')
    
    if (!videoUrl) {
      return NextResponse.json({ error: 'URL do vídeo é obrigatória' }, { status: 400 })
    }

    console.log('🎬 Proxy: Buscando vídeo:', videoUrl)

    // Verificar cache primeiro
    const cacheKey = videoUrl
    const cached = videoCache.get(cacheKey)
    const now = Date.now()

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('✅ Proxy: Usando cache para vídeo')
      return new NextResponse(cached.buffer, {
        status: 200,
        headers: {
          'Content-Type': cached.contentType,
          'Content-Length': cached.buffer.byteLength.toString(),
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Range',
          'Cache-Control': 'public, max-age=86400, immutable',
          'Accept-Ranges': 'bytes',
          'ETag': `"${Buffer.from(videoUrl).toString('base64')}"`
        }
      })
    }

    // Headers otimizados para streaming
    const fetchHeaders: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'video/mp4,video/*,*/*;q=0.9',
      'Accept-Encoding': 'identity', // Desabilitar compressão para vídeos
      'Connection': 'keep-alive'
    }

    // Adicionar Range header se presente
    if (range) {
      fetchHeaders['Range'] = range
    }

    const response = await fetch(videoUrl, {
      method: 'GET',
      headers: fetchHeaders
    })

    if (!response.ok) {
      console.error('❌ Proxy: Erro ao buscar vídeo:', response.status, response.statusText)
      return NextResponse.json({ error: 'Erro ao buscar vídeo' }, { status: response.status })
    }

    const videoBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'video/mp4'
    const contentLength = response.headers.get('content-length')
    const acceptRanges = response.headers.get('accept-ranges')

    // Armazenar no cache
    videoCache.set(cacheKey, {
      buffer: videoBuffer,
      contentType,
      timestamp: now
    })

    // Limpar cache antigo periodicamente
    if (videoCache.size > 100) {
      const entries = Array.from(videoCache.entries())
      for (const [key, value] of entries) {
        if ((now - value.timestamp) > CACHE_DURATION) {
          videoCache.delete(key)
        }
      }
    }

    console.log('✅ Proxy: Vídeo carregado com sucesso, tamanho:', videoBuffer.byteLength)

    const responseHeaders: HeadersInit = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range',
      'Cache-Control': 'public, max-age=86400, immutable',
      'ETag': `"${Buffer.from(videoUrl).toString('base64')}"`
    }

    if (contentLength) {
      responseHeaders['Content-Length'] = contentLength
    }

    if (acceptRanges) {
      responseHeaders['Accept-Ranges'] = acceptRanges
    }

    // Se é uma resposta parcial (206), manter o status
    const status = response.status === 206 ? 206 : 200

    return new NextResponse(videoBuffer, {
      status,
      headers: responseHeaders
    })

  } catch (error) {
    console.error('❌ Proxy: Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
} 