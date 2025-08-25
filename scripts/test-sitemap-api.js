const axios = require('axios')

async function testSitemapAPI() {
  try {
    console.log('🔍 Testando sitemap como API route...')
    
    const response = await axios.get('http://localhost:3000/api/sitemap', {
      headers: {
        'Accept': 'application/xml'
      }
    })
    
    console.log('✅ Sitemap gerado com sucesso!')
    console.log('Status:', response.status)
    console.log('Content-Type:', response.headers['content-type'])
    console.log('Tamanho:', response.data.length, 'caracteres')
    
    // Mostrar as primeiras linhas do XML
    const lines = response.data.split('\n').slice(0, 20)
    console.log('\n📄 Primeiras linhas do sitemap:')
    lines.forEach(line => console.log(line))
    
    // Contar URLs
    const urlMatches = response.data.match(/<url>/g)
    const urlCount = urlMatches ? urlMatches.length : 0
    console.log(`\n📊 Total de URLs no sitemap: ${urlCount}`)
    
    // Verificar se contém vídeos
    if (response.data.includes('/video/')) {
      console.log('✅ Sitemap contém URLs de vídeos')
    } else {
      console.log('⚠️ Sitemap não contém URLs de vídeos')
    }
    
    // Verificar se contém categorias
    if (response.data.includes('/categories/')) {
      console.log('✅ Sitemap contém URLs de categorias')
    } else {
      console.log('⚠️ Sitemap não contém URLs de categorias')
    }
    
    // Verificar se contém tags
    if (response.data.includes('/tag/')) {
      console.log('✅ Sitemap contém URLs de tags')
    } else {
      console.log('⚠️ Sitemap não contém URLs de tags')
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar sitemap:')
    if (error.response) {
      console.log('Status:', error.response.status)
      console.log('Data:', error.response.data)
    } else {
      console.log('Erro:', error.message)
    }
  }
}

testSitemapAPI()
