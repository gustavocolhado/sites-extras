#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Lista de domínios e suas logos correspondentes
const domainLogos = [
  { domain: 'cornofilmando.com', logo: 'logo-filmando.png', name: 'CORNO FILMANDO' },
  { domain: 'cornomanso.com.br', logo: 'logo-manso.png', name: 'CORNO MANSO' },
  { domain: 'cornoplay.com', logo: 'logo-play.png', name: 'CORNO PLAY' },
  { domain: 'cornosbrasil.com', logo: 'logo.png', name: 'CORNOS BRASIL' }, // já existe
  { domain: 'cornostv.com', logo: 'logo-tv.png', name: 'CORNOS TV' },
  { domain: 'cornosvip.com', logo: 'logo-vip.png', name: 'CORNOS VIP' },
  { domain: 'cornotube.com', logo: 'logo-tube.png', name: 'CORNO TUBE' },
  { domain: 'cornovideos.com', logo: 'logo-videos.png', name: 'CORNO VIDEOS' },
  { domain: 'esposadecorno.com', logo: 'logo-esposa.png', name: 'ESPOSA DE CORNO' },
  { domain: 'esposagozando.com', logo: 'logo-gozando.png', name: 'ESPOSA GOZANDO' },
  { domain: 'esposasafada.com', logo: 'logo-safada.png', name: 'ESPOSA SAFADA' },
  { domain: 'maridocorno.com', logo: 'logo-marido.png', name: 'MARIDO CORNO' },
  { domain: 'mulherdecorno.com', logo: 'logo-mulher.png', name: 'MULHER DE CORNO' },
  { domain: 'mulherdocorno.com', logo: 'logo-mulher.png', name: 'MULHER DO CORNO' },
  { domain: 'videosdecorno.com', logo: 'logo-videos.png', name: 'VIDEOS DE CORNO' }
];

const imgsDir = path.join(__dirname, '../public/imgs');
const sourceLogo = path.join(imgsDir, 'logo.png');

console.log('🎨 Gerando logos para cada domínio...\n');

// Verificar se o logo fonte existe
if (!fs.existsSync(sourceLogo)) {
  console.error('❌ Logo fonte não encontrado:', sourceLogo);
  console.log('📝 Por favor, crie manualmente as seguintes logos na pasta public/imgs/:');
  
  domainLogos.forEach(({ logo, name }) => {
    if (logo !== 'logo.png') {
      console.log(`   - ${logo} (${name})`);
    }
  });
  
  process.exit(1);
}

// Criar logos para cada domínio
domainLogos.forEach(({ domain, logo, name }) => {
  const logoPath = path.join(imgsDir, logo);
  
  if (logo === 'logo.png') {
    console.log(`✅ ${logo} já existe (${name})`);
    return;
  }
  
  try {
    // Copiar o logo fonte para o novo nome
    fs.copyFileSync(sourceLogo, logoPath);
    console.log(`✅ Criado: ${logo} (${name})`);
  } catch (error) {
    console.error(`❌ Erro ao criar ${logo}:`, error.message);
  }
});

console.log('\n🎉 Processo concluído!');
console.log('\n📝 Próximos passos:');
console.log('1. Edite cada logo para refletir o nome do domínio correspondente');
console.log('2. Mantenha o mesmo tamanho e formato (PNG)');
console.log('3. Use cores que combinem com a cor primária de cada domínio');
console.log('4. Teste o sistema acessando cada domínio para verificar se as logos aparecem corretamente');

// Listar todas as logos que precisam ser criadas
console.log('\n📋 Logos que precisam ser criadas manualmente:');
domainLogos
  .filter(({ logo }) => logo !== 'logo.png')
  .forEach(({ logo, name, domain }) => {
    console.log(`   - ${logo} → ${name} (${domain})`);
  });
