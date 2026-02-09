
// const fetch = require('node-fetch'); // Native fetch in Node 18+

const url = process.env.MAKE_OUTBOX_WEBHOOK_URL;
const secret = process.env.MAKE_WEBHOOK_SECRET;

if (!url) {
  console.error('Missing MAKE_OUTBOX_WEBHOOK_URL');
  process.exit(1);
}

async function testMake() {
  console.log('Sending test request to Make:', url);
  
  const payload = {
    workspaceId: 'TEST_WORKSPACE_ID',
    phone: '5511999999999',
    message: { // Trying nested structure based on common Z-API patterns, or maybe flat?
      // The API sends: { workspaceId, phone, text, type }
      // Let's send EXACTLY what the API sends first.
    },
    // Actually the API sends:
    /*
      body: JSON.stringify({
          workspaceId: workspaceId,
          phone: currentConv.contact_phone,
          text: text,
          type: 'text'
        })
    */
  };
  
  // Constructing the EXACT body the API sends
  const body = {
    workspaceId: 'TEST_WORKSPACE_ID',
    phone: '5511999999999',
    text: 'Teste de envio direto do script de debug Trae',
    type: 'text'
  };

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
