'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { useDomainContext } from '@/contexts/DomainContext'
import Image from 'next/image'
import Link from 'next/link'

export default function Logo() {
  const { theme } = useTheme()
  const { domainConfig, isLoading } = useDomainContext()

  // Fallback to default logo if domain config is not loaded
  const logoSrc = isLoading || !domainConfig 
    ? (theme === 'dark' ? '/imgs/logo.png' : '/imgs/logo-dark.png')
    : domainConfig.logo

  const altText = isLoading || !domainConfig 
    ? 'CORNOS BRASIL'
    : domainConfig.siteName

  return (
    <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
      <Image
        src={logoSrc}
        alt={altText}
        width={180}
        height={180}
        className="w-full"
        priority
      />
    </Link>
  )
} 