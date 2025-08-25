'use client'

import { useEffect, useState } from 'react'
import { getDomainConfig, getCurrentDomain, type DomainConfig } from '@/config/domains'

export function useDomain() {
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

  return {
    domainConfig,
    currentDomain,
    isLoading
  }
}

export function useDomainConfig() {
  const { domainConfig } = useDomain()
  return domainConfig
}
