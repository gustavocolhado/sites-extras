const axios = require('axios')

async function testPremiumCache() {
  try {
    console.log('🔍 Testando otimização do cache premium...')
    
    // Primeira chamada - deve fazer requisição
    console.log('\n📞 Primeira chamada:')
    const start1 = Date.now()
    const response1 = await axios.get('http://localhost:3000/api/user/premium-status')
    const time1 = Date.now() - start1
    console.log(`⏱️ Tempo: ${time1}ms`)
    console.log('Status:', response1.status)
    console.log('Data:', response1.data)
    
    // Segunda chamada - deve usar cache
    console.log('\n📞 Segunda chamada (deve usar cache):')
    const start2 = Date.now()
    const response2 = await axios.get('http://localhost:3000/api/user/premium-status')
    const time2 = Date.now() - start2
    console.log(`⏱️ Tempo: ${time2}ms`)
    console.log('Status:', response2.status)
    console.log('Data:', response2.data)
    
    // Terceira chamada - deve usar cache
    console.log('\n📞 Terceira chamada (deve usar cache):')
    const start3 = Date.now()
    const response3 = await axios.get('http://localhost:3000/api/user/premium-status')
    const time3 = Date.now() - start3
    console.log(`⏱️ Tempo: ${time3}ms`)
    console.log('Status:', response3.status)
    console.log('Data:', response3.data)
    
    console.log('\n📊 Resumo:')
    console.log(`Primeira chamada: ${time1}ms`)
    console.log(`Segunda chamada: ${time2}ms`)
    console.log(`Terceira chamada: ${time3}ms`)
    
    if (time2 < time1 && time3 < time1) {
      console.log('✅ Cache funcionando corretamente!')
    } else {
      console.log('⚠️ Cache pode não estar funcionando como esperado')
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar cache:')
    if (error.response) {
      console.log('Status:', error.response.status)
      console.log('Data:', error.response.data)
    } else {
      console.log('Erro:', error.message)
    }
  }
}

testPremiumCache()
