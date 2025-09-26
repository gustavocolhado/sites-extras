'use client'

import { useEffect, useState } from 'react'
import { useCPATracking } from '@/hooks/useCPATracking'

interface CPATrackingProps {
  userId?: string
  onConversion?: (success: boolean) => void
}

export default function CPATracking({ userId, onConversion }: CPATrackingProps) {
  const { isCPASource, sendConversion } = useCPATracking()
  const [isTracking, setIsTracking] = useState(false)

  useEffect(() => {
    if (isCPASource) {
      console.log('🎯 CPA Tracking ativo - aguardando conversão')
    }
  }, [isCPASource])

  const handleConversion = async (planType: string, amount: number) => {
    if (!isCPASource || !userId) {
      console.log('❌ CPA Tracking não ativo ou usuário não identificado')
      onConversion?.(false)
      return
    }

    setIsTracking(true)
    
    try {
      const success = await sendConversion(userId, planType, amount)
      
      if (success) {
        console.log('✅ Conversão CPA registrada com sucesso')
        onConversion?.(true)
      } else {
        console.log('❌ Falha ao registrar conversão CPA')
        onConversion?.(false)
      }
    } catch (error) {
      console.error('❌ Erro ao processar conversão CPA:', error)
      onConversion?.(false)
    } finally {
      setIsTracking(false)
    }
  }

  // Expor a função para uso externo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).handleCPAConversion = handleConversion
    }
  }, [userId, isCPASource])

  return null // Componente invisível
}

// Hook para usar em outros componentes
export function useCPAConversion() {
  const { isCPASource, sendConversion } = useCPATracking()

  const triggerConversion = async (userId: string, planType: string, amount: number) => {
    if (!isCPASource) {
      console.log('❌ Não é uma fonte CPA')
      return false
    }

    return await sendConversion(userId, planType, amount)
  }

  return {
    isCPASource,
    triggerConversion
  }
}
