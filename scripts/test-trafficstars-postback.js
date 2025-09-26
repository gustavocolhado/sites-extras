#!/usr/bin/env node

/**
 * Script para testar o postback diretamente para o TrafficStars
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

async function testTrafficStarsPostback() {
  console.log('🧪 Testando postback direto para TrafficStars...\n')

  // Dados de teste baseados na sua URL
  const testData = {
    value: '29.90',
    clickid: 'dXNlcl9pZF8yNjY5NjlfcWEwZWp2RXZ0dU9YbUdzaHlvTWhSclR3UXR2dklIMUtGQXRCWGZORUliaUJrZ0g2Sm5tZVAwT1NZdEgzcng0Zk9zYlVudUxDSkJ2SHM0b3hmVVJLVTN0a3BCcGl0YVN5Rmg2clhtdTg5eXR6VVphVGpPRHZIbmY1_test_postback',
    key: 'GODOiGyqwq6r1PxUDZTPjkyoyTeocItpUE7K',
    goalid: '0'
  }

  try {
    // Teste 1: Postback direto para TrafficStars
    console.log('1️⃣ Testando postback direto para TrafficStars...')
    const postbackUrl = `https://tsyndicate.com/api/v1/cpa/action?value=${testData.value}&clickid=${testData.clickid}&key=${testData.key}&goalid=${testData.goalid}`
    
    console.log('📡 URL do postback:', postbackUrl)
    
    const response = await fetch(postbackUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'CPA-Tracking-Test/1.0'
      }
    })

    console.log('📊 Resposta do TrafficStars:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    })

    const responseText = await response.text()
    console.log('📄 Conteúdo da resposta:', responseText)

    if (response.ok) {
      console.log('✅ Postback direto funcionou!')
    } else {
      console.log('❌ Postback direto falhou')
    }

  } catch (error) {
    console.log('❌ Erro no postback direto:', error.message)
  }

  try {
    // Teste 2: Usar nossa API de teste
    console.log('\n2️⃣ Testando nossa API de teste...')
    const testResponse = await fetch(`${BASE_URL}/api/trafficstars/test?clickid=${testData.clickid}&value=${testData.value}`)
    const testData_result = await testResponse.json()
    
    console.log('📊 Resultado da API de teste:', testData_result)

  } catch (error) {
    console.log('❌ Erro na API de teste:', error.message)
  }

  console.log('\n🔍 Possíveis problemas:')
  console.log('1. ClickId pode estar inválido ou expirado')
  console.log('2. Chave do TrafficStars pode estar incorreta')
  console.log('3. URL do postback pode estar errada')
  console.log('4. TrafficStars pode estar rejeitando o postback')
  console.log('5. Problemas de CORS ou rede')
  
  console.log('\n📋 Próximos passos:')
  console.log('• Verificar se o clickId é válido no painel do TrafficStars')
  console.log('• Confirmar a chave e URL do postback')
  console.log('• Verificar logs do TrafficStars para ver se recebeu o postback')
  console.log('• Testar com um clickId diferente')
}

// Executar teste
testTrafficStarsPostback().catch(console.error)
