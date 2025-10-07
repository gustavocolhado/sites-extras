'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import AgeVerificationModal from './AgeVerificationModal'

interface AgeVerificationWrapperProps {
  children: React.ReactNode
}

export default function AgeVerificationWrapper({ children }: AgeVerificationWrapperProps) {
  const [isAgeVerified, setIsAgeVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    // Se estiver na página da campanha, pular a verificação
    if (pathname === '/c') {
      setIsAgeVerified(true)
      setIsLoading(false)
      return
    }

    // Verificar se o usuário já confirmou a idade
    const hasConfirmedAge = localStorage.getItem('ageConfirmed')
    
    if (hasConfirmedAge) {
      setIsAgeVerified(true)
    }
    
    setIsLoading(false)
  }, [pathname])

  const handleAgeConfirm = () => {
    setIsAgeVerified(true)
  }

  // Mostrar loading enquanto verifica o localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-theme-primary">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se a idade não foi verificada, mostrar o modal
  if (!isAgeVerified) {
    return <AgeVerificationModal onConfirm={handleAgeConfirm} />
  }

  // Se a idade foi verificada, mostrar o conteúdo normal
  return <>{children}</>
}
