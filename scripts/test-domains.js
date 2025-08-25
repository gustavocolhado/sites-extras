// Simular as configurações de domínio para teste
const domainConfigs = {
  'confissoesdecorno.com': {
    name: 'Confissões de Corno',
    title: 'CONFISSÕES DE CORNO - Histórias Reais de Cornos Brasileiros',
    description: 'Confissões reais de cornos brasileiros. Histórias verdadeiras de traição, sexo amador e confissões íntimas. CONFISSÕES DE CORNO - O site das confissões mais quentes.',
    keywords: [
      'confissões de corno',
      'histórias de corno',
      'confissões reais',
      'traição brasileira',
      'sexo amador',
      'confissões íntimas',
      'cornos brasileiros',
      'histórias reais',
      'confissões quentes',
      'traição real'
    ],
    logo: '/imgs/logo-confissoes.png',
    favicon: '/favicon-confissoes.png',
    primaryColor: '#e74c3c',
    theme: 'dark',
    canonical: 'https://confissoesdecorno.com',
    ogImage: '/imgs/og-confissoes.jpg',
    siteName: 'CONFISSÕES DE CORNO'
  },
  'cornosbrasil.com': {
    name: 'Cornos Brasil',
    title: 'CORNOS BRASIL - Videos Porno de Sexo Amador | Corno Videos',
    description: 'Videos porno de sexo amador brasileiro. Assista videos de corno, porno amador, videos porno grátis. CORNOS BRASIL - O melhor site de videos porno amador do Brasil.',
    keywords: [
      'videos porno',
      'porno amador',
      'videos de corno',
      'cornos brasil',
      'sexo amador',
      'videos porno grátis',
      'porno brasileiro',
      'videos de sexo',
      'amador porno',
      'videos porno amador',
      'cornos videos',
      'porno corno',
      'videos de sexo amador',
      'porno grátis',
      'videos porno brasileiro'
    ],
    logo: '/imgs/logo.png',
    favicon: '/favicon.png',
    primaryColor: '#e74c3c',
    theme: 'dark',
    canonical: 'https://cornosbrasil.com',
    ogImage: '/imgs/logo.png',
    siteName: 'CORNOS BRASIL'
  }
}

function getDomainConfig(hostname) {
  // Remove port and protocol
  const domain = hostname.replace(/:\d+$/, '').toLowerCase()
  
  // Check if we have a config for this domain
  if (domainConfigs[domain]) {
    return domainConfigs[domain]
  }
  
  // Default fallback to cornosbrasil.com
  return domainConfigs['cornosbrasil.com']
}

console.log('=== TESTE DO SISTEMA DE DOMÍNIOS ===\n')

// Listar todos os domínios configurados
console.log('Domínios configurados:')
Object.keys(domainConfigs).forEach((domain, index) => {
  const config = domainConfigs[domain]
  console.log(`${index + 1}. ${domain}`)
  console.log(`   Nome: ${config.name}`)
  console.log(`   Site: ${config.siteName}`)
  console.log(`   Cor: ${config.primaryColor}`)
  console.log(`   Canonical: ${config.canonical}`)
  console.log('')
})

// Testar função getDomainConfig
console.log('=== TESTE DA FUNÇÃO getDomainConfig ===\n')

const testDomains = [
  'confissoesdecorno.com',
  'cornosbrasil.com',
  'dominio-inexistente.com' // Teste de fallback
]

testDomains.forEach(domain => {
  const config = getDomainConfig(domain)
  console.log(`Domínio: ${domain}`)
  console.log(`  Config encontrada: ${config ? 'SIM' : 'NÃO'}`)
  if (config) {
    console.log(`  Site: ${config.siteName}`)
    console.log(`  Título: ${config.title.substring(0, 50)}...`)
    console.log(`  Cor: ${config.primaryColor}`)
  }
  console.log('')
})

console.log('=== TESTE CONCLUÍDO ===')
