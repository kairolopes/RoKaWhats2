
const https = require('https');

async function sendRealMessage() {
  console.log('🚀 Sending REAL Message via API (Triggers Make + DB + Frontend)...');
  
  const targetPhone = '5562985635204';
  const workspaceId = '6228cbce-c983-43c1-b2e8-f2dd647dc0ff';
  const messageText = 'Teste final via API de envio. Agora vai chegar no celular E na tela! 🚀';
  
  // URL de produção
  const url = 'https://rokawhats2.onrender.com/api/inbox/send';
  
  const payload = JSON.stringify({
    workspaceId: workspaceId,
    to: { phone: targetPhone },
    message: {
      type: 'text',
      text: messageText
    }
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length
    }
  };

  const req = https.request(url, options, (res) => {
    let data = '';

    console.log(`📡 Status: ${res.statusCode}`);

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('📄 Response:', data);
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('✅ Sucesso! A mensagem foi encaminhada para o Make (para envio Z-API) e salva no banco.');
        console.log('👉 Verifique o celular e a tela do Inbox agora.');
      } else {
        console.error('❌ Falha ao enviar.');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro na requisição:', error.message);
  });

  req.write(payload);
  req.end();
}

sendRealMessage();
