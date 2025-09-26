'use client'

import LandingPage from '@/components/LandingPage'
import { useCPATracking } from '@/hooks/useCPATracking'
import { useEffect } from 'react'

export default function CampaignPage() {
  const { isCPASource, trackingData } = useCPATracking()

  useEffect(() => {
    if (isCPASource && trackingData) {
      console.log('🎯 CPA Tracking detectado:', trackingData)
      console.log('📊 ClickId específico:', trackingData.clickId)
      console.log('📊 Source específico:', trackingData.source)
      console.log('📊 Campaign específico:', trackingData.campaign)
      
      // Salvar dados de tracking para uso posterior
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cpa_tracking_data', JSON.stringify(trackingData))
        console.log('💾 Dados salvos no sessionStorage')
      }
    } else {
      console.log('❌ CPA Tracking não ativo ou dados não encontrados')
    }
  }, [isCPASource, trackingData])

  return <LandingPage />
} 