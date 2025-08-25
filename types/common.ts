// Tipos comuns do projeto

export interface Creator {
  id: string
  name: string
  qtd: number | null
  description: string | null
  image: string | null
  created_at: string | null
  update_at: string | null
}

export interface Video {
  id: string
  title: string | null
  title_en: string | null
  title_es: string | null
  category: string[]
  description: string | null
  description_en: string | null
  description_es: string | null
  url: string
  url_en: string | null
  url_es: string | null
  viewCount: number
  likesCount: number
  videoUrl: string
  thumbnailUrl: string | null
  duration: number | null
  premium: boolean
  creator: string | null
  iframe: boolean
  trailerUrl: string | null
  created_at: string | null
  updated_at: string | null
  userId: string | null
}

export interface User {
  id: string
  email: string
  name: string | null
  password: string | null
  emailVerified: Date | null
  image: string | null
  premium: boolean
  paymentStatus: string | null
  paymentType: string | null
  paymentDate: Date | null
  expireDate: Date | null
  paymentId: string | null
  paymentQrCodeUrl: string | null
  signupSource: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}
