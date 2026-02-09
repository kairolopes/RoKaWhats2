const fs = require('fs');

// Credentials from .env
const INSTANCE_ID = '3EDCE29A3EB0A1453F66FAF4F663B13A';
const SECURITY_TOKEN = 'CC91F1EC21501AFE9182A3BC';
const CLIENT_TOKEN = 'Ff94d05bcd8b546afb957fc52d8e33ebaS';

// Both numbers worked for text, testing both for Polls
const PHONE_WITH_9 = '5562985635204';
const PHONE_WITHOUT_9 = '556285635204';

async function sendPoll(phone, label) {
    console.log(`\n--- Sending Poll to ${label} (${phone}) ---`);
    const url = `https://api.z-api.io/instances/${INSTANCE_ID}/token/${SECURITY_TOKEN}/send-poll`;
    
    const payload = {
        phone: phone,
        pollName: `Enquete Teste (${label})`,
        pollOptions: ["Opcao A", "Opcao B", "Opcao C"],
        selectableOptionsCount: 1
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
    console.log("Iniciando teste de Enquete em variações...");
    
    // 1. Enviar para número com 9
    await sendPoll(PHONE_WITH_9, "Com 9");

    // 2. Enviar para número sem 9
    await sendPoll(PHONE_WITHOUT_9, "Sem 9");
}

run();
