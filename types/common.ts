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
  name: string | null
  username: string | null
  email: string | null
  password: string | null
  emailVerified: Date | null
  image: string | null
  resetToken: string | null
  resetTokenExpiration: Date | null
  access: number
  premium: boolean
  paymentId: number | null
  preferenceId: string | null
  paymentQrCodeUrl: string | null
  paymentStatus: string | null
  paymentType: string | null
  promotionId: string | null
  affiliateId: string | null
  chavePix: string | null
  promotionCode: string | null
  signupSource: string | null
  tempPassword: boolean
  needsPasswordChange: boolean | null
  acceptPromotionalEmails: boolean
  acceptTermsOfUse: boolean
  lastEmailSent: Date | null
  created_at: Date | null
  update_at: Date | null
  paymentDate: Date | null
  expireDate: Date | null
  isCampaignPayment: boolean | null // Adicionado para indicar se o pagamento foi por campanha
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}
