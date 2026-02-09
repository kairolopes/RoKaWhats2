const fs = require('fs');

// Credentials from .env
const INSTANCE_ID = '3EDCE29A3EB0A1453F66FAF4F663B13A';
const SECURITY_TOKEN = 'CC91F1EC21501AFE9182A3BC';
const CLIENT_TOKEN = 'Ff94d05bcd8b546afb957fc52d8e33ebaS';

const PHONE_WITH_9 = '5562985635204'; 

async function sendPollStrict(phone, label) {
    console.log(`\n--- Sending Poll (Doc Structure) to ${label} (${phone}) ---`);
    const url = `https://api.z-api.io/instances/${INSTANCE_ID}/token/${SECURITY_TOKEN}/send-poll`;
    
    // Structure based on User's Screenshots
    const payload = {
        phone: phone,
        message: `Enquete Docs Z-API (${label})`, // Was 'pollName'
        pollMaxOptions: 1,                        // Was 'selectableOptionsCount'
        poll: [                                   // Was 'pollOptions' (array of strings)
            { name: "Opcao Z-API" },
            { name: "Opcao Outras" },
            { name: "Opcao Teste" }
        ]
    };

    console.log("Payload:", JSON.stringify(payload, null, 2));

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
    await sendPollStrict(PHONE_WITH_9, "Com 9 (Padrao)");
}

run();
