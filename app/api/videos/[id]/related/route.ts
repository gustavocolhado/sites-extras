import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Função para construir URLs completas
function buildMediaUrl(url: string | null): string | null {
  if (!url) return null
  
  // Se já é uma URL completa, retornar como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL
  if (!mediaUrl) {
    console.warn('NEXT_PUBLIC_MEDIA_URL não está configurada')
    return url
  }
  
  // Remove barra dupla se existir
  const cleanMediaUrl = mediaUrl.endsWith('/') ? mediaUrl.slice(0, -1) : mediaUrl
  const cleanUrl = url.startsWith('/') ? url : `/${url}`
  
  return `${cleanMediaUrl}${cleanUrl}`
}

// Função para formatar tempo relativo
function formatRelativeTime(date: Date | null): string {
  if (!date) return 'recentemente'
  
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'agora mesmo'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutos atrás`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} horas atrás`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} dias atrás`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} meses atrás`
  
  return `${Math.floor(diffInSeconds / 31536000)} anos atrás`
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
         const { searchParams } = new URL(request.url)
     const limit = parseInt(searchParams.get('limit') || '20')
     const videoId = params.id

    // Primeiro, buscar o vídeo atual para obter suas categorias
    const currentVideo = await prisma.video.findUnique({
      where: { id: videoId },
      select: { category: true }
    })

    let relatedVideos = []

    if (currentVideo && currentVideo.category.length > 0) {
             // Buscar vídeos que compartilham categorias com o vídeo atual
       relatedVideos = await prisma.video.findMany({
         where: {
           id: { not: videoId },
           category: {
             hasSome: currentVideo.category
           }
         },
         take: limit * 2, // Buscar mais vídeos para ter mais opções para ordenação aleatória
         select: {
           id: true,
           title: true,
           thumbnailUrl: true,
           duration: true,
           creator: true,
           viewCount: true,
           created_at: true,
           category: true,
           videoUrl: true,
           premium: true,
           iframe: true
         }
       })

             // Se não encontrou vídeos com categorias compartilhadas, buscar vídeos aleatórios
       if (relatedVideos.length === 0) {
         relatedVideos = await prisma.video.findMany({
           where: {
             id: { not: videoId }
           },
           take: limit * 2, // Buscar mais vídeos para ter mais opções para ordenação aleatória
           orderBy: {
             created_at: 'desc'
           },
           select: {
             id: true,
             title: true,
             thumbnailUrl: true,
             duration: true,
             creator: true,
             viewCount: true,
             created_at: true,
             category: true,
             videoUrl: true,
             premium: true,
             iframe: true
           }
         })
       }
         } else {
       // Se o vídeo atual não tem categorias, buscar vídeos aleatórios
       relatedVideos = await prisma.video.findMany({
         where: {
           id: { not: videoId }
         },
         take: limit * 2, // Buscar mais vídeos para ter mais opções para ordenação aleatória
         orderBy: {
           created_at: 'desc'
         },
         select: {
           id: true,
           title: true,
           thumbnailUrl: true,
           duration: true,
           creator: true,
           viewCount: true,
           created_at: true,
           category: true,
           videoUrl: true,
           premium: true,
           iframe: true
         }
       })
     }

    // Aplicar ordenação aleatória manualmente
    relatedVideos = relatedVideos.sort(() => Math.random() - 0.5).slice(0, limit)

         // Se não encontrar vídeos no banco, retornar dados mock
     if (relatedVideos.length === 0) {
              const mockVideos = [
          {
            id: '507f1f77bcf86cd799439011',
            title: 'Novinha em Biquíni na Praia - Vídeo Sensual',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '2:15',
            creator: 'Cremona',
            viewCount: 1200,
            uploadTime: '2 hours ago',
            category: ['BOQUETES', 'MAGRINHA'],
            videoUrl: '/videos/video1.mp4',
            premium: false,
            iframe: false
          },
          {
            id: '507f1f77bcf86cd799439012',
            title: 'Magrinha Fazendo Boquete Caseiro',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '3:42',
            creator: 'Cremona',
            viewCount: 890,
            uploadTime: '4 hours ago',
            category: ['BOQUETES', 'CASEIRO'],
            videoUrl: '/videos/video2.mp4',
            premium: false,
            iframe: false
          },
          {
            id: '507f1f77bcf86cd799439013',
            title: 'Sexo Oral Intenso com Novinha',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '4:20',
            creator: 'Cremona',
            viewCount: 1500,
            uploadTime: '6 hours ago',
            category: ['SEXO ORAL', 'NOVINHA'],
            videoUrl: '/videos/video3.mp4',
            premium: false,
            iframe: false
          },
          {
            id: '507f1f77bcf86cd799439014',
            title: 'Boquete Profundo e Molhado',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '3:15',
            creator: 'Cremona',
            viewCount: 2100,
            uploadTime: '8 hours ago',
            category: ['BOQUETES', 'PROFUNDO'],
            videoUrl: '/videos/video4.mp4',
            premium: false,
            iframe: false
          },
          {
            id: '507f1f77bcf86cd799439015',
            title: 'Novinha Fazendo Sexo Oral',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '5:30',
            creator: 'Cremona',
            viewCount: 1800,
            uploadTime: '12 hours ago',
            category: ['SEXO ORAL', 'NOVINHA'],
            videoUrl: '/videos/video5.mp4',
            premium: false,
            iframe: false
          },
          {
            id: '507f1f77bcf86cd799439016',
            title: 'Magrinha Fazendo Sexo Oral Profundo',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '4:45',
            creator: 'Cremona',
            viewCount: 1600,
            uploadTime: '1 day ago',
            category: ['SEXO ORAL', 'MAGRINHA'],
            videoUrl: '/videos/video6.mp4',
            premium: false,
            iframe: false
          },
          {
            id: '507f1f77bcf86cd799439017',
            title: 'Boquete Caseiro com Novinha',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '3:20',
            creator: 'Cremona',
            viewCount: 1100,
            uploadTime: '1 day ago',
            category: ['BOQUETES', 'CASEIRO'],
            videoUrl: '/videos/video7.mp4',
            premium: false,
            iframe: false
          },
          {
            id: '507f1f77bcf86cd799439018',
            title: 'Sexo Oral Intenso e Molhado',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '5:15',
            creator: 'Cremona',
            viewCount: 1900,
            uploadTime: '2 days ago',
            category: ['SEXO ORAL', 'INTENSO'],
            videoUrl: '/videos/video8.mp4',
            premium: false,
            iframe: false
          },
          {
            id: '507f1f77bcf86cd799439019',
            title: 'Novinha Fazendo Boquete na Praia',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '2:55',
            creator: 'Cremona',
            viewCount: 1400,
            uploadTime: '2 days ago',
            category: ['BOQUETES', 'PRAIA'],
            videoUrl: '/videos/video9.mp4',
            premium: false,
            iframe: false
          },
          {
            id: '507f1f77bcf86cd799439020',
            title: 'Magrinha Fazendo Sexo Oral Caseiro',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '4:10',
            creator: 'Cremona',
            viewCount: 1700,
            uploadTime: '3 days ago',
            category: ['SEXO ORAL', 'MAGRINHA'],
            videoUrl: '/videos/video10.mp4',
            premium: false,
            iframe: false
          },
          {
            id: '507f1f77bcf86cd799439021',
            title: 'Boquete Profundo com Novinha',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '3:35',
            creator: 'Cremona',
            viewCount: 1300,
            uploadTime: '3 days ago',
            category: ['BOQUETES', 'PROFUNDO'],
            videoUrl: '/videos/video11.mp4',
            premium: false,
            iframe: false
          },
          {
            id: '507f1f77bcf86cd799439022',
            title: 'Sexo Oral Molhado e Intenso',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '4:50',
            creator: 'Cremona',
            viewCount: 2000,
            uploadTime: '4 days ago',
            category: ['SEXO ORAL', 'MOLHADO'],
            videoUrl: '/videos/video12.mp4',
            premium: false,
            iframe: false
          },
          {
            id: '507f1f77bcf86cd799439023',
            title: 'Novinha Fazendo Boquete Caseiro',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '3:25',
            creator: 'Cremona',
            viewCount: 1200,
            uploadTime: '4 days ago',
            category: ['BOQUETES', 'CASEIRO'],
            videoUrl: '/videos/video13.mp4',
            premium: false,
            iframe: false
          },
          {
            id: '507f1f77bcf86cd799439024',
            title: 'Magrinha Fazendo Sexo Oral na Praia',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '4:05',
            creator: 'Cremona',
            viewCount: 1600,
            uploadTime: '5 days ago',
            category: ['SEXO ORAL', 'PRAIA'],
            videoUrl: '/videos/video14.mp4',
            premium: false,
            iframe: false
          },
          {
            id: '507f1f77bcf86cd799439025',
            title: 'Boquete Intenso com Novinha',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '3:40',
            creator: 'Cremona',
            viewCount: 1400,
            uploadTime: '5 days ago',
            category: ['BOQUETES', 'INTENSO'],
            videoUrl: '/videos/video15.mp4',
            premium: false,
            iframe: false
          },
          {
            id: '507f1f77bcf86cd799439026',
            title: 'Sexo Oral Caseiro e Molhado',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '4:30',
            creator: 'Cremona',
            viewCount: 1800,
            uploadTime: '6 days ago',
            category: ['SEXO ORAL', 'CASEIRO'],
            videoUrl: '/videos/video16.mp4',
            premium: false,
            iframe: false
          },
          {
            id: '507f1f77bcf86cd799439027',
            title: 'Novinha Fazendo Boquete Profundo',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '3:15',
            creator: 'Cremona',
            viewCount: 1500,
            uploadTime: '6 days ago',
            category: ['BOQUETES', 'PROFUNDO'],
            videoUrl: '/videos/video17.mp4',
            premium: false,
            iframe: false
          },
          {
            id: '507f1f77bcf86cd799439028',
            title: 'Magrinha Fazendo Sexo Oral Intenso',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '4:20',
            creator: 'Cremona',
            viewCount: 1700,
            uploadTime: '1 week ago',
            category: ['SEXO ORAL', 'INTENSO'],
            videoUrl: '/videos/video18.mp4',
            premium: false,
            iframe: false
          },
          {
            id: '507f1f77bcf86cd799439029',
            title: 'Boquete Molhado com Novinha',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '3:50',
            creator: 'Cremona',
            viewCount: 1300,
            uploadTime: '1 week ago',
            category: ['BOQUETES', 'MOLHADO'],
            videoUrl: '/videos/video19.mp4',
            premium: false,
            iframe: false
          },
          {
            id: '507f1f77bcf86cd799439030',
            title: 'Sexo Oral na Praia com Magrinha',
            thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
            duration: '4:15',
            creator: 'Cremona',
            viewCount: 1900,
            uploadTime: '1 week ago',
            category: ['SEXO ORAL', 'PRAIA'],
            videoUrl: '/videos/video20.mp4',
            premium: false,
            iframe: false
          }
        ]

      return NextResponse.json({
        videos: mockVideos,
        total: mockVideos.length
      })
    }

    // Transformar created_at em uploadTime formatado, duration em string e construir URLs completas
    const videosWithFormattedTime = relatedVideos.map(video => ({
      ...video,
      thumbnailUrl: buildMediaUrl(video.thumbnailUrl),
      videoUrl: buildMediaUrl(video.videoUrl),
      duration: video.duration ? `${Math.floor(video.duration / 60)}:${String(Math.floor(video.duration % 60)).padStart(2, '0')}` : '0:00',
      uploadTime: formatRelativeTime(video.created_at)
    }))

    return NextResponse.json({
      videos: videosWithFormattedTime,
      total: videosWithFormattedTime.length
    })

  } catch (error) {
    console.error('Erro ao buscar vídeos relacionados:', error)
    
         // Fallback com dados mock em caso de erro
     const fallbackVideos = [
       {
         id: '507f1f77bcf86cd799439011',
         title: 'Novinha em Biquíni na Praia - Vídeo Sensual',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '2:15',
         creator: 'Cremona',
         viewCount: 1200,
         uploadTime: '2 hours ago',
         category: ['BOQUETES', 'MAGRINHA'],
         videoUrl: '/videos/video1.mp4',
         premium: false,
         iframe: false
       },
       {
         id: '507f1f77bcf86cd799439012',
         title: 'Magrinha Fazendo Boquete Caseiro',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '3:42',
         creator: 'Cremona',
         viewCount: 890,
         uploadTime: '4 hours ago',
         category: ['BOQUETES', 'CASEIRO'],
         videoUrl: '/videos/video2.mp4',
         premium: false,
         iframe: false
       },
       {
         id: '507f1f77bcf86cd799439013',
         title: 'Sexo Oral Intenso com Novinha',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '4:20',
         creator: 'Cremona',
         viewCount: 1500,
         uploadTime: '6 hours ago',
         category: ['SEXO ORAL', 'NOVINHA'],
         videoUrl: '/videos/video3.mp4',
         premium: false,
         iframe: false
       },
       {
         id: '507f1f77bcf86cd799439014',
         title: 'Boquete Profundo e Molhado',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '3:15',
         creator: 'Cremona',
         viewCount: 2100,
         uploadTime: '8 hours ago',
         category: ['BOQUETES', 'PROFUNDO'],
         videoUrl: '/videos/video4.mp4',
         premium: false,
         iframe: false
       },
       {
         id: '507f1f77bcf86cd799439015',
         title: 'Novinha Fazendo Sexo Oral',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '5:30',
         creator: 'Cremona',
         viewCount: 1800,
         uploadTime: '12 hours ago',
         category: ['SEXO ORAL', 'NOVINHA'],
         videoUrl: '/videos/video5.mp4',
         premium: false,
         iframe: false
       },
       {
         id: '507f1f77bcf86cd799439016',
         title: 'Magrinha Fazendo Sexo Oral Profundo',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '4:45',
         creator: 'Cremona',
         viewCount: 1600,
         uploadTime: '1 day ago',
         category: ['SEXO ORAL', 'MAGRINHA'],
         videoUrl: '/videos/video6.mp4',
         premium: false,
         iframe: false
       },
       {
         id: '507f1f77bcf86cd799439017',
         title: 'Boquete Caseiro com Novinha',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '3:20',
         creator: 'Cremona',
         viewCount: 1100,
         uploadTime: '1 day ago',
         category: ['BOQUETES', 'CASEIRO'],
         videoUrl: '/videos/video7.mp4',
         premium: false,
         iframe: false
       },
       {
         id: '507f1f77bcf86cd799439018',
         title: 'Sexo Oral Intenso e Molhado',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '5:15',
         creator: 'Cremona',
         viewCount: 1900,
         uploadTime: '2 days ago',
         category: ['SEXO ORAL', 'INTENSO'],
         videoUrl: '/videos/video8.mp4',
         premium: false,
         iframe: false
       },
       {
         id: '507f1f77bcf86cd799439019',
         title: 'Novinha Fazendo Boquete na Praia',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '2:55',
         creator: 'Cremona',
         viewCount: 1400,
         uploadTime: '2 days ago',
         category: ['BOQUETES', 'PRAIA'],
         videoUrl: '/videos/video9.mp4',
         premium: false,
         iframe: false
       },
       {
         id: '507f1f77bcf86cd799439020',
         title: 'Magrinha Fazendo Sexo Oral Caseiro',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '4:10',
         creator: 'Cremona',
         viewCount: 1700,
         uploadTime: '3 days ago',
         category: ['SEXO ORAL', 'MAGRINHA'],
         videoUrl: '/videos/video10.mp4',
         premium: false,
         iframe: false
       },
       {
         id: '507f1f77bcf86cd799439021',
         title: 'Boquete Profundo com Novinha',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '3:35',
         creator: 'Cremona',
         viewCount: 1300,
         uploadTime: '3 days ago',
         category: ['BOQUETES', 'PROFUNDO'],
         videoUrl: '/videos/video11.mp4',
         premium: false,
         iframe: false
       },
       {
         id: '507f1f77bcf86cd799439022',
         title: 'Sexo Oral Molhado e Intenso',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '4:50',
         creator: 'Cremona',
         viewCount: 2000,
         uploadTime: '4 days ago',
         category: ['SEXO ORAL', 'MOLHADO'],
         videoUrl: '/videos/video12.mp4',
         premium: false,
         iframe: false
       },
       {
         id: '507f1f77bcf86cd799439023',
         title: 'Novinha Fazendo Boquete Caseiro',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '3:25',
         creator: 'Cremona',
         viewCount: 1200,
         uploadTime: '4 days ago',
         category: ['BOQUETES', 'CASEIRO'],
         videoUrl: '/videos/video13.mp4',
         premium: false,
         iframe: false
       },
       {
         id: '507f1f77bcf86cd799439024',
         title: 'Magrinha Fazendo Sexo Oral na Praia',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '4:05',
         creator: 'Cremona',
         viewCount: 1600,
         uploadTime: '5 days ago',
         category: ['SEXO ORAL', 'PRAIA'],
         videoUrl: '/videos/video14.mp4',
         premium: false,
         iframe: false
       },
       {
         id: '507f1f77bcf86cd799439025',
         title: 'Boquete Intenso com Novinha',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '3:40',
         creator: 'Cremona',
         viewCount: 1400,
         uploadTime: '5 days ago',
         category: ['BOQUETES', 'INTENSO'],
         videoUrl: '/videos/video15.mp4',
         premium: false,
         iframe: false
       },
       {
         id: '507f1f77bcf86cd799439026',
         title: 'Sexo Oral Caseiro e Molhado',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '4:30',
         creator: 'Cremona',
         viewCount: 1800,
         uploadTime: '6 days ago',
         category: ['SEXO ORAL', 'CASEIRO'],
         videoUrl: '/videos/video16.mp4',
         premium: false,
         iframe: false
       },
       {
         id: '507f1f77bcf86cd799439027',
         title: 'Novinha Fazendo Boquete Profundo',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '3:15',
         creator: 'Cremona',
         viewCount: 1500,
         uploadTime: '6 days ago',
         category: ['BOQUETES', 'PROFUNDO'],
         videoUrl: '/videos/video17.mp4',
         premium: false,
         iframe: false
       },
       {
         id: '507f1f77bcf86cd799439028',
         title: 'Magrinha Fazendo Sexo Oral Intenso',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '4:20',
         creator: 'Cremona',
         viewCount: 1700,
         uploadTime: '1 week ago',
         category: ['SEXO ORAL', 'INTENSO'],
         videoUrl: '/videos/video18.mp4',
         premium: false,
         iframe: false
       },
       {
         id: '507f1f77bcf86cd799439029',
         title: 'Boquete Molhado com Novinha',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '3:50',
         creator: 'Cremona',
         viewCount: 1300,
         uploadTime: '1 week ago',
         category: ['BOQUETES', 'MOLHADO'],
         videoUrl: '/videos/video19.mp4',
         premium: false,
         iframe: false
       },
       {
         id: '507f1f77bcf86cd799439030',
         title: 'Sexo Oral na Praia com Magrinha',
         thumbnailUrl: 'https://medias.cornosbrasilvip.com/uploads/thumb/622a46f7-feba-4157-bc7a-d95c55f18f74.png',
         duration: '4:15',
         creator: 'Cremona',
         viewCount: 1900,
         uploadTime: '1 week ago',
         category: ['SEXO ORAL', 'PRAIA'],
         videoUrl: '/videos/video20.mp4',
         premium: false,
         iframe: false
       }
     ]

    return NextResponse.json({
      videos: fallbackVideos,
      total: fallbackVideos.length
    })
  }
} 