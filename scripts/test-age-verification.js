/**
 * Script para testar a verificação de idade
 * Execute: node scripts/test-age-verification.js
 */

console.log('🧪 Testando verificação de idade...\n')

// Simular localStorage
const localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null
  },
  setItem(key, value) {
    this.data[key] = value
    console.log(`✅ localStorage.setItem('${key}', '${value}')`)
  },
  removeItem(key) {
    delete this.data[key]
    console.log(`🗑️ localStorage.removeItem('${key}')`)
  }
}

// Simular window
global.window = {
  localStorage
}

// Importar funções
const { hasConfirmedAge, confirmAge, resetAgeConfirmation } = require('../utils/ageVerification.ts')

console.log('📋 Teste 1: Verificar estado inicial')
console.log('Estado inicial:', hasConfirmedAge() ? 'Confirmado' : 'Não confirmado')

console.log('\n📋 Teste 2: Confirmar idade')
confirmAge()
console.log('Estado após confirmação:', hasConfirmedAge() ? 'Confirmado' : 'Não confirmado')

console.log('\n📋 Teste 3: Resetar confirmação')
resetAgeConfirmation()
console.log('Estado após reset:', hasConfirmedAge() ? 'Confirmado' : 'Não confirmado')

console.log('\n✅ Testes concluídos!')
console.log('\n💡 Para testar no navegador:')
console.log('1. Abra o console do navegador')
console.log('2. Execute: localStorage.removeItem("ageConfirmed")')
console.log('3. Recarregue a página')
console.log('4. O modal de verificação de idade deve aparecer')
