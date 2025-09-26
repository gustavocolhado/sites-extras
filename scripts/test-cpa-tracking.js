#!/usr/bin/env node

/**
 * Script para testar o sistema de tracking CPA do TrafficStars
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

async function testCPATracking() {
  console.log('🧪 Iniciando testes do sistema CPA Tracking...\n')

  // Teste 1: Verificar se a API de postback está funcionando
  console.log('1️⃣ Testando API de postback...')
  try {
    const postbackUrl = `${BASE_URL}/api/trafficstars/postback?value=29.90&clickid=test-click-123&key=GODOiGyqwq6r1PxUDZTPjkyoyTeocItpUE7K&goalid=0`
    const response = await fetch(postbackUrl)
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ API de postback funcionando:', data)
    } else {
      console.log('❌ Erro na API de postback:', data)
    }
  } catch (error) {
    console.log('❌ Erro ao testar API de postback:', error.message)
  }

  // Teste 2: Testar endpoint de conversões
  console.log('\n2️⃣ Testando endpoint de conversões...')
  try {
    const response = await fetch(`${BASE_URL}/api/trafficstars/conversions`)
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Endpoint de conversões funcionando:', data)
    } else {
      console.log('❌ Erro no endpoint de conversões:', data)
    }
  } catch (error) {
    console.log('❌ Erro ao testar endpoint de conversões:', error.message)
  }

  // Teste 3: Testar postback real para TrafficStars
  console.log('\n3️⃣ Testando postback real para TrafficStars...')
  try {
    const response = await fetch(`${BASE_URL}/api/trafficstars/test?clickid=test-real-123&value=29.90`)
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Postback real funcionando:', data)
    } else {
      console.log('❌ Erro no postback real:', data)
    }
  } catch (error) {
    console.log('❌ Erro ao testar postback real:', error.message)
  }

  console.log('\n🎯 Testes concluídos!')
  console.log('\n📋 URLs para testar manualmente:')
  console.log(`• Página de campanha: ${BASE_URL}/c?source=cpa-01&campaign=trafficstars&clickid=test-123`)
  console.log(`• API de postback: ${BASE_URL}/api/trafficstars/postback`)
  console.log(`• Conversões: ${BASE_URL}/api/trafficstars/conversions`)
  console.log(`• Teste: ${BASE_URL}/api/trafficstars/test`)
}

// Executar testes
testCPATracking().catch(console.error)
