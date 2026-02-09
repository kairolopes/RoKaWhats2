const fs = require('fs');
const path = require('path');

// Load .env manually
const envPath = path.resolve(__dirname, '.env');
let env = {};
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const firstEq = line.indexOf('=');
    if (firstEq > -1) {
      const key = line.substring(0, firstEq).trim();
      const val = line.substring(firstEq + 1).trim();
      env[key] = val;
    }
  });
} catch (e) {
  console.error('Erro ao ler .env:', e.message);
  process.exit(1);
}

// Extract credentials from ZAPI_AVATAR_URL_TEMPLATE
// https://api.z-api.io/instances/3EDCE29A3EB0A1453F66FAF4F663B13A/token/CC91F1EC21501AFE9182A3BC/contacts/...
const template = env.ZAPI_AVATAR_URL_TEMPLATE;
const parts = template.split('/');
const instanceId = parts[4];
const securityToken = parts[6];

// The Client-Token is separate
const clientToken = env.ZAPI_CLIENT_TOKEN;

console.log('Instance ID:', instanceId);
console.log('Security Token (URL):', securityToken);
console.log('Client Token (Header):', clientToken);

const PHONE = '5562985635204';

async function sendDirectPoll() {
    // Correct URL structure for Z-API:
    // POST https://api.z-api.io/instances/{INSTANCE_ID}/token/{SECURITY_TOKEN}/send-poll
    const url = `https://api.z-api.io/instances/${instanceId}/token/${securityToken}/send-poll`;
    
    const payload = {
        phone: PHONE,
        pollName: "Teste Direto Z-API",
        pollOptions: ["Opcao 1", "Opcao 2", "Opcao 3"],
        selectableOptionsCount: 1
    };

    console.log(`Sending to: ${url}`);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Client-Token': clientToken
            },
            body: JSON.stringify(payload)
        });

        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log('Response:', text);
    } catch (error) {
        console.error('Error:', error);
    }
}

sendDirectPoll();
