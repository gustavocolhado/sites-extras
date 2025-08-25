'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { DomainProvider } from '@/contexts/DomainContext'
import AgeVerificationWrapper from './AgeVerificationWrapper'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DomainProvider>
        <ThemeProvider>
          <AuthProvider>
            <AgeVerificationWrapper>
              {children}
            </AgeVerificationWrapper>
          </AuthProvider>
        </ThemeProvider>
      </DomainProvider>
    </SessionProvider>
  )
} 