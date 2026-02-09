
const url = process.env.MAKE_OUTBOX_WEBHOOK_URL;
const secret = process.env.MAKE_WEBHOOK_SECRET;

if (!url) {
  console.error('Missing MAKE_OUTBOX_WEBHOOK_URL');
  process.exit(1);
}

async function testMake() {
  console.log('Sending test request to Make:', url);
  
  // Constructing the CORRECT nested body that matches Make's expectation
  const body = {
    workspaceId: 'TEST_WORKSPACE_ID',
    to: {
      phone: '5511999999999'
    },
    message: {
      type: 'text',
      text: 'Teste de envio CORRETO do script de debug Trae (nested)'
    }
  };

  console.log('Payload:', JSON.stringify(body, null, 2));

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-make-secret': secret || ''
      },
      body: JSON.stringify(body)
    });

    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text}`);

    if (res.status >= 400) {
      console.error('Make returned an error. Check scenario configuration.');
    } else {
      console.log('Make accepted the request.');
    }

  } catch (e) {
    console.error('Fetch error:', e);
  }
}

testMake();
