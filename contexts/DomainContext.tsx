'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getDomainConfig, getCurrentDomain, type DomainConfig } from '@/config/domains'

interface DomainContextType {
  domainConfig: DomainConfig | null
  currentDomain: string
  isLoading: boolean
}

const DomainContext = createContext<DomainContextType>({
  domainConfig: null,
  currentDomain: '',
  isLoading: true
})

export function DomainProvider({ children }: { children: React.ReactNode }) {
  const [domainConfig, setDomainConfig] = useState<DomainConfig | null>(null)
  const [currentDomain, setCurrentDomain] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const domain = getCurrentDomain()
    const config = getDomainConfig(domain)
    
    setCurrentDomain(domain)
    setDomainConfig(config)
    setIsLoading(false)
  }, [])

  return (
    <DomainContext.Provider value={{ domainConfig, currentDomain, isLoading }}>
      {children}
    </DomainContext.Provider>
  )
}

export function useDomainContext() {
  const context = useContext(DomainContext)
  if (!context) {
    throw new Error('useDomainContext must be used within a DomainProvider')
  }
  return context
}
