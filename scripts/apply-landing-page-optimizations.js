const fs = require('fs');
const path = require('path');

// Caminho para o arquivo LandingPage.tsx
const filePath = path.join(__dirname, '..', 'components', 'LandingPage.tsx');

console.log('🔧 Aplicando otimizações na LandingPage.tsx...');

try {
  // Ler o arquivo
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Aplicar correções
  const corrections = [
    {
      from: '}, 60000); // Verificar a cada 60 segundos (respeitando limite da PushinPay)',
      to: '}, 15000); // Verificar a cada 15 segundos (mais rápido)'
    },
    {
      from: '}, 30000); // Aguardar 30 segundos antes de começar',
      to: '}, 10000); // Aguardar apenas 10 segundos antes de começar'
    },
    {
      from: '}, 10000); // Verificar a cada 10 segundos',
      to: '}, 5000); // Verificar a cada 5 segundos (mais rápido)'
    },
    {
      from: '}, 10000); // Aguardar 10 segundos antes de começar',
      to: '}, 3000); // Aguardar apenas 3 segundos antes de começar'
    },
    {
      from: '}, 10000); // Aguardar 10 segundos',
      to: '}, 3000); // Aguardar apenas 3 segundos'
    },
    {
      from: '}, 5000);',
      to: '}, 2000); // Aguardar apenas 2 segundos'
    }
  ];
  
  let changesApplied = 0;
  
  corrections.forEach((correction, index) => {
    if (content.includes(correction.from)) {
      content = content.replace(correction.from, correction.to);
      changesApplied++;
      console.log(`✅ Correção ${index + 1} aplicada`);
    } else {
      console.log(`⚠️ Correção ${index + 1} não encontrada: ${correction.from}`);
    }
  });
  
  // Salvar o arquivo
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log(`\n🎉 Otimizações aplicadas com sucesso!`);
  console.log(`📊 Total de correções: ${changesApplied}/${corrections.length}`);
  
  if (changesApplied === corrections.length) {
    console.log('✅ Todas as otimizações foram aplicadas!');
  } else {
    console.log('⚠️ Algumas correções não foram encontradas. Verifique o arquivo manualmente.');
  }
  
} catch (error) {
  console.error('❌ Erro ao aplicar otimizações:', error.message);
}
