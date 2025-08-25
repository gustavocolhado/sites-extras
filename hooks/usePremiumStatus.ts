import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface PremiumStatus {
  isPremium: boolean
  premiumExpiresAt: string | null
  message: string
}

/**
 * Hook para verificar o status premium do usuário usando dados da sessão
 * Não faz chamadas para API - usa apenas dados da sessão do NextAuth
 */
export function usePremiumStatus() {
  const { data: session, status } = useSession()
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({
    isPremium: false,
    premiumExpiresAt: null,
    message: 'Verificando status...'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    // Se não está autenticado
    if (status === 'unauthenticated') {
      setPremiumStatus({
        isPremium: false,
        premiumExpiresAt: null,
        message: 'Usuário não autenticado'
      })
      setLoading(false)
      return
    }

    // Verificar status premium usando dados da sessão
    if (session?.user) {
      const user = session.user
      const now = new Date()
      
      // Verificar se é premium e se não expirou
      const isPremium = user.premium && (!user.expireDate || new Date(user.expireDate) > now)
      


      setPremiumStatus({
        isPremium,
        premiumExpiresAt: user.expireDate ? new Date(user.expireDate).toISOString() : null,
        message: isPremium ? 'Usuário premium ativo' : 'Usuário não premium'
      })
    } else {
      setPremiumStatus({
        isPremium: false,
        premiumExpiresAt: null,
        message: 'Usuário não encontrado'
      })
    }

    setLoading(false)
  }, [session, status])

  return {
    ...premiumStatus,
    loading
  }
}

/**
 * Hook utilitário para verificação rápida de premium
 * Retorna apenas boolean - ideal para verificações simples
 */
export function useIsPremium(): boolean {
  const { data: session, status } = useSession()
  
  if (status === 'loading' || status === 'unauthenticated' || !session?.user) {
    return false
  }
  
  const user = session.user
  const now = new Date()
  
  return user.premium && (!user.expireDate || new Date(user.expireDate) > now)
}

/**
 * Função utilitária para verificar se um usuário é premium
 * Pode ser usada fora de componentes React
 */
export function checkPremiumStatus(user: any): boolean {
  if (!user) return false
  
  const now = new Date()
  return user.premium && (!user.expireDate || new Date(user.expireDate) > now)
}

// Função para limpar o cache (mantida para compatibilidade, mas agora não faz nada)
export function clearPremiumStatusCache() {
  // Cache não aplicável - usando dados da sessão
} 