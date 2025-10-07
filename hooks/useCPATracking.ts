'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { convertReaisToDollars, getExchangeRate } from '@/lib/utils'

interface CPATrackingData {
  source: string | null
  campaign: string | null
  clickId: string | null
  goalId: string | null
  value: string | null
  price: string | null
  leadCode: string | null
}

const TRACKING_COOLDOWN_MINUTES = 5; // Cooldown para evitar múltiplas visitas em um curto período

export function useCPATracking() {
  console.log('✨ useCPATracking hook montado/re-renderizado.');
  const searchParams = useSearchParams()
  const [trackingData, setTrackingData] = useState<CPATrackingData | null>(null)
  const [isCPASource, setIsCPASource] = useState(false)

  useEffect(() => {
    console.log('🔄 useEffect em useCPATracking disparado.')
    const source = searchParams.get('source')
    const campaign = searchParams.get('campaign')
    const clickId = searchParams.get('clickid')
    const goalId = searchParams.get('goalid') || '0'
    const value = searchParams.get('value')
    const price = searchParams.get('price')
    const leadCode = searchParams.get('lead_code')

    console.log('🔍 Parâmetros da URL capturados:', {
      source,
      campaign,
      clickId,
      goalId,
      value,
      price,
      leadCode
    })

    // Verificar se é uma fonte CPA
    const isCPA = source?.startsWith('cpa')

    if (isCPA) {
      console.log('✅ Fonte CPA detectada!')
      console.log('📊 ClickId capturado:', clickId)

      setTrackingData({
        source,
        campaign,
        clickId,
        goalId,
        value,
        price,
        leadCode
      })
      setIsCPASource(true)

      // Usar localStorage para um controle mais robusto de tracking por campanha
      const campaignTrackingKey = `cpa_tracked_${source}_${campaign}`
      const lastTracked = localStorage.getItem(campaignTrackingKey)
      const currentTime = new Date().getTime()

      let shouldTrack = true;
      if (lastTracked) {
        const lastTrackedTime = parseInt(lastTracked, 10);
        const cooldownEndTime = lastTrackedTime + (TRACKING_COOLDOWN_MINUTES * 60 * 1000);
        if (currentTime < cooldownEndTime) {
          shouldTrack = false;
          console.log(`ℹ️ Tracking CPA para '${source}_${campaign}' ignorado. Cooldown ativo. Próximo rastreamento em: ${new Date(cooldownEndTime).toLocaleTimeString()}`);
        } else {
          console.log(`✅ Cooldown para '${source}_${campaign}' expirado. Pronto para rastrear novamente.`);
        }
      }

      if (shouldTrack) {
        console.log('🚀 Iniciando novo rastreamento de CPA...')
        // Salvar dados de tracking no localStorage para uso posterior (persistente)
        localStorage.setItem('cpa_tracking', JSON.stringify({
          source,
          campaign,
          clickId,
          goalId,
          value,
          price,
          leadCode,
          timestamp: new Date().toISOString()
        }))

        // Marcar que o tracking foi salvo, com timestamp
        localStorage.setItem(campaignTrackingKey, currentTime.toString())

        // Salvar dados de tracking no banco de dados
        saveCPATrackingToDatabase({
          source,
          campaign,
          clickId,
          goalId,
          value,
          price,
          leadCode
        })

        console.log('💾 Dados salvos no localStorage e banco de dados')
      } else {
        console.log('ℹ️ Tracking CPA já registrado recentemente para esta campanha. Ignorando chamada duplicada.')
      }
    } else {
      console.log('❌ Não é uma fonte CPA')
    }
  }, [searchParams]) // Dependência de searchParams para reavaliar se a URL mudar

  const saveCPATrackingToDatabase = async (data: {
    source: string | null
    campaign: string | null
    clickId: string | null
    goalId: string | null
    value: string | null
    price: string | null
    leadCode: string | null
  }) => {
    try {
      console.log('💾 Salvando tracking CPA no banco de dados...')

      const response = await fetch('/api/campaigns/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: data.source,
          campaign: data.campaign,
          clickId: data.clickId,
          goalId: data.goalId,
          value: data.value,
          price: data.price,
          leadCode: data.leadCode,
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          pageUrl: window.location.href,
          ipAddress: 'unknown' // Será preenchido pelo servidor
        })
      })

      if (response.ok) {
        console.log('✅ Tracking CPA salvo no banco de dados com sucesso')
      } else {
        console.error('❌ Erro ao salvar tracking CPA no banco de dados')
      }
    } catch (error) {
      console.error('❌ Erro ao salvar tracking CPA no banco de dados:', error)
    }
  }

  const sendConversion = async (userId: string, planType: string, amount: number) => {
    console.log('🔍 DEBUG - sendConversion chamado:', {
      isCPASource,
      trackingData,
      userId,
      planType,
      amount
    })

    if (!isCPASource || !trackingData) {
      console.log('❌ Não é uma fonte CPA ou dados de tracking não encontrados')
      console.log('🔍 DEBUG - Detalhes:', {
        isCPASource,
        hasTrackingData: !!trackingData,
        trackingData
      })
      return false
    }

    try {
      console.log('🎯 Iniciando processo de conversão CPA...')
      
      // Enviar conversão para o sistema interno
      const response = await fetch('/api/campaigns/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          source: trackingData.source,
          campaign: trackingData.campaign,
          planId: planType,
          amount
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Erro ao registrar conversão interna: ${errorData.error}`)
      }

      console.log('✅ Conversão interna registrada com sucesso')

      // Enviar postback para o TrafficStars
      console.log('🎯 Iniciando envio de postback para TrafficStars...')
      await sendTrafficStarsPostback(userId, planType, amount)
      
      return true
    } catch (error) {
      console.error('❌ Erro ao enviar conversão CPA:', error)
      return false
    }
  }

  const sendTrafficStarsPostback = async (userId: string, planType: string, amount: number) => {
    console.log('🔍 DEBUG - sendTrafficStarsPostback chamado:', {
      userId,
      planType,
      amount,
      trackingData
    })

    if (!trackingData?.clickId) {
      console.log('❌ ClickId não encontrado para postback')
      return
    }

    try {
      const postbackUrl = new URL('https://tsyndicate.com/api/v1/cpa/action')
      
      // Converter valor de reais para dólares
      const exchangeRate = getExchangeRate()
      const valueInDollars = convertReaisToDollars(amount, exchangeRate)
      
      console.log('💰 Conversão de moeda para postback (hook):', {
        valorOriginalBRL: amount,
        taxaCambio: exchangeRate,
        valorConvertidoUSD: valueInDollars
      })
      
      postbackUrl.searchParams.set('value', valueInDollars.toString())
      postbackUrl.searchParams.set('clickid', trackingData.clickId)
      postbackUrl.searchParams.set('key', 'GODOiGyqwq6r1PxUDZTPjkyoyTeocItpUE7K')
      postbackUrl.searchParams.set('goalid', trackingData.goalId || '0')
      
      if (trackingData.leadCode) {
        postbackUrl.searchParams.set('lead_code', trackingData.leadCode)
      }

      console.log('🎯 Enviando postback para TrafficStars:', postbackUrl.toString())
      console.log('📊 Parâmetros do postback:', {
        value: valueInDollars.toString(),
        valueOriginalBRL: amount.toString(),
        clickid: trackingData.clickId,
        key: 'GODOiGyqwq6r1PxUDZTPjkyoyTeocItpUE7K',
        goalid: trackingData.goalId || '0',
        lead_code: trackingData.leadCode
      })

      const response = await fetch(postbackUrl.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'CPA-Tracking/1.0'
        }
      })

      console.log('📡 Resposta do TrafficStars:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (response.ok) {
        const responseText = await response.text()
        console.log('✅ Postback enviado com sucesso para TrafficStars')
        console.log('📄 Resposta do TrafficStars:', responseText)
      } else {
        const errorText = await response.text()
        console.error('❌ Erro ao enviar postback para TrafficStars:', response.status)
        console.error('📄 Erro detalhado:', errorText)
      }
    } catch (error) {
      console.error('❌ Erro ao enviar postback para TrafficStars:', error)
    }
  }

  return {
    trackingData,
    isCPASource,
    sendConversion
  }
}
