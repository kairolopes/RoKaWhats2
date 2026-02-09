
// const fetch = require('node-fetch'); // Ensure node-fetch is available or use built-in fetch in newer Node
// Node 18+ has built-in fetch, so we might not need require('node-fetch')

async function testSendApi() {
  const url = 'https://rokawhats2.onrender.com/api/inbox/send';
  const payload = {
    workspaceId: '6228cbce-c983-43c1-b2e8-f2dd647dc0ff',
    to: {
      phone: '5562985635204'
    },
    message: {
      type: 'text',
      text: 'Teste de envio via API - Verificação de Variáveis de Ambiente'
    }
  };

  console.log('🚀 Sending request to:', url);
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('📡 Status Code:', response.status);
    
    const text = await response.text();
    console.log('📄 Response Body:', text);

    if (response.status === 200) {
      console.log('✅ Success! The API is working and Environment Variables are likely correct.');
    } else if (response.status === 500) {
      console.log('❌ Error 500: Server Error. This usually indicates missing MAKE_OUTBOX_WEBHOOK_URL.');
    } else {
      console.log('⚠️ Unexpected Status.');
    }

  } catch (error) {
    console.error('❌ Network or Script Error:', error);
  }
}

testSendApi();
