// Script para testar se NEXT_PUBLIC_MEDIA_URL está sendo carregada
require('dotenv').config()

console.log('🔍 Testando variáveis de ambiente...\n')

// Verificar se a variável existe
const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL
console.log('📊 NEXT_PUBLIC_MEDIA_URL:', mediaUrl)
console.log('📊 Tipo:', typeof mediaUrl)
console.log('📊 Existe:', !!mediaUrl)
console.log('📊 Comprimento:', mediaUrl ? mediaUrl.length : 0)

if (mediaUrl) {
  console.log('✅ Variável encontrada!')
  console.log('🔗 URL completa:', mediaUrl)
  
  // Testar construção de URL
  const testUrl = 'thumbnails/video1.jpg'
  const cleanMediaUrl = mediaUrl.endsWith('/') ? mediaUrl.slice(0, -1) : mediaUrl
  const cleanThumbnailUrl = testUrl.startsWith('/') ? testUrl : `/${testUrl}`
  const fullUrl = `${cleanMediaUrl}${cleanThumbnailUrl}`
  
  console.log('\n🧪 Teste de construção de URL:')
  console.log('   URL original:', testUrl)
  console.log('   Media URL limpa:', cleanMediaUrl)
  console.log('   Thumbnail URL limpa:', cleanThumbnailUrl)
  console.log('   URL final:', fullUrl)
} else {
  console.log('❌ Variável não encontrada!')
  console.log('\n💡 Soluções:')
  console.log('   1. Verifique se o arquivo .env.local existe')
  console.log('   2. Verifique se NEXT_PUBLIC_MEDIA_URL está definida')
  console.log('   3. Reinicie o servidor após adicionar a variável')
  console.log('   4. Verifique se não há espaços extras na definição')
}

// Verificar outras variáveis relacionadas
console.log('\n📋 Outras variáveis de ambiente:')
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ Não configurada')
console.log('   NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Configurada' : '❌ Não configurada')
console.log('   NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? '✅ Configurada' : '❌ Não configurada')

console.log('\n🎉 Teste concluído!')
