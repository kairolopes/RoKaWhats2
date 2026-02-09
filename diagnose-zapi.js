const fs = require('fs');

// Credentials from .env
const INSTANCE_ID = '3EDCE29A3EB0A1453F66FAF4F663B13A';
const SECURITY_TOKEN = 'CC91F1EC21501AFE9182A3BC';
const CLIENT_TOKEN = 'Ff94d05bcd8b546afb957fc52d8e33ebaS';

const PHONE_WITH_9 = '5562985635204';
const PHONE_WITHOUT_9 = '556285635204';

async function checkStatus() {
    console.log('\n--- Checking Z-API Status ---');
    const url = `https://api.z-api.io/instances/${INSTANCE_ID}/token/${SECURITY_TOKEN}/status`;
    try {
        const res = await fetch(url, {
            headers: { 'Client-Token': CLIENT_TOKEN }
        });
        const data = await res.json();
        console.log('Status Response:', JSON.stringify(data, null, 2));
        return data.connected;
    } catch (e) {
        console.error('Error checking status:', e.message);
        return false;
    }
}

async function sendText(phone, label) {
    console.log(`\n--- Sending Text to ${label} (${phone}) ---`);
    const url = `https://api.z-api.io/instances/${INSTANCE_ID}/token/${SECURITY_TOKEN}/send-text`;
    const payload = {
        phone: phone,
        message: `Teste de diagnostico Z-API (${label}) - ${new Date().toLocaleTimeString()}`
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Client-Token': CLIENT_TOKEN 
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log(`Response for ${label}:`, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(`Error sending to ${label}:`, e.message);
    }
}

async function run() {
    const isConnected = await checkStatus();
    if (!isConnected) {
        console.warn('⚠️ Instance appears NOT connected (or status check failed). Attempting to send anyway...');
    }

    await sendText(PHONE_WITH_9, "Com 9 (Padrao)");
    await sendText(PHONE_WITHOUT_9, "Sem 9 (Antigo)");
}

run();
