const axios = require('axios')

async function testPremiumStatus() {
  try {
    console.log('🔍 Testando API de status premium...')
    
    const response = await axios.get('http://localhost:3000/api/user/premium-status')
    
    console.log('✅ Resposta da API:')
    console.log('Status:', response.status)
    console.log('Data:', response.data)
    
  } catch (error) {
    console.error('❌ Erro ao testar API:')
    if (error.response) {
      console.log('Status:', error.response.status)
      console.log('Data:', error.response.data)
    } else {
      console.log('Erro:', error.message)
    }
  }
}

testPremiumStatus()
