'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Session } from 'next-auth'
import { useSession, signIn, signOut } from 'next-auth/react'

interface AuthContextType {
  session: Session | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  signIn: (provider: string, credentials?: any) => Promise<any>
  signOut: () => Promise<any>
  isPremium: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
  isAuthModalOpen: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [isPremium, setIsPremium] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    if (session?.user) {
      const user = session.user
      const now = new Date()
      
      // Verificar se é premium e se não expirou
      const isPremium = user.premium && (!user.expireDate || new Date(user.expireDate) > now)
      

      
      setIsPremium(isPremium)
    } else {
      setIsPremium(false)
    }
  }, [session])

  const handleSignIn = async (provider: string, credentials?: any) => {
    if (provider === 'credentials') {
      return await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        source: credentials.source || 'website',
        redirect: false,
      })
    } else {
      return await signIn(provider, { redirect: false })
    }
  }

  const handleSignOut = async () => {
    return await signOut({ redirect: false })
  }

  const openAuthModal = () => setIsAuthModalOpen(true)
  const closeAuthModal = () => setIsAuthModalOpen(false)

  const value = {
    session,
    status,
    signIn: handleSignIn,
    signOut: handleSignOut,
    isPremium,
    openAuthModal,
    closeAuthModal,
    isAuthModalOpen,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 