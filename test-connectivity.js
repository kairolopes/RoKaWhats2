const fs = require('fs');

// Load environment variables
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

async function sendTestMessage(type, payload, description) {
    console.log(`\n--- Testando ${description} (${type}) ---`);
    const phone = '556285635204'; 
    const externalMessageId = `test-${type}-${Date.now()}`;

    const makePayload = {
        to: { phone },
        message: {
            type,
            ...payload
        },
        externalMessageId
    };

    console.log('Payload:', JSON.stringify(makePayload, null, 2));

    const url = env.MAKE_OUTBOX_WEBHOOK_URL;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(makePayload)
        });

        console.log(`Resposta do Make: ${res.status}`);
        const text = await res.text();
        console.log('Body:', text);
        
        if (res.status === 200) {
            console.log('✅ Sucesso (Make aceitou)');
        } else {
            console.log('❌ Falha');
        }
    } catch (e) {
        console.error('Erro:', e);
    }
}

async function runTests() {
    // 1. Text Simple
    await sendTestMessage('text', { text: "Teste de Conectividade: Texto Simples" }, "Texto");
}

runTests();
