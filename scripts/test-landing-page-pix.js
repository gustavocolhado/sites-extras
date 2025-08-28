const fetch = require('node-fetch');

async function testLandingPagePix() {
  try {
    console.log('🧪 Testando API da Landing Page PIX...');
    
    const response = await fetch('http://localhost:3000/api/landing-page/create-pix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value: 100, // R$ 1,00 em centavos
        email: 'teste@exemplo.com',
        planId: 'monthly',
        referralData: {
          source: 'test',
          campaign: 'test'
        }
      }),
    });

    console.log('📡 Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro:', errorData);
      return;
    }

    const data = await response.json();
    console.log('✅ Sucesso! Dados recebidos:');
    console.log('ID:', data.id);
    console.log('Tem QR Code:', !!data.qr_code);
    console.log('Tem QR Code Base64:', !!data.qr_code_base64);
    console.log('Tamanho QR Code:', data.qr_code?.length);
    console.log('Tamanho QR Code Base64:', data.qr_code_base64?.length);
    console.log('Provedor:', data.provider);
    console.log('Status:', data.status);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testLandingPagePix();
