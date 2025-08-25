import { useState, useEffect } from 'react'

interface RelatedVideo {
  id: string
  title: string
  thumbnailUrl: string
  duration: string
  creator: string
  viewCount: number
  uploadTime: string
  category: string[]
  videoUrl?: string
  premium?: boolean
  iframe?: boolean
}

interface UseRelatedVideosOptions {
  videoId: string
  limit?: number
  autoLoad?: boolean
}

export function useRelatedVideos(options: UseRelatedVideosOptions) {
   const { videoId, limit = 20, autoLoad = true } = options
  
  const [videos, setVideos] = useState<RelatedVideo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRelatedVideos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/videos/${videoId}/related?limit=${limit}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar vídeos relacionados')
      }
      
      const data = await response.json()
      setVideos(data.videos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
             // Fallback para dados mock
              setVideos([
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
        ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoLoad && videoId) {
      fetchRelatedVideos()
    }
  }, [videoId, autoLoad])

  return {
    videos,
    loading,
    error,
    refetch: fetchRelatedVideos
  }
} 