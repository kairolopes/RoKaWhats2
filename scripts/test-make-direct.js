const url = "https://hook.us1.make.com/nqk42vgm1he55a73f9pk7dviq66mm31d";
const secret = "f3d6c8b55b820c1b2a0d5ee8f4e7a3d9859b6cfa1e2345b7c9d0ab12cd34ef56";

async function testMake() {
  console.log('Sending test request to Make:', url);
  
  // Constructing the CORRECT nested body that matches Make's expectation
  // Based on memory: { workspaceId, to: { phone }, message: { type, text } }
  const body = {
    workspaceId: 'TEST_WORKSPACE_ID',
    to: {
      phone: '5511999999999'
    },
    message: {
      type: 'text',
      text: 'Teste de envio direto (Trae Script) - ' + new Date().toISOString()
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
