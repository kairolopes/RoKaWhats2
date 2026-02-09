// const fetch = require('node-fetch'); // Usando nativo

async function testMakeDirect() {
  const url = 'https://hook.us1.make.com/nqk42vgm1he55a73f9pk7dviq66mm31d';
  
  const payload = {
    workspaceId: "test-workspace",
    to: {
      phone: "5511999998888" // Número fictício claramente diferente do usuário
    },
    message: {
      text: "TESTE DE ISOLAMENTO - Se voce receber isso, o Make esta ignorando o numero de destino."
    }
  };

  console.log('📤 Enviando para Make:', url);
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('📡 Status:', response.status);
    console.log('📄 Response:', await response.text());
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Tenta ler .env
// require('dotenv').config({ path: '.env.local' });
// Fallback para .env
// require('dotenv').config();

testMakeDirect();
