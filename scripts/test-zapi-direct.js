
// const fetch = require('node-fetch');

async function testZapiDirect() {
  const instanceId = '3EDCE29A3EB0A1453F66FAF4F663B13A';
  const token = 'CC91F1EC21501AFE9182A3BC';
  const clientToken = 'Ff94d05bcd8b546afb957fc52d8e33ebaS';
  
  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;
  
  const payload = {
    phone: '5562985635204',
    message: 'Teste Direto Z-API (Bypassing Make) - Verificando credenciais.'
  };

  console.log('🚀 Sending DIRECT request to Z-API:', url);
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': clientToken
      },
      body: JSON.stringify(payload)
    });

    console.log('📡 Status Code:', response.status);
    const text = await response.text();
    console.log('📄 Response Body:', text);

    if (response.ok) {
        console.log('✅ Z-API accepted the request. Credentials are CORRECT.');
    } else {
        console.log('❌ Z-API rejected the request.');
    }

  } catch (error) {
    console.error('❌ Network Error:', error);
  }
}

testZapiDirect();
