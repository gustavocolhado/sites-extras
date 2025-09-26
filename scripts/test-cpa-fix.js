#!/usr/bin/env node

/**
 * Script para testar a correção do erro de ObjectId no CPA tracking
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

async function testCPAFix() {
  console.log('🧪 Testando correção do erro de ObjectId...\n')

  try {
    // Teste 1: Tentar conversão com email (deve funcionar agora)
    console.log('1️⃣ Testando conversão com email...')
    const response = await fetch(`${BASE_URL}/api/campaigns/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'testando10332@gmail.com', // Email em vez de ObjectId
        source: 'cpa-01',
        campaign: 'trafficstars',
        planId: 'monthly',
        amount: 29.90
      })
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Conversão com email funcionando:', data)
    } else {
      console.log('❌ Erro na conversão com email:', data)
    }
  } catch (error) {
    console.log('❌ Erro ao testar conversão com email:', error.message)
  }

  try {
    // Teste 2: Tentar conversão com ObjectId (deve continuar funcionando)
    console.log('\n2️⃣ Testando conversão com ObjectId...')
    const response = await fetch(`${BASE_URL}/api/campaigns/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: '68d46b0735f7f9e3ba0bd86e', // ObjectId válido
        source: 'cpa-01',
        campaign: 'trafficstars',
        planId: 'monthly',
        amount: 29.90
      })
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Conversão com ObjectId funcionando:', data)
    } else {
      console.log('❌ Erro na conversão com ObjectId:', data)
    }
  } catch (error) {
    console.log('❌ Erro ao testar conversão com ObjectId:', error.message)
  }

  console.log('\n🎯 Teste concluído!')
  console.log('\n📋 O que foi corrigido:')
  console.log('• Sistema agora detecta se userId é email ou ObjectId')
  console.log('• Se for email, busca o usuário no banco e usa o ObjectId')
  console.log('• Se for ObjectId, usa diretamente')
  console.log('• Elimina o erro "Malformed ObjectID"')
}

// Executar teste
testCPAFix().catch(console.error)
