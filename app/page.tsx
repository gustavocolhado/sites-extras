'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Layout from '@/components/Layout'
import Header from '@/components/Header'
import Creators from '@/components/Creators'
import VideoSection from '@/components/VideoSection'
import PremiumBanner from '@/components/PremiumBanner'
import SEOHead from '@/components/SEOHead'
import AdIframe728x90 from '@/components/ads/728x90'
import AdIframe300x100 from '@/components/ads/300x100'
import SetPasswordModal from '@/components/SetPasswordModal'

import { useSession } from 'next-auth/react'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import Section from '@/components/Section'
import AdIframe300x250 from '@/components/ads/300x250'

export default function Home() {
  const { data: session } = useSession()
  const { isPremium } = usePremiumStatus()
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // @ts-ignore
    if (session?.user?.needsPasswordChange && pathname === '/') {
      setShowSetPasswordModal(true)
    } else {
      setShowSetPasswordModal(false)
    }
  }, [session, pathname])

  return (
    <>
      <SEOHead 
        title="CORNOS BRASIL - Videos Porno de Sexo Amador | Corno Videos"
        description="Videos porno de sexo amador brasileiro. Assista videos de corno, porno amador, videos porno grátis. CORNOS BRASIL - O melhor site de videos porno amador do Brasil."
        keywords={[
          'videos porno',
          'porno amador',
          'videos de corno', 
          'cornos brasil',
          'sexo amador',
          'videos porno grátis',
          'porno brasileiro',
          'videos de sexo',
          'amador porno',
          'videos porno amador',
          'cornos videos',
          'porno corno',
          'videos de sexo amador',
          'porno grátis',
          'videos porno brasileiro'
        ]}
        canonical="https://cornosbrasil.com"
      />
      <Layout>
        <Header />
        <main className="min-h-screen">
          {/* Mostrar PremiumBanner apenas para usuários não premium */}
          {!session?.user?.premium && <PremiumBanner />}
                    
          <Creators />

          {!session?.user?.premium && (
            <Section>
              <div className="hidden md:flex md:justify-center">
                <AdIframe728x90 />
              </div>
              <div className="flex justify-center md:hidden">
                <AdIframe300x100 />
              </div>
            </Section>
          )}
          
          <VideoSection />

          {!session?.user?.premium && (
            <Section>
              <div className="hidden md:flex md:justify-center">
                <AdIframe728x90 />
              </div>
              <div className="flex justify-center md:hidden">
                <AdIframe300x100 />
              </div>
            </Section>
          )}
          {/* SEO Content Section */}
          <Section className="bg-theme-card py-8 px-4">
            <div className="container w-full">
              <h1 className="text-sm font-bold text-theme-primary mb-4">
                CORNOS BRASIL - Videos Porno de Sexo Amador
              </h1>
              <div className="prose prose-lg text-theme-secondary">
                <p className="mb-2 text-xs">
                  Bem-vindo ao <strong>CORNOS BRASIL</strong>, o melhor site de <strong>videos porno amador</strong> do Brasil. 
                  Aqui você encontra uma vasta coleção de <strong>videos de corno</strong>, <strong>porno amador</strong> e 
                  <strong>videos porno grátis</strong> de alta qualidade.
                </p>
                <p className="mb-2 text-xs">
                  Nossa plataforma oferece <strong>videos de sexo amador</strong> autênticos, com conteúdo brasileiro 
                  e internacional. Assista <strong>videos porno</strong> sem interrupções e descubra o melhor do 
                  <strong>porno brasileiro</strong>.
                </p>
                <p className="mb-2 text-xs">
                  Explore nossa coleção de <strong>videos porno amador</strong>, <strong>videos de corno</strong> e 
                  muito mais. O <strong>CORNOS BRASIL</strong> é sua fonte confiável para <strong>porno grátis </strong> 
                  e <strong>videos de sexo</strong> de qualidade.
                </p>
              </div>
            </div>
          </Section>
        
        </main>
      </Layout>
      {session?.user?.email && (
        <SetPasswordModal
          isOpen={showSetPasswordModal}
          onClose={() => setShowSetPasswordModal(false)}
          userEmail={session.user.email}
        />
      )}
    </>
  )
}
