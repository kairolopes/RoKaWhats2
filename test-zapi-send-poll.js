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
    const phone = '556285635204'; // Número de teste corrigido (sem 9 extra)
    const externalMessageId = `test-${type}-${Date.now()}`;

    const makePayload = {
        to: { phone },
        message: {
            type,
            ...payload
        },
        externalMessageId
    };

    console.log('Payload enviado para o Make:', JSON.stringify(makePayload, null, 2));

    const url = env.MAKE_OUTBOX_WEBHOOK_URL;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(makePayload)
        });

        console.log(`Resposta do Make: ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.log('Corpo da resposta:', text);
        
        if (res.status === 200) {
            console.log('✅ Sucesso! Enquete enviada para processamento.');
        } else {
            console.log('❌ Falha no envio.');
        }
    } catch (e) {
        console.error('Erro ao enviar para o Make:', e);
    }
}

async function runTests() {
    // Teste de Enquete
    await sendTestMessage('poll', {
        pollName: "Qual funcionalidade você prefere?",
        pollOptions: ["Chatbots IA", "Disparo em Massa", "CRM Integrado"],
        selectableOptionsCount: 1
    }, "Enquete (Poll)");
}

runTests();
