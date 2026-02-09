
// const fetch = require('node-fetch');

async function testMakeDirect() {
  const makeUrl = process.env.MAKE_WEBHOOK_URL;
  if (!makeUrl) {
      console.error("❌ Missing MAKE_WEBHOOK_URL");
      process.exit(1);
  }
  
  const payload = {
    workspaceId: '6228cbce-c983-43c1-b2e8-f2dd647dc0ff',
    to: {
      phone: '5562985635204'
    },
    message: {
      type: 'text',
      text: 'Teste Direto para o Make (Bypassing Backend) - Se chegar, o problema é no Render.'
    }
  };

  console.log('🚀 Sending DIRECT request to Make:', makeUrl);
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(makeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('📡 Status Code:', response.status);
    const text = await response.text();
    console.log('📄 Response Body:', text);

    if (response.ok) {
        console.log('✅ Make accepted the request. Check your phone!');
    } else {
        console.log('❌ Make rejected the request.');
    }

  } catch (error) {
    console.error('❌ Network Error:', error);
  }
}

testMakeDirect();
